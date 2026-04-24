from langgraph.graph import StateGraph, START, END, MessagesState
from app.graph.nodes import chatbot_node


def build_graph():
    """Build and compile the LangGraph chatbot graph."""
    graph_builder = StateGraph(MessagesState)

    graph_builder.add_node("chatbot", chatbot_node)

    graph_builder.add_edge(START, "chatbot")
    graph_builder.add_edge("chatbot", END)

    return graph_builder.compile()


# Pre-compiled graph instance
graph = build_graph()
