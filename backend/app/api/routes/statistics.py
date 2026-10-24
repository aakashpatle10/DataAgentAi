from fastapi import APIRouter, Query
from typing import List, Optional

from app.schemas.statistics import (
    DescriptiveStatsItem, CorrelationResponse, OutlierReport,
    GroupAnalysisRequest, GroupAnalysisResponse,
    LinearRegressionRequest, LinearRegressionResponse
)
from app.services.statistics_service import statistics_service

router = APIRouter()

@router.post("/{dataset_id}/statistics", response_model=List[DescriptiveStatsItem])
def get_statistics(dataset_id: str):
    return statistics_service.get_descriptive_stats(dataset_id)

@router.post("/{dataset_id}/correlations", response_model=CorrelationResponse)
def get_correlations(dataset_id: str):
    return statistics_service.get_correlations(dataset_id)

@router.post("/{dataset_id}/outliers", response_model=OutlierReport)
def get_outliers(dataset_id: str, column: Optional[str] = Query(None)):
    return statistics_service.detect_outliers(dataset_id, column)

@router.post("/{dataset_id}/group-analysis", response_model=GroupAnalysisResponse)
def run_group_analysis(dataset_id: str, req: GroupAnalysisRequest):
    return statistics_service.group_analysis(dataset_id, req.group_by, req.metric_column)

@router.post("/{dataset_id}/regression", response_model=LinearRegressionResponse)
def run_regression(dataset_id: str, req: LinearRegressionRequest):
    return statistics_service.linear_regression(dataset_id, req.x_column, req.y_column)
