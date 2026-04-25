from fastapi import APIRouter, Depends, HTTPException
from typing import List
from app.db import db
from app.routes.auth import get_current_user
from app.models.thread import ThreadBase, ThreadCreate
from datetime import datetime

router = APIRouter(prefix="/api/threads", tags=["threads"])

@router.get("", response_model=List[ThreadBase])
async def get_threads(current_user: dict = Depends(get_current_user)):
    if db is None:
        raise HTTPException(status_code=500, detail="Database not configured")
    
    cursor = db.threads.find({"user_id": current_user["email"]}).sort("updated_at", -1)
    threads = await cursor.to_list(length=100)
    # Convert _id or handle mapping if needed, but here we use the 'id' field
    return threads

@router.post("", response_model=ThreadBase)
async def upsert_thread(thread: ThreadCreate, current_user: dict = Depends(get_current_user)):
    if db is None:
        raise HTTPException(status_code=500, detail="Database not configured")
    
    thread_data = {
        "id": thread.id,
        "title": thread.title,
        "user_id": current_user["email"],
        "updated_at": datetime.now()
    }
    
    await db.threads.update_one(
        {"id": thread.id, "user_id": current_user["email"]},
        {"$set": thread_data},
        upsert=True
    )
    
    return thread_data
