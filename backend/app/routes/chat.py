import json
from fastapi import APIRouter, Depends, Request, UploadFile
from fastapi.responses import StreamingResponse
from app.routes.auth import get_current_user
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
from app.models.chat import ChatRequest, MessageSchema
from app.graph.agent import graph
from app.routes.documents import _process_file

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


async def _stream_response(messages, thread_id: str, user_id: str, files=None):
    """Stream the LLM response using Vercel AI SDK Data Stream Protocol."""
    def text_chunk(content: str):
        return f'0:{json.dumps(content)}\n'
    
    def data_chunk(data: dict):
        return f'2:{json.dumps([data])}\n'

    # Process files first if any
    if files:
        for file in files:
            yield data_chunk({"status": f"INGESTING: {file.filename.upper()}"})
            try:
                await _process_file(file, user_id)
            except Exception as err:
                yield data_chunk({"status": f"INGESTION FAILED: {str(err)}"})
        yield data_chunk({"status": "CONTEXT LOADED"})

    last_message = messages[-1] if messages else None
    input_messages = [_to_langchain_message(last_message)] if last_message else []

    config = {
        "configurable": {
            "thread_id": thread_id,
            "user_id": user_id
        }
    }

    async for event in graph.astream_events(
        {"messages": input_messages},
        config=config,
        version="v2",
    ):
        kind = event.get("event")
        
        if kind == "on_chat_model_stream":
            node_name = event.get("metadata", {}).get("langgraph_node")
            if node_name == "chatbot":
                content = event["data"]["chunk"].content
                if content:
                    yield text_chunk(content)
        
        elif kind == "on_tool_start":
            tool_name = event.get("name")
            yield data_chunk({"status": f"USING TOOL: {tool_name.upper()}"})
        
        elif kind == "on_chain_start" and event.get("name") == "chatbot":
            yield data_chunk({"status": "THINKING..."})

    # Finalize the stream with a finish message (Prefix 'e' for FINISH_MESSAGE)
    yield f'e:{json.dumps({"finishReason": "stop", "usage": {"promptTokens": 0, "completionTokens": 0}})}\n'


@router.post("/chat")
async def chat(
    request: Request,
    current_user: dict = Depends(get_current_user)
):
    """Chat endpoint that handles both JSON and Multipart Form Data (AI SDK style)."""
    content_type = request.headers.get("Content-Type", "")
    
    thread_id = "default_thread"
    messages = []
    files = []
    
    if "multipart/form-data" in content_type:
        form_data = await request.form()
        messages_str = form_data.get("messages", "[]")
        messages_json = json.loads(messages_str)
        messages = [MessageSchema(**msg) for msg in messages_json]
        thread_id = form_data.get("id", "default_thread")
        files = [v for k, v in form_data.items() if isinstance(v, UploadFile)]
    else:
        body = await request.json()
        req_model = ChatRequest(**body)
        messages = req_model.messages
        thread_id = req_model.id or "default_thread"

    return StreamingResponse(
        _stream_response(messages, thread_id, str(current_user["_id"]), files),
        media_type="text/plain",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Vercel-AI-Data-Stream": "v1"
        },
    )
