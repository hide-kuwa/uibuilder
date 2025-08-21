from typing import Dict, List, Optional, Any, Set
from uuid import uuid4, UUID
from datetime import datetime, timedelta
from dotenv import load_dotenv
import os
import json
import asyncio
import logging
import hashlib
import subprocess
import tempfile
from pathlib import Path

import httpx
import jwt
from fastapi import (
    FastAPI,
    HTTPException,
    Response,
    Depends,
    WebSocket,
    WebSocketDisconnect,
    Request,
)
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel, ConfigDict
from dotenv import load_dotenv

load_dotenv()

class PageVersion(BaseModel):
    model_config = ConfigDict(protected_namespaces=())
    id: UUID
    page_id: str
    created_at: datetime
    author: Optional[str] = None
    json: Dict[str, Any]

class PublishRequest(BaseModel):
    model_config = ConfigDict(protected_namespaces=())
    author: Optional[str] = None
    json: Dict[str, Any]

class RollbackRequest(BaseModel):
    model_config = ConfigDict(protected_namespaces=())
    author: Optional[str] = None

class CodegenRequest(BaseModel):
    model_config = ConfigDict(protected_namespaces=())
    spec: Dict[str, Any]
    out_file: str
    branch: str
    base: str
    title: str
    body: Optional[str] = None

SECRET_KEY = "dev-secret"
ALGORITHM = "HS256"

def hash_password(p: str) -> str:
    return hashlib.sha256(p.encode()).hexdigest()

users = {
    "demo@example.com": {
        "hashed_password": hash_password("demo"),
        "role": "admin",
    },
    "editor@example.com": {
        "hashed_password": hash_password("editor"),
        "role": "editor",
    },
}

security = HTTPBearer()

def create_access_token(data: dict, expires_delta: timedelta) -> str:
    to_encode = data.copy()
    to_encode["exp"] = datetime.utcnow() + expires_delta
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def require_role(roles: List[str]):
    def dependency(
        credentials: HTTPAuthorizationCredentials = Depends(security),
    ):
        try:
            payload = jwt.decode(
                credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM]
            )
        except jwt.PyJWTError:
            raise HTTPException(status_code=401, detail="Invalid token")
        if payload.get("role") not in roles:
            raise HTTPException(status_code=403, detail="Forbidden")
        return payload
    return dependency

class LoginRequest(BaseModel):
    email: str
    password: str

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["Content-Security-Policy"] = "default-src 'self'"
    response.headers["Referrer-Policy"] = "same-origin"
    return response

@app.post("/auth/login")
def login(req: LoginRequest):
    user = users.get(req.email)
    if not user or user["hashed_password"] != hash_password(req.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_access_token(
        {"sub": req.email, "role": user["role"]}, timedelta(minutes=5)
    )
    return {"access_token": token}

versions_store: Dict[str, List[PageVersion]] = {}
MAX_VERSIONS_PER_PAGE = 50

ws_rooms: Dict[str, Set[WebSocket]] = {}
presence_map: Dict[str, Set[str]] = {}

async def broadcast_presence(page_id: str):
    users_list = list(presence_map.get(page_id, set()))
    for ws in ws_rooms.get(page_id, set()):
        await ws.send_json({"type": "presence", "users": users_list})

@app.post("/api/pages/{page_id}/publish")
async def publish_page(
    page_id: str,
    req: PublishRequest,
    _: dict = Depends(require_role(["editor", "admin"])),
):
    version = PageVersion(
        id=uuid4(),
        page_id=page_id,
        created_at=datetime.utcnow(),
        author=req.author,
        json=req.json,
    )
    page_versions = versions_store.setdefault(page_id, [])
    page_versions.append(version)
    if len(page_versions) > MAX_VERSIONS_PER_PAGE:
        del page_versions[0]
    try:
        await deploy_page(page_id)
    except Exception:
        logging.exception("Deploy failed for page %s", page_id)
    return {"version_id": str(version.id)}

@app.get("/api/pages/{page_id}/versions")
def list_versions(page_id: str):
    page_versions = versions_store.get(page_id, [])
    return [
        {"id": str(v.id), "created_at": v.created_at, "author": v.author}
        for v in page_versions
    ]

@app.get("/api/pages/{page_id}/versions/{version_id}")
def get_version(page_id: str, version_id: UUID):
    page_versions = versions_store.get(page_id)
    if not page_versions:
        raise HTTPException(status_code=404, detail="Page not found")
    for v in page_versions:
        if v.id == version_id:
            return v.json
    raise HTTPException(status_code=404, detail="Version not found")

@app.post("/api/pages/{page_id}/rollback/{version_id}")
def rollback_page(
    page_id: str,
    version_id: UUID,
    req: RollbackRequest | None = None,
    _: dict = Depends(require_role(["editor", "admin"])),
):
    page_versions = versions_store.get(page_id)
    if not page_versions:
        raise HTTPException(status_code=404, detail="Page not found")
    for v in page_versions:
        if v.id == version_id:
            new_version = PageVersion(
                id=uuid4(),
                page_id=page_id,
                created_at=datetime.utcnow(),
                author=req.author if req and req.author else v.author,
                json=v.json,
            )
            page_versions.append(new_version)
            if len(page_versions) > MAX_VERSIONS_PER_PAGE:
                del page_versions[0]
            return {"version_id": str(new_version.id)}
    raise HTTPException(status_code=404, detail="Version not found")

async def _request_with_retry(
    method: str, url: str, *, headers: dict, data: bytes | None = None
) -> httpx.Response:
    backoff = 0.5
    for attempt in range(3):
        try:
            async with httpx.AsyncClient() as client:
                response = await client.request(
                    method, url, headers=headers, content=data
                )
            if response.status_code < 500:
                return response
        except httpx.HTTPError:
            pass
        if attempt == 2:
            break
        await asyncio.sleep(backoff)
        backoff *= 2
    raise HTTPException(status_code=502, detail="Cloudflare request failed")

@app.post("/api/pages/{page_id}/deploy")
async def deploy_page(
    page_id: str, _=Depends(require_role(["admin"]))
):
    page_versions = versions_store.get(page_id)
    if not page_versions:
        raise HTTPException(status_code=404, detail="Page not found")
    latest = page_versions[-1]

    account = os.getenv("CF_ACCOUNT_ID")
    namespace = os.getenv("CF_NAMESPACE_ID")
    token = os.getenv("CF_API_TOKEN")
    if not all([account, namespace, token]):
        raise HTTPException(status_code=500, detail="Cloudflare credentials missing")

    key = f"prod:{page_id}:latest.json"
    url = (
        f"https://api.cloudflare.com/client/v4/accounts/{account}/storage/kv/"
        f"namespaces/{namespace}/values/{key}"
    )
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
    }

    data = json.dumps(latest.json).encode()
    resp = await _request_with_retry("PUT", url, headers=headers, data=data)
    if resp.status_code >= 300:
        raise HTTPException(status_code=502, detail=f"KV write failed ({resp.status_code}): {resp.text}")

    return {"status": "ok", "key": key, "version": str(latest.id)}

@app.get("/edge-config/{page_id}")
async def get_edge_config(page_id: str):
    account = os.getenv("CF_ACCOUNT_ID")
    namespace = os.getenv("CF_NAMESPACE_ID")
    token = os.getenv("CF_API_TOKEN")
    if not all([account, namespace, token]):
        raise HTTPException(status_code=500, detail="Cloudflare credentials missing")

    key = f"prod:{page_id}:latest.json"
    url = (
        f"https://api.cloudflare.com/client/v4/accounts/{account}/storage/kv/"
        f"namespaces/{namespace}/values/{key}"
    )
    headers = {"Authorization": f"Bearer {token}"}

    resp = await _request_with_retry("GET", url, headers=headers)
    if resp.status_code >= 300:
        raise HTTPException(status_code=502, detail=f"KV fetch failed ({resp.status_code}): {resp.text}")

    return Response(
        content=resp.content,
        media_type="application/json",
        headers={"Cache-Control": "public, max-age=60"},
    )

@app.websocket("/ws/pages/{page_id}")
async def page_ws(websocket: WebSocket, page_id: str):
    token = websocket.query_params.get("token")
    if not token:
        await websocket.close(code=1008)
        return
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except jwt.PyJWTError:
        await websocket.close(code=1008)
        return
    user_id = payload.get("sub", "unknown")
    await websocket.accept()
    room = ws_rooms.setdefault(page_id, set())
    room.add(websocket)
    presence_map.setdefault(page_id, set()).add(user_id)
    await broadcast_presence(page_id)
    try:
        while True:
            msg = await websocket.receive_json()
            if msg.get("type") == "edit":
                await asyncio.sleep(0.01)
                for ws in list(room):
                    if ws is not websocket:
                        await ws.send_json(
                            {"type": "edit", "user": user_id, "data": msg.get("data")}
                        )
    except WebSocketDisconnect:
        pass
    finally:
        room.discard(websocket)
        presence_map.get(page_id, set()).discard(user_id)
        await broadcast_presence(page_id)

@app.post("/api/codegen")
def codegen(req: CodegenRequest):
    repo_root = Path(__file__).resolve().parent.parent
    with tempfile.NamedTemporaryFile("w", delete=False, suffix=".json") as tmp:
        json.dump(req.spec, tmp)
        tmp_path = tmp.name

    out_path = repo_root / req.out_file
    subprocess.run(
        ["node", str(repo_root / "scripts" / "json2tsx.js"), "--in", tmp_path, "--out", str(out_path)],
        check=True,
        cwd=repo_root,
    )

    cmd = [
        "npx",
        "ts-node",
        str(repo_root / "commit-and-pr.ts"),
        "--branch",
        req.branch,
        "--base",
        req.base,
        "--title",
        req.title,
        "--body",
        req.body or "",
        "--paths",
        req.out_file,
    ]
    pr_proc = subprocess.run(cmd, capture_output=True, text=True, cwd=repo_root, check=True)
    pr_url = pr_proc.stdout.strip().splitlines()[-1]
    return {"pr_url": pr_url}

@app.get("/health")
def health_check():
    return {"status": "ok"}
