from sqlalchemy import Column, String, Text, DateTime, ForeignKey, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import uuid
import enum
from ..core.database import Base

class TripStatus(str, enum.Enum):
    SCHEDULED = "scheduled"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class TransportMode(str, enum.Enum):
    DRIVING = "driving"
    FLYING = "flying"

class Trip(Base):
    __tablename__ = "trips"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    client_id = Column(UUID(as_uuid=True), ForeignKey("clients.id"), nullable=False)
    staff_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    status = Column(Enum(TripStatus), nullable=False, default=TripStatus.SCHEDULED)
    origin_address = Column(Text, nullable=False)
    destination_address = Column(Text, nullable=False)
    scheduled_start = Column(DateTime(timezone=True), nullable=False)
    actual_start = Column(DateTime(timezone=True), nullable=True)
    scheduled_end = Column(DateTime(timezone=True), nullable=True)
    actual_end = Column(DateTime(timezone=True), nullable=True)
    transport_mode = Column(Enum(TransportMode), nullable=False, default=TransportMode.DRIVING)
    vehicle_info = Column(Text, nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    client = relationship("Client", back_populates="trips")
    staff = relationship("User", back_populates="staff_trips", foreign_keys=[staff_id])
    location_updates = relationship("LocationUpdate", back_populates="trip")
    flight_info = relationship("FlightInfo", back_populates="trip", uselist=False)
    messages = relationship("Message", back_populates="trip")
    documents = relationship("Document", back_populates="trip")
    geofences = relationship("Geofence", back_populates="trip")
    wellness_checkins = relationship("WellnessCheckin", back_populates="trip")
    emergency_alerts = relationship("EmergencyAlert", back_populates="trip")
