**# 🧠 NeuroTutor AI — Enhanced Multi-Agent System with Document Upload

I'll extend the architecture to include *document upload functionality* that integrates seamlessly with the existing voice/text input system.

---

## UPDATED SYSTEM OVERVIEW

┌─────────────────────────────────────────────────────────────┐

│                    NEUROTUTOR AI SYSTEM                      │

│                                                              │

│   ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │

│   │ Agent 1  │  │ Agent 2  │  │ Agent 3  │  │ Agent 4  │  │

│   │Conductor │──│ Learner  │──│ Content  │──│ Struggle │  │

│   │          │  │ Profiler │  │ Creator  │  │ Detector │  │

│   └──────────┘  └──────────┘  └──────────┘  └──────────┘  │

│        │              │              │              │        │

│   ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │

│   │ Agent 5  │  │ Agent 6  │  │ Agent 7  │  │ Agent 8  │  │

│   │Adaptation│──│ Modality │──│ Feedback │──│ Safety   │  │

│   │Strategist│  │ Renderer │  │ Loop     │  │Guardrail │  │

│   └──────────┘  └──────────┘  └──────────┘  └──────────┘  │

│        │              │              │              │        │

│   ┌──────────┐  ┌──────────┐                               │

│   │ Agent 9  │  │ Agent 10 │         ◄── NEW AGENTS        │

│   │Document  │──│ Context  │                               │

│   │Processor │  │ Manager  │                               │

│   └──────────┘  └──────────┘                               │

└─────────────────────────────────────────────────────────────┘

---

## NEW AGENTS

### 📄 AGENT 9 — THE DOCUMENT PROCESSOR

Role:        Ingests, parses, and extracts learning content from uploaded documents

Analogy:     Like a librarian who reads any book and creates a study guide

*Supported Document Types:*

┌─────────────────────┬──────────────────────────────────────────┐

│  FORMAT             │  USE CASE                                 │

├─────────────────────┼──────────────────────────────────────────┤

│  📝 PDF             │ Textbooks, worksheets, study guides       │

│  📄 DOCX/DOC        │ Assignments, teacher notes                │

│  🖼️ Images (JPG/PNG)│ Handwritten notes, photos of whiteboards │

│  📊 PPT/PPTX        │ Presentation slides                       │

│  📋 TXT/MD          │ Plain text notes                          │

│  🎵 Audio (MP3/WAV) │ Recorded lectures (transcribed)           │

│  🎬 Video (MP4)     │ Educational videos (transcribed + frames) │

│  📸 Screenshot      │ Quick problem capture                     │

└─────────────────────┴──────────────────────────────────────────┘

*Processing Pipeline:*

Document Upload

    │

    ▼

┌─────────────────┐

│ File Validation │ ◄── Check file type, size, safety

│                 │     Max 50MB, virus scan

└────────┬────────┘

    │

    ▼

┌─────────────────┐

│ Content Extract │ ◄── Different parsers per format:

│                 │     • PDF: PyPDF2 + pdfplumber

│                 │     • Images: OCR (Tesseract + Azure)

│                 │     • Audio: Whisper transcription

│                 │     • Video: Frame extraction + Whisper

└────────┬────────┘

    │

    ▼

┌─────────────────┐

│ Structure       │ ◄── Identify sections, headings,

│ Analysis        │     diagrams, formulas, key concepts

└────────┬────────┘

    │

    ▼

┌─────────────────┐

│ Accessibility   │ ◄── Dyslexia-friendly formatting:

│ Enhancement     │     • Simplify dense paragraphs

│                 │     • Extract & label diagrams

│                 │     • Identify math notation

└────────┬────────┘

    │

    ▼

┌─────────────────┐

│ Chunk & Index   │ ◄── Break into learner-friendly segments

│                 │     Store in Context Manager

└────────┬────────┘

    │

    ▼

┌─────────────────┐

│ Generate Summary│ ◄── Create audio-friendly overview

│                 │     "This document is about..."

└─────────────────┘

*Technical Implementation:*

⁠ python

class DocumentProcessor:

    def process_document(self, file_upload):

    # Step 1: Validate

    if not self.is_safe(file_upload):

    return {"error": "File not supported or unsafe"}

    # Step 2: Route to appropriate parser

    file_type = self.detect_type(file_upload)

    if file_type == "pdf":

    raw_content = self.parse_pdf(file_upload)

    elif file_type == "image":

    raw_content = self.ocr_extract(file_upload)

    elif file_type == "audio":

    raw_content = self.transcribe_audio(file_upload)

    elif file_type == "video":

    raw_content = self.process_video(file_upload)

    else:

    raw_content = self.parse_text(file_upload)

    # Step 3: Structure analysis

    structured = self.analyze_structure(raw_content)

    # Step 4: Accessibility enhancement

    enhanced = self.make_accessible(structured)

    # Step 5: Chunk for learning

    chunks = self.chunk_content(

    enhanced,

    max_chunk_size=300,  # words

    overlap=50

    )

    # Step 6: Store in context manager

    doc_id = self.context_manager.store_document(

    content=chunks,

    metadata={

    "title": structured.title,

    "subject": self.detect_subject(structured),

    "difficulty": self.assess_difficulty(structured),

    "key_concepts": self.extract_concepts(structured)

    }

    )

    # Step 7: Generate friendly summary

    summary = self.generate_summary(structured)

    return {

    "doc_id": doc_id,

    "summary": summary,

    "ready": True

    }

    def parse_pdf(self, file):

    """Extract text, images, formulas from PDF"""

    import pdfplumber

    with pdfplumber.open(file) as pdf:

    text_content = []

    images = []

    for page in pdf.pages:

    # Extract text

    text_content.append(page.extract_text())

    # Extract images

    page_images = page.images

    images.extend(page_images)

    # Extract tables

    tables = page.extract_tables()

    if tables:

    text_content.append(

    self.format_tables_as_text(tables)

    )

    return {

    "text": "\n".join(text_content),

    "images": images,

    "page_count": len(pdf.pages)

    }

    def ocr_extract(self, image_file):

    """Extract text from images (handwritten notes, whiteboards)"""

    import pytesseract

    from PIL import Image

    # Open image

    img = Image.open(image_file)

    # Enhance for better OCR

    enhanced = self.enhance_for_ocr(img)

    # Run OCR

    text = pytesseract.image_to_string(enhanced)

    # Also try handwriting recognition if print fails

    if len(text.strip()) < 50:

    text = self.azure_handwriting_ocr(enhanced)

    return {

    "text": text,

    "source": "ocr",

    "confidence": self.calculate_ocr_confidence(text)

    }

    def transcribe_audio(self, audio_file):

    """Transcribe recorded lectures"""

    import whisper

    model = whisper.load_model("base")

    result = model.transcribe(

    audio_file,

    language="en",

    task="transcribe"

    )

    return {

    "text": result["text"],

    "segments": result["segments"],  # timestamped

    "language": result["language"]

    }

    def make_accessible(self, content):

    """Make content dyslexia/ADHD friendly"""

    # Break long paragraphs

    simplified = self.break_paragraphs(

    content,

    max_sentences=3

    )

    # Replace complex words

    simplified = self.simplify_vocabulary(simplified)

    # Add structure markers

    simplified = self.add_visual_markers(simplified)

    # Extract and label diagrams

    diagrams = self.extract_diagrams(content)

    return {

    "text": simplified,

    "diagrams": diagrams,

    "key_terms": self.highlight_key_terms(simplified)

    }

 ⁠

---

### 🧠 AGENT 10 — THE CONTEXT MANAGER

Role:        Maintains awareness of uploaded documents during conversations

Analogy:     Like a study buddy who remembers what's in your textbook

*Responsibilities:*

✅ Store document chunks with semantic indexing (vector DB)

✅ Retrieve relevant sections when student asks questions

✅ Track which parts of document student has covered

✅ Suggest next sections to learn

✅ Detect when student is confused about specific doc content

✅ Bridge document content with Content Creator explanations

*Data Model:*

⁠ json

{

  "doc_id": "doc_xyz789",

  "learner_id": "user_abc123",

  "metadata": {

    "title": "Chapter 5: Photosynthesis",

    "subject": "Biology",

    "grade_level": 7,

    "difficulty": "medium",

    "upload_date": "2025-01-15T10:30:00Z"

  },

  "chunks": [

    {

    "chunk_id": "chunk_001",

    "text": "Photosynthesis is the process by which plants...",

    "section": "Introduction",

    "page": 1,

    "embedding": [0.234, 0.876, ...],  // vector embedding

    "concepts": ["photosynthesis", "plants", "energy"],

    "has_diagram": true,

    "diagram_description": "Diagram showing plant cell with chloroplasts"

    },

    {

    "chunk_id": "chunk_002",

    "text": "The light-dependent reactions occur in...",

    "section": "Light Reactions",

    "page": 2,

    "embedding": [0.456, 0.234, ...],

    "concepts": ["light reactions", "thylakoid", "ATP"],

    "has_formula": true,

    "formula": "6CO2 + 6H2O → C6H12O6 + 6O2"

    }

  ],

  "learning_progress": {

    "chunks_covered": ["chunk_001"],

    "chunks_understood": [],

    "chunks_struggling": [],

    "current_position": "chunk_002",

    "estimated_completion": "45%"

  },

  "session_context": {

    "active": true,

    "current_question": "Explain light-dependent reactions",

    "relevant_chunks": ["chunk_002", "chunk_003"],

    "student_notes": []

  }

}

 ⁠

*Retrieval Logic:*

⁠ python

class ContextManager:

    def__init__(self):

    self.vector_db = ChromaDB()  # or Pinecone, Weaviate

    self.document_store = MongoDB()

    def store_document(self, content, metadata):

    """Store document with semantic search capability"""

    doc_id = generate_id()

    # Create embeddings for each chunk

    for chunk in content.chunks:

    embedding = self.create_embedding(chunk.text)

    self.vector_db.add(

    id=chunk.chunk_id,

    embedding=embedding,

    metadata={

    "doc_id": doc_id,

    "text": chunk.text,

    "section": chunk.section,

    "page": chunk.page,

    "concepts": chunk.concepts

    }

    )

    # Store full document

    self.document_store.insert({

    "doc_id": doc_id,

    "metadata": metadata,

    "chunks": content.chunks,

    "learning_progress": self.init_progress(content)

    })

    return doc_id

    def retrieve_relevant_context(self, question, doc_id, top_k=3):

    """Find most relevant chunks for student's question"""

    # Create embedding for question

    question_embedding = self.create_embedding(question)

    # Search vector DB

    results = self.vector_db.search(

    embedding=question_embedding,

    filter={"doc_id": doc_id},

    top_k=top_k

    )

    # Get full chunk details

    relevant_chunks = []

    for result in results:

    chunk = self.document_store.get_chunk(result.id)

    relevant_chunks.append({

    "text": chunk.text,

    "section": chunk.section,

    "page": chunk.page,

    "relevance_score": result.score,

    "has_diagram": chunk.has_diagram,

    "diagram_url": chunk.diagram_url if chunk.has_diagram else None

    })

    return relevant_chunks

    def update_progress(self, learner_id, doc_id, chunk_id, status):

    """Track which parts student has learned"""

    self.document_store.update_one(

    {"doc_id": doc_id, "learner_id": learner_id},

    {

    "$addToSet": {

    f"learning_progress.chunks_{status}": chunk_id

    },

    "$set": {

    "learning_progress.last_updated": datetime.now()

    }

    }

    )

    def suggest_next_chunk(self, learner_id, doc_id):

    """Intelligent sequencing of document content"""

    doc = self.document_store.find_one({

    "doc_id": doc_id,

    "learner_id": learner_id

    })

    covered = set(doc['learning_progress']['chunks_covered'])

    all_chunks = doc['chunks']

    # Find next uncovered chunk

    for chunk in all_chunks:

    if chunk.chunk_id not in covered:

    # Check if prerequisites are covered

    prereqs = self.get_prerequisites(chunk)

    if all(p in covered for p in prereqs):

    return chunk

    return None  # Document complete!

 ⁠

---

## UPDATED USER INPUT INTERFACE

### 📱 Enhanced Input Screen

┌─────────────────────────────────────────────────────────────┐

│                    NEUROTUTOR AI                            │

├─────────────────────────────────────────────────────────────┤

│                                                             │

│  📚 ACTIVE DOCUMENT:                                        │

│  ┌───────────────────────────────────────────────────────┐ │

│  │ 📄 Chapter 5: Photosynthesis                          │ │

│  │ 📊 Progress: ████████░░ 45%                           │ │

│  │ 📍 Currently on: Light Reactions (Page 2)             │ │

│  │                                                        │ │

│  │ [👁️ View Doc] [🗑️ Remove] [➕ Add Another]           │ │

│  └───────────────────────────────────────────────────────┘ │

│                                                             │

│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │

│                                                             │

│  💬 WHAT DO YOU WANT TO LEARN?                              │

│                                                             │

│  ┌───────────────────────────────────────────────────────┐ │

│  │                                                        │ │

│  │  Type your question here...                           │ │

│  │                                                        │ │

│  └───────────────────────────────────────────────────────┘ │

│                                                             │

│  ┌─────────┐  ┌─────────┐  ┌──────────────────────────┐   │

│  │ 🎤 SPEAK │  │ 📎 FILE │  │ 🎯 QUICK ACTIONS ▼       │   │

│  └─────────┘  └─────────┘  └──────────────────────────┘   │

│                                                             │

│  🔍 SUGGESTED QUESTIONS:                                    │

│  • "Explain this page to me"                                │

│  • "What's happening in the diagram on page 2?"             │

│  • "I don't understand light-dependent reactions"           │

│  • "Quiz me on what I just learned"                         │

│                                                             │

└─────────────────────────────────────────────────────────────┘

### 📎 Document Upload Flow

USER TAPS "📎 FILE" BUTTON

    │

    ▼

┌────────────────────────┐

│  UPLOAD OPTIONS        │

│                        │

│  📸 Take Photo         │  ◄── Instant capture of notes/board

│  📁 Choose File        │  ◄── From device storage

│  🎙️ Record Lecture    │  ◄── Audio recording

│  🎬 Record Screen      │  ◄── Video of online class

│  📋 Paste Link         │  ◄── YouTube edu video, PDF link

│                        │

└───────────┬────────────┘

    │

    ▼

    FILE SELECTED

    │

    ▼

┌────────────────────────┐

│  📤 UPLOADING...       │

│  ███████░░░ 70%        │  ◄── Progress bar

│                        │

│  Processing your file  │

│  This may take a moment│

└───────────┬────────────┘

    │

    ▼

┌────────────────────────┐

│  ✅ DOCUMENT READY!    │

│                        │

│  I've read your file:  │

│  "Chapter 5:           │

│   Photosynthesis"      │

│                        │

│  📄 12 pages           │

│  📚 5 main concepts    │

│  🖼️ 3 diagrams         │

│  ⏱️ ~15 min to learn   │

│                        │

│  [🎧 Read it to me]    │

│  [💬 Ask questions]    │

│  [📖 Start from top]   │

└────────────────────────┘

---

## UPDATED USER FLOWS

### 🟢 FLOW 4: DOCUMENT-BASED LEARNING SESSION

┌─────────────────────────────────────────────────────────────────────┐

│                     USER OPENS APP + UPLOADS PDF                     │

└──────────────────────────┬──────────────────────────────────────────┘

    │

    ▼

    ┌────────────────────────┐

    │  USER: Uploads         │

    │  "Biology Chapter 5.pdf"│

    └───────────┬────────────┘

    │

    ▼

    ┌────────────────────────┐

    │  DOCUMENT PROCESSOR    │

    │  • Extracts text       │

    │  • Identifies diagrams │

    │  • Detects formulas    │

    │  • Breaks into chunks  │

    └───────────┬────────────┘

    │

    ▼

    ┌────────────────────────┐

    │  CONTEXT MANAGER       │

    │  • Stores in vector DB │

    │  • Creates summary     │

    │  • Identifies key terms│

    └───────────┬────────────┘

    │

    ▼

    ┌────────────────────────┐

    │  APP: "Got it! This is │

    │   about photosynthesis.│

    │   Want me to:          │

    │                        │

    │   🎧 Read it aloud?    │

    │   💬 Explain a part?   │

    │   📖 Start from top?   │

    └───────────┬────────────┘

    │

    ▼

    ┌────────────────────────┐

    │  USER: "Explain the    │

    │   diagram on page 2"   │

    └───────────┬────────────┘

    │

    ▼

    ┌────────────────────────┐

    │  CONDUCTOR AGENT       │

    │  routes to:            │

    │  → Context Manager     │

    │    (retrieve page 2    │

    │     diagram context)   │

    │  → Content Creator     │

    │  → Modality Renderer   │

    └───────────┬────────────┘

    │

    ▼

    ┌────────────────────────┐

    │  CONTEXT MANAGER       │

    │  retrieves:            │

    │  • Diagram image       │

    │  • Surrounding text    │

    │  • Related concepts    │

    │    (chloroplast, light)│

    └───────────┬────────────┘

    │

    ▼

    ┌────────────────────────┐

    │  CONTENT CREATOR       │

    │  generates explanation │

    │  using:                │

    │  • Document context    │

    │  • Learner profile     │

    │  • Selected strategy   │

    │    (visual_analogy)    │

    └───────────┬────────────┘

    │

    ▼

    ┌────────────────────────┐

    │  APP: Shows diagram +  │

    │  audio explanation:    │

    │                        │

    │  🎨 [Diagram displayed]│

    │  "See this green part? │

    │   That's the chloro-   │

    │   plast. Think of it   │

    │   like a tiny solar    │

    │   panel inside the     │

    │   plant cell..."       │

    │                        │

    │  🎧 [Playing audio]    │

    └───────────┬────────────┘

    │

    ▼

    ┌────────────────────────┐

    │  STRUGGLE DETECTOR     │

    │  monitoring...         │

    └───────────┬────────────┘

    │

    (continues monitoring)

    │

    ▼

    ┌────────────────────────┐

    │  USER: "I get it!"     │

    └───────────┬────────────┘

    │

    ▼

    ┌────────────────────────┐

    │  CONTEXT MANAGER       │

    │  updates progress:     │

    │  ✅ Page 2 understood  │

    │  📍 Move to page 3?    │

    └───────────┬────────────┘

    │

    ▼

    ┌────────────────────────┐

    │  APP: "Awesome! 🎉    │

    │   Ready for page 3?    │

    │   Or want to practice  │

    │   page 2 with a quiz?" │

    │                        │

    │  [▶️ Next page]         │

    │  [🎯 Quiz me]          │

    └────────────────────────┘

---

### 🟡 FLOW 5: MULTI-DOCUMENT SESSION

    USER HAS 3 DOCS UPLOADED:

    • Biology Chapter 5

    • Chemistry Worksheet

    • Math Practice Problems

    │

    ▼

    ┌────────────────────────┐

    │  USER: "Explain        │

    │   chemical bonds"      │

    └───────────┬────────────┘

    │

    ▼

    ┌────────────────────────┐

    │  CONDUCTOR AGENT       │

    │  detects ambiguity:    │

    │  • Could be Bio doc    │

    │    (molecular bonds    │

    │     in photosynthesis) │

    │  • Could be Chem doc   │

    │    (ionic/covalent)    │

    └───────────┬────────────┘

    │

    ▼

    ┌────────────────────────┐

    │  APP: "I found this in │

    │   2 documents:         │

    │                        │

    │   📗 Biology Ch5       │

    │      (bonds in         │

    │       molecules)       │

    │                        │

    │   📘 Chemistry Sheet   │

    │      (types of bonds)  │

    │                        │

    │  Which one do you      │

    │  want to learn about?" │

    └───────────┬────────────┘

    │

    ▼

    ┌────────────────────────┐

    │  USER: "Chemistry"     │

    └───────────┬────────────┘

    │

    ▼

    ┌────────────────────────┐

    │  CONTEXT MANAGER       │

    │  switches active doc   │

    │  to Chemistry worksheet│

    │  retrieves relevant    │

    │  chunks about bonds    │

    └───────────┬────────────┘

    │

    (continues normal flow)

---

## UPDATED CONDUCTOR AGENT (WITH DOCUMENT AWARENESS)

⁠ python

class ConductorAgent:

    def handle_input(self, user_input):

    # Step 1: Check if documents are active

    active_docs = self.context_manager.get_active_documents(

    self.current_learner_id

    )

    # Step 2: Understand intent

    intent = self.learner_profile_agent.extract_intent(user_input)

    # Step 3: Determine if question relates to documents

    if active_docs:

    doc_context = self.context_manager.retrieve_relevant_context(

    question=intent.raw_question,

    doc_ids=[doc.id for doc in active_docs],

    top_k=3

    )

    # If high relevance to doc content, use that

    if doc_context and doc_context[0].relevance_score > 0.7:

    explanation_source = "document"

    source_material = doc_context

    else:

    explanation_source = "general"

    source_material = None

    else:

    explanation_source = "general"

    source_material = None

    # Step 4: Get learner context

    learner_context = self.learner_profile_agent.get_profile()

    # Step 5: Generate explanation

    if explanation_source == "document":

    # Document-grounded explanation

    explanation = self.content_creator.generate_from_document(

    topic=intent.topic,

    question=intent.raw_question,

    document_chunks=source_material,

    learner_profile=learner_context

    )

    else:

    # General knowledge explanation

    explanation = self.content_creator.generate(

    topic=intent.topic,

    question=intent.raw_question,

    learner_profile=learner_context

    )

    # Step 6: Choose modality

    rendered = self.modality_renderer.render(

    explanation=explanation,

    preferred_modality=learner_context.preferred_modalities,

    include_diagrams=source_material[0].has_diagram if source_material else False

    )

    # Step 7: Safety check

    safe_content = self.safety_guardrail.check(rendered)

    # Step 8: Deliver

    self.deliver(safe_content)

    # Step 9: Update document progress if applicable

    if explanation_source == "document":

    self.context_manager.update_progress(

    learner_id=self.current_learner_id,

    doc_id=source_material[0].doc_id,

    chunk_id=source_material[0].chunk_id,

    status="covered"

    )

    # Step 10: Start monitoring loop

    self.struggle_detector.start_monitoring()

 ⁠

---

## UPDATED CONTENT CREATOR (DOCUMENT-AWARE)

⁠ python

class ContentCreator:

    def generate_from_document(self, topic, question, document_chunks, learner_profile):

    """Generate explanation grounded in uploaded document"""

    # Build context from document

    doc_context = self.build_document_context(document_chunks)

    # Select strategy based on learner profile

    strategy = self.select_strategy(learner_profile)

    # Enhanced prompt with document grounding

    prompt = f"""

You are an adaptive tutor helping a {learner_profile.age}-year-old

student with {learner_profile.conditions}.

STRATEGY TO USE: {strategy}

DOCUMENT CONTEXT (what the student is reading):

{doc_context.text}

{f"DIAGRAM PRESENT: {doc_context.diagram_description}" if doc_context.has_diagram else ""}

STUDENT'S QUESTION: {question}

RULES:

1. Base your explanation on the DOCUMENT CONTEXT above
2. Reference specific parts of their document ("on page 2, you saw...")
3. If there's a diagram, describe it in your explanation
4. Use the {strategy} teaching method
5. Keep it in 2-3 sentence chunks
6. Use concrete examples related to the document's topic

Your explanation:

"""

    # Generate with LLM

    explanation = self.llm.generate(prompt)

    # Attach document metadata for rendering

    explanation.metadata = {

    "source": "document",

    "doc_id": document_chunks[0].doc_id,

    "page": document_chunks[0].page,

    "has_diagram": doc_context.has_diagram,

    "diagram_url": doc_context.diagram_url

    }

    return explanation

    def build_document_context(self, chunks):

    """Combine retrieved chunks into coherent context"""

    combined_text = "\n\n".join([

    f"[From page {chunk.page}, section '{chunk.section}']:\n{chunk.text}"

    for chunk in chunks

    ])

    # Check if any chunk has diagrams

    has_diagram = any(chunk.has_diagram for chunk in chunks)

    diagram_url = chunks[0].diagram_url if has_diagram else None

    diagram_description = chunks[0].diagram_description if has_diagram else None

    return DocumentContext(

    text=combined_text,

    has_diagram=has_diagram,

    diagram_url=diagram_url,

    diagram_description=diagram_description

    )

 ⁠

---

## UPDATED MODALITY RENDERER (WITH DIAGRAM SUPPORT)

⁠ python

class ModalityRenderer:

    def render(self, explanation, preferred_modality, include_diagrams=False):

    """Render explanation with document diagrams if present"""

    output = {}

    # Audio rendering (always available)

    if "audio" in preferred_modality:

    audio = self.tts_engine.synthesize(

    text=explanation.text,

    voice=self.select_voice(explanation.learner_profile),

    pace="slow" if "adhd" in explanation.learner_profile.conditions else "normal"

    )

    output["audio"] = audio

    # Visual rendering

    if "visual" in preferred_modality:

    # If document has diagram, show it

    if include_diagrams and explanation.metadata.get("has_diagram"):

    output["diagram"] = {

    "type": "document_image",

    "url": explanation.metadata["diagram_url"],

    "description": explanation.metadata.get("diagram_description"),

    "annotations": self.generate_annotations(explanation)

    }

    else:

    # Generate new illustration

    output["illustration"] = self.generate_illustration(

    explanation.text,

    style="educational_friendly"

    )

    # Text rendering (minimal, dyslexia-friendly)

    if "text" in preferred_modality:

    output["text"] = self.format_text(

    explanation.text,

    font="OpenDyslexic",

    line_spacing=2.0,

    highlight_keywords=True

    )

    # Interactive elements

    if "interactive" in preferred_modality:

    output["interactive"] = self.create_interactive_elements(

    explanation,

    document_context=explanation.metadata.get("source") == "document"

    )

    # Add document reference if applicable

    if explanation.metadata.get("source") == "document":

    output["reference"] = {

    "doc_name": explanation.metadata.get("doc_name"),

    "page": explanation.metadata.get("page"),

    "highlight_text": explanation.metadata.get("relevant_text")

    }

    return output

    def generate_annotations(self, explanation):

    """Add labels/arrows to document diagrams"""

    # Use LLM to identify key parts mentioned in explanation

    key_parts = self.llm.extract_entities(explanation.text)

    annotations = []

    for part in key_parts:

    annotations.append({

    "label": part.name,

    "description": part.explanation,

    "color": self.assign_color(part.importance)

    })

    return annotations

 ⁠

---

## TECHNICAL STACK UPDATES

┌─────────────────────┬────────────────────────────────────────────┐

│  LAYER              │  TECHNOLOGY                                 │

├─────────────────────┼────────────────────────────────────────────┤

│  Document Parsing   │  PyPDF2, pdfplumber, python-docx           │

│  OCR                │  Tesseract + Azure Computer Vision         │

│  Audio Transcribe   │  Whisper (OpenAI)                          │

│  Vector DB          │  ChromaDB / Pinecone / Weaviate            │

│  Embeddings         │  OpenAI text-embedding-3 / Sentence-BERT   │

│  Image Processing   │  PIL, OpenCV                               │

│  Diagram Annotation │  Fabric.js / Konva.js                      │

│  File Storage       │  AWS S3 / Google Cloud Storage             │

│  + everything from original stack                                │

└─────────────────────┴────────────────────────────────────────────┘

---

## UPDATED MVP SCOPE

PHASE 1 — MVP (4-6 weeks)

  ✅ Conductor Agent (basic routing)

  ✅ Content Creator (3 strategies)

  ✅ Modality Renderer (audio + text)

  ✅ Simple Struggle Detector

  ✅ Learner Profile

  ✅ Safety Guardrail

  ✅ Document Processor (PDF + images only)  ◄── NEW

  ✅ Context Manager (basic retrieval)       ◄── NEW

PHASE 2 — SMART (6-8 weeks)

  ⬜ Advanced Struggle Detector

  ⬜ Adaptation Strategist

  ⬜ Visual generation

  ⬜ Interactive mode

  ⬜ Feedback Loop Agent

  ⬜ Multi-document support                  ◄── NEW

  ⬜ Diagram annotation                      ◄── NEW

  ⬜ Audio/video file support                ◄── NEW

PHASE 3 — FULL (8-12 weeks)

  ⬜ Knowledge Graph (curriculum-aware)

  ⬜ Gamification

  ⬜ Parent/Teacher dashboard

  ⬜ Multi-session learning paths

  ⬜ Document collaboration (share notes)    ◄── NEW

  ⬜ Auto-generated study guides from docs   ◄── NEW

---

This architecture now fully supports *document upload alongside voice/text input*, creating a powerful multimodal learning system where students can:

1.⁠ ⁠Upload their textbooks/worksheets

2.⁠ ⁠Ask questions about specific content

3.⁠ ⁠Get explanations adapted to their learning style

4.⁠ ⁠Track progress through the material

The system maintains its core innovation of *invisible adaptation* while adding document intelligence. Want me to detail the database schema, API endpoints, or specific prompt templates?

**
