from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime
from ..database import Base


class LlmSettings(Base):
    __tablename__ = "llm_settings"

    id = Column(Integer, primary_key=True, index=True)
    selected_key_id = Column(Integer, nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
