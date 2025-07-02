from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
import os
import uuid
from ..core.database import get_db
from ..models.document import Document
from ..models.trip import Trip
from ..models.user import User
from ..schemas.document import Document as DocumentSchema, DocumentCreate
from ..api.dependencies import get_current_active_user, require_staff_or_admin

router = APIRouter(prefix="/documents", tags=["documents"])

@router.get("/trips/{trip_id}/documents", response_model=List[DocumentSchema])
async def get_trip_documents(
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
    
    documents = db.query(Document).filter(Document.trip_id == trip_id).all()
    return documents

@router.post("/trips/{trip_id}/documents", response_model=DocumentSchema)
async def upload_document(
    trip_id: str,
    file: UploadFile = File(...),
    document_type: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_staff_or_admin)
):
    trip = db.query(Trip).filter(Trip.id == trip_id).first()
    if trip is None:
        raise HTTPException(status_code=404, detail="Trip not found")
    
    if current_user.role.value == "staff" and trip.staff_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to upload documents for this trip")
    
    upload_dir = "uploads/documents"
    os.makedirs(upload_dir, exist_ok=True)
    
    file_extension = os.path.splitext(file.filename)[1]
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    file_path = os.path.join(upload_dir, unique_filename)
    
    with open(file_path, "wb") as buffer:
        content = await file.read()
        buffer.write(content)
    
    document = Document(
        trip_id=trip_id,
        uploaded_by=current_user.id,
        filename=file.filename,
        file_path=file_path,
        file_size=len(content),
        mime_type=file.content_type,
        document_type=document_type,
        is_encrypted=True,
        access_permissions=[]
    )
    
    db.add(document)
    db.commit()
    db.refresh(document)
    
    return document

@router.get("/documents/{document_id}/download")
async def download_document(
    document_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    document = db.query(Document).filter(Document.id == document_id).first()
    if document is None:
        raise HTTPException(status_code=404, detail="Document not found")
    
    trip = db.query(Trip).filter(Trip.id == document.trip_id).first()
    from ..api.trips import _can_access_trip
    if not _can_access_trip(current_user, trip, db):
        raise HTTPException(status_code=403, detail="Not authorized to access this document")
    
    if not os.path.exists(document.file_path):
        raise HTTPException(status_code=404, detail="File not found on server")
    
    from fastapi.responses import FileResponse
    return FileResponse(
        path=document.file_path,
        filename=document.filename,
        media_type=document.mime_type
    )

@router.delete("/documents/{document_id}")
async def delete_document(
    document_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_staff_or_admin)
):
    document = db.query(Document).filter(Document.id == document_id).first()
    if document is None:
        raise HTTPException(status_code=404, detail="Document not found")
    
    trip = db.query(Trip).filter(Trip.id == document.trip_id).first()
    if current_user.role.value == "staff" and trip.staff_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete documents for this trip")
    
    if os.path.exists(document.file_path):
        os.remove(document.file_path)
    
    db.delete(document)
    db.commit()
    
    return {"message": "Document deleted successfully"}
