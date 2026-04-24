from pydantic import BaseModel


class MessageSchema(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    messages: list[MessageSchema]


class ChatResponse(BaseModel):
    reply: str
