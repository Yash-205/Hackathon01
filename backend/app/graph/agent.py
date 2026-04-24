import os
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient
from langgraph.checkpoint.mongodb import AsyncMongoDBSaver
from langgraph.graph import StateGraph, START, END, MessagesState
from langgraph.prebuilt import ToolNode, tools_condition
from app.graph.nodes import llm, generate_mindmap_tool

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
    # Bind tools to the LLM
    tools = [generate_mindmap_tool]
    llm_with_tools = llm.bind_tools(tools)

    def chatbot(state: MessagesState):
        return {"messages": [llm_with_tools.invoke(state["messages"])]}

    graph_builder = StateGraph(MessagesState)

    graph_builder.add_node("chatbot", chatbot)
    graph_builder.add_node("tools", ToolNode(tools))

    graph_builder.add_edge(START, "chatbot")
    graph_builder.add_conditional_edges(
        "chatbot",
        tools_condition,
    )
    graph_builder.add_edge("tools", "chatbot")

    return graph_builder.compile(checkpointer=memory)


# Pre-compiled graph instance
graph = build_graph()
