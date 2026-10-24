import uvicorn
import os
import sys

# Ensure backend root is on Python sys.path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from app.config import settings

if __name__ == "__main__":
    bind_host = "0.0.0.0" if (os.environ.get("RENDER") or os.environ.get("PORT") or (settings.APP_HOST in ("127.0.0.1", "localhost") and os.environ.get("PORT"))) else settings.APP_HOST
    print(f"Starting DataAgent AI Backend on http://{bind_host}:{settings.APP_PORT}")
    uvicorn.run(
        "app.main:app",
        host=bind_host,
        port=settings.APP_PORT,
        reload=(settings.APP_ENV == "development")
    )

