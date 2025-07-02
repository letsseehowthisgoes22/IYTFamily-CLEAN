from sqlalchemy import Column, String, Boolean, DateTime, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import uuid
import enum
from ..core.database import Base

class UserRole(str, enum.Enum):
    ADMIN = "admin"
    STAFF = "staff"
    FAMILY = "family"
    PROVIDERS = "providers"

class User(Base):
    __tablename__ = "users"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), nullable=False)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    phone = Column(String(20), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    clients = relationship("Client", back_populates="family_user")
    staff_trips = relationship("Trip", back_populates="staff", foreign_keys="Trip.staff_id")
    messages = relationship("Message", back_populates="sender")
    documents = relationship("Document", back_populates="uploaded_by_user", foreign_keys="Document.uploaded_by")
    notifications = relationship("Notification", back_populates="user")
    wellness_checkins = relationship("WellnessCheckin", back_populates="staff")
    emergency_alerts = relationship("EmergencyAlert", back_populates="triggered_by_user", foreign_keys="EmergencyAlert.triggered_by")
