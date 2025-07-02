from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..core.database import get_db
from ..models.flight_info import FlightInfo
from ..models.trip import Trip
from ..models.user import User
from ..schemas.flight_info import FlightInfo as FlightInfoSchema, FlightInfoCreate, FlightInfoUpdate
from ..api.dependencies import get_current_active_user, require_staff_or_admin

router = APIRouter(prefix="/flights", tags=["flights"])

@router.post("/trips/{trip_id}/flight", response_model=FlightInfoSchema)
async def create_flight_info(
    trip_id: str,
    flight_data: FlightInfoCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_staff_or_admin)
):
    trip = db.query(Trip).filter(Trip.id == trip_id).first()
    if trip is None:
        raise HTTPException(status_code=404, detail="Trip not found")
    
    if current_user.role.value == "staff" and trip.staff_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to add flight info for this trip")
    
    existing_flight = db.query(FlightInfo).filter(FlightInfo.trip_id == trip_id).first()
    if existing_flight:
        raise HTTPException(status_code=400, detail="Flight info already exists for this trip")
    
    flight_info = FlightInfo(**flight_data.dict())
    db.add(flight_info)
    db.commit()
    db.refresh(flight_info)
    
    return flight_info

@router.get("/trips/{trip_id}/flight/status", response_model=FlightInfoSchema)
async def get_flight_status(
    trip_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    trip = db.query(Trip).filter(Trip.id == trip_id).first()
    if trip is None:
        raise HTTPException(status_code=404, detail="Trip not found")
    
    from ..api.trips import _can_access_trip
    if not _can_access_trip(current_user, trip, db):
        raise HTTPException(status_code=403, detail="Not authorized to access this trip")
    
    flight_info = db.query(FlightInfo).filter(FlightInfo.trip_id == trip_id).first()
    if flight_info is None:
        raise HTTPException(status_code=404, detail="No flight info found for this trip")
    
    return flight_info

@router.put("/trips/{trip_id}/flight", response_model=FlightInfoSchema)
async def update_flight_info(
    trip_id: str,
    flight_update: FlightInfoUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_staff_or_admin)
):
    trip = db.query(Trip).filter(Trip.id == trip_id).first()
    if trip is None:
        raise HTTPException(status_code=404, detail="Trip not found")
    
    if current_user.role.value == "staff" and trip.staff_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update flight info for this trip")
    
    flight_info = db.query(FlightInfo).filter(FlightInfo.trip_id == trip_id).first()
    if flight_info is None:
        raise HTTPException(status_code=404, detail="No flight info found for this trip")
    
    update_data = flight_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(flight_info, field, value)
    
    db.commit()
    db.refresh(flight_info)
    return flight_info
