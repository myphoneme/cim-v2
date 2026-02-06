from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime
from ..database import Base


class Team(Base):
    __tablename__ = "teams"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    email_alias = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
