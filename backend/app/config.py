from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    database_url: str
    secret_key: str
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    google_client_id: str
    google_client_secret: str
    google_redirect_uri: str


    class Config:
        env_file = ".env"


settings = Settings()