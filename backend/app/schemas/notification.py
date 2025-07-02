from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class NotificationBase(BaseModel):
    user_id: str
    type: str
    title: str
    content: str
    channels: List[str] = ["in_app"]
    trip_id: Optional[str] = None

class NotificationCreate(NotificationBase):
    pass

class Notification(NotificationBase):
    id: str
    is_read: bool
    sent_at: Optional[datetime] = None
    created_at: datetime
    
    class Config:
        from_attributes = True
