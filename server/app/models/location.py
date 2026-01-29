from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from ..database import Base


class Location(Base):
    __tablename__ = "locations"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)  # e.g., "Pune DC", "Mumbai Branch"
    code = Column(String, nullable=False, unique=True)  # e.g., "PUN-DC", "MUM-BR"
    type = Column(String, default="DC")  # DC (Data Center), BR (Branch), DR (Disaster Recovery)
    address = Column(String, nullable=True)
    is_primary = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationship to device items
    device_items = relationship("DeviceItem", back_populates="location")
