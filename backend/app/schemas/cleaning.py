from pydantic import BaseModel, Field
from typing import List, Optional, Any, Dict

class TransformationStep(BaseModel):
    operation: str  # remove_duplicates, drop_columns, rename_column, cast_type, impute_missing, trim_whitespace, normalize_categorical, filter_rows
    parameters: Dict[str, Any] = Field(default_factory=dict)
    description: Optional[str] = None

class TransformationPreviewResponse(BaseModel):
    operation: str
    original_rows: int
    original_cols: int
    preview_rows: int
    preview_cols: int
    affected_rows_count: int
    sample_before: List[Dict[str, Any]]
    sample_after: List[Dict[str, Any]]

class TransformationHistoryItem(BaseModel):
    id: str
    dataset_id: str
    operation: str
    parameters: Dict[str, Any]
    description: str
    timestamp: str
    rows_before: int
    rows_after: int
    cols_before: int
    cols_after: int
