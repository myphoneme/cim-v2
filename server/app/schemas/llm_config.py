from datetime import datetime
from pydantic import BaseModel
from typing import Optional, List


class LlmApiKeyCreate(BaseModel):
    provider: str
    api_key: str
    label: Optional[str] = None


class LlmApiKeySummary(BaseModel):
    id: int
    provider: str
    label: Optional[str]
    masked_key: str
    created_at: datetime
    is_selected: bool


class LlmConfigResponse(BaseModel):
    selected_key_id: Optional[int]
    requires_selection: bool
    keys: List[LlmApiKeySummary]


class LlmSelectRequest(BaseModel):
    key_id: int


class LlmApiKeyUpdate(BaseModel):
    api_key: Optional[str] = None
    label: Optional[str] = None
