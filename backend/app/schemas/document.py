from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class DocumentBase(BaseModel):
    trip_id: str
    filename: str
    document_type: Optional[str] = None

class DocumentCreate(DocumentBase):
    pass

class Document(DocumentBase):
    id: str
    uploaded_by: str
    file_path: str
    file_size: Optional[int] = None
    mime_type: Optional[str] = None
    is_encrypted: bool
    access_permissions: List[str]
    created_at: datetime
    
    class Config:
        from_attributes = True
