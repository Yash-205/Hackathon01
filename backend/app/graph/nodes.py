from langchain_groq import ChatGroq
from langchain_core.messages import AIMessage
from app.config import GROQ_API_KEY, MODEL_NAME

# If API key is missing, we'll use a mock responder
if not GROQ_API_KEY or GROQ_API_KEY == "your-groq-api-key-here":
    class MockLLM:
        def invoke(self, messages):
            return AIMessage(content=f"Hello! [Mock Mode] You said: '{messages[-1].content}'")
        
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


def chatbot_node(state: dict) -> dict:
    """Process the current messages through the LLM and return the response."""
    messages = state["messages"]
    response = llm.invoke(messages)
    return {"messages": [response]}
