from pydantic import BaseModel, Field
from typing import List, Optional, Any, Dict

class ChartConfigRequest(BaseModel):
    chart_type: str  # bar, line, scatter, histogram, box, pie, heatmap, area
    x_column: Optional[str] = None
    y_column: Optional[str] = None
    group_by: Optional[str] = None
    color_column: Optional[str] = None
    aggregation: Optional[str] = "none"  # none, sum, mean, count, min, max
    title: Optional[str] = None

class ChartRecommendation(BaseModel):
    id: str
    title: str
    description: str
    chart_type: str
    config: ChartConfigRequest

class ChartResponse(BaseModel):
    title: str
    chart_type: str
    plotly_data: List[Dict[str, Any]]
    plotly_layout: Dict[str, Any]
    point_count: int
    note: Optional[str] = None
