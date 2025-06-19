import os
from typing import Optional
from dotenv import load_dotenv

load_dotenv()


class Settings:
    PROJECT_NAME: str = "Resume Match"
    API_V1_STR: str = "/api"

    OPENAI_API_KEY: Optional[str] = os.getenv("OPENAI_API_KEY")

    # File upload settings
    MAX_UPLOAD_SIZE: int = 10 * 1024 * 1024  # 10 MB limit
    ALLOWED_EXTENSIONS: list = ["pdf", "doc", "docx"]

    # Storage settings
    UPLOAD_DIR: str = "uploads"

    # MongoDB settings
    MONGODB_URL: str = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
    DATABASE_NAME: str = os.getenv("DATABASE_NAME", "tireno_hire")

    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    REDIS_TTL: int = int(os.getenv("REDIS_TTL", "86400"))  # 24 hours default

    # Cache settings
    CACHE_URL_CONTENT: bool = True
    CACHE_EXTRACTED_TEXT: bool = True
    CACHE_PARSED_DATA: bool = True


settings = Settings()
