from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class LocationCreate(BaseModel):
    name: str
    code: str
    type: str = "DC"
    address: Optional[str] = None
    is_primary: bool = False
    is_active: bool = True


class LocationUpdate(BaseModel):
    name: Optional[str] = None
    code: Optional[str] = None
    type: Optional[str] = None
    address: Optional[str] = None
    is_primary: Optional[bool] = None
    is_active: Optional[bool] = None


class LocationResponse(BaseModel):
    id: int
    name: str
    code: str
    type: str
    address: Optional[str] = None
    is_primary: bool
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
