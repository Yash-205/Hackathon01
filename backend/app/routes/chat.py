import json
from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from app.routes.auth import get_current_user
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
from app.models.chat import ChatRequest
from app.graph.agent import graph

router = APIRouter(prefix="/api", tags=["chat"])


def _to_langchain_message(msg):
    """Convert a schema message to a LangChain message object."""
    if msg.role == "user":
        return HumanMessage(content=msg.content)
    elif msg.role == "assistant":
        return AIMessage(content=msg.content)
    elif msg.role == "system":
        return SystemMessage(content=msg.content)
    return HumanMessage(content=msg.content)


async def _stream_response(messages, thread_id: str):
    """Stream the LLM response using Vercel AI SDK Data Stream Protocol."""
    # We only send the latest user message because the state is persisted by MongoDBSaver.
    # However, Vercel AI SDK sends the whole history. LangGraph will append it.
    # If using checkpointer, it's usually better to just pass the last message.
    # But to be safe with Vercel's format, we can just pass the last message.
    
    last_message = messages[-1] if messages else None
    input_messages = [_to_langchain_message(last_message)] if last_message else []

    config = {"configurable": {"thread_id": thread_id}}

    async for event in graph.astream_events(
        {"messages": input_messages},
        config=config,
        version="v2",
    ):
        kind = event.get("event")
        if kind == "on_chat_model_stream":
            content = event["data"]["chunk"].content
            if content:
                # Vercel Data Stream Protocol format for text chunks
                yield f'0:{json.dumps(content)}\n'




@router.post("/chat")
async def chat(request: ChatRequest, current_user: dict = Depends(get_current_user)):
    """Chat endpoint that streams the AI response as Server-Sent Events."""
    thread_id = request.id or "default_thread"
    return StreamingResponse(
        _stream_response(request.messages, thread_id),
        media_type="text/plain",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Vercel-AI-Data-Stream": "v1"
        },
    )
