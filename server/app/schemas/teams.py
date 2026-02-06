from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class TeamCreate(BaseModel):
    name: str
    email_alias: Optional[str] = None


class TeamResponse(TeamCreate):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
