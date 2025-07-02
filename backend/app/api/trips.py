from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from ..core.database import get_db
from ..models.trip import Trip, TripStatus
from ..models.user import User, UserRole
from ..schemas.trip import Trip as TripSchema, TripCreate, TripUpdate
from ..api.dependencies import get_current_active_user, require_staff_or_admin

router = APIRouter(prefix="/trips", tags=["trips"])

@router.post("/", response_model=TripSchema)
async def create_trip(
    trip_data: TripCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_staff_or_admin)
):
    db_trip = Trip(**trip_data.dict())
    db.add(db_trip)
    db.commit()
    db.refresh(db_trip)
    return db_trip

@router.get("/", response_model=List[TripSchema])
async def read_trips(
    skip: int = 0,
    limit: int = 100,
    status: Optional[TripStatus] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    query = db.query(Trip)
    
    if current_user.role == UserRole.STAFF:
        query = query.filter(Trip.staff_id == current_user.id)
    elif current_user.role in [UserRole.FAMILY, UserRole.PROVIDERS]:
        from ..models.client import Client
        client_ids = db.query(Client.id).filter(Client.family_user_id == current_user.id).all()
        client_ids = [client_id[0] for client_id in client_ids]
        query = query.filter(Trip.client_id.in_(client_ids))
    
    if status:
        query = query.filter(Trip.status == status)
    
    trips = query.offset(skip).limit(limit).all()
    return trips

@router.get("/{trip_id}", response_model=TripSchema)
async def read_trip(
    trip_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    trip = db.query(Trip).filter(Trip.id == trip_id).first()
    if trip is None:
        raise HTTPException(status_code=404, detail="Trip not found")
    
    if not _can_access_trip(current_user, trip, db):
        raise HTTPException(status_code=403, detail="Not authorized to access this trip")
    
    return trip

@router.put("/{trip_id}", response_model=TripSchema)
async def update_trip(
    trip_id: str,
    trip_update: TripUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_staff_or_admin)
):
    trip = db.query(Trip).filter(Trip.id == trip_id).first()
    if trip is None:
        raise HTTPException(status_code=404, detail="Trip not found")
    
    if current_user.role == UserRole.STAFF and trip.staff_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this trip")
    
    update_data = trip_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(trip, field, value)
    
    db.commit()
    db.refresh(trip)
    return trip

@router.post("/{trip_id}/start")
async def start_trip(
    trip_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_staff_or_admin)
):
    trip = db.query(Trip).filter(Trip.id == trip_id).first()
    if trip is None:
        raise HTTPException(status_code=404, detail="Trip not found")
    
    if current_user.role == UserRole.STAFF and trip.staff_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to start this trip")
    
    if trip.status != TripStatus.SCHEDULED:
        raise HTTPException(status_code=400, detail="Trip cannot be started")
    
    from datetime import datetime
    trip.status = TripStatus.IN_PROGRESS
    trip.actual_start = datetime.utcnow()
    
    db.commit()
    db.refresh(trip)
    return {"message": "Trip started successfully", "trip": trip}

@router.post("/{trip_id}/complete")
async def complete_trip(
    trip_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_staff_or_admin)
):
    trip = db.query(Trip).filter(Trip.id == trip_id).first()
    if trip is None:
        raise HTTPException(status_code=404, detail="Trip not found")
    
    if current_user.role == UserRole.STAFF and trip.staff_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to complete this trip")
    
    if trip.status != TripStatus.IN_PROGRESS:
        raise HTTPException(status_code=400, detail="Trip cannot be completed")
    
    from datetime import datetime
    trip.status = TripStatus.COMPLETED
    trip.actual_end = datetime.utcnow()
    
    db.commit()
    db.refresh(trip)
    return {"message": "Trip completed successfully", "trip": trip}

def _can_access_trip(user: User, trip: Trip, db: Session) -> bool:
    if user.role == UserRole.ADMIN:
        return True
    elif user.role == UserRole.STAFF:
        return trip.staff_id == user.id
    elif user.role in [UserRole.FAMILY, UserRole.PROVIDERS]:
        from ..models.client import Client
        client = db.query(Client).filter(Client.id == trip.client_id).first()
        return client and client.family_user_id == user.id
    return False
