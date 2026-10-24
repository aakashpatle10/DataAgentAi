from fastapi import APIRouter
from app.config import settings
from app.repositories.dataset_repository import repository
from app.services.ai_service import ai_service

router = APIRouter()

@router.get("/health")
def health_check():
    ai_status = ai_service.get_status()
    return {
        "status": "healthy",
        "service": "DataAgent AI Backend",
        "version": "1.0.0",
        "environment": settings.APP_ENV,
        "database": {
            "type": "mongodb",
            "connected": repository.is_mongo_connected,
            "fallback_active": not repository.is_mongo_connected
        },
        "ai": {
            "provider": ai_status.provider,
            "is_configured": ai_status.is_configured,
            "model": ai_status.model
        }
    }
