from fastapi import APIRouter
from typing import List

from app.schemas.charts import ChartConfigRequest, ChartResponse, ChartRecommendation
from app.services.chart_service import chart_service

router = APIRouter()

@router.post("/{dataset_id}/charts", response_model=ChartResponse)
def create_chart(dataset_id: str, cfg: ChartConfigRequest):
    return chart_service.generate_chart(dataset_id, cfg)

@router.get("/{dataset_id}/charts/recommend", response_model=List[ChartRecommendation])
def recommend_charts(dataset_id: str):
    return chart_service.recommend_charts(dataset_id)
