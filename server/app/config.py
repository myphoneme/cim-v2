from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite:///./database.sqlite"
    JWT_SECRET: str = "cims-secret-key-change-in-production"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours

    GEMINI_API_KEY: str = ""

    # Default to wide-open CORS in dev; override in .env for prod
    CORS_ORIGINS: list[str] = ["*"]

    ADMIN_EMAIL: str = "phoneme2016@gmail.com"
    ADMIN_PASSWORD: str = "Solution@1979"

    UPLOAD_DIR: str = "./uploads"
    MAX_UPLOAD_SIZE: int = 50 * 1024 * 1024  # 50MB

    class Config:
        env_file = ".env"
        extra = "ignore"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
