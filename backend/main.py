from typing import Dict, List, Optional, Any
from uuid import uuid4, UUID
from datetime import datetime

from fastapi import FastAPI, HTTPException
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

@app.get("/health")
def health_check():
    return {"status": "ok"}