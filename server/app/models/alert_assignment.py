from sqlalchemy import Column, Integer, DateTime, ForeignKey
from datetime import datetime
from ..database import Base


class AlertAssignment(Base):
    __tablename__ = "alert_assignments"

    id = Column(Integer, primary_key=True, index=True)
    alert_id = Column(Integer, ForeignKey("alerts.id"), nullable=False)
    team_id = Column(Integer, ForeignKey("teams.id"), nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    assigned_at = Column(DateTime, default=datetime.utcnow)
