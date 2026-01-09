from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, JSON, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from ..database import Base


class Attachment(Base):
    __tablename__ = "attachments"

    id = Column(Integer, primary_key=True, index=True)
    equipment_id = Column(Integer, ForeignKey("equipment.id"))
    name = Column(String, nullable=False)
    type = Column(String, nullable=False)  # pdf, docx, video, youtube
    url = Column(Text, nullable=False)  # File path or external URL
    thumbnail = Column(Text, nullable=True)
    file_metadata = Column(JSON, nullable=True)  # {duration, views, postedAt, author}
    upload_date = Column(DateTime, default=datetime.utcnow)
    # Document Management fields
    document_category = Column(String, default="implementation")  # implementation, tutorial, troubleshooting, maintenance
    is_published = Column(Boolean, default=True)

    equipment = relationship("Equipment", back_populates="attachments")
