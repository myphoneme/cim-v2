from typing import Dict, Any
import base64
import json
import mimetypes
import re

from ..config import get_settings

settings = get_settings()


from typing import Optional


class AnthropicService:
    def __init__(self, api_key: Optional[str] = None, model_name: Optional[str] = None):
        from anthropic import Anthropic
        self.client = Anthropic(api_key=api_key or settings.ANTHROPIC_API_KEY)
        self.model_name = model_name or settings.ANTHROPIC_MODEL

    def extract_metrics_from_image(self, file_path: str) -> Dict[str, Any]:
        prompt = """
        Extract metrics from this monitoring dashboard screenshot.
        If multiple hosts/VMs are present, return a COMPLETE row per host/VM IP with all metric keys.
        For each IP, always include cpu_util, ram_util, disk_util, net_in, net_out (use null if not visible).
        Return JSON ONLY in this format:
        {
          "metrics": [
            {"ip_address": "10.0.1.11", "key": "cpu_util", "value": 0.0, "unit": "%", "confidence": 0.0},
            {"ip_address": "10.0.1.11", "key": "ram_util", "value": 0.0, "unit": "%", "confidence": 0.0},
            {"ip_address": "10.0.1.11", "key": "disk_util", "value": 0.0, "unit": "%", "confidence": 0.0},
            {"ip_address": "10.0.1.11", "key": "net_in", "value": null, "unit": "%", "confidence": 0.0},
            {"ip_address": "10.0.1.11", "key": "net_out", "value": null, "unit": "%", "confidence": 0.0}
          ],
          "raw_text": "...",
          "confidence": 0.0,
          "status": "ok",
          "capture_time": null
        }
        Use keys cpu_util, ram_util, disk_util, net_in, net_out only.
        If a metric is not visible for an IP, set value to null (do not guess).
        """
        try:
            mime_type, _ = mimetypes.guess_type(file_path)
            mime_type = mime_type or "image/png"
            with open(file_path, "rb") as f:
                image_bytes = f.read()

            image_b64 = base64.b64encode(image_bytes).decode("utf-8")
            response = self.client.messages.create(
                model=self.model_name,
                max_tokens=1024,
                temperature=0,
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": prompt},
                            {
                                "type": "image",
                                "source": {
                                    "type": "base64",
                                    "media_type": mime_type,
                                    "data": image_b64,
                                },
                            },
                        ],
                    }
                ],
            )
            response_text = ""
            if response.content:
                first = response.content[0]
                response_text = getattr(first, "text", "") or ""

            if response_text.startswith("```"):
                response_text = response_text.split("```", 2)[1]
                if response_text.startswith("json"):
                    response_text = response_text[4:]

            cleaned = response_text.strip()
            try:
                data = json.loads(cleaned)
                return data
            except Exception:
                match = re.search(r"\{.*\}", cleaned, flags=re.DOTALL)
                if match:
                    try:
                        data = json.loads(match.group(0))
                        return data
                    except Exception:
                        pass

            return {
                "metrics": [],
                "raw_text": cleaned,
                "confidence": 0.0,
                "status": "error",
                "capture_time": None
            }
        except Exception as e:
            return {
                "metrics": [],
                "raw_text": None,
                "confidence": 0.0,
                "status": "error",
                "capture_time": None,
                "error": str(e)
            }
