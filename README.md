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

## 🧠 Key Features

### 🗺️ AI Mind-Map Engine
- **Horizontal Hierarchical Layout**: Automatically structures complex data into a logical "Root → Category → Detail" flow.
- **Intelligent Branching**: Backend logic enforces multi-level depth, ensuring maps are rich and organized, never flat.
- **Interactive Modals**: Click any node to expand it into a detailed `MorphingDialog` with a premium dark-blur backdrop.
- **Adaptive Fit**: Intelligent auto-scaling logic ensures the entire tree is perfectly centered and legible on any screen size.

### 💬 Premium Chat Experience
- **Vercel AI SDK Integration**: Real-time streaming for a snappy, responsive assistant.
- **Rich Markdown Support**: Full GFM support for tables, lists, and task items.
- **Code Visualization**: High-fidelity code blocks with syntax highlighting and automatic language detection.
- **Glassmorphism UI**: A consistent, dark-themed aesthetic with blurred overlays and subtle micro-animations.

### 🛡️ Robust Architecture
- **Self-Healing Ports**: Automated process cleanup (`lsof -ti | kill`) on every startup.
- **Unified Dev Experience**: One command (`npm run dev`) launches the entire fullstack environment.
- **Type-Safe Generation**: Structured JSON output using Pydantic and LangGraph for 100% reliable graph data.

## 🛠 Tech Stack

### Frontend
- **Next.js 15 (App Router)**: Modern React framework for high-performance server-side rendering.
- **Vercel AI SDK**: Reactive state management for AI streaming.
- **Tailwind CSS 4**: Next-gen styling with native typography and JIT compiling.
- **Framer Motion**: Premium animations and layout transitions.
- **React Markdown**: Secure and flexible markdown parsing.

### Backend
- **Python 3.12 / FastAPI**: High-speed asynchronous backend service.
- **LangGraph**: Advanced stateful AI orchestration.
- **Pydantic**: Robust data validation and structured output.
- **Groq**: Ultra-fast LLM inference for real-time generation.

---

## 📄 License
MIT
