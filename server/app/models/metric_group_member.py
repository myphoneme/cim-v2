from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from ..database import Base


class MetricGroupMember(Base):
    __tablename__ = "metric_group_members"

    id = Column(Integer, primary_key=True, index=True)
    group_id = Column(Integer, ForeignKey("metric_groups.id"), nullable=False)
    metric_key = Column(String, nullable=False)

    group = relationship("MetricGroup", back_populates="members")
