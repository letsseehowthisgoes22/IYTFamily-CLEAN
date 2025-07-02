from sqlalchemy import Column, String, Integer, Boolean, DateTime, ForeignKey, Enum, Numeric
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import uuid
import enum
from ..core.database import Base

class FenceType(str, enum.Enum):
    SAFE_ZONE = "safe_zone"
    RESTRICTED_AREA = "restricted_area"
    CHECKPOINT = "checkpoint"

class Geofence(Base):
    __tablename__ = "geofences"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    trip_id = Column(UUID(as_uuid=True), ForeignKey("trips.id"), nullable=False)
    name = Column(String(100), nullable=False)
    center_latitude = Column(Numeric(10, 8), nullable=False)
    center_longitude = Column(Numeric(11, 8), nullable=False)
    radius_meters = Column(Integer, nullable=False)
    fence_type = Column(Enum(FenceType), nullable=False, default=FenceType.SAFE_ZONE)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    trip = relationship("Trip", back_populates="geofences")
