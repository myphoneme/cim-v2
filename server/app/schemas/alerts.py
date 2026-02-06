from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class AlertRuleCreate(BaseModel):
    name: str
    group_id: Optional[int] = None
    metric_key: str
    operator: str
    threshold: float
    duration_minutes: int = 0
    severity: str = "warning"
    message_template: Optional[str] = None
    team_id: Optional[int] = None
    is_enabled: bool = True


class AlertRuleResponse(AlertRuleCreate):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class AlertResponse(BaseModel):
    id: int
    device_item_id: Optional[int] = None
    vm_id: Optional[int] = None
    rule_id: Optional[int] = None
    status: str
    severity: str
    detected_at: datetime
    latest_value: Optional[float] = None
    summary: Optional[str] = None
    evidence_upload_id: Optional[int] = None

    class Config:
        from_attributes = True


class AlertUpdateCreate(BaseModel):
    status: str
    note: Optional[str] = None


class AlertUpdateResponse(AlertUpdateCreate):
    id: int
    alert_id: int
    updated_by: Optional[int] = None
    updated_at: datetime

    class Config:
        from_attributes = True


class AlertAssignCreate(BaseModel):
    team_id: Optional[int] = None
    user_id: Optional[int] = None
