from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

class NumericColumnProfile(BaseModel):
    count: int
    missing_count: int
    mean: Optional[float] = None
    median: Optional[float] = None
    std: Optional[float] = None
    min: Optional[float] = None
    max: Optional[float] = None
    q25: Optional[float] = None
    q75: Optional[float] = None
    iqr: Optional[float] = None
    outlier_count: int = 0
    lower_bound: Optional[float] = None
    upper_bound: Optional[float] = None

class CategoricalColumnProfile(BaseModel):
    unique_count: int
    missing_count: int
    cardinality: float  # unique / total
    top_values: List[Dict[str, Any]] = Field(default_factory=list)

class DatetimeColumnProfile(BaseModel):
    valid_count: int
    missing_count: int
    min_date: Optional[str] = None
    max_date: Optional[str] = None

class TextColumnProfile(BaseModel):
    empty_strings_count: int
    avg_length: float
    distinct_count: int

class ColumnProfile(BaseModel):
    name: str
    dtype: str
    category: str  # numeric, categorical, datetime, text, boolean
    numeric_stats: Optional[NumericColumnProfile] = None
    categorical_stats: Optional[CategoricalColumnProfile] = None
    datetime_stats: Optional[DatetimeColumnProfile] = None
    text_stats: Optional[TextColumnProfile] = None

class QualityIssue(BaseModel):
    severity: str  # "error" (confirmed issue) | "warning" (heuristic caution)
    category: str  # missing_values, duplicates, constant_column, high_cardinality, id_column, mixed_types
    column: Optional[str] = None
    description: str
    affected_count: int
    affected_percentage: float

class DatasetProfileResponse(BaseModel):
    dataset_id: str
    total_rows: int
    total_columns: int
    total_cells: int
    memory_usage_kb: float
    duplicate_rows_count: int
    duplicate_rows_percentage: float
    missing_cells_count: int
    missing_cells_percentage: float
    numeric_columns_count: int
    categorical_columns_count: int
    datetime_columns_count: int
    text_columns_count: int
    columns: Dict[str, ColumnProfile]
    quality_issues: List[QualityIssue]
    quality_score: float  # 0 to 100 calculated health score
