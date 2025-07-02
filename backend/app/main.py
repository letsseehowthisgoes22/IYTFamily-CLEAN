from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import psycopg
from .core.database import engine, Base
from .api import (
    auth_router,
    users_router,
    trips_router,
    locations_router,
    flights_router,
    messages_router,
    documents_router,
    notifications_router,
    clients_router
)

app = FastAPI(
    title="IYT Family Transport API",
    description="Secure, HIPAA-compliant API for adolescent behavioral health transport",
    version="1.0.0"
)

# Disable CORS. Do not remove this for full-stack development.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

Base.metadata.create_all(bind=engine)

app.include_router(auth_router, prefix="/api/v1")
app.include_router(users_router, prefix="/api/v1")
app.include_router(trips_router, prefix="/api/v1")
app.include_router(locations_router, prefix="/api/v1")
app.include_router(flights_router, prefix="/api/v1")
app.include_router(messages_router, prefix="/api/v1")
app.include_router(documents_router, prefix="/api/v1")
app.include_router(notifications_router, prefix="/api/v1")
app.include_router(clients_router, prefix="/api/v1")

@app.get("/healthz")
async def healthz():
    return {"status": "ok"}

@app.get("/")
async def root():
    return {
        "message": "IYT Family Transport API",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/healthz"
    }
