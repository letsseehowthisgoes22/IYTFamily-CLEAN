from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from ..core.database import get_db
from ..models.client import Client
from ..models.user import User, UserRole
from ..schemas.client import Client as ClientSchema, ClientCreate, ClientUpdate
from ..api.dependencies import get_current_active_user, require_admin

router = APIRouter(prefix="/clients", tags=["clients"])

@router.post("/", response_model=ClientSchema)
async def create_client(
    client_data: ClientCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    db_client = Client(**client_data.dict())
    db.add(db_client)
    db.commit()
    db.refresh(db_client)
    return db_client

@router.get("/", response_model=List[ClientSchema])
async def read_clients(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    query = db.query(Client)
    
    if current_user.role in [UserRole.FAMILY, UserRole.PROVIDERS]:
        query = query.filter(Client.family_user_id == current_user.id)
    elif current_user.role == UserRole.STAFF:
        from ..models.trip import Trip
        client_ids = db.query(Trip.client_id).filter(Trip.staff_id == current_user.id).distinct().all()
        client_ids = [client_id[0] for client_id in client_ids if client_id[0]]
        query = query.filter(Client.id.in_(client_ids))
    
    clients = query.offset(skip).limit(limit).all()
    return clients

@router.get("/{client_id}", response_model=ClientSchema)
async def read_client(
    client_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    client = db.query(Client).filter(Client.id == client_id).first()
    if client is None:
        raise HTTPException(status_code=404, detail="Client not found")
    
    if not _can_access_client(current_user, client, db):
        raise HTTPException(status_code=403, detail="Not authorized to access this client")
    
    return client

@router.put("/{client_id}", response_model=ClientSchema)
async def update_client(
    client_id: str,
    client_update: ClientUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    client = db.query(Client).filter(Client.id == client_id).first()
    if client is None:
        raise HTTPException(status_code=404, detail="Client not found")
    
    update_data = client_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(client, field, value)
    
    db.commit()
    db.refresh(client)
    return client

@router.post("/{client_id}/assign-family")
async def assign_client_to_family(
    client_id: str,
    family_user_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    client = db.query(Client).filter(Client.id == client_id).first()
    if client is None:
        raise HTTPException(status_code=404, detail="Client not found")
    
    family_user = db.query(User).filter(
        User.id == family_user_id,
        User.role.in_([UserRole.FAMILY, UserRole.PROVIDERS])
    ).first()
    if family_user is None:
        raise HTTPException(status_code=404, detail="Family/Provider user not found")
    
    client.family_user_id = family_user_id
    db.commit()
    db.refresh(client)
    
    return {"message": "Client assigned successfully", "client": client}

@router.post("/{client_id}/unassign-family")
async def unassign_client_from_family(
    client_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    client = db.query(Client).filter(Client.id == client_id).first()
    if client is None:
        raise HTTPException(status_code=404, detail="Client not found")
    
    client.family_user_id = None
    db.commit()
    db.refresh(client)
    
    return {"message": "Client unassigned successfully", "client": client}

@router.get("/unassigned/list", response_model=List[ClientSchema])
async def get_unassigned_clients(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    clients = db.query(Client).filter(Client.family_user_id.is_(None)).all()
    return clients

def _can_access_client(user: User, client: Client, db: Session) -> bool:
    if user.role == UserRole.ADMIN:
        return True
    elif user.role in [UserRole.FAMILY, UserRole.PROVIDERS]:
        return client.family_user_id == user.id
    elif user.role == UserRole.STAFF:
        from ..models.trip import Trip
        trip_exists = db.query(Trip).filter(
            Trip.client_id == client.id,
            Trip.staff_id == user.id
        ).first()
        return trip_exists is not None
    return False
