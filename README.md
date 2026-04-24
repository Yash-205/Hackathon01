# Hackathon01 - AI Chatbot

A modular chatbot with a **Python FastAPI** backend (LangChain/LangGraph) and a **Next.js** frontend (shadcn/ui, dark theme).

## Project Structure

```
backend/     Python FastAPI + LangGraph
frontend/    Next.js + shadcn/ui + Tailwind
```

## Quick Start

### 1. Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env and add your OPENAI_API_KEY
uvicorn app.main:app --reload --port 8000
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Python, FastAPI, LangChain, LangGraph |
| Frontend | Next.js 15, TypeScript, Tailwind CSS |
| UI | shadcn/ui, Lucide React icons |
| Background | React Bits Particles |
| Streaming | Server-Sent Events (SSE) |
