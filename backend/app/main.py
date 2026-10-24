import os
from pathlib import Path
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse

from app.config import settings
from app.api.routes import (
    health, datasets, profiling, exploration,
    cleaning, charts, statistics, ai, reports, projects
)

from app.repositories.dataset_repository import repository

@asynccontextmanager
async def lifespan(app: FastAPI):
    if repository.is_mongo_connected:
        print("[DataAgent AI] Connected to MongoDB database successfully.")
    yield

app = FastAPI(
    title="DataAgent AI API",
    description="Deterministic Data Processing & AI-Powered Analytics Platform Engine",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Middleware
raw_origins = [o.strip() for o in settings.FRONTEND_ORIGIN.split(",") if o.strip()]
for default_origin in ["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000"]:
    if default_origin not in raw_origins:
        raw_origins.append(default_origin)

if "*" in raw_origins:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=False,
        allow_methods=["*"],
        allow_headers=["*"],
    )
else:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=raw_origins,
        allow_origin_regex=r"https?://.*",
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

# Register API Routers
app.include_router(health.router, prefix="/api", tags=["System & Health"])
app.include_router(datasets.router, prefix="/api/datasets", tags=["Datasets"])
app.include_router(profiling.router, prefix="/api/datasets", tags=["Profiling & Quality"])
app.include_router(exploration.router, prefix="/api/datasets", tags=["Exploration"])
app.include_router(cleaning.router, prefix="/api/datasets", tags=["Data Cleaning"])
app.include_router(charts.router, prefix="/api/datasets", tags=["Visualizations"])
app.include_router(statistics.router, prefix="/api/datasets", tags=["Statistical Analysis"])
app.include_router(ai.router, prefix="/api/ai", tags=["AI Analyst"])
app.include_router(ai.router, prefix="/api/datasets", tags=["AI Analyst (Dataset Prefix)"])
app.include_router(reports.router, prefix="/api", tags=["Reports"])
app.include_router(reports.router, prefix="/api/datasets", tags=["Reports (Dataset Prefix)"])
app.include_router(projects.router, prefix="/api/projects", tags=["Saved Projects"])

@app.get("/", include_in_schema=False)
def root():
    return RedirectResponse(url="/docs")
