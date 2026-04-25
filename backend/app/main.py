from fastapi import FastAPI, Request, Depends, HTTPException # type: ignore
import json
from fastapi.middleware.cors import CORSMiddleware # type: ignore
from fastapi.responses import JSONResponse # type: ignore
from app.routes.chat import router as chat_router
from app.routes.threads import router as threads_router
from app.routes.mindmap import router as mindmap_router
from app.routes.auth import router as auth_router, get_current_user
from app.routes.documents import router as documents_router

app = FastAPI(title="Chatbot API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    # This handler ensures that even 500 errors return CORS headers
    # so the browser shows the actual error instead of a CORS failure.
    return JSONResponse(
        status_code=500,
        content={"detail": str(exc)},
        headers={
            "Access-Control-Allow-Origin": "http://localhost:3000",
            "Access-Control-Allow-Credentials": "true",
        }
    )

app.include_router(auth_router)
app.include_router(chat_router)
app.include_router(mindmap_router)
app.include_router(threads_router)
app.include_router(documents_router)


from app.db import get_db
from bson import ObjectId
from app.vector_store import client as qdrant_client, COLLECTION_NAME, VectorParams, Distance

@app.post("/api/testing/cleanup")
async def cleanup_database():
    db = await get_db()
    try:
        # Clear MongoDB
        await db.users.delete_many({})
        await db.threads.delete_many({})
        await db.messages.delete_many({})
        await db.documents.delete_many({})
        
        # Clear Qdrant Vector Store
        if qdrant_client.collection_exists(COLLECTION_NAME):
            qdrant_client.delete_collection(collection_name=COLLECTION_NAME)
            qdrant_client.create_collection(
                collection_name=COLLECTION_NAME,
                vectors_config=VectorParams(size=384, distance=Distance.COSINE),
            )
            
        return {"message": "Database and Vector Store cleaned successfully"}
    except Exception as e:
        return JSONResponse(status_code=500, content={"detail": str(e)})

from app.routes.chat import _get_chat_response
from app.models.chat import ChatRequest, MessageSchema
from fastapi import UploadFile

@app.post("/api/chat-fix")
async def chat_fix(request: Request, current_user: dict = Depends(get_current_user)):
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


@app.get("/health")
async def health():
    return {"status": "ok", "version": "1.0.2"} # Force reload
