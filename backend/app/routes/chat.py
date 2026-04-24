import json
from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
from app.models.schemas import ChatRequest
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


async def _stream_response(messages):
    """Stream the LLM response token-by-token via SSE."""
    lc_messages = [_to_langchain_message(m) for m in messages]

    async for event in graph.astream_events(
        {"messages": lc_messages},
        version="v2",
    ):
        kind = event.get("event")
        if kind == "on_chat_model_stream":
            content = event["data"]["chunk"].content
            if content:
                yield f"data: {json.dumps({'token': content})}\n\n"

    yield "data: [DONE]\n\n"


@router.post("/chat")
async def chat(request: ChatRequest):
    """Chat endpoint that streams the AI response as Server-Sent Events."""
    return StreamingResponse(
        _stream_response(request.messages),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        },
    )
