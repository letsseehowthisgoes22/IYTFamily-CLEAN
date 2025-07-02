from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class FlightInfoBase(BaseModel):
    trip_id: str
    airline: str
    flight_number: str
    departure_airport: str
    arrival_airport: str
    scheduled_departure: Optional[datetime] = None
    scheduled_arrival: Optional[datetime] = None
    gate: Optional[str] = None
    status: Optional[str] = None

class FlightInfoCreate(FlightInfoBase):
    pass

class FlightInfoUpdate(BaseModel):
    airline: Optional[str] = None
    flight_number: Optional[str] = None
    departure_airport: Optional[str] = None
    arrival_airport: Optional[str] = None
    scheduled_departure: Optional[datetime] = None
    actual_departure: Optional[datetime] = None
    scheduled_arrival: Optional[datetime] = None
    actual_arrival: Optional[datetime] = None
    gate: Optional[str] = None
    status: Optional[str] = None

class FlightInfo(FlightInfoBase):
    id: str
    actual_departure: Optional[datetime] = None
    actual_arrival: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
