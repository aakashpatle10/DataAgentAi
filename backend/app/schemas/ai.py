from pydantic import BaseModel, Field
from typing import List, Optional, Any, Dict
from app.schemas.charts import ChartResponse

class AiStatusResponse(BaseModel):
    is_configured: bool
    provider: str
    model: str
    message: str
    available_fallback_features: List[str]

class AiChatRequest(BaseModel):
    message: str
    history: Optional[List[Dict[str, str]]] = Field(default_factory=list)

class AiChatResponse(BaseModel):
    answer: str
    intent_recognized: str
    is_ai_live: bool
    computed_data: Optional[Any] = None
    suggested_chart: Optional[ChartResponse] = None
    suggested_followups: List[str] = Field(default_factory=list)
