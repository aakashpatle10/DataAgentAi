from fastapi import APIRouter
from app.schemas.ai import AiStatusResponse, AiChatRequest, AiChatResponse
from app.services.ai_service import ai_service
from app.repositories.dataset_repository import repository

router = APIRouter()

@router.get("/status", response_model=AiStatusResponse)
def get_ai_status():
    return ai_service.get_status()

@router.post("/{dataset_id}/chat", response_model=AiChatResponse)
async def chat_with_dataset(dataset_id: str, req: AiChatRequest):
    return await ai_service.chat(dataset_id, req.message)

@router.get("/{dataset_id}/history")
def get_chat_history(dataset_id: str):
    return repository.get_chat_history(dataset_id)

@router.delete("/{dataset_id}/history")
def clear_chat_history(dataset_id: str):
    if repository.is_mongo_connected and repository.db is not None:
        repository.db.chat_history.delete_many({"dataset_id": dataset_id})
    return {"message": "Chat history cleared."}
