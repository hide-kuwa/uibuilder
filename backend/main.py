from typing import Dict, List, Optional, Any, Set
from uuid import uuid4, UUID
from datetime import datetime, timedelta
import os
import json
import asyncio
import hashlib

import httpx
import jwt
from fastapi import (
    FastAPI,
    HTTPException,
    Response,
    Depends,
    WebSocket,
    WebSocketDisconnect,
)
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from starlette.middleware.security import SecurityMiddleware
from pydantic import BaseModel

class PageVersion(BaseModel):
    """Representation of a single stored page version."""
    id: UUID
    page_id: str
    created_at: datetime
    author: Optional[str] = None
    json: Dict[str, Any]

class PublishRequest(BaseModel):
    author: Optional[str] = None
    json: Dict[str, Any]

class RollbackRequest(BaseModel):
    author: Optional[str] = None


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


@app.post("/auth/login")
def login(req: LoginRequest):
    user = users.get(req.email)
    if not user or user["hashed_password"] != hash_password(req.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_access_token(
        {"sub": req.email, "role": user["role"]}, timedelta(minutes=5)
    )
    return {"access_token": token}

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(
    SecurityMiddleware,
    content_security_policy="default-src 'self'",
    referrer_policy="same-origin",
)

# In-memory store of page versions: {page_id: [PageVersion, ...]}
versions_store: Dict[str, List[PageVersion]] = {}
MAX_VERSIONS_PER_PAGE = 50

# WebSocket rooms and presence tracking
ws_rooms: Dict[str, Set[WebSocket]] = {}
presence_map: Dict[str, Set[str]] = {}


async def broadcast_presence(page_id: str):
    users = list(presence_map.get(page_id, set()))
    for ws in ws_rooms.get(page_id, set()):
        await ws.send_json({"type": "presence", "users": users})

@app.post("/api/pages/{page_id}/publish")
def publish_page(
    page_id: str,
    req: PublishRequest,
    _: dict = Depends(require_role(["editor", "admin"])),
):
    """Create a new version for the specified page."""
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
        # Drop the oldest version to maintain the limit
        del page_versions[0]
    return {"version_id": str(version.id)}

@app.get("/api/pages/{page_id}/versions")
def list_versions(page_id: str):
    """List version metadata for a page."""
    page_versions = versions_store.get(page_id, [])
    return [
        {"id": str(v.id), "created_at": v.created_at, "author": v.author}
        for v in page_versions
    ]

@app.get("/api/pages/{page_id}/versions/{version_id}")
def get_version(page_id: str, version_id: UUID):
    """Retrieve the JSON payload for a specific page version."""
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
    """Rollback to a specified version by creating a new head version."""
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


async def _request_with_retry(method: str, url: str, *, headers: dict, data: bytes | None = None) -> httpx.Response:
    """Helper to perform HTTP requests with retries and exponential backoff."""
    backoff = 0.5
    for attempt in range(3):
        try:
            async with httpx.AsyncClient() as client:
                response = await client.request(method, url, headers=headers, content=data)
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
    """Deploy the latest version of a page to Cloudflare KV."""
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
        raise HTTPException(status_code=502, detail="KV write failed")

    return {"status": "ok", "key": key, "version": str(latest.id)}


@app.get("/edge-config/{page_id}")
async def get_edge_config(page_id: str):
    """Fetch deployed page JSON from Cloudflare KV for local testing."""
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
        raise HTTPException(status_code=502, detail="KV fetch failed")

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

@app.get("/health")
def health_check():
    return {"status": "ok"}
