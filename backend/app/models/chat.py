from pydantic import BaseModel


class MessageSchema(BaseModel):
    role: str
    content: str


from typing import Optional

class ChatRequest(BaseModel):
    messages: list[MessageSchema]
    id: Optional[str] = None


class ChatResponse(BaseModel):
    reply: str
