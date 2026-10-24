from pydantic import BaseModel, Field
from typing import List, Optional, Any, Dict
from app.schemas.dataset import ColumnSchema

class ColumnFilter(BaseModel):
    column: str
    operator: str  # equals, contains, starts_with, gt, gte, lt, lte, is_null, not_null
    value: Optional[Any] = None

class QueryRequest(BaseModel):
    page: int = Field(default=1, ge=1)
    page_size: int = Field(default=25, ge=1, le=100)
    sort_by: Optional[str] = None
    sort_order: Optional[str] = Field(default="asc", pattern="^(asc|desc)$")
    search: Optional[str] = None
    filters: List[ColumnFilter] = Field(default_factory=list)
    columns: Optional[List[str]] = None

class QueryResponse(BaseModel):
    dataset_id: str
    total_rows: int
    filtered_rows: int
    page: int
    page_size: int
    total_pages: int
    columns: List[ColumnSchema]
    rows: List[Dict[str, Any]]
