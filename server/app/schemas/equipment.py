from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List
from .manual import ManualContentResponse


class AttachmentResponse(BaseModel):
    id: int
    name: str
    type: str
    url: str
    thumbnail: Optional[str] = None
    metadata: Optional[dict] = Field(default=None, alias="file_metadata")
    upload_date: datetime
    document_category: str = "implementation"
    is_published: bool = True

    class Config:
        from_attributes = True
        populate_by_name = True


class EquipmentCreate(BaseModel):
    name: str
    area: str
    type: str
    vendor: str
    model: str
    serial_number: Optional[str] = None
    license_details: Optional[str] = None
    quantity: str = "1"
    sop_status: str = "Pending"
    email: Optional[str] = None
    phone: Optional[str] = None
    license_applicable: str = "No"
    account_type: str = "AUTO"
    security_level: str = "LOW"
    web_support: Optional[str] = None
    username: Optional[str] = None
    credentials: Optional[str] = None
    otp_required: Optional[str] = None
    contact_person_otp: Optional[str] = None
    validity: Optional[str] = None
    contact_info: Optional[str] = None
    contact_number: Optional[str] = None


class EquipmentUpdate(BaseModel):
    name: Optional[str] = None
    area: Optional[str] = None
    type: Optional[str] = None
    vendor: Optional[str] = None
    model: Optional[str] = None
    serial_number: Optional[str] = None
    license_details: Optional[str] = None
    quantity: Optional[str] = None
    sop_status: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    license_applicable: Optional[str] = None
    account_type: Optional[str] = None
    security_level: Optional[str] = None
    web_support: Optional[str] = None
    username: Optional[str] = None
    credentials: Optional[str] = None
    otp_required: Optional[str] = None
    contact_person_otp: Optional[str] = None
    validity: Optional[str] = None
    contact_info: Optional[str] = None
    contact_number: Optional[str] = None


class EquipmentResponse(BaseModel):
    id: int
    name: str
    area: str
    type: str
    vendor: str
    model: str
    serial_number: Optional[str] = None
    license_details: Optional[str] = None
    quantity: str
    sop_status: str
    email: Optional[str] = None
    phone: Optional[str] = None
    license_applicable: str
    account_type: str = "AUTO"
    security_level: str = "LOW"
    web_support: Optional[str] = None
    username: Optional[str] = None
    credentials: Optional[str] = None
    otp_required: Optional[str] = None
    contact_person_otp: Optional[str] = None
    validity: Optional[str] = None
    contact_info: Optional[str] = None
    contact_number: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    manual: Optional[ManualContentResponse] = None
    attachments: List[AttachmentResponse] = []

    class Config:
        from_attributes = True


class EquipmentListResponse(BaseModel):
    id: int
    name: str
    area: str
    type: str
    vendor: str
    model: str
    quantity: str
    sop_status: str
    email: Optional[str] = None
    phone: Optional[str] = None
    account_type: str = "AUTO"
    security_level: str = "LOW"
    doc_count: int = 0
    video_count: int = 0
    last_updated: Optional[datetime] = None

    class Config:
        from_attributes = True
