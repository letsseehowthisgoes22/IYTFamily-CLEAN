from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..core.database import get_db
from ..models.notification import Notification
from ..models.user import User
from ..schemas.notification import Notification as NotificationSchema, NotificationCreate
from ..api.dependencies import get_current_active_user, require_admin

router = APIRouter(prefix="/notifications", tags=["notifications"])

@router.get("/", response_model=List[NotificationSchema])
async def get_user_notifications(
    skip: int = 0,
    limit: int = 100,
    unread_only: bool = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    query = db.query(Notification).filter(Notification.user_id == current_user.id)
    
    if unread_only:
        query = query.filter(Notification.is_read == False)
    
    notifications = query.order_by(Notification.created_at.desc()).offset(skip).limit(limit).all()
    return notifications

@router.post("/", response_model=NotificationSchema)
async def create_notification(
    notification_data: NotificationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    notification = Notification(**notification_data.dict())
    db.add(notification)
    db.commit()
    db.refresh(notification)
    return notification

@router.put("/{notification_id}/read")
async def mark_notification_read(
    notification_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    notification = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.user_id == current_user.id
    ).first()
    
    if notification is None:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    notification.is_read = True
    db.commit()
    
    return {"message": "Notification marked as read"}

@router.get("/preferences")
async def get_notification_preferences(
    current_user: User = Depends(get_current_active_user)
):
    return {
        "email_enabled": True,
        "sms_enabled": True,
        "push_enabled": True,
        "in_app_enabled": True
    }

@router.put("/preferences")
async def update_notification_preferences(
    preferences: dict,
    current_user: User = Depends(get_current_active_user)
):
    return {"message": "Notification preferences updated", "preferences": preferences}
