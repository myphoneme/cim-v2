from typing import Dict, Any
import base64
import json
import mimetypes
import re

from ..config import get_settings

settings = get_settings()


from typing import Optional


class OpenAIService:
    def __init__(self, api_key: Optional[str] = None, model_name: Optional[str] = None):
        from openai import OpenAI
        self.client = OpenAI(api_key=api_key or settings.OPENAI_API_KEY)
        self.model_name = model_name or settings.OPENAI_MODEL

    def extract_metrics_from_image(self, file_path: str) -> Dict[str, Any]:
        prompt = """
        Extract metrics from this monitoring dashboard screenshot.
        If multiple hosts/VMs are present, return one metric per host with the host/VM IP.
        Return JSON ONLY in this format:
        {
          "metrics": [
            {"ip_address": "10.0.1.11", "key": "cpu_util", "value": 0.0, "unit": "%", "confidence": 0.0},
            {"ip_address": "10.0.1.11", "key": "ram_util", "value": 0.0, "unit": "%", "confidence": 0.0}
          ],
          "raw_text": "...",
          "confidence": 0.0,
          "status": "ok",
          "capture_time": null
        }
        Use keys like cpu_util, ram_util, disk_util, net_in, net_out.
        """
        try:
            mime_type, _ = mimetypes.guess_type(file_path)
            mime_type = mime_type or "image/png"
            with open(file_path, "rb") as f:
                image_bytes = f.read()

            image_b64 = base64.b64encode(image_bytes).decode("utf-8")
            response = self.client.chat.completions.create(
                model=self.model_name,
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": prompt},
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": f"data:{mime_type};base64,{image_b64}"
                                },
                            },
                        ],
                    }
                ],
                temperature=0,
            )
            response_text = response.choices[0].message.content or ""

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
