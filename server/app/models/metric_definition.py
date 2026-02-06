from sqlalchemy import Column, Integer, String, Text
from ..database import Base


class MetricDefinition(Base):
    __tablename__ = "metric_definitions"

    id = Column(Integer, primary_key=True, index=True)
    key = Column(String, unique=True, index=True, nullable=False)
    display_name = Column(String, nullable=False)
    default_unit = Column(String, nullable=True)
    description = Column(Text, nullable=True)
