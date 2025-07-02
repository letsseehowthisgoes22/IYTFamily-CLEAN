from pydantic import BaseModel
from typing import List
from datetime import datetime
from ..models.message import MessageType

class MessageBase(BaseModel):
    trip_id: str
    content: str
    message_type: MessageType = MessageType.TEXT

class MessageCreate(MessageBase):
    pass

class Message(MessageBase):
    id: str
    sender_id: str
    is_encrypted: bool
    read_by: List[str]
    created_at: datetime
    
    class Config:
        from_attributes = True
