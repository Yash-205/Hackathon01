import json
from fastapi import APIRouter, Depends, Request, UploadFile
from fastapi.responses import JSONResponse
from app.routes.auth import get_current_user
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
from app.models.chat import ChatRequest, MessageSchema
from app.graph.agent import graph
from app.routes.documents import _process_file

router = APIRouter(prefix="/api", tags=["chat"])

def _to_langchain_message(msg):
    if msg.role == "user":
        return HumanMessage(content=msg.content)
    elif msg.role == "assistant":
        return AIMessage(content=msg.content)
    elif msg.role == "system":
        return SystemMessage(content=msg.content)
    return HumanMessage(content=msg.content)

async def _get_chat_response(messages, thread_id: str, user_id: str, files=None):
    if files:
        for file in files:
            try:
                await _process_file(file, user_id)
            except Exception as err:
                print(f"Ingestion failed: {err}")

    last_message = messages[-1] if messages else None
    input_messages = [_to_langchain_message(last_message)] if last_message else []

    config = {"configurable": {"thread_id": thread_id, "user_id": user_id}}

    try:
        final_state = await graph.ainvoke({"messages": input_messages}, config=config)
        assistant_messages = [m for m in final_state["messages"] if isinstance(m, AIMessage)]
        last_assistant_msg = assistant_messages[-1] if assistant_messages else AIMessage(content="I couldn't generate a response.")
        content = last_assistant_msg.content
    except Exception as e:
        content = f"Error: {str(e)}"
    
    return {"id": thread_id, "role": "assistant", "content": content}

@router.post("/chat-v2")
async def chat(request: Request, current_user: dict = Depends(get_current_user)):
    content_type = request.headers.get("Content-Type", "")
    if "multipart/form-data" in content_type:
        form_data = await request.form()
        messages_json = json.loads(form_data.get("messages", "[]"))
        messages = [MessageSchema(**msg) for msg in messages_json]
        thread_id = form_data.get("id", "default_thread")
        files = [v for k, v in form_data.items() if isinstance(v, UploadFile)]
    else:
        body = await request.json()
        req_model = ChatRequest(**body)
        messages = req_model.messages
        thread_id = req_model.id or "default_thread"
        files = []

    response_data = await _get_chat_response(messages, thread_id, str(current_user["_id"]), files)
    return JSONResponse(content=response_data)
