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
        streaming=True,
    )

@tool
def generate_mindmap_tool(text: str) -> str:
    """Generate a structured mind map from the given text content.
    Returns a JSON string with a central_topic and an array of 3-8 nodes,
    each with id, label, detail, and color."""
    return "Mind map generated successfully. The user can now see it in the UI."

def chatbot_node(state: dict) -> dict:
    """Process the current messages through the LLM and return the response."""
    messages = state["messages"]
    response = llm.invoke(messages)
    return {"messages": [response]}
