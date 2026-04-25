from fastapi import APIRouter, HTTPException
from app.db import get_db
import os

router = APIRouter(prefix="/api/testing", tags=["testing"])

@router.post("/cleanup")
async def cleanup_database():
    # SECURITY: Only allow this in a test/development environment
    # In a real app, you'd check an ENV variable
    db = await get_db()
    
    try:
        # Clear specific collections
        await db.users.delete_many({})
        await db.threads.delete_many({})
        await db.messages.delete_many({})
        await db.documents.delete_many({})
        
        return {"message": "Database cleaned successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
