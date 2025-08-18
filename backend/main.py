from typing import Dict, List, Optional, Any
from uuid import uuid4, UUID
from datetime import datetime
import os
import json
import asyncio
import subprocess
import tempfile
from pathlib import Path

import httpx
from fastapi import FastAPI, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware
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


class CodegenRequest(BaseModel):
    spec: Dict[str, Any]
    out_file: str
    branch: str
    base: str
    title: str
    body: Optional[str] = None

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory store of page versions: {page_id: [PageVersion, ...]}
versions_store: Dict[str, List[PageVersion]] = {}
MAX_VERSIONS_PER_PAGE = 50

@app.post("/api/pages/{page_id}/publish")
def publish_page(page_id: str, req: PublishRequest):
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
def rollback_page(page_id: str, version_id: UUID, req: RollbackRequest | None = None):
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
async def deploy_page(page_id: str):
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


@app.post("/api/codegen")
def codegen(req: CodegenRequest):
    """Generate code and open a pull request with the changes."""
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
