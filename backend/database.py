from motor.motor_asyncio import AsyncIOMotorClient
from config import get_settings

settings = get_settings()

_client: AsyncIOMotorClient | None = None


async def connect_db():
    """Connect to MongoDB (singleton)."""
    global _client
    if _client is None:
        _client = AsyncIOMotorClient(settings.MONGODB_URI)
    return _client


async def get_db():
    """Get the database instance."""
    client = await connect_db()
    return client[settings.DATABASE_NAME]


async def close_db():
    """Close the MongoDB connection."""
    global _client
    if _client is not None:
        _client.close()
        _client = None
