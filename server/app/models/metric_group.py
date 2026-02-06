from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from ..database import Base


class MetricGroup(Base):
    __tablename__ = "metric_groups"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    description = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    members = relationship("MetricGroupMember", back_populates="group", cascade="all, delete-orphan")
    device_items = relationship("DeviceItem", back_populates="metric_group")
    vm_items = relationship("VmItem", back_populates="metric_group")
    alert_rules = relationship("AlertRule", back_populates="group")
