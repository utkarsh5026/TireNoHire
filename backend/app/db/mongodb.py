from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from loguru import logger
from app.core.config import settings
from typing import Optional
from app.db.models import ResumeDB, JobDB, MatchAnalysisDB


client: Optional[AsyncIOMotorClient] = None


async def connect_to_mongo():
    """🔌 Create database connection

    Establishes a connection to MongoDB using the configured URL,
    initializes Beanie with the appropriate document models,
    and logs the connection status.

    Raises:
        Exception: If connection to MongoDB fails
    """
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
    """👋 Close database connection

    Gracefully closes the MongoDB connection when the application
    is shutting down and logs the closure.
    """
    global client
    if client:
        client.close()
        logger.info("MongoDB connection closed")


def get_db():
    """🗃️ Return database client

    Provides access to the MongoDB database instance for
    performing database operations throughout the application.

    Returns:
        Database: MongoDB database instance or None if not connected
    """
    return client[settings.DATABASE_NAME] if client else None
