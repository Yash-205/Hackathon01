from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class ThreadBase(BaseModel):
    id: str
    title: str
    user_id: str
    updated_at: datetime = datetime.now()

class ThreadCreate(BaseModel):
    id: str
    title: str
