from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # MongoDB
    MONGODB_URI: str = "mongodb://localhost:27017/earthscape"
    DATABASE_NAME: str = "earthscape"

    # JWT
    SECRET_KEY: str = "earthscape-dev-secret-key-2024"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_HOURS: int = 24

    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 8000

    # CORS
    FRONTEND_URL: str = "http://localhost:3000"

    class Config:
        env_file = "../.env"
        extra = "ignore"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
