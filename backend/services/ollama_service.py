import os
import httpx
from fastapi import HTTPException

OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "qwen2.5-coder:3b")

class OllamaService:
    def __init__(self, base_url: str = OLLAMA_BASE_URL, default_model: str = OLLAMA_MODEL):
        self.base_url = base_url.rstrip("/")
        self.default_model = default_model

    async def get_health_status(self) -> dict:
        """Check Ollama API and model availability."""
        try:
            async with httpx.AsyncClient(timeout=3.0) as client:
                res = await client.get(f"{self.base_url}/api/tags")
                if res.status_code == 200:
                    models_data = res.json().get("models", [])
                    available_models = [m.get("name") for m in models_data if m.get("name")]
                    
                    # Check if configured model or variant exists
                    target = self.default_model
                    model_found = any(
                        target in m or f"{target}:latest" == m for m in available_models
                    )
                    
                    status_code = "connected" if model_found else "model_missing"
                    msg = (
                        f"Local AI ready with model '{target}'"
                        if model_found
                        else f"Ollama is running, but model '{target}' is missing. Pull it using 'ollama pull {target}'."
                    )

                    return {
                        "backend_status": "ok",
                        "ollama_status": status_code,
                        "model": target,
                        "available_models": available_models,
                        "message": msg
                    }
        except httpx.ConnectError:
            return {
                "backend_status": "ok",
                "ollama_status": "offline",
                "model": self.default_model,
                "available_models": [],
                "message": "Ollama service is not running locally. Start it with 'ollama serve'."
            }
        except Exception as e:
            return {
                "backend_status": "ok",
                "ollama_status": "offline",
                "model": self.default_model,
                "available_models": [],
                "message": f"Error connecting to Ollama: {str(e)}"
            }

    async def generate_chat(self, prompt: str, code: str = "", filename: str = "main.py", language: str = "python", history: list = None, model: str = None) -> dict:
        """Send chat request to Ollama chat API."""
        health = await self.get_health_status()
        if health["ollama_status"] == "offline":
            raise HTTPException(
                status_code=503,
                detail="Ollama is not running. Please start Ollama locally ('ollama serve') and retry."
            )

        target_model = model or self.default_model
        available = health["available_models"]

        # Auto-fallback to installed model if target model is not present
        if available and not any(target_model in m for m in available):
            target_model = available[0]

        system_instruction = (
            "You are CodeSaathi, an expert, encouraging, and beginner-friendly AI coding assistant. "
            "You run completely offline on the user's local machine. "
            "Always explain code simply and clearly. Structure responses with markdown headings, "
            "bullet points, and formatted code blocks. When fixing bugs, show the complete corrected snippet."
        )

        messages = [{"role": "system", "content": system_instruction}]

        # Add optional conversation history
        if history:
            for item in history:
                if isinstance(item, dict) and "role" in item and "content" in item:
                    messages.append({"role": item["role"], "content": item["content"]})

        user_content = f"File: {filename} ({language})\n\n"
        if code.strip():
            user_content += f"Current code:\n```{language}\n{code}\n```\n\n"
        user_content += f"User Request: {prompt}"

        messages.append({"role": "user", "content": user_content})

        try:
            async with httpx.AsyncClient(timeout=120.0) as client:
                res = await client.post(
                    f"{self.base_url}/api/chat",
                    json={
                        "model": target_model,
                        "stream": False,
                        "messages": messages
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
                    "status": "success"
                }
        except httpx.TimeoutException:
            raise HTTPException(
                status_code=504,
                detail="The local AI model timed out. Try asking a simpler question or using a smaller model."
            )
        except HTTPException:
            raise
        except Exception as exc:
            raise HTTPException(status_code=500, detail=f"Ollama AI Error: {str(exc)}")

ollama_service = OllamaService()
