from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..core.database import get_db
from ..models.message import Message
from ..models.trip import Trip
from ..models.user import User
from ..schemas.message import Message as MessageSchema, MessageCreate
from ..api.dependencies import get_current_active_user

router = APIRouter(prefix="/messages", tags=["messages"])

@router.get("/trips/{trip_id}/messages", response_model=List[MessageSchema])
async def get_trip_messages(
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
    
    messages = db.query(Message).filter(
        Message.trip_id == trip_id
    ).order_by(Message.created_at.asc()).offset(skip).limit(limit).all()
    
    return messages

@router.post("/trips/{trip_id}/messages", response_model=MessageSchema)
async def create_message(
    trip_id: str,
    message_data: MessageCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    trip = db.query(Trip).filter(Trip.id == trip_id).first()
    if trip is None:
        raise HTTPException(status_code=404, detail="Trip not found")
    
    from ..api.trips import _can_access_trip
    if not _can_access_trip(current_user, trip, db):
        raise HTTPException(status_code=403, detail="Not authorized to send messages for this trip")
    
    message = Message(
        trip_id=trip_id,
        sender_id=current_user.id,
        content=message_data.content,
        message_type=message_data.message_type,
        is_encrypted=True,
        read_by=[]
    )
    
    db.add(message)
    db.commit()
    db.refresh(message)
    
    return message

@router.put("/messages/{message_id}/read")
async def mark_message_read(
    message_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    message = db.query(Message).filter(Message.id == message_id).first()
    if message is None:
        raise HTTPException(status_code=404, detail="Message not found")
    
    trip = db.query(Trip).filter(Trip.id == message.trip_id).first()
    from ..api.trips import _can_access_trip
    if not _can_access_trip(current_user, trip, db):
        raise HTTPException(status_code=403, detail="Not authorized to access this message")
    
    if str(current_user.id) not in message.read_by:
        message.read_by.append(str(current_user.id))
        db.commit()
    
    return {"message": "Message marked as read"}
