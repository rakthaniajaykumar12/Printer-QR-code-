import os
from pathlib import Path
from pydantic_settings import BaseSettings

# Base directories
BASE_DIR = Path(__file__).resolve().parent.parent
UPLOAD_DIR = BASE_DIR / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


class Settings(BaseSettings):
    SHOP_NAME: str = "Smart Xerox"
    SHOP_TAGLINE: str = "Fast Mobile Printing • Epson EcoTank L3250"
    DATABASE_URL: str = f"sqlite:///{BASE_DIR / 'smart_xerox.db'}"
    SECRET_KEY: str = "change-this-super-secret-key-in-production-12345678"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days persistent login on owner phone

    OWNER_USERNAME: str = "admin"
    OWNER_PASSWORD: str = "SmartXerox@2026"  # Initial password, can be changed in settings/env

    UPLOAD_DIR: str = str(UPLOAD_DIR)
    MAX_FILE_SIZE_MB: int = 15
    ALLOWED_EXTENSIONS: set = {"pdf", "jpg", "jpeg", "png"}

    RATE_BW_PER_PAGE: float = 2.0
    RATE_COLOR_PER_PAGE: float = 10.0
    FILE_RETENTION_HOURS: int = 24

    CORS_ORIGINS: str = "*"
    FRONTEND_URL: str = "http://localhost:5173"

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "extra": "ignore"
    }


settings = Settings()
