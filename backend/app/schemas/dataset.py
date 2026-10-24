from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class ColumnSchema(BaseModel):
    name: str
    dtype: str
    inferred_type: str  # numeric, categorical, datetime, text, boolean
    sample_values: List[Any] = Field(default_factory=list)
    null_count: int = 0
    null_percentage: float = 0.0

class DatasetMeta(BaseModel):
    id: str
    name: str
    original_filename: str
    file_format: str
    file_size_bytes: int
    row_count: int
    column_count: int
    columns: List[str]
    created_at: str
    updated_at: Optional[str] = None
    is_demo: bool = False

class DatasetPreviewResponse(BaseModel):
    metadata: DatasetMeta
    columns: List[ColumnSchema]
    preview_rows: List[Dict[str, Any]]
