import os
from motor.motor_asyncio import AsyncIOMotorClient
from app.config import MONGODB_URI

client = AsyncIOMotorClient(MONGODB_URI)
db = client.chatbot_db

async def get_db():
    return db
