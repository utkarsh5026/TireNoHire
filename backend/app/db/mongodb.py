from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from loguru import logger
from core.config import settings
from typing import Optional
from db.models import ResumeDB, JobDB, MatchAnalysisDB

# Global client variable
client: Optional[AsyncIOMotorClient] = None


async def connect_to_mongo():
    """Create database connection."""
    global client
    try:
        client = AsyncIOMotorClient(settings.MONGODB_URL)
        await init_beanie(
            database=client[settings.DATABASE_NAME],
            document_models=[ResumeDB, JobDB, MatchAnalysisDB]
        )
        logger.info("Connected to MongoDB")
    except Exception as e:
        logger.error(f"Failed to connect to MongoDB: {e}")
        raise e


async def close_mongo_connection():
    """Close database connection."""
    global client
    if client:
        client.close()
        logger.info("MongoDB connection closed")


def get_db():
    """Return db client."""
    return client[settings.DATABASE_NAME] if client else None
