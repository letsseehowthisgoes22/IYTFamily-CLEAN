from sqlalchemy import Column, String, Text, DateTime, ForeignKey, Enum, Numeric
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import uuid
import enum
from ..core.database import Base

class AlertStatus(str, enum.Enum):
    ACTIVE = "active"
    RESOLVED = "resolved"
    FALSE_ALARM = "false_alarm"

class EmergencyAlert(Base):
    __tablename__ = "emergency_alerts"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    trip_id = Column(UUID(as_uuid=True), ForeignKey("trips.id"), nullable=False)
    triggered_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    alert_type = Column(String(50), nullable=False)
    location_latitude = Column(Numeric(10, 8), nullable=True)
    location_longitude = Column(Numeric(11, 8), nullable=True)
    description = Column(Text, nullable=True)
    status = Column(Enum(AlertStatus), nullable=False, default=AlertStatus.ACTIVE)
    resolved_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    resolved_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    trip = relationship("Trip", back_populates="emergency_alerts")
    triggered_by_user = relationship("User", back_populates="emergency_alerts", foreign_keys=[triggered_by])
