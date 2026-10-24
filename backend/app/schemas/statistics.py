from pydantic import BaseModel, Field
from typing import List, Optional, Any, Dict

class DescriptiveStatsItem(BaseModel):
    column: str
    count: int
    mean: Optional[float] = None
    median: Optional[float] = None
    mode: Optional[Any] = None
    std: Optional[float] = None
    variance: Optional[float] = None
    min: Optional[float] = None
    q25: Optional[float] = None
    q75: Optional[float] = None
    max: Optional[float] = None
    skewness: Optional[float] = None
    kurtosis: Optional[float] = None

class CorrelationPair(BaseModel):
    column_x: str
    column_y: str
    pearson_r: float
    spearman_rho: Optional[float] = None
    relationship: str  # Strong Positive, Moderate Positive, Weak, Moderate Negative, Strong Negative

class CorrelationResponse(BaseModel):
    columns: List[str]
    pearson_matrix: List[List[Optional[float]]]
    spearman_matrix: Optional[List[List[Optional[float]]]] = None
    top_correlations: List[CorrelationPair]
    caution_note: str = "Correlation indicates statistical association, not causation."

class OutlierReport(BaseModel):
    column: str
    total_records: int
    outlier_count: int
    outlier_percentage: float
    q1: float
    q3: float
    iqr: float
    lower_threshold: float
    upper_threshold: float
    method_explanation: str
    candidates_preview: List[Dict[str, Any]] = Field(default_factory=list)

class GroupAnalysisRequest(BaseModel):
    group_by: str
    metric_column: str

class GroupAnalysisRow(BaseModel):
    group: str
    count: int
    sum: Optional[float] = None
    mean: Optional[float] = None
    median: Optional[float] = None
    min: Optional[float] = None
    max: Optional[float] = None

class GroupAnalysisResponse(BaseModel):
    group_by: str
    metric_column: str
    results: List[GroupAnalysisRow]

class LinearRegressionRequest(BaseModel):
    x_column: str
    y_column: str

class LinearRegressionResponse(BaseModel):
    x_column: str
    y_column: str
    slope: float
    intercept: float
    r_squared: float
    p_value: float
    formula: str
    interpretation: str
