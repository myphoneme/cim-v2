from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List, Any


class MonitoringUploadResponse(BaseModel):
    id: int
    device_item_id: Optional[int] = None
    vm_id: Optional[int] = None
    location_id: Optional[int] = None
    file_path: str
    file_name: str
    mime_type: Optional[str] = None
    uploaded_by_user_id: Optional[int] = None
    capture_time: Optional[datetime] = None
    dashboard_label: Optional[str] = None
    raw_text: Optional[str] = None
    extracted_metrics: Optional[List[Any]] = None
    parse_status: str
    parse_confidence: Optional[float] = None
    parse_error: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class MonitoringMetricEdit(BaseModel):
    key: Optional[str] = None
    value: Optional[float] = None
    unit: Optional[str] = None
    ip_address: Optional[str] = None
    device_item_id: Optional[int] = None
    vm_id: Optional[int] = None
    confidence: Optional[float] = None


class MonitoringConfirmRequest(BaseModel):
    metrics: Optional[List[MonitoringMetricEdit]] = None
    capture_time: Optional[datetime] = None
