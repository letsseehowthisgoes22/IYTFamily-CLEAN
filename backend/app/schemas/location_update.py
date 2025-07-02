from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from decimal import Decimal

class LocationUpdateBase(BaseModel):
    trip_id: str
    latitude: Decimal
    longitude: Decimal
    accuracy: Optional[Decimal] = None
    speed: Optional[Decimal] = None
    heading: Optional[Decimal] = None
    timestamp: Optional[datetime] = None

class LocationUpdateCreate(LocationUpdateBase):
    pass

class LocationUpdate(LocationUpdateBase):
    id: str
    created_at: datetime
    
    class Config:
        from_attributes = True
