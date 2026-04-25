from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from app.routes.auth import get_current_user
from app.db import get_db
from app.agents.document_processor import DocumentProcessor
from datetime import datetime
from bson import ObjectId

router = APIRouter(prefix="/api/documents", tags=["documents"])
processor = DocumentProcessor()

async def _process_file(file: UploadFile, user_id: str):
    """Internal helper to process a file and store it in MongoDB."""
    contents = await file.read()
    if len(contents) > 10 * 1024 * 1024:
        raise Exception("File too large (max 10MB)")

    try:
        # Process the document
        processed_data = processor.process(contents, file.filename)
        
        # Prepare document record
        doc_record = {
            "user_id": user_id,
            "filename": file.filename,
            "content": processed_data["text"],
            "format": processed_data["format"],
            "page_count": processed_data.get("page_count", 1),
            "created_at": datetime.utcnow(),
            "summary": processed_data["text"][:500] + "..." if len(processed_data["text"]) > 500 else processed_data["text"]
        }
        
        db = await get_db()
        await db.documents.insert_one(doc_record)
        return doc_record
    except Exception as e:
        raise Exception(f"Failed to process document: {str(e)}")


@router.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    try:
        doc_record = await _process_file(file, str(current_user["_id"]))
        return {
            "filename": doc_record["filename"],
            "summary": doc_record["summary"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/")
async def list_documents(current_user: dict = Depends(get_current_user)):
    db = await get_db()
    cursor = db.documents.find({"user_id": str(current_user["_id"])}).sort("created_at", -1)
    documents = []
    async for doc in cursor:
        doc["id"] = str(doc["_id"])
        del doc["_id"]
        del doc["content"] # Don't send full content in list
        documents.append(doc)
    return documents

@router.get("/{doc_id}")
async def get_document(doc_id: str, current_user: dict = Depends(get_current_user)):
    db = await get_db()
    doc = await db.documents.find_one({"_id": ObjectId(doc_id), "user_id": str(current_user["_id"])})
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    
    doc["id"] = str(doc["_id"])
    del doc["_id"]
    return doc
