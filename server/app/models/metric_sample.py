from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from ..database import Base


class MetricSample(Base):
    __tablename__ = "metric_samples"

    id = Column(Integer, primary_key=True, index=True)
    device_item_id = Column(Integer, ForeignKey("device_items.id"), nullable=True)
    vm_id = Column(Integer, ForeignKey("vm_items.id"), nullable=True)
    captured_at = Column(DateTime, default=datetime.utcnow)
    metric_key = Column(String, nullable=False)
    value = Column(Float, nullable=False)
    unit = Column(String, nullable=True)
    source_upload_id = Column(Integer, ForeignKey("monitoring_uploads.id"), nullable=True)
    confidence = Column(Float, nullable=True)

    device_item = relationship("DeviceItem", back_populates="metric_samples")
    vm_item = relationship("VmItem", back_populates="metric_samples")
    source_upload = relationship("MonitoringUpload", back_populates="metric_samples")
