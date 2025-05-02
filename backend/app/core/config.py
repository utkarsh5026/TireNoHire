import os
from dotenv import load_dotenv

load_dotenv()


class Settings:
    PROJECT_NAME: str = "Resume Match"
    API_V1_STR: str = "/api"

    # LLM API settings
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY")

    # File upload settings
    MAX_UPLOAD_SIZE: int = 10 * 1024 * 1024  # 10 MB limit
    ALLOWED_EXTENSIONS: list = ["pdf", "doc", "docx"]

    # Storage settings
    UPLOAD_DIR: str = "uploads"

    # MongoDB settings
    MONGODB_URL: str = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
    DATABASE_NAME: str = os.getenv("DATABASE_NAME", "tireno_hire")


settings = Settings()
