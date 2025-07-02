from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    database_url: str = "sqlite:///:memory:"
    redis_url: str = "redis://localhost:6379"
    secret_key: str = "your-secret-key-here"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    encryption_key: str = "your-encryption-key-here"
    
    flight_api_key: Optional[str] = None
    google_maps_api_key: Optional[str] = None
    twilio_api_key: Optional[str] = None
    sendgrid_api_key: Optional[str] = None
    
    class Config:
        env_file = ".env"

settings = Settings()
