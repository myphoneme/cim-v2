from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from .location import LocationResponse


class DeviceItemCreate(BaseModel):
    device_name: str
    hostname: Optional[str] = None
    ip_address: Optional[str] = None
    serial_number: Optional[str] = None
    category: str  # Network, Compute, Storage, Security, Backup
    equipment_id: Optional[int] = None
    model: Optional[str] = None
    version: Optional[str] = None
    location_id: Optional[int] = None
    username: Optional[str] = None
    password: Optional[str] = None
    description: Optional[str] = None
    rack_position: Optional[str] = None
    status: str = "Active"


class DeviceItemUpdate(BaseModel):
    device_name: Optional[str] = None
    hostname: Optional[str] = None
    ip_address: Optional[str] = None
    serial_number: Optional[str] = None
    category: Optional[str] = None
    equipment_id: Optional[int] = None
    model: Optional[str] = None
    version: Optional[str] = None
    location_id: Optional[int] = None
    username: Optional[str] = None
    password: Optional[str] = None
    description: Optional[str] = None
    rack_position: Optional[str] = None
    status: Optional[str] = None


class EquipmentBrief(BaseModel):
    id: int
    name: str
    vendor: str
    model: str

    class Config:
        from_attributes = True


class DeviceItemResponse(BaseModel):
    id: int
    device_name: str
    hostname: Optional[str] = None
    ip_address: Optional[str] = None
    serial_number: Optional[str] = None
    category: str
    equipment_id: Optional[int] = None
    model: Optional[str] = None
    version: Optional[str] = None
    location_id: Optional[int] = None
    username: Optional[str] = None
    password: Optional[str] = None  # Consider masking in production
    description: Optional[str] = None
    rack_position: Optional[str] = None
    status: str
    created_at: datetime
    updated_at: datetime
    equipment: Optional[EquipmentBrief] = None
    location: Optional[LocationResponse] = None

    class Config:
        from_attributes = True


class DeviceItemListResponse(BaseModel):
    id: int
    device_name: str
    hostname: Optional[str] = None
    ip_address: Optional[str] = None
    serial_number: Optional[str] = None
    category: str
    model: Optional[str] = None
    version: Optional[str] = None
    status: str
    location_name: Optional[str] = None
    equipment_name: Optional[str] = None

    class Config:
        from_attributes = True
