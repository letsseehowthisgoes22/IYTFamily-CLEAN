from sqlalchemy import Column, String, Text, Boolean, DateTime, ForeignKey, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import uuid
import enum
from ..core.database import Base

class MessageType(str, enum.Enum):
    TEXT = "text"
    IMAGE = "image"
    AUDIO = "audio"
    DOCUMENT = "document"

class Message(Base):
    __tablename__ = "messages"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    trip_id = Column(UUID(as_uuid=True), ForeignKey("trips.id"), nullable=False)
    sender_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    content = Column(Text, nullable=False)
    message_type = Column(Enum(MessageType), nullable=False, default=MessageType.TEXT)
    is_encrypted = Column(Boolean, default=True)
    read_by = Column(Text, default="[]")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    trip = relationship("Trip", back_populates="messages")
    sender = relationship("User", back_populates="messages")
