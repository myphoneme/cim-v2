from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from ..database import Base


class AlertRule(Base):
    __tablename__ = "alert_rules"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    group_id = Column(Integer, ForeignKey("metric_groups.id"), nullable=True)
    metric_key = Column(String, nullable=False)
    operator = Column(String, default=">")
    threshold = Column(Float, nullable=False)
    duration_minutes = Column(Integer, default=0)
    severity = Column(String, default="warning")
    message_template = Column(String, nullable=True)
    team_id = Column(Integer, ForeignKey("teams.id"), nullable=True)
    is_enabled = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    group = relationship("MetricGroup", back_populates="alert_rules")
    team = relationship("Team")
