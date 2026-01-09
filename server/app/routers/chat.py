from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import List
import uuid
from datetime import datetime
from ..database import get_db
from ..models.user import User
from ..models.equipment import Equipment
from ..models.chat_history import ChatHistory
from ..schemas.chat import ChatRequest, ChatMessage
from ..middleware.auth import get_current_user
from ..services.gemini_service import GeminiService
from ..config import get_settings

settings = get_settings()
router = APIRouter(prefix="/chat", tags=["chat"])


@router.post("/stream")
async def chat_stream(
    request: ChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Get current inventory for context
    equipment_list = db.query(Equipment).all()
    inventory_context = [
        {
            "id": eq.id,
            "name": eq.name,
            "vendor": eq.vendor,
            "model": eq.model,
            "area": eq.area,
            "type": eq.type
        }
        for eq in equipment_list
    ]

    # Generate or use existing session ID
    session_id = request.session_id or str(uuid.uuid4())

    # Get chat history for this session
    history = db.query(ChatHistory).filter(
        ChatHistory.session_id == session_id
    ).order_by(ChatHistory.timestamp).all()

    history_messages = [
        {"role": msg.role, "content": msg.content}
        for msg in history
    ]

    # Save user message
    user_message = ChatHistory(
        user_id=current_user.id,
        session_id=session_id,
        role="user",
        content=request.message,
        timestamp=datetime.utcnow()
    )
    db.add(user_message)
    db.commit()

    async def generate():
        gemini = GeminiService()
        full_response = ""

        try:
            async for chunk in gemini.chat_stream(
                message=request.message,
                inventory=inventory_context,
                history=history_messages
            ):
                full_response += chunk
                yield chunk

            # Save model response after streaming completes
            model_message = ChatHistory(
                user_id=current_user.id,
                session_id=session_id,
                role="model",
                content=full_response,
                timestamp=datetime.utcnow()
            )
            db.add(model_message)
            db.commit()

        except Exception as e:
            yield f"Error: {str(e)}"

    return StreamingResponse(
        generate(),
        media_type="text/plain",
        headers={
            "X-Session-Id": session_id
        }
    )


@router.get("/history", response_model=List[ChatMessage])
async def get_chat_history(
    session_id: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(ChatHistory).filter(ChatHistory.user_id == current_user.id)

    if session_id:
        query = query.filter(ChatHistory.session_id == session_id)

    messages = query.order_by(ChatHistory.timestamp).all()

    return [
        ChatMessage(
            role=msg.role,
            content=msg.content,
            timestamp=msg.timestamp
        )
        for msg in messages
    ]


@router.delete("/history/{session_id}")
async def clear_chat_history(
    session_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db.query(ChatHistory).filter(
        ChatHistory.session_id == session_id,
        ChatHistory.user_id == current_user.id
    ).delete()
    db.commit()
    return {"message": "Chat history cleared"}
