# 🧠 NeuroTutor AI: Hackathon MVP Architecture & Implementation Guide

This document serves as the definitive blueprint for taking the current NeuroTutor AI codebase to a **winning, demo-ready state** within a hackathon timeframe (the next 12-24 hours). It details the exact architecture we will use, the specific code files that need modification, and the step-by-step implementation strategy for each feature.

---

## 1. Architectural Vision vs. Hackathon Reality

The original design documents outline a sophisticated 10-agent system. While visionary, building 10 distinct, reliable agents in a hackathon is a recipe for integration hell and demo failure. 

### The Pragmatic "Hackathon-Winning" Architecture
We will focus on a **4-Agent + 1-Tool** architecture that delivers the core value proposition flawlessly:
1. **The Conductor (LangGraph `StateGraph`)**: Orchestrates the conversation and routes between regular chat and tool calling.
2. **The Content Creator (LLM + System Prompt)**: Generates educational responses, dynamically styled based on the user's profile.
3. **The Document Processor (API Endpoint)**: Extracts text from PDFs and images on upload.
4. **The Context Manager (RAG via MongoDB)**: Retrieves relevant document chunks based on user queries.
5. *[NEW]* **The Feedback Loop ("Quiz Me" Endpoint/Tool)**: Automatically generates context-aware multiple-choice quizzes to validate learning.

### The "Golden Path" Demo Flow We Are Building
1. **Onboarding**: User logs in and is prompted for their Grade Level and Learning Style (Visual, Text, Interactive).
2. **Ingestion**: User uploads a Biology PDF.
3. **Inquiry**: User asks, "Explain the light-dependent reactions."
4. **RAG + Personalization**: The backend searches the PDF, retrieves the exact paragraph, and explains it using a *Visual Analogy* suitable for a 10th grader.
5. **Interactive Visualization**: The UI generates an interactive Mind Map of the explanation.
6. **Validation**: User clicks "Quiz Me", and the system generates a 3-question MCQ based *only* on the previous explanation.

---

## 2. Phase 1: Fixing RAG (Retrieval-Augmented Generation)

### The Problem
Currently, the `search_documents` tool in `app/graph/nodes.py` does a naive MongoDB `.find().sort().limit(5)`. It simply returns the last 5 uploaded documents, completely ignoring the user's actual question. This means the AI cannot answer specific questions about uploaded notes.

### The Solution: MongoDB Full-Text Search
While a Vector DB (like ChromaDB or Pinecone) is ideal, setting it up during a hackathon introduces massive overhead (embeddings APIs, dependency management, latency). Instead, we will use **MongoDB's native Full-Text Search**. It is fast, requires zero extra dependencies, and is more than capable for a demo.

### Implementation Steps

#### 1. Update Database Initialization (`backend/app/db.py`)
We need to ensure a text index exists on the `content` field of the `documents` collection.
```python
# backend/app/db.py
async def init_db():
    # Create text index for semantic search
    await db.documents.create_index([("content", "text")])
```
*Note: We will call `init_db()` on application startup in `main.py`.*

#### 2. Rewrite the Search Tool (`backend/app/graph/nodes.py`)
Update the `search_documents` tool to utilize the `$text` search operator.
```python
@tool
async def search_documents(query: str, config: RunnableConfig) -> str:
    """Search the user's uploaded study materials and notes."""
    user_id = config.get("configurable", {}).get("user_id")
    if not user_id:
        return "Error: User not authenticated."

    try:
        db = await get_db()
        # MongoDB Full-Text Search
        cursor = db.documents.find(
            {
                "user_id": user_id,
                "$text": {"$search": query}
            },
            {"score": {"$meta": "textScore"}}
        ).sort([("score", {"$meta": "textScore"})]).limit(3)
        
        docs = await cursor.to_list(length=3)
        
        if not docs:
            return f"No specific information found in uploaded documents for: '{query}'. Provide a general educational answer."
            
        context = "Information found in your uploaded documents:\n\n"
        for doc in docs:
            # Simple chunking: grab the first 1500 chars (can be improved with highlighting)
            content = doc["content"][:1500] + "..." if len(doc["content"]) > 1500 else doc["content"]
            context += f"--- Source: {doc['filename']} ---\n{content}\n\n"
            
        return context
    except Exception as e:
        return f"Error searching documents: {str(e)}"
```

#### 3. Update Document Processor (`backend/app/routes/documents.py`)
Ensure that the text extracted from PDFs/Images is clean enough for indexing. The current `pdfplumber` implementation is sufficient for the MVP.

---

## 3. Phase 2: The Learner Profiler (Personalization)

### The Problem
The current system prompt in `agent.py` is static: *"You are NeuroTutor AI... Be concise, professional, and academic."* This completely ignores the "Adaptive Learning" core value proposition.

### The Solution: Dynamic System Prompts based on User Data
We will add a simple onboarding modal to the frontend to capture learning preferences, store them in MongoDB, and inject them into the LangGraph system prompt.

### Implementation Steps

#### 1. Update Database Schema (`backend/app/routes/auth.py`)
When creating a new user or getting the current user, we need to handle the `profile` object.
```python
# Add to User schema/creation
profile = {
    "grade_level": "10th Grade",
    "learning_style": "visual", # visual, auditory, kinesthetic
    "interests": ["gaming", "sports"]
}
```

#### 2. Create the Onboarding API (`backend/app/routes/auth.py`)
Add a `PUT /api/auth/profile` endpoint to update these preferences.

#### 3. Dynamic System Prompt Injection (`backend/app/graph/agent.py`)
Modify `build_graph()` to accept the `user_id`, fetch the profile, and generate a dynamic prompt.

```python
async def get_dynamic_prompt(user_id: str):
    db = await get_db()
    user = await db.users.find_one({"_id": ObjectId(user_id)})
    profile = user.get("profile", {})
    
    grade = profile.get("grade_level", "High School")
    style = profile.get("learning_style", "visual")
    
    style_instructions = ""
    if style == "visual":
        style_instructions = "Use highly visual analogies. Describe scenes, colors, and spatial relationships."
    elif style == "interactive":
        style_instructions = "Use Socratic questioning. Don't just give answers, ask the student what they think first."
        
    return f"""You are NeuroTutor AI, a premium learning assistant.
    You are currently tutoring a {grade} student who learns best through {style} explanations.
    
    {style_instructions}
    
    TOOLS:
    1. `search_documents`: ALWAYS use this first if the user asks about specific topics to check their notes.
    2. `generate_mindmap_tool`: Suggest using the Mind Map button for complex topics.
    
    RESPONSE STYLE:
    - Never generate ASCII flowcharts.
    - Keep responses under 4 short paragraphs.
    - Always end with an encouraging remark.
    """
```

#### 4. Frontend Onboarding Modal (`frontend/src/components/onboarding-modal.tsx`)
Create a beautiful, glassmorphic modal that appears if `user.profile` is empty.
- **Select Grade**: Dropdown (Middle School, High School, College).
- **Select Style**: Cards with icons (👀 Visual, 🎧 Auditory, 👐 Hands-on).
- **Save**: Calls `PUT /api/auth/profile` and refreshes the page state.

---

## 4. Phase 3: The "Wow" Factor (Quiz Generation)

### The Problem
Chatbots are everywhere. To win a hackathon in the EdTech space, you need active learning, not just passive reading. The "Feedback Loop Agent" from the docs is missing.

### The Solution: Context-Aware MCQ Generation
We will add a "Quiz Me" button to the chat UI. When clicked, it calls a dedicated endpoint that reads the *last AI message* and generates a 3-question multiple-choice quiz.

### Implementation Steps

#### 1. Backend Quiz Endpoint (`backend/app/routes/quiz.py`)
Create a new router utilizing `with_structured_output` for guaranteed JSON generation.

```python
from pydantic import BaseModel, Field

class QuizQuestion(BaseModel):
    question: str = Field(..., description="The multiple choice question")
    options: List[str] = Field(..., description="Exactly 4 options")
    correct_answer_index: int = Field(..., description="Index of the correct option (0-3)")
    explanation: str = Field(..., description="Why this answer is correct")

class QuizResponse(BaseModel):
    questions: List[QuizQuestion]

@router.post("/generate-quiz")
async def generate_quiz(request: Request):
    # Extract the text context from the request (the last AI message)
    # Use LLM with structured output:
    structured_llm = llm.with_structured_output(QuizResponse)
    
    prompt = f"Based ONLY on the following text, generate a 3-question multiple choice quiz to test the student's understanding:\n\n{text}"
    response = structured_llm.invoke([HumanMessage(content=prompt)])
    return response.dict()
```

#### 2. Frontend UI Integration (`frontend/src/components/message-bubble.tsx`)
- Add a "Quiz Me" button next to the "Generate Mind Map" button.
- When clicked, show a loading spinner.
- Render the returned JSON as interactive radio-button questions.
- Show instant green/red feedback when an option is selected, along with the `explanation` text.

---

## 5. Phase 4: UI Polish & The Final 10%

A hackathon is often won on aesthetics and seamless UX.

### 1. The Empty State
When a new user logs in, the chat shouldn't just be an empty black box.
- **Action**: Add an animated "Welcome to NeuroTutor" hero section in the main chat area if `messages.length === 0`.
- Include quick-action buttons: "Upload my Biology syllabus", "Explain Quantum Physics visually", "Test my knowledge on fractions".

### 2. Document Upload Progress
Currently, file uploads might just hang or fail silently if they take too long.
- **Action**: Add a toast notification (`react-hot-toast` or similar) that shows "Analyzing document..." with a spinner while the `/api/documents/upload` request is pending.

### 3. Typing Indicators
The LLM response takes a few seconds before streaming starts.
- **Action**: Show a skeleton loader or a custom animated "NeuroTutor is thinking..." indicator while waiting for the first byte of the stream.

### 4. Error Boundaries
- **Action**: Wrap the `MessageBubble` and `MindMap` in React Error Boundaries so that if a structured JSON parse fails, the whole app doesn't crash with a white screen during the demo.

---

## 6. Execution Strategy

To complete this in time, we will execute in strict phases. We will not move to Phase N+1 until Phase N is fully functional and tested.

1. **Sprint 1 (Database & RAG)**: Modify `db.py` to add text indexes. Update `search_documents`. Test via API.
2. **Sprint 2 (Personalization)**: Add the `PUT /profile` endpoint. Update `build_graph` to use dynamic system prompts.
3. **Sprint 3 (Frontend Onboarding)**: Build the React modal to capture user preferences.
4. **Sprint 4 (Quiz Feature)**: Build the `/generate-quiz` endpoint and the interactive React quiz component.
5. **Sprint 5 (Polish)**: Empty states, loaders, toast notifications.

**Are you ready to begin Sprint 1?**
