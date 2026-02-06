from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class MetricDefinitionCreate(BaseModel):
    key: str
    display_name: str
    default_unit: Optional[str] = None
    description: Optional[str] = None


class MetricDefinitionResponse(MetricDefinitionCreate):
    id: int

    class Config:
        from_attributes = True


class MetricGroupCreate(BaseModel):
    name: str
    description: Optional[str] = None


class MetricGroupResponse(MetricGroupCreate):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class MetricGroupMemberCreate(BaseModel):
    metric_key: str


class MetricSampleResponse(BaseModel):
    id: int
    device_item_id: Optional[int] = None
    vm_id: Optional[int] = None
    captured_at: datetime
    metric_key: str
    value: float
    unit: Optional[str] = None
    source_upload_id: Optional[int] = None
    confidence: Optional[float] = None

    class Config:
        from_attributes = True
