import os
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_qdrant import QdrantVectorStore
from qdrant_client import QdrantClient
from qdrant_client.http.models import Distance, VectorParams

# Ensure the database directory exists
DB_DIR = os.path.join(os.path.dirname(__file__), "..", "qdrant_db")
os.makedirs(DB_DIR, exist_ok=True)

# Initialize embeddings
embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")

# Initialize Qdrant Client (Cloud)
qdrant_url = os.getenv("QDRANT_URL")
qdrant_api_key = os.getenv("QDRANT_API_KEY")

if not qdrant_url or not qdrant_api_key:
    raise ValueError("QDRANT_URL and QDRANT_API_KEY must be set in .env for cloud deployment.")

client = QdrantClient(
    url=qdrant_url,
    api_key=qdrant_api_key
)

COLLECTION_NAME = "neurotutor_documents"

# Ensure collection exists
if not client.collection_exists(COLLECTION_NAME):
    client.create_collection(
        collection_name=COLLECTION_NAME,
        vectors_config=VectorParams(size=384, distance=Distance.COSINE),
    )

# Create LangChain wrapper
vector_store = QdrantVectorStore(
    client=client,
    collection_name=COLLECTION_NAME,
    embedding=embeddings,
)

def add_documents_to_vector_store(texts: list[str], metadatas: list[dict]):
    """Adds chunked texts and their metadata to the vector store."""
    if not texts:
        return
    vector_store.add_texts(texts=texts, metadatas=metadatas)

def search_vector_store(query: str, user_id: str, k: int = 3):
    """Searches the vector store with a user_id filter."""
    from qdrant_client.http import models
    
    # Use Qdrant's payload filtering to restrict to user_id
    filter = models.Filter(
        must=[
            models.FieldCondition(
                key="metadata.user_id",
                match=models.MatchValue(value=user_id),
            )
        ]
    )
    
    results = vector_store.similarity_search(
        query=query,
        k=k,
        filter=filter
    )
    return results
