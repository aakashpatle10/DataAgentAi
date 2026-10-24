from pydantic import BaseModel
from typing import Optional, List

class ReportGenerateRequest(BaseModel):
    title: Optional[str] = "DataAgent AI Comprehensive Analysis Report"
    include_overview: bool = True
    include_quality: bool = True
    include_descriptive_stats: bool = True
    include_correlations: bool = True
    include_transformations: bool = True
    include_insights: bool = True

class ReportMeta(BaseModel):
    id: str
    dataset_id: str
    title: str
    file_format: str = "pdf"
    file_size_bytes: int
    created_at: str
    download_url: str
