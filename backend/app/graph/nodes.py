from langchain_groq import ChatGroq
from langchain_core.messages import AIMessage, SystemMessage, HumanMessage
from langchain_core.tools import tool
from app.config import GROQ_API_KEY, MODEL_NAME
import json

# If API key is missing, we'll use a mock responder
if not GROQ_API_KEY or GROQ_API_KEY == "your-groq-api-key-here":
    class MockLLM:
        def invoke(self, messages):
            return AIMessage(content=f"Hello! [Mock Mode] You said: '{messages[-1].content}'")
        
        def bind_tools(self, tools):
            return self

        async def astream_events(self, input_data, version):
            text = f"Hello! [Mock Mode] You said: {input_data['messages'][-1].content}"
            for token in text.split():
                yield {
                    "event": "on_chat_model_stream",
                    "data": {"chunk": AIMessage(content=token + " ")}
                }
    llm = MockLLM()
else:
    llm = ChatGroq(
        model=MODEL_NAME,
        api_key=GROQ_API_KEY,
        streaming=False,
    )

from app.db import db, get_db
from langchain_core.runnables import RunnableConfig
from app.vector_store import search_vector_store

@tool
async def search_documents(query: str, config: RunnableConfig) -> str:
    """Search the user's uploaded study materials and notes."""
    user_id = config.get("configurable", {}).get("user_id")
    if not user_id:
        return "Error: User not authenticated."

    try:
        # Search vector store for relevant chunks
        results = search_vector_store(query=query, user_id=user_id, k=3)
        
        if not results:
            return "No documents found for this user. Ask user to upload materials."
        
        context = "Information found in your uploaded documents:\n\n"
        for doc in results:
            content = doc.page_content
            filename = doc.metadata.get("filename", "Unknown Document")
            if len(content) > 1500:
                content = content[:1500] + "..."
            context += f"--- {filename} ---\n{content}\n\n"
            
        return context
    except Exception as e:
        return f"Error searching documents: {str(e)}"

@tool
def generate_mindmap_tool(text: str) -> str:
    """Generate a structured mind map to visualize a complex topic."""
    return "MIND_MAP_TRIGGERED"

