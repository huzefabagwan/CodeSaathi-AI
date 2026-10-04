from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import subprocess
import tempfile
import sys
import time
import os

from services.ollama_service import ollama_service, OLLAMA_MODEL
from services.semgrep_service import semgrep_service

app = FastAPI(
    title="CodeSaathi Local AI Backend",
    description="Offline-capable, privacy-first AI coding assistant powered by Ollama (Qwen2.5-Coder:7b) and Semgrep static analysis",
    version="2.0.0"
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
    mode: str = "local"

class HealthResponse(BaseModel):
    backend_status: str
    ollama_status: str
    model: str
    model_available: bool
    available_models: List[str]
    local_ai_active: bool
    semgrep_available: bool
    semgrep_version: Optional[str] = None
    privacy_mode: str
    message: str

class AnalyzeRequest(BaseModel):
    code: str = Field(..., min_length=1, description="Code to analyze")
    language: Optional[str] = Field("python", description="Language")
    filename: Optional[str] = Field("main.py", description="Filename")
    action: Optional[str] = Field("find_bugs", description="Action: explain, debug, find_bugs, fix_errors, optimize, generate_tests, security_review, complexity_analysis")
    history: Optional[List[MessageItem]] = Field(default=[], description="Conversation history")
    model: Optional[str] = Field(None, description="Model override")

class StaticAnalysisRequest(BaseModel):
    code: str = Field(..., description="Code to scan with Semgrep")
    language: Optional[str] = Field("python", description="Programming language")
    filename: Optional[str] = Field("main.py", description="Filename")

class ReviewRequest(BaseModel):
    code: str = Field(..., description="Code for unified AI + static analysis review")
    language: Optional[str] = Field("python", description="Programming language")
    filename: Optional[str] = Field("main.py", description="Filename")
    model: Optional[str] = Field(None, description="Model override")

class RunRequest(BaseModel):
    code: str = Field(..., description="Python code to run")
    filename: Optional[str] = Field("main.py", description="Filename")

# Endpoints
@app.get("/api/health", response_model=HealthResponse)
async def health():
    """GET /api/health: Check status of backend, local Ollama server, Qwen2.5-Coder model, and Semgrep."""
    return await ollama_service.get_health_status()

@app.post("/api/chat", response_model=ChatResponse)
async def chat(req: ChatRequest):
    """POST /api/chat: Core chat endpoint connecting strictly to local Ollama API."""
    if not req.message.strip():
        raise HTTPException(status_code=400, detail="Prompt message cannot be empty.")
    return await ollama_service.generate_chat(
        prompt=req.message,
        code=req.code or "",
        filename=req.filename or "main.py",
        language=req.language or "python",
        history=[h.dict() for h in req.history] if req.history else [],
        model=req.model
    )

@app.post("/api/analyze")
async def analyze(req: AnalyzeRequest):
    """
    POST /api/analyze: Specialized endpoint for code analysis:
    Explain, Debug, Find Bugs, Fix Errors, Optimize, Generate Tests, Security Review, Complexity Analysis.
    Returns structured JSON.
    """
    if not req.code.strip():
        raise HTTPException(status_code=400, detail="Code cannot be empty.")
    
    return await ollama_service.analyze_code(
        code=req.code,
        language=req.language or "python",
        filename=req.filename or "main.py",
        action=req.action or "find_bugs",
        history=[h.dict() for h in req.history] if req.history else [],
        model=req.model
    )

@app.post("/api/static-analysis")
async def static_analysis(req: StaticAnalysisRequest):
    """
    POST /api/static-analysis: Run Semgrep open-source static analysis locally.
    1. Saves code to a temporary file safely.
    2. Runs Semgrep against the temporary file.
    3. Captures structured JSON output.
    4. Parses findings into a clean response.
    5. Never executes user source code.
    6. Safely cleans up temporary files.
    """
    return semgrep_service.scan_code(
        code=req.code,
        language=req.language or "python",
        filename=req.filename or "main.py"
    )

@app.post("/api/review")
async def review(req: ReviewRequest):
    """
    POST /api/review: Combined Code Review.
    Combines Semgrep static analysis findings with Qwen2.5-Coder local intelligence.
    Flow: User Code -> Semgrep -> Findings -> Qwen2.5-Coder -> Unified Review
    """
    return await ollama_service.combined_review(
        code=req.code,
        language=req.language or "python",
        filename=req.filename or "main.py",
        model=req.model
    )

@app.post("/api/run")
async def run_code(req: RunRequest):
    """
    POST /api/run: Execute Python code locally in temporary file with 10s timeout.
    Isolated from static analysis & AI analysis endpoints.
    """
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
