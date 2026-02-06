from .auth import router as auth_router
from .equipment import router as equipment_router
from .chat import router as chat_router
from .attachments import router as attachments_router
from .manuals import router as manuals_router
from .locations import router as locations_router
from .device_items import router as device_items_router
from .vms import router as vms_router
from .monitoring_uploads import router as monitoring_uploads_router
from .metrics import router as metrics_router
from .alerts import router as alerts_router
from .teams import router as teams_router
from .llm_config import router as llm_config_router

__all__ = [
    "auth_router",
    "equipment_router",
    "chat_router",
    "attachments_router",
    "manuals_router",
    "locations_router",
    "device_items_router",
    "vms_router",
    "monitoring_uploads_router",
    "metrics_router",
    "alerts_router",
    "teams_router",
    "llm_config_router",
]
