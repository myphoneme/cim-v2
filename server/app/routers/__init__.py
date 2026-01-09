from .auth import router as auth_router
from .equipment import router as equipment_router
from .chat import router as chat_router
from .attachments import router as attachments_router
from .manuals import router as manuals_router

__all__ = ["auth_router", "equipment_router", "chat_router", "attachments_router", "manuals_router"]
