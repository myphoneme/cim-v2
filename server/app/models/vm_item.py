from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from ..database import Base


class VmItem(Base):
    __tablename__ = "vm_items"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    vendor = Column(String, nullable=True)
    project = Column(String, nullable=True)
    tier = Column(String, nullable=True)
    ip_address = Column(String, nullable=True)
    hostname = Column(String, nullable=True)
    role = Column(String, nullable=True)
    os = Column(String, nullable=True)
    disk_primary = Column(String, nullable=True)
    disk_secondary = Column(String, nullable=True)
    memory_gb = Column(String, nullable=True)
    host_ip = Column(String, nullable=True)
    vcpu = Column(String, nullable=True)
    location_id = Column(Integer, ForeignKey("locations.id"), nullable=True)
    grafana_url = Column(String, nullable=True)
    metric_group_id = Column(Integer, ForeignKey("metric_groups.id"), nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    location = relationship("Location", backref="vm_items")
    metric_group = relationship("MetricGroup", back_populates="vm_items")
    monitoring_uploads = relationship("MonitoringUpload", back_populates="vm_item")
    metric_samples = relationship("MetricSample", back_populates="vm_item")
    alerts = relationship("Alert", back_populates="vm_item")
