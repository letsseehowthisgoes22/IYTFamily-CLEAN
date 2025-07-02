from sqlalchemy import Column, String, Text, DateTime, ForeignKey, Enum, Numeric
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import uuid
import enum
from ..core.database import Base

class CheckinStatus(str, enum.Enum):
    ALL_GOOD = "all_good"
    NEED_HELP = "need_help"
    EMERGENCY = "emergency"

class WellnessCheckin(Base):
    __tablename__ = "wellness_checkins"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    trip_id = Column(UUID(as_uuid=True), ForeignKey("trips.id"), nullable=False)
    staff_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    status = Column(Enum(CheckinStatus), nullable=False)
    notes = Column(Text, nullable=True)
    location_latitude = Column(Numeric(10, 8), nullable=True)
    location_longitude = Column(Numeric(11, 8), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    trip = relationship("Trip", back_populates="wellness_checkins")
    staff = relationship("User", back_populates="wellness_checkins", foreign_keys=[staff_id])
