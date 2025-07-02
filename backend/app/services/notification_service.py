from typing import List
from sqlalchemy.orm import Session
from ..models.notification import Notification
from ..models.user import User
from ..schemas.notification import NotificationCreate

class NotificationService:
    def __init__(self, db: Session):
        self.db = db
    
    def create_notification(self, notification_data: NotificationCreate) -> Notification:
        notification = Notification(**notification_data.dict())
        self.db.add(notification)
        self.db.commit()
        self.db.refresh(notification)
        return notification
    
    def send_trip_notification(self, user_ids: List[str], trip_id: str, notification_type: str, title: str, content: str):
        for user_id in user_ids:
            notification_data = NotificationCreate(
                user_id=user_id,
                trip_id=trip_id,
                type=notification_type,
                title=title,
                content=content,
                channels=["in_app", "email", "sms"]
            )
            self.create_notification(notification_data)
    
    def notify_trip_started(self, trip_id: str, family_user_ids: List[str], provider_user_ids: List[str]):
        all_user_ids = family_user_ids + provider_user_ids
        self.send_trip_notification(
            user_ids=all_user_ids,
            trip_id=trip_id,
            notification_type="trip_started",
            title="Trip Started",
            content="Your transport has begun. You can now track the real-time location."
        )
    
    def notify_trip_completed(self, trip_id: str, family_user_ids: List[str], provider_user_ids: List[str]):
        all_user_ids = family_user_ids + provider_user_ids
        self.send_trip_notification(
            user_ids=all_user_ids,
            trip_id=trip_id,
            notification_type="trip_completed",
            title="Trip Completed",
            content="Your transport has been completed successfully."
        )
    
    def notify_location_update(self, trip_id: str, family_user_ids: List[str], provider_user_ids: List[str], location_info: str):
        all_user_ids = family_user_ids + provider_user_ids
        self.send_trip_notification(
            user_ids=all_user_ids,
            trip_id=trip_id,
            notification_type="location_update",
            title="Location Update",
            content=f"Transport location update: {location_info}"
        )
