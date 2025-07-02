from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from ..core.database import get_db
from ..models.location_update import LocationUpdate
from ..models.trip import Trip
from ..models.user import User
from ..schemas.location_update import LocationUpdate as LocationUpdateSchema, LocationUpdateCreate
from ..api.dependencies import get_current_active_user, require_staff_or_admin

router = APIRouter(prefix="/locations", tags=["locations"])

@router.post("/trips/{trip_id}/location", response_model=LocationUpdateSchema)
async def create_location_update(
    trip_id: str,
    location_data: LocationUpdateCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_staff_or_admin)
):
    trip = db.query(Trip).filter(Trip.id == trip_id).first()
    if trip is None:
        raise HTTPException(status_code=404, detail="Trip not found")
    
    if current_user.role.value == "staff" and trip.staff_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update location for this trip")
    
    location_update = LocationUpdate(
        trip_id=trip_id,
        latitude=location_data.latitude,
        longitude=location_data.longitude,
        accuracy=location_data.accuracy,
        speed=location_data.speed,
        heading=location_data.heading,
        timestamp=location_data.timestamp or datetime.utcnow()
    )
    
    db.add(location_update)
    db.commit()
    db.refresh(location_update)
    
    return location_update

@router.get("/trips/{trip_id}/location/current", response_model=LocationUpdateSchema)
async def get_current_location(
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
    
    latest_location = db.query(LocationUpdate).filter(
        LocationUpdate.trip_id == trip_id
    ).order_by(LocationUpdate.timestamp.desc()).first()
    
    if latest_location is None:
        raise HTTPException(status_code=404, detail="No location data found for this trip")
    
    return latest_location

@router.get("/trips/{trip_id}/location/history", response_model=List[LocationUpdateSchema])
async def get_location_history(
    trip_id: str,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    trip = db.query(Trip).filter(Trip.id == trip_id).first()
    if trip is None:
        raise HTTPException(status_code=404, detail="Trip not found")
    
    from ..api.trips import _can_access_trip
    if not _can_access_trip(current_user, trip, db):
        raise HTTPException(status_code=403, detail="Not authorized to access this trip")
    
    locations = db.query(LocationUpdate).filter(
        LocationUpdate.trip_id == trip_id
    ).order_by(LocationUpdate.timestamp.desc()).offset(skip).limit(limit).all()
    
    return locations
