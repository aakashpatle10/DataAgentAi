from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Dict, Any, List, Optional
import uuid
from datetime import datetime

from app.repositories.dataset_repository import repository

router = APIRouter()

class ProjectSaveRequest(BaseModel):
    dataset_id: str
    name: str = Field(default="My Analysis Project")
    notes: Optional[str] = None
    summary_snapshot: Optional[Dict[str, Any]] = None

@router.post("/save")
def save_project(req: ProjectSaveRequest):
    project_id = f"proj_{uuid.uuid4().hex[:8]}"
    project_doc = {
        "id": project_id,
        "dataset_id": req.dataset_id,
        "name": req.name,
        "notes": req.notes or "Data analysis project snapshot",
        "summary_snapshot": req.summary_snapshot,
        "saved_at": datetime.utcnow().isoformat(),
        "is_mongo": repository.is_mongo_connected
    }
    repository.save_project(project_doc)
    return {
        "success": True,
        "project_id": project_id,
        "message": "Project saved successfully to MongoDB!" if repository.is_mongo_connected else "Project saved successfully to local repository!",
        "saved_at": project_doc["saved_at"]
    }

@router.get("")
def list_saved_projects():
    return repository.get_saved_projects()
