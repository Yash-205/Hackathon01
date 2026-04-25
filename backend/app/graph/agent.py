import os
from dotenv import load_dotenv
from app.db import client
from langgraph.checkpoint.mongodb import AsyncMongoDBSaver
from langgraph.graph import StateGraph, START, END, MessagesState
from langchain_core.messages import SystemMessage, RemoveMessage
from langgraph.prebuilt import ToolNode
from app.graph.nodes import llm, generate_mindmap_tool, search_documents

# Initialize MongoDB checkpointer
memory = None
if client:
    try:
        memory = AsyncMongoDBSaver(client)
    except Exception as e:
        print(f"Warning: Failed to initialize MongoDB Checkpointer: {e}")

# ... (rest of the file remains similar until build_graph)

# System Prompt to define chatbot personality and capabilities
SYSTEM_PROMPT = (
    "You are NeuroTutor AI, a premium learning assistant. "
    "Primary goal: Help students understand complex topics using their uploaded materials.\n\n"
    "TOOLS:\n"
    "1. `search_documents`: Use this to find info in uploaded notes/files. ALWAYS search first if the user mentions 'notes' or 'files'.\n"
    "2. `generate_mindmap_tool`: Use this to create a mind map for complex topics or if requested.\n\n"
    "RESPONSE STYLE:\n"
    "- NEVER generate ASCII art, flowcharts, or text-based mind maps yourself.\n"
    "- If a mind map is needed, provide a clear explanation and suggest using the 'Generate Mind Map' button or tool.\n"
    "- If using document context, cite the filename.\n"
    "- If no files found, provide a general answer and suggest uploading notes.\n"
    "- Be concise, professional, and academic."
)

def build_graph():
    """Build and compile the LangGraph chatbot graph."""
    tools = [generate_mindmap_tool, search_documents]
    llm_with_tools = llm.bind_tools(tools)

    async def chatbot(state: MessagesState):
        # Prepend SystemMessage to give context
        messages = [SystemMessage(content=SYSTEM_PROMPT)] + state["messages"]
        response = await llm_with_tools.ainvoke(messages)
        return {"messages": [response]}

    async def summarize_conversation(state: MessagesState):
        messages = state["messages"]
        if len(messages) <= 6:
            return {"messages": []}
        
        messages_to_summarize = messages[:-4]
        summary_prompt = (
            "Summarize the preceding conversation history into a concise paragraph. "
            "Focus on the main topics and decisions. Keep it under 100 words."
        )
        
        summary_response = await llm.ainvoke([
            SystemMessage(content=summary_prompt),
            *messages_to_summarize
        ])
        
        summary_message = SystemMessage(content=f"Previous Conversation Summary: {summary_response.content}")
        delete_messages = [RemoveMessage(id=m.id) for m in messages_to_summarize if m.id]
        
        return {"messages": delete_messages + [summary_message]}

    def route_after_chatbot(state: MessagesState):
        """Unified router to handle tool calls and summarization."""
        last_message = state["messages"][-1]
        
        # If the LLM wants to call a tool, go to tools
        if hasattr(last_message, "tool_calls") and last_message.tool_calls:
            return "tools"
        
        # Otherwise, check if we should summarize
        if len(state["messages"]) > 10:
            return "summarize"
        
        return END

    graph_builder = StateGraph(MessagesState)

    graph_builder.add_node("chatbot", chatbot)
    graph_builder.add_node("tools", ToolNode(tools))
    graph_builder.add_node("summarize", summarize_conversation)

    graph_builder.add_edge(START, "chatbot")
    graph_builder.add_conditional_edges(
        "chatbot",
        route_after_chatbot,
        {"tools": "tools", "summarize": "summarize", END: END}
    )
    graph_builder.add_edge("tools", "chatbot")
    graph_builder.add_edge("summarize", END)

    return graph_builder.compile(checkpointer=memory)


# Pre-compiled graph instance
graph = build_graph()
