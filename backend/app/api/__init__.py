from .auth import router as auth_router
from .users import router as users_router
from .trips import router as trips_router
from .locations import router as locations_router
from .flights import router as flights_router
from .messages import router as messages_router
from .documents import router as documents_router
from .notifications import router as notifications_router
from .clients import router as clients_router

__all__ = [
    "auth_router",
    "users_router", 
    "trips_router",
    "locations_router",
    "flights_router",
    "messages_router",
    "documents_router",
    "notifications_router",
    "clients_router"
]
