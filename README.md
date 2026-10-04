# CodeSaathi AI 🚀

**An offline-capable, open-weight AI coding workspace powered by Ollama + Qwen2.5-Coder.**

CodeSaathi AI is a full-stack, local-first AI developer tool built with React, Vite, FastAPI, and Ollama. It works completely offline once the model is downloaded — no API keys, no cloud services, no data leaving your machine.

---

## 🎯 Features

| Feature | Status |
|---|---|
| Monaco Code Editor (multi-file) | ✅ |
| Local AI Chat via Ollama | ✅ |
| Conversation History | ✅ |
| Python Code Execution | ✅ |
| AI Bug Detection & Audit | ✅ |
| Visual Fix Preview (Diff Editor) | ✅ |
| Live Connection Status Badge | ✅ |
| Beginner Setup Guide | ✅ |
| Offline AI Inference | ✅ |

---

## 🏗️ Architecture

```
React (Vite)  ──▶  FastAPI (port 8000)  ──▶  Ollama API (port 11434)  ──▶  Qwen2.5-Coder:3B
```

---

## 📦 Requirements

| Component | Min Version |
|---|---|
| Node.js | 18+ |
| Python | 3.10+ |
| Ollama | Latest |
| RAM | 6 GB recommended |

---

## 🚀 One-Time Setup

### Step 1 — Install Ollama

Download from [https://ollama.com](https://ollama.com) and install on Windows.

### Step 2 — Pull the AI Model

Open **PowerShell** and run:

```powershell
ollama pull qwen2.5-coder:3b
```

> ⚠️ This step requires internet. The download is ~2GB. After pulling, CodeSaathi works **fully offline**.

### Step 3 — Verify model is installed

```powershell
ollama list
```

You should see `qwen2.5-coder:3b` listed.

---

## ▶️ Running the Application

### Backend (PowerShell Terminal 1)

```powershell
cd CodeSaathi\backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn main:app --reload
```

Backend starts at: `http://localhost:8000`

### Frontend (PowerShell Terminal 2)

```powershell
cd CodeSaathi\frontend
npm install
npm run dev
```

Frontend starts at: `http://localhost:5173`

> Open `http://localhost:5173` in your browser.

---

## 🔌 API Endpoints

| Endpoint | Method | Description |
|---|---|---|
| `/api/health` | GET | Check backend + Ollama status |
| `/api/chat` | POST | Chat with local AI model |
| `/api/analyze` | POST | Deep code analysis & bug audit |
| `/api/run` | POST | Execute Python code locally |

### Example: Chat Request

```json
POST /api/chat
{
  "message": "Find potential bugs in this code",
  "code": "def div(a, b): return a/b",
  "filename": "main.py",
  "language": "python"
}
```

### Example: Health Response

```json
{
  "backend_status": "ok",
  "ollama_status": "connected",
  "model": "qwen2.5-coder:3b",
  "available_models": ["qwen2.5-coder:3b"],
  "message": "Local AI ready with model 'qwen2.5-coder:3b'"
}
```

---

## ⚙️ Configuration

Copy and edit the environment file:

```powershell
cp .env.example .env
```

Available settings in `.env`:

```
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=qwen2.5-coder:3b
```

You can swap to any other installed Ollama model (e.g. `codellama:7b`, `mistral:7b`).

---

## 🤖 AI Status Indicators

Click the status badge in the top header to open the diagnostic panel:

| Badge | Meaning |
|---|---|
| 🟢 Connected — Local AI ready | Ollama is running, model is available |
| 🟡 Loading model... | Checking connection on startup |
| 🟠 Model missing | Ollama is running but model not pulled yet |
| 🔴 Offline — Ollama unavailable | Ollama service is not running |

---

## 🔒 Security & Privacy

- All AI inference runs locally on your machine.
- No code or prompts are ever sent to cloud services.
- CORS is configured for localhost access only.
- No automatic execution of AI-generated code.
- Input validation applied on all backend endpoints.

---

## 📄 License

Apache-2.0. See `LICENSE`.
