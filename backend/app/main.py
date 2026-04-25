from fastapi import FastAPI, Request # type: ignore
from fastapi.middleware.cors import CORSMiddleware # type: ignore
from fastapi.responses import JSONResponse # type: ignore
from app.routes.chat import router as chat_router
from app.routes.auth import router as auth_router
from app.routes.mindmap import router as mindmap_router
from app.routes.threads import router as threads_router
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

@app.post("/api/testing/cleanup")
async def cleanup_database():
    db = await get_db()
    try:
        await db.users.delete_many({})
        await db.threads.delete_many({})
        await db.messages.delete_many({})
        await db.documents.delete_many({})
        return {"message": "Database cleaned successfully"}
    except Exception as e:
        return JSONResponse(status_code=500, content={"detail": str(e)})

@app.get("/health")
async def health():
    return {"status": "ok", "version": "1.0.1"} # Incremented version to verify reload
# Backend reloaded for testing
