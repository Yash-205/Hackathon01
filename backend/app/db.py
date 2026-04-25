import os
import certifi
from motor.motor_asyncio import AsyncIOMotorClient # type: ignore
from app.config import MONGODB_URI

client = AsyncIOMotorClient(
    MONGODB_URI,
    tlsCAFile=certifi.where(),
    serverSelectionTimeoutMS=5000
)
# Use the database name specified in the MONGODB_URI (fitmatev2)
db = client.get_default_database()

async def get_db():
    return db
