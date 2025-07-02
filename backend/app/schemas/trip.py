from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime
from ..models.trip import TripStatus, TransportMode

class TripBase(BaseModel):
    client_id: str
    staff_id: str
    origin_address: str
    destination_address: str
    scheduled_start: datetime
    scheduled_end: Optional[datetime] = None
    transport_mode: TransportMode = TransportMode.DRIVING
    vehicle_info: Optional[Dict[str, Any]] = None
    notes: Optional[str] = None

class TripCreate(TripBase):
    pass

class TripUpdate(BaseModel):
    client_id: Optional[str] = None
    staff_id: Optional[str] = None
    status: Optional[TripStatus] = None
    origin_address: Optional[str] = None
    destination_address: Optional[str] = None
    scheduled_start: Optional[datetime] = None
    actual_start: Optional[datetime] = None
    scheduled_end: Optional[datetime] = None
    actual_end: Optional[datetime] = None
    transport_mode: Optional[TransportMode] = None
    vehicle_info: Optional[Dict[str, Any]] = None
    notes: Optional[str] = None

class Trip(TripBase):
    id: str
    status: TripStatus
    actual_start: Optional[datetime] = None
    actual_end: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
