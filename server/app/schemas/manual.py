from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List


class LinkItem(BaseModel):
    title: str
    uri: str


class ManualContentCreate(BaseModel):
    summary: str
    monitoring: List[str]
    maintenance: List[str]
    troubleshooting: List[str]
    links: Optional[List[LinkItem]] = None
    illustration_prompt: Optional[str] = None
    image_url: Optional[str] = None


class ManualContentResponse(BaseModel):
    id: int
    equipment_id: int
    summary: str
    monitoring: List[str]
    maintenance: List[str]
    troubleshooting: List[str]
    links: Optional[List[dict]] = None
    illustration_prompt: Optional[str] = None
    image_url: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
