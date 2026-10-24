from fastapi import APIRouter
from app.schemas.profiling import DatasetProfileResponse, QualityIssue
from app.services.profiling_service import profiling_service
from typing import List

router = APIRouter()

@router.get("/{dataset_id}/profile", response_model=DatasetProfileResponse)
def get_dataset_profile(dataset_id: str):
    return profiling_service.profile_dataset(dataset_id)

@router.get("/{dataset_id}/quality", response_model=List[QualityIssue])
def get_dataset_quality(dataset_id: str):
    profile = profiling_service.profile_dataset(dataset_id)
    return profile.quality_issues
