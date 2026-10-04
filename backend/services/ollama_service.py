import os
import re
import json
import httpx
from fastapi import HTTPException
from typing import Dict, Any, List, Optional
from services.semgrep_service import semgrep_service

OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://127.0.0.1:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "qwen2.5-coder:7b")

# Maximum permitted characters for code/prompt to prevent out-of-memory or freezing
MAX_CODE_CHARS = 50000

class OllamaService:
    def __init__(self, base_url: str = OLLAMA_BASE_URL, default_model: str = OLLAMA_MODEL):
        self.base_url = base_url.rstrip("/")
        self.default_model = default_model

    async def get_health_status(self) -> dict:
        """Check status of backend, Ollama server, model availability, and Semgrep."""
        semgrep_status = semgrep_service.get_status()
        semgrep_installed = semgrep_status.get("installed", False)
        semgrep_version = semgrep_status.get("version")

        try:
            async with httpx.AsyncClient(timeout=4.0) as client:
                res = await client.get(f"{self.base_url}/api/tags")
                if res.status_code == 200:
                    models_data = res.json().get("models", [])
                    available_models = [m.get("name") for m in models_data if m.get("name")]
                    
                    target = self.default_model
                    model_found = any(
                        target in m or f"{target}:latest" == m for m in available_models
                    )
                    
                    status_code = "connected" if model_found else ("model_missing" if available_models else "no_models")
                    is_active = model_found or len(available_models) > 0
                    
                    if model_found:
                        msg = f"Local AI active with '{target}'. 100% offline inference on your device."
                    elif available_models:
                        msg = f"Ollama is running with models {available_models}, but target '{target}' is missing. Run 'ollama pull {target}'."
                    else:
                        msg = f"Ollama is running but has no models installed. Run 'ollama pull {target}'."

                    return {
                        "backend_status": "ok",
                        "ollama_status": status_code,
                        "model": target,
                        "model_available": model_found,
                        "available_models": available_models,
                        "local_ai_active": is_active,
                        "semgrep_available": semgrep_installed,
                        "semgrep_version": semgrep_version,
                        "privacy_mode": "100% Local (Zero Cloud Inference)",
                        "message": msg
                    }
        except httpx.ConnectError:
            return {
                "backend_status": "ok",
                "ollama_status": "offline",
                "model": self.default_model,
                "model_available": False,
                "available_models": [],
                "local_ai_active": False,
                "semgrep_available": semgrep_installed,
                "semgrep_version": semgrep_version,
                "privacy_mode": "100% Local (Zero Cloud Inference)",
                "message": "Ollama service is not running locally. Start it with 'ollama serve'."
            }
        except Exception as e:
            return {
                "backend_status": "ok",
                "ollama_status": "offline",
                "model": self.default_model,
                "model_available": False,
                "available_models": [],
                "local_ai_active": False,
                "semgrep_available": semgrep_installed,
                "semgrep_version": semgrep_version,
                "privacy_mode": "100% Local (Zero Cloud Inference)",
                "message": f"Error connecting to Ollama: {str(e)}"
            }

    async def _send_chat_request(self, messages: List[Dict[str, str]], model: Optional[str] = None, timeout: float = 120.0) -> Dict[str, Any]:
        """Internal helper to call Ollama chat API."""
        health = await self.get_health_status()
        if health["ollama_status"] == "offline":
            raise HTTPException(
                status_code=503,
                detail="Ollama is not running locally. Please start Ollama ('ollama serve') and retry."
            )

        target_model = model or self.default_model
        available = health["available_models"]

        # If specified model is not present, fallback to configured or first available
        if available and not any(target_model in m for m in available):
            target_model = available[0]

        try:
            async with httpx.AsyncClient(timeout=timeout) as client:
                res = await client.post(
                    f"{self.base_url}/api/chat",
                    json={
                        "model": target_model,
                        "stream": False,
                        "messages": messages,
                        "options": {
                            "temperature": 0.2
                        }
                    }
                )

                if res.status_code == 404:
                    raise HTTPException(
                        status_code=503,
                        detail=f"Model '{target_model}' not found in Ollama. Pull it with: 'ollama pull {target_model}'"
                    )

                res.raise_for_status()
                data = res.json()
                content = data.get("message", {}).get("content", "")
                return {
                    "response": content,
                    "model": target_model,
                    "status": "success",
                    "mode": "local"
                }
        except httpx.TimeoutException:
            raise HTTPException(
                status_code=504,
                detail="Local AI model timed out. Try asking a more specific question or inspecting a smaller snippet."
            )
        except HTTPException:
            raise
        except Exception as exc:
            raise HTTPException(status_code=500, detail=f"Ollama Local AI Error: {str(exc)}")

    async def generate_chat(self, prompt: str, code: str = "", filename: str = "main.py", language: str = "python", history: list = None, model: str = None) -> dict:
        """Send chat request to Ollama chat API with user context."""
        if not prompt or not prompt.strip():
            raise HTTPException(status_code=400, detail="User prompt cannot be empty.")

        if len(code) > MAX_CODE_CHARS:
            raise HTTPException(
                status_code=400,
                detail=f"Code length ({len(code)} chars) exceeds maximum allowed size ({MAX_CODE_CHARS} chars)."
            )

        system_instruction = (
            "You are CodeSaathi AI, a professional, privacy-first local AI pair-programming assistant powered by Qwen2.5-Coder. "
            "You run completely offline on the user's machine via Ollama. "
            "Provide insightful, clean, production-grade solutions. Format your responses with structured markdown, "
            "bullet points, and clear code blocks. When fixing or generating code, always output the full corrected snippet."
        )

        messages = [{"role": "system", "content": system_instruction}]

        if history:
            for item in history:
                if isinstance(item, dict) and "role" in item and "content" in item:
                    messages.append({"role": item["role"], "content": item["content"]})

        user_content = f"File: {filename} ({language})\n\n"
        if code.strip():
            user_content += f"Current Code:\n```{language}\n{code}\n```\n\n"
        user_content += f"User Request: {prompt}"

        messages.append({"role": "user", "content": user_content})
        return await self._send_chat_request(messages, model=model)

    async def analyze_code(self, code: str, language: str = "python", filename: str = "main.py", action: str = "find_bugs", history: list = None, model: str = None) -> Dict[str, Any]:
        """
        Specialized code analysis for:
        explain, debug, find_bugs, fix_errors, optimize, generate_tests, security_review, complexity_analysis
        Returns structured JSON with summary, issues, suggestions, fixed_code, complexity.
        """
        if not code or not code.strip():
            raise HTTPException(status_code=400, detail="Source code cannot be empty.")

        if len(code) > MAX_CODE_CHARS:
            raise HTTPException(
                status_code=400,
                detail=f"Code input exceeds maximum size ({MAX_CODE_CHARS} characters)."
            )

        action_configs = {
            "explain": {
                "task": "Explain the code architecture, logic flow, and edge cases clearly.",
                "action_name": "explain"
            },
            "debug": {
                "task": "Debug the code thoroughly. Identify runtime errors, logic bugs, unhandled exceptions, and edge conditions.",
                "action_name": "debug"
            },
            "find_bugs": {
                "task": "Perform a deep bug audit. Highlight edge cases (e.g. division by zero, null/None values, empty sequences), off-by-one errors, and syntax traps.",
                "action_name": "find_bugs"
            },
            "fix_errors": {
                "task": "Fix all bugs and syntax errors in this code. Provide complete corrected code and explain each fix.",
                "action_name": "fix_errors"
            },
            "optimize": {
                "task": "Optimize the code for time complexity, space complexity, readability, and idiomatic conventions.",
                "action_name": "optimize"
            },
            "generate_tests": {
                "task": "Generate comprehensive unit tests covering regular flows, boundary conditions, and edge cases.",
                "action_name": "generate_tests"
            },
            "security_review": {
                "task": "Conduct a security audit. Check for command injection, hardcoded secrets, dangerous eval/exec, insecure deserialization, SQL injection, and sanitization issues.",
                "action_name": "security_review"
            },
            "complexity_analysis": {
                "task": "Analyze algorithmic time and space complexity (Big-O), code maintainability, and cognitive complexity.",
                "action_name": "complexity_analysis"
            }
        }

        config = action_configs.get(action.lower(), {
            "task": f"Analyze this code for {action}.",
            "action_name": action
        })

        system_instruction = (
            "You are CodeSaathi AI's local code analysis engine powered by Qwen2.5-Coder. "
            "You MUST respond ONLY with a valid JSON object. Do not enclose with explanation outside the JSON. "
            "The JSON object MUST match this exact schema:\n"
            "{\n"
            '  "action": "' + config["action_name"] + '",\n'
            '  "summary": "High-level overview of the analysis",\n'
            '  "issues": [\n'
            '    {"line": 1, "severity": "ERROR|WARNING|INFO", "description": "Issue description"}\n'
            '  ],\n'
            '  "suggestions": ["Actionable suggestion 1", "Actionable suggestion 2"],\n'
            '  "fixed_code": "Complete corrected or optimized code (if applicable, else empty string)",\n'
            '  "complexity": "Estimated Time: O(...), Space: O(...)",\n'
            '  "model": "qwen2.5-coder:7b",\n'
            '  "mode": "local"\n'
            "}"
        )

        user_content = (
            f"File: {filename}\n"
            f"Language: {language}\n"
            f"Action: {config['action_name']}\n"
            f"Task: {config['task']}\n\n"
            f"Source Code:\n```{language}\n{code}\n```\n\n"
            "Return ONLY the structured JSON response."
        )

        messages = [
            {"role": "system", "content": system_instruction},
            {"role": "user", "content": user_content}
        ]

        raw_result = await self._send_chat_request(messages, model=model, timeout=120.0)
        raw_text = raw_result.get("response", "").strip()
        used_model = raw_result.get("model", self.default_model)

        # Parse JSON robustly
        parsed = self._extract_json(raw_text)
        if parsed and isinstance(parsed, dict):
            parsed["action"] = config["action_name"]
            parsed["model"] = used_model
            parsed["mode"] = "local"
            if "issues" not in parsed or not isinstance(parsed["issues"], list):
                parsed["issues"] = []
            if "suggestions" not in parsed or not isinstance(parsed["suggestions"], list):
                parsed["suggestions"] = []
            if "summary" not in parsed:
                parsed["summary"] = raw_text[:200]
            if "fixed_code" not in parsed:
                parsed["fixed_code"] = ""
            if "complexity" not in parsed:
                parsed["complexity"] = "Not evaluated"
            return parsed

        # Fallback if model output was markdown text
        return {
            "action": config["action_name"],
            "summary": raw_text[:300] if len(raw_text) > 300 else raw_text,
            "issues": [],
            "suggestions": [line.strip("- *") for line in raw_text.split("\n") if line.strip().startswith(("-", "*"))][:5],
            "fixed_code": self._extract_code_block(raw_text),
            "complexity": "Not evaluated",
            "model": used_model,
            "mode": "local",
            "raw_analysis": raw_text
        }

    async def combined_review(self, code: str, language: str = "python", filename: str = "main.py", model: str = None) -> Dict[str, Any]:
        """
        Combines Semgrep open-source static analysis with local Qwen2.5-Coder intelligence.
        Flow: Code -> Semgrep -> Findings -> Qwen2.5-Coder -> Unified Code Review
        """
        if not code or not code.strip():
            raise HTTPException(status_code=400, detail="Source code cannot be empty.")

        if len(code) > MAX_CODE_CHARS:
            raise HTTPException(
                status_code=400,
                detail=f"Code length ({len(code)} chars) exceeds maximum allowed size ({MAX_CODE_CHARS} chars)."
            )

        # 1. Run local Semgrep static analysis
        semgrep_res = semgrep_service.scan_code(code=code, language=language, filename=filename)
        findings = semgrep_res.get("findings", [])
        semgrep_status = semgrep_res.get("status", "unknown")

        # 2. Format findings for Qwen context
        findings_context = ""
        if findings:
            findings_context = "SEMGREP STATIC ANALYSIS FINDINGS:\n"
            for idx, f in enumerate(findings, 1):
                findings_context += (
                    f"{idx}. Severity: [{f['severity']}] | Rule: {f['rule_id']} | Line {f['line']}\n"
                    f"   Message: {f['message']}\n"
                    f"   Code snippet: {f.get('code', '')}\n\n"
                )
        else:
            findings_context = "SEMGREP STATIC ANALYSIS: No critical static rule violations detected.\n"

        system_instruction = (
            "You are CodeSaathi AI, performing an expert Unified Code Review. "
            "You run completely offline locally on the user's machine. "
            "You combine Semgrep static-analysis findings with deep LLM reasoning.\n"
            "Treat Semgrep findings as analysis indicators (do not claim they are always absolute). "
            "For each finding, explain:\n"
            "1. What the issue means in plain terms.\n"
            "2. Why it matters (impact, safety, or reliability risks).\n"
            "3. How to fix it properly.\n"
            "Also inspect the code for any additional logic bugs, edge cases, and algorithmic improvements.\n"
            "Provide the complete, corrected code snippet.\n"
            "You MUST respond ONLY with valid JSON matching this schema:\n"
            "{\n"
            '  "summary": "Overall code review summary",\n'
            '  "semgrep_summary": "Summary of static analysis results",\n'
            '  "issues_explained": [\n'
            '    {\n'
            '      "line": 1,\n'
            '      "severity": "ERROR|WARNING|INFO",\n'
            '      "rule_id": "rule_name",\n'
            '      "meaning": "What the issue means",\n'
            '      "impact": "Why it matters",\n'
            '      "fix": "How to resolve it"\n'
            '    }\n'
            '  ],\n'
            '  "recommendations": ["Recommendation 1", "Recommendation 2"],\n'
            '  "fixed_code": "Complete corrected code",\n'
            '  "complexity": "Time: O(...), Space: O(...)"\n'
            "}"
        )

        user_content = (
            f"File: {filename}\n"
            f"Language: {language}\n\n"
            f"{findings_context}\n"
            f"User Source Code:\n```{language}\n{code}\n```\n\n"
            "Generate the Unified Code Review JSON."
        )

        messages = [
            {"role": "system", "content": system_instruction},
            {"role": "user", "content": user_content}
        ]

        raw_result = await self._send_chat_request(messages, model=model, timeout=120.0)
        raw_text = raw_result.get("response", "").strip()
        used_model = raw_result.get("model", self.default_model)

        parsed = self._extract_json(raw_text)
        if parsed and isinstance(parsed, dict):
            return {
                "status": "success",
                "semgrep_status": semgrep_status,
                "semgrep_findings": findings,
                "summary": parsed.get("summary", "Code review completed."),
                "semgrep_summary": parsed.get("semgrep_summary", f"Semgrep identified {len(findings)} finding(s)."),
                "issues_explained": parsed.get("issues_explained", []),
                "recommendations": parsed.get("recommendations", []),
                "fixed_code": parsed.get("fixed_code", ""),
                "complexity": parsed.get("complexity", "Not specified"),
                "model": used_model,
                "mode": "local"
            }

        # Fallback if unstructured
        return {
            "status": "success",
            "semgrep_status": semgrep_status,
            "semgrep_findings": findings,
            "summary": "Unified review completed using local Semgrep and Qwen2.5-Coder.",
            "semgrep_summary": f"Semgrep identified {len(findings)} finding(s).",
            "issues_explained": [
                {
                    "line": f.get("line", 1),
                    "severity": f.get("severity", "WARNING"),
                    "rule_id": f.get("rule_id", "issue"),
                    "meaning": f.get("message", "Detected by Semgrep"),
                    "impact": "Code reliability or security risk",
                    "fix": "Review logic and apply safeguards"
                }
                for f in findings
            ],
            "recommendations": [line.strip("- *") for line in raw_text.split("\n") if line.strip().startswith(("-", "*"))][:5],
            "fixed_code": self._extract_code_block(raw_text),
            "complexity": "Analyzed",
            "model": used_model,
            "mode": "local",
            "detailed_review": raw_text
        }

    def _extract_json(self, text: str) -> Optional[Dict[str, Any]]:
        """Extract and parse JSON object from LLM response text."""
        # 1. Direct parse
        try:
            return json.loads(text)
        except Exception:
            pass

        # 2. Markdown block ```json ... ```
        json_pattern = re.search(r"```(?:json)?\s*(\{[\s\S]*?\})\s*```", text, re.IGNORECASE)
        if json_pattern:
            try:
                return json.loads(json_pattern.group(1))
            except Exception:
                pass

        # 3. Find outermost curly braces { ... }
        first_brace = text.find("{")
        last_brace = text.rfind("}")
        if first_brace != -1 and last_brace != -1 and last_brace > first_brace:
            try:
                return json.loads(text[first_brace : last_brace + 1])
            except Exception:
                pass

        return None

    def _extract_code_block(self, text: str) -> str:
        """Extract code from markdown code fences if present."""
        code_pattern = re.search(r"```(?:[a-zA-Z0-9_\-]+)?\n([\s\S]*?)```", text)
        if code_pattern:
            return code_pattern.group(1).strip()
        return ""

ollama_service = OllamaService()
