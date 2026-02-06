from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from ..database import Base


class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    device_item_id = Column(Integer, ForeignKey("device_items.id"), nullable=True)
    vm_id = Column(Integer, ForeignKey("vm_items.id"), nullable=True)
    rule_id = Column(Integer, ForeignKey("alert_rules.id"), nullable=True)
    status = Column(String, default="open")
    severity = Column(String, default="warning")
    detected_at = Column(DateTime, default=datetime.utcnow)
    latest_value = Column(Float, nullable=True)
    summary = Column(String, nullable=True)
    evidence_upload_id = Column(Integer, ForeignKey("monitoring_uploads.id"), nullable=True)

    device_item = relationship("DeviceItem", back_populates="alerts")
    vm_item = relationship("VmItem", back_populates="alerts")
    rule = relationship("AlertRule")
    updates = relationship("AlertUpdate", back_populates="alert", cascade="all, delete-orphan")
