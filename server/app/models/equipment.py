from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from ..database import Base


class Equipment(Base):
    __tablename__ = "equipment"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    area = Column(String, nullable=False)  # Network, Security, Comput, Software, Application, ILL/MPLS Service, DR
    type = Column(String, nullable=False)
    vendor = Column(String, nullable=False)
    model = Column(String, nullable=False)
    serial_number = Column(String, nullable=True)
    license_details = Column(String, nullable=True)
    quantity = Column(String, default="1")  # Can be "N/A"
    sop_status = Column(String, default="Pending")  # Available, Pending, Update Required

    # Support Info
    email = Column(String, nullable=True)  # Vendor support email
    phone = Column(String, nullable=True)  # Vendor support phone
    license_applicable = Column(String, default="No")  # Yes, No

    # Node Logic
    account_type = Column(String, default="AUTO")  # AUTO, MANUAL, etc.
    security_level = Column(String, default="LOW")  # LOW, MEDIUM, HIGH, CRITICAL
    web_support = Column(String, nullable=True)
    username = Column(String, nullable=True)
    credentials = Column(String, nullable=True)
    otp_required = Column(String, nullable=True)
    contact_person_otp = Column(String, nullable=True)
    validity = Column(String, nullable=True)
    contact_info = Column(String, nullable=True)
    contact_number = Column(String, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    manual = relationship("ManualContent", back_populates="equipment", uselist=False, cascade="all, delete-orphan")
    attachments = relationship("Attachment", back_populates="equipment", cascade="all, delete-orphan")
