import os
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient
from langgraph.checkpoint.mongodb import AsyncMongoDBSaver
from langgraph.graph import StateGraph, START, END, MessagesState
from app.graph.nodes import chatbot_node

# Ensure .env is loaded
load_dotenv()

# Initialize MongoDB checkpointer
mongodb_uri = os.getenv("MONGODB_URI")
client = None
memory = None

if mongodb_uri:
    try:
        client = AsyncIOMotorClient(mongodb_uri)
        memory = AsyncMongoDBSaver(client)
    except Exception as e:
        print(f"Warning: Failed to initialize MongoDB Checkpointer: {e}")

def build_graph():
    """Build and compile the LangGraph chatbot graph."""
    graph_builder = StateGraph(MessagesState)

    graph_builder.add_node("chatbot", chatbot_node)

    graph_builder.add_edge(START, "chatbot")
    graph_builder.add_edge("chatbot", END)

    return graph_builder.compile(checkpointer=memory)


# Pre-compiled graph instance
graph = build_graph()
