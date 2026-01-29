from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from ..database import Base


class DeviceItem(Base):
    __tablename__ = "device_items"

    id = Column(Integer, primary_key=True, index=True)

    # Basic Info
    device_name = Column(String, nullable=False)  # e.g., "Core Router 1"
    hostname = Column(String, nullable=True)  # e.g., "FSL-DC-PUN-COR-RTR-01"
    ip_address = Column(String, nullable=True)  # e.g., "10.0.11.11"
    serial_number = Column(String, nullable=True)  # e.g., "957JL24"

    # Category - links to infrastructure type
    category = Column(String, nullable=False)  # Network, Compute, Storage, Security, Backup

    # Model Info - can be linked to Equipment or manual entry
    equipment_id = Column(Integer, ForeignKey("equipment.id"), nullable=True)
    model = Column(String, nullable=True)  # e.g., "iEdge 1000", used if equipment_id not set
    version = Column(String, nullable=True)  # Firmware/OS version

    # Location
    location_id = Column(Integer, ForeignKey("locations.id"), nullable=True)

    # Credentials (stored securely - consider encryption in production)
    username = Column(String, nullable=True)
    password = Column(String, nullable=True)  # Should be encrypted in production

    # Additional Info
    description = Column(Text, nullable=True)
    rack_position = Column(String, nullable=True)  # e.g., "Rack 1, U10-U12"
    status = Column(String, default="Active")  # Active, Inactive, Maintenance, Decommissioned

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    equipment = relationship("Equipment", backref="device_items")
    location = relationship("Location", back_populates="device_items")
