from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional
import subprocess
import tempfile
import sys
import time
import os

from services.ollama_service import ollama_service, OLLAMA_MODEL

app = FastAPI(
    title="CodeSaathi Local AI Backend",
    description="Offline-capable AI coding assistant powered by local Ollama models",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic Schemas
class MessageItem(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, description="User prompt or question")
    code: Optional[str] = Field("", description="Current editor code")
    filename: Optional[str] = Field("main.py", description="Active file name")
    language: Optional[str] = Field("python", description="Programming language")
    history: Optional[List[MessageItem]] = Field(default=[], description="Previous conversation history")
    model: Optional[str] = Field(None, description="Model override")

class ChatResponse(BaseModel):
    response: str
    model: str
    status: str = "success"

class HealthResponse(BaseModel):
    backend_status: str
    ollama_status: str
    model: str
    available_models: List[str]
    message: str

class AnalyzeRequest(BaseModel):
    code: str = Field(..., min_length=1, description="Code to analyze")
    language: Optional[str] = Field("python", description="Language")
    filename: Optional[str] = Field("main.py", description="Filename")
    action: Optional[str] = Field("find_bugs", description="Action: explain, find_bugs, improve, fix_errors, generate_tests")

class RunRequest(BaseModel):
    code: str = Field(..., description="Python code to run")
    filename: Optional[str] = Field("main.py", description="Filename")

# Endpoints
@app.get("/api/health", response_model=HealthResponse)
async def health():
    """GET /api/health: Check status of backend, Ollama server, and model availability."""
    return await ollama_service.get_health_status()

@app.post("/api/chat", response_model=ChatResponse)
async def chat(req: ChatRequest):
    """POST /api/chat: Core chat endpoint connecting to local Ollama API."""
    if not req.message.strip():
        raise HTTPException(status_code=400, detail="Prompt message cannot be empty.")
    return await ollama_service.generate_chat(
        prompt=req.message,
        code=req.code,
        filename=req.filename,
        language=req.language,
        history=[h.dict() for h in req.history] if req.history else [],
        model=req.model
    )

@app.post("/api/analyze")
async def analyze(req: AnalyzeRequest):
    """POST /api/analyze: Specialized endpoint for code analysis, bug detection, and refactoring."""
    action_prompts = {
        "explain": "Explain this code step-by-step for a beginner programmer.",
        "find_bugs": "Perform a deep bug audit on this code. Highlight any syntax errors, logic flaws, edge cases (e.g. division by zero, empty inputs), and security risks.",
        "improve": "Suggest improvements for code readability, performance, structure, and language best practices.",
        "fix_errors": "Identify any errors in this code, explain why they occur, and provide the complete corrected code snippet.",
        "generate_tests": "Write comprehensive unit tests for this code."
    }

    prompt = action_prompts.get(req.action, f"Analyze this code: {req.action}")
    result = await ollama_service.generate_chat(
        prompt=prompt,
        code=req.code,
        filename=req.filename,
        language=req.language
    )
    return {
        "action": req.action,
        "filename": req.filename,
        "analysis": result["response"],
        "model": result["model"]
    }

@app.post("/api/run")
async def run_code(req: RunRequest):
    """POST /api/run: Execute Python code locally in temporary file with 10s timeout."""
    if not req.filename.endswith(".py"):
        return {
            "stdout": "",
            "stderr": "Code execution is currently supported for Python (.py) files.",
            "exit_code": 0,
            "duration_ms": 0
        }

    start_time = time.time()
    with tempfile.NamedTemporaryFile(suffix=".py", mode="w", delete=False, encoding="utf-8") as temp_file:
        temp_file.write(req.code)
        temp_file_path = temp_file.name

    try:
        result = subprocess.run(
            [sys.executable, temp_file_path],
            capture_output=True,
            text=True,
            timeout=10
        )
        duration = round((time.time() - start_time) * 1000, 2)
        return {
            "stdout": result.stdout,
            "stderr": result.stderr,
            "exit_code": result.returncode,
            "duration_ms": duration
        }
    except subprocess.TimeoutExpired:
        duration = round((time.time() - start_time) * 1000, 2)
        return {
            "stdout": "",
            "stderr": "Execution timed out after 10 seconds.",
            "exit_code": 124,
            "duration_ms": duration
        }
    except Exception as e:
        duration = round((time.time() - start_time) * 1000, 2)
        return {
            "stdout": "",
            "stderr": str(e),
            "exit_code": 1,
            "duration_ms": duration
        }
    finally:
        if os.path.exists(temp_file_path):
            try:
                os.remove(temp_file_path)
            except Exception:
                pass
