# CodeSaathi AI 🚀

> **Privacy-First, Local-First AI Pair Programming Assistant & Code Reviewer**  
> Powered by **Ollama + Qwen2.5-Coder:7b** and open-source **Semgrep** static analysis.

[![Local AI](https://img.shields.io/badge/Local%20AI-100%25%20Offline-emerald.svg)](#privacy-first-local-inference)
[![Model](https://img.shields.io/badge/LLM-Qwen2.5--Coder%3A7b-blue.svg)](#1-ollama--qwen25-coder7b)
[![Static Analysis](https://img.shields.io/badge/Static%20Analysis-Semgrep%20(Open%20Source)-orange.svg)](#2-semgrep-static-analysis)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

---

## 📌 Overview

**CodeSaathi AI** is a modern, developer-centric AI workspace built for developers who care deeply about code quality, security, and privacy. Unlike cloud-dependent AI tools that stream proprietary source code and intellectual property to remote third-party APIs, CodeSaathi AI operates **100% locally on your machine**.

By pairing **Qwen2.5-Coder:7b** running through local **Ollama** with **Semgrep's** open-source abstract syntax tree (AST) static analysis engine, CodeSaathi delivers deep context-aware debugging, vulnerability detection, and refactoring without leaking a single line of code.

---

## ✨ Key Features

- 🟢 **100% Offline AI Inference**: All generative AI prompts and source code remain on your machine via local Ollama. Zero external API calls (no OpenAI, Gemini, or Anthropic).
- 🛡️ **Semgrep Static Analysis Layer**: Open-source AST rule scanning identifies command injection risks, hardcoded secrets, dangerous `eval`/`exec`, SQL injection, and logic edge cases before runtime.
- ⚡ **Unified Code Review (`/api/review`)**: Combines Semgrep static findings with Qwen2.5-Coder's reasoning to explain *what* the problem means, *why* it matters, and *how* to resolve it with verified code.
- 🛠️ **8 Core AI Actions**: Dedicated structured actions for:
  - **Explain**: Step-by-step logic breakdown.
  - **Debug**: Discover runtime traps and unhandled exceptions.
  - **Find Bugs**: Deep audit for off-by-one errors and edge conditions.
  - **Fix Errors**: Generate clean, idiomatic drop-in replacements.
  - **Optimize**: Algorithmic refactoring for time and memory efficiency.
  - **Generate Tests**: Comprehensive test suites (pytest/unittest).
  - **Security Review**: Audit vulnerabilities against security best practices.
  - **Complexity Analysis**: Big-O runtime and cognitive complexity metrics.
- 💻 **Monaco Code Editor**: Professional developer IDE experience with multi-tab support, syntax highlighting, diff preview, and minimap.
- ▶️ **Safe Isolated Local Runner**: Execute Python code in temporary files with a 10-second timeout, stdout/stderr capture, and immediate AI fix assistance.

---

## 🏗️ Architecture

```
User Browser (React + Vite + Monaco Editor)
  │
  ├── 1. POST /api/run ───────────────► Safe Temporary File Execution (10s Timeout)
  │
  ├── 2. POST /api/static-analysis ───► Semgrep Engine (Local AST Security Scan)
  │                                           │
  │                                           ▼
  ├── 3. POST /api/review ────────────► [Semgrep Findings] + [Source Code]
  │                                           │
  │                                           ▼
  └── 4. POST /api/chat / /api/analyze► Ollama Local HTTP API (127.0.0.1:11434)
                                              │
                                              ▼
                                       Qwen2.5-Coder:7b (Local GPU/CPU Inference)
```

---

## 🔒 Privacy-First Local Inference

When **Local AI Active** is displayed in CodeSaathi AI:
1. **Zero Cloud Transmission**: Prompts, code files, and diagnostics never leave your localhost network.
2. **No API Keys Required**: No subscriptions, cloud credit cards, or external tokens needed.
3. **Open-Source Tooling**: Powered entirely by open-weight models (Qwen2.5-Coder) and open-source tooling (Semgrep, FastAPI, Monaco Editor).

---

## 🚀 Quick Start Guide

### Prerequisites
- **Python**: 3.10+ (tested with Python 3.11, 3.12, 3.13)
- **Node.js**: v18+ or v20+
- **Ollama**: Download from [ollama.com](https://ollama.com)

---

### Step 1: Install Ollama & Pull Qwen2.5-Coder:7b

1. Download and install Ollama from [ollama.com](https://ollama.com).
2. Start the Ollama daemon:
   ```bash
   ollama serve
   ```
3. Pull the official 7-billion parameter coding model:
   ```bash
   ollama pull qwen2.5-coder:7b
   ```
4. Verify the model is installed:
   ```bash
   ollama list
   ```

---

### Step 2: Install Semgrep & Backend Dependencies

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
   *(Note: `requirements.txt` includes `fastapi`, `uvicorn[standard]`, `httpx`, `pydantic`, and `semgrep`)*

3. Verify Semgrep installation:
   ```bash
   semgrep --version
   ```

4. Configure environment variables (optional, defaults to `http://127.0.0.1:11434`):
   ```bash
   cp .env.example .env
   ```

5. Start the FastAPI backend:
   ```bash
   uvicorn main:app --host 127.0.0.1 --port 8000 --reload
   ```
   The backend API will be available at `http://localhost:8000`.

---

### Step 3: Install Frontend & Run Vite Dev Server

1. In a new terminal window, navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install frontend packages:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to `http://localhost:5173`.

---

## 📡 API Endpoints Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Comprehensive status of backend, Ollama server, Qwen2.5-Coder:7b, and Semgrep |
| `POST` | `/api/chat` | Contextual chat with conversation history and active file code |
| `POST` | `/api/analyze` | Structured AI analysis for Explain, Debug, Find Bugs, Fix, Optimize, Tests, Security, Complexity |
| `POST` | `/api/static-analysis`| Open-source Semgrep static analysis without executing user code |
| `POST` | `/api/review` | Combined review combining Semgrep AST findings with Qwen2.5-Coder reasoning |
| `POST` | `/api/run` | Safe local execution of Python scripts with 10-second timeout |

---

## 🎯 Hackathon Demo Flow

Follow this step-by-step workflow during demos:

1. **Paste Buggy/Vulnerable Code**:
   - Open `security_demo.py` or paste code containing potential division-by-zero and `os.system` command execution.
2. **Trigger Static Scan**:
   - Click **"Static Scan"** in the top bar or sidebar.
   - Semgrep immediately flags the command injection risk and division hazard in the **Problems** tab.
3. **Click "Debug" / "Security Review"**:
   - In the AI Assistant panel, click **Debug** or **Security**.
   - Qwen2.5-Coder:7b generates a structured breakdown with issues, suggestions, and Big-O complexity.
4. **Trigger "Full AI Review"**:
   - Click **"Full Review"**.
   - The unified review combines Semgrep AST findings with LLM reasoning, explaining what the issue means, why it matters, and providing a clean drop-in fix.
5. **Apply Fix**:
   - Click **"Preview & Apply Fix"** to view Monaco diff side-by-side and apply changes directly to the editor.
6. **Verify Privacy Indicator**:
   - Click **"🟢 LOCAL AI ACTIVE"** in the top bar to display the privacy diagnostics confirming 100% local inference.

---

## 🔧 Troubleshooting

- **Ollama Status says "Offline"**:
  - Run `ollama serve` in a terminal window.
  - Verify `http://127.0.0.1:11434/api/tags` returns a 200 response in your browser.
- **Model Missing**:
  - Run `ollama pull qwen2.5-coder:7b`.
  - Check available models using `ollama list`.
- **Semgrep Not Detected**:
  - Run `pip install semgrep`.
  - If using a virtual environment or Conda, ensure the `Scripts` directory is in your `PATH` or set `SEMGREP_PATH` in `backend/.env`.

---

## 📄 License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.
