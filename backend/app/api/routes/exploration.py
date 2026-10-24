from fastapi import APIRouter
from app.schemas.exploration import QueryRequest, QueryResponse
from app.services.exploration_service import exploration_service

router = APIRouter()

@router.post("/{dataset_id}/query", response_model=QueryResponse)
def query_dataset(dataset_id: str, req: QueryRequest):
    return exploration_service.query_dataset(dataset_id, req)
