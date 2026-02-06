from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime
from ..database import Base


class LlmApiKey(Base):
    __tablename__ = "llm_api_keys"

    id = Column(Integer, primary_key=True, index=True)
    provider = Column(String, nullable=False, index=True)
    label = Column(String, nullable=True)
    api_key = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
