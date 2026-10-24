import os
from pathlib import Path
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    APP_ENV: str = "development"
    APP_HOST: str = "0.0.0.0"
    APP_PORT: int = 8000
    FRONTEND_ORIGIN: str = "http://localhost:5173"
    
    # MongoDB
    MONGODB_URI: str = "mongodb://localhost:27017/dataagent_ai"
    MONGODB_DATABASE: str = "dataagent_ai"
    
    # Storage settings - 100% MongoDB-Native
    STORAGE_BACKEND: str = "mongodb"
    MAX_UPLOAD_SIZE_MB: int = 25
    
    # AI Provider
    AI_PROVIDER: str = "gemini"
    AI_API_KEY: str = ""
    AI_MODEL: str = "gemini-3.5-flash"
    AI_BASE_URL: str = "https://generativelanguage.googleapis.com/v1beta"

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()

# Bind dynamic PORT in cloud environments (Render, Railway, Heroku, etc.)
if "PORT" in os.environ:
    try:
        settings.APP_PORT = int(os.environ["PORT"])
    except Exception:
        pass
