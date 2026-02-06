from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Float, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from ..database import Base


class MonitoringUpload(Base):
    __tablename__ = "monitoring_uploads"

    id = Column(Integer, primary_key=True, index=True)
    device_item_id = Column(Integer, ForeignKey("device_items.id"), nullable=True)
    vm_id = Column(Integer, ForeignKey("vm_items.id"), nullable=True)
    location_id = Column(Integer, ForeignKey("locations.id"), nullable=True)
    file_path = Column(Text, nullable=False)
    file_name = Column(String, nullable=False)
    mime_type = Column(String, nullable=True)
    uploaded_by_user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    capture_time = Column(DateTime, nullable=True)
    dashboard_label = Column(String, nullable=True)
    raw_text = Column(Text, nullable=True)
    extracted_metrics = Column(JSON, nullable=True)
    parse_status = Column(String, default="pending")
    parse_confidence = Column(Float, nullable=True)
    parse_error = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    device_item = relationship("DeviceItem", back_populates="monitoring_uploads")
    vm_item = relationship("VmItem", back_populates="monitoring_uploads")
    location = relationship("Location")
    uploaded_by = relationship("User")
    metric_samples = relationship("MetricSample", back_populates="source_upload")
