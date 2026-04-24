# Fitmate AI - Mind Map Assistant

A sophisticated AI chatbot that generates interactive, hierarchical mind maps from your conversations. Built with **FastAPI** (Python) and **Next.js 15** (React).

## 🚀 Quick Start

From the root directory, you can run the following commands:

### 1. Initial Setup
Install all dependencies for both frontend and backend:
```bash
npm run install-all
```

### 2. Run Fullstack (Recommended)
Start both the Frontend and Backend concurrently. This command automatically clears ports 3000 and 8080 to prevent "Address already in use" errors:
```bash
npm run dev
```
- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **Backend**: [http://localhost:8080](http://localhost:8080)

### 3. Individual Commands
If you need to run them separately:
- **Frontend only**: `npm run dev:frontend`
- **Backend only**: `npm run dev:backend`
- **Kill Ports**: `npm run kill-ports` (Manually clear 3000 and 8080)

## 🧠 Features
- **AI Mind Maps**: Transforms long assistant responses into spherical, interactive graph layouts.
- **Hierarchical Flow**: Automatically structures data into a horizontal "root-to-leaf" flow.
- **Premium UI**: Dark-mode aesthetic with glassmorphism and static high-contrast spherical nodes.
- **Minimalist Design**: Simplified animations for a stable, professional feel.
- **Auto-Scaling**: Graph automatically scales to fit your screen perfectly.

## 🛠 Tech Stack
- **Backend**: Python 3.12, FastAPI, LangChain, LangGraph, Pydantic (Structured Output).
- **Frontend**: Next.js 15, Framer Motion (Motion 12), Tailwind CSS, Lucide React.
- **Database**: MongoDB (Persistence Layer).

## 📄 License
MIT
