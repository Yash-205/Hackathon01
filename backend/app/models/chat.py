from pydantic import BaseModel


class MessageSchema(BaseModel):
    role: str
    content: str


from typing import Optional, List

class ChatRequest(BaseModel):
    messages: List[MessageSchema]
    id: Optional[str] = None


class ChatResponse(BaseModel):
    reply: str
