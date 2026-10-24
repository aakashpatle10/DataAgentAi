import uvicorn
import os
import sys

# Ensure backend root is on Python sys.path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from app.config import settings

if __name__ == "__main__":
    print(f"Starting DataAgent AI Backend on http://{settings.APP_HOST}:{settings.APP_PORT}")
    uvicorn.run(
        "app.main:app",
        host=settings.APP_HOST,
        port=settings.APP_PORT,
        reload=(settings.APP_ENV == "development")
    )
