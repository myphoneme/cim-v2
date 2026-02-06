from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class VmItemBase(BaseModel):
    name: str
    vendor: Optional[str] = None
    project: Optional[str] = None
    tier: Optional[str] = None
    ip_address: Optional[str] = None
    hostname: Optional[str] = None
    role: Optional[str] = None
    os: Optional[str] = None
    disk_primary: Optional[str] = None
    disk_secondary: Optional[str] = None
    memory_gb: Optional[str] = None
    host_ip: Optional[str] = None
    vcpu: Optional[str] = None
    location_id: Optional[int] = None
    grafana_url: Optional[str] = None
    metric_group_id: Optional[int] = None


class VmItemCreate(VmItemBase):
    pass


class VmItemUpdate(BaseModel):
    name: Optional[str] = None
    vendor: Optional[str] = None
    project: Optional[str] = None
    tier: Optional[str] = None
    ip_address: Optional[str] = None
    hostname: Optional[str] = None
    role: Optional[str] = None
    os: Optional[str] = None
    disk_primary: Optional[str] = None
    disk_secondary: Optional[str] = None
    memory_gb: Optional[str] = None
    host_ip: Optional[str] = None
    vcpu: Optional[str] = None
    location_id: Optional[int] = None
    grafana_url: Optional[str] = None
    metric_group_id: Optional[int] = None


class VmItemResponse(VmItemBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
