from typing import Dict, Any
from ..config import get_settings
from ..database import SessionLocal
from ..models.llm_api_key import LlmApiKey
from ..models.llm_settings import LlmSettings
from .gemini_service import GeminiService
from .openai_service import OpenAIService
from .anthropic_service import AnthropicService


class MetricsExtractionService:
    def __init__(self):
        settings = get_settings()
        provider = (settings.LLM_PROVIDER or "gemini").lower()
        api_key = None
        model_name = None
        self.provider_name = provider
        self.provider_error = None

        keys_present = False
        try:
            db = SessionLocal()
            try:
                keys = db.query(LlmApiKey).all()
                keys_present = len(keys) > 0
                selection = db.query(LlmSettings).first()
                selected_key = None

                if keys:
                    if len(keys) == 1:
                        selected_key = keys[0]
                    elif selection and selection.selected_key_id:
                        selected_key = next((k for k in keys if k.id == selection.selected_key_id), None)
                        if not selected_key:
                            self.provider_error = "Selected API key not found. Update LLM settings."
                    else:
                        self.provider_error = "Multiple API keys configured. Select one in Admin Hub."

                if selected_key:
                    provider = selected_key.provider.lower()
                    api_key = selected_key.api_key
                    self.provider_name = provider
            finally:
                db.close()
        except Exception as e:
            self.provider_error = f"Failed to load LLM settings: {e}"

        if not api_key and not keys_present:
            if provider == "openai":
                api_key = settings.OPENAI_API_KEY
                model_name = settings.OPENAI_MODEL
            elif provider in ("claude", "anthropic"):
                api_key = settings.ANTHROPIC_API_KEY
                model_name = settings.ANTHROPIC_MODEL
                self.provider_name = "claude"
            else:
                api_key = settings.GEMINI_API_KEY
                model_name = settings.GEMINI_MODEL
                self.provider_name = "gemini"

        if not api_key:
            self.provider_error = self.provider_error or f"Missing API key for {self.provider_name}"
            self.provider = None
            return

        try:
            if provider == "openai":
                self.provider = OpenAIService(api_key=api_key, model_name=model_name)
            elif provider in ("claude", "anthropic"):
                self.provider = AnthropicService(api_key=api_key, model_name=model_name)
            else:
                self.provider = GeminiService(api_key=api_key, model_name=model_name)
                self.provider_name = "gemini"
        except Exception as e:
            self.provider = None
            self.provider_error = f"{provider} init failed: {e}"

    def extract_from_image(self, file_path: str) -> Dict[str, Any]:
        if self.provider_error or not self.provider:
            return {
                "metrics": [],
                "raw_text": None,
                "confidence": 0.0,
                "status": "error",
                "capture_time": None,
                "error": self._sanitize_error(self.provider_error or "LLM provider unavailable")
            }
        result = self.provider.extract_metrics_from_image(file_path)
        if isinstance(result, dict) and result.get("error"):
            result["error"] = self._sanitize_error(str(result["error"]))
        return result

    def _sanitize_error(self, message: str) -> str:
        import re
        if not message:
            return message
        sanitized = message
        patterns = [
            r"(sk-[A-Za-z0-9_\-]{16,})",
            r"(sk-ant-[A-Za-z0-9_\-]{16,})",
            r"(sk-proj-[A-Za-z0-9_\-]{16,})",
            r"(AIza[0-9A-Za-z_\-]{10,})",
            r"(OPENAI_[A-Za-z0-9_\-]{6,})",
        ]
        for pattern in patterns:
            def repl(match):
                value = match.group(1)
                tail = value[-4:] if len(value) >= 4 else value
                return f"***{tail}"
            sanitized = re.sub(pattern, repl, sanitized)
        sanitized = re.sub(
            r"(Incorrect API key provided:\s*)([^\s,}]+)",
            lambda m: f"{m.group(1)}***",
            sanitized,
            flags=re.IGNORECASE
        )
        # Mask explicit api_key fields in JSON-like text
        sanitized = re.sub(r'("api_key"\s*:\s*")([^"]+)(")', lambda m: f'{m.group(1)}***{m.group(2)[-4:]}{m.group(3)}', sanitized)
        sanitized = re.sub(r"(api[_-]?key\s*[:=]\s*)([A-Za-z0-9_\-]{8,})", lambda m: f"{m.group(1)}***{m.group(2)[-4:]}", sanitized, flags=re.IGNORECASE)
        return sanitized
