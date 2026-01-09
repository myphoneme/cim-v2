from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from ..database import Base


class ManualContent(Base):
    __tablename__ = "manual_contents"

    id = Column(Integer, primary_key=True, index=True)
    equipment_id = Column(Integer, ForeignKey("equipment.id"), unique=True)
    summary = Column(Text, nullable=False)
    monitoring = Column(JSON, nullable=False)  # Array of strings
    maintenance = Column(JSON, nullable=False)  # Array of strings
    troubleshooting = Column(JSON, nullable=False)  # Array of strings
    links = Column(JSON, nullable=True)  # Array of {title, uri}
    illustration_prompt = Column(Text, nullable=True)
    image_url = Column(Text, nullable=True)  # Base64 or URL

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    equipment = relationship("Equipment", back_populates="manual")
