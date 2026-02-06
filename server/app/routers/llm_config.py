from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from ..models.user import User
from ..models.llm_api_key import LlmApiKey
from ..models.llm_settings import LlmSettings
from ..schemas.llm_config import LlmApiKeyCreate, LlmApiKeySummary, LlmConfigResponse, LlmSelectRequest, LlmApiKeyUpdate
from ..middleware.auth import get_current_user

router = APIRouter(prefix="/llm-config", tags=["llm-config"])

ALLOWED_PROVIDERS = {"openai", "gemini", "claude"}


def require_admin(user: User):
    if user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")


def mask_key(value: str) -> str:
    if not value:
        return ""
    tail = value[-4:] if len(value) >= 4 else value
    return f"****{tail}"


@router.get("/", response_model=LlmConfigResponse)
async def get_llm_config(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    require_admin(current_user)
    keys = db.query(LlmApiKey).order_by(LlmApiKey.created_at.desc()).all()
    selection = db.query(LlmSettings).first()
    selected_key_id = selection.selected_key_id if selection else None

    requires_selection = len(keys) > 1 and not selected_key_id
    summaries: List[LlmApiKeySummary] = []
    for key in keys:
        summaries.append(LlmApiKeySummary(
            id=key.id,
            provider=key.provider,
            label=key.label,
            masked_key=mask_key(key.api_key),
            created_at=key.created_at,
            is_selected=selected_key_id == key.id
        ))

    return LlmConfigResponse(
        selected_key_id=selected_key_id,
        requires_selection=requires_selection,
        keys=summaries
    )


@router.post("/keys", response_model=LlmConfigResponse)
async def add_llm_key(
    payload: LlmApiKeyCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    require_admin(current_user)
    provider = payload.provider.lower().strip()
    if provider not in ALLOWED_PROVIDERS:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Unsupported provider")
    if not payload.api_key:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="API key required")

    record = LlmApiKey(provider=provider, label=payload.label, api_key=payload.api_key)
    db.add(record)
    db.commit()
    db.refresh(record)

    selection = db.query(LlmSettings).first()
    key_count = db.query(LlmApiKey).count()
    if key_count == 1:
        if not selection:
            selection = LlmSettings(selected_key_id=record.id)
            db.add(selection)
        else:
            selection.selected_key_id = record.id
        db.commit()

    return await get_llm_config(db=db, current_user=current_user)


@router.patch("/select", response_model=LlmConfigResponse)
async def select_llm_key(
    payload: LlmSelectRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    require_admin(current_user)
    key = db.query(LlmApiKey).filter(LlmApiKey.id == payload.key_id).first()
    if not key:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="API key not found")

    selection = db.query(LlmSettings).first()
    if not selection:
        selection = LlmSettings(selected_key_id=key.id)
        db.add(selection)
    else:
        selection.selected_key_id = key.id
    db.commit()

    return await get_llm_config(db=db, current_user=current_user)


@router.delete("/keys/{key_id}", response_model=LlmConfigResponse)
async def delete_llm_key(
    key_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    require_admin(current_user)
    key = db.query(LlmApiKey).filter(LlmApiKey.id == key_id).first()
    if not key:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="API key not found")
    db.delete(key)
    db.commit()

    remaining = db.query(LlmApiKey).order_by(LlmApiKey.created_at.desc()).all()
    selection = db.query(LlmSettings).first()
    if selection:
        if selection.selected_key_id == key_id:
            selection.selected_key_id = remaining[0].id if remaining else None
            db.commit()

    return await get_llm_config(db=db, current_user=current_user)


@router.patch("/keys/{key_id}", response_model=LlmConfigResponse)
async def update_llm_key(
    key_id: int,
    payload: LlmApiKeyUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    require_admin(current_user)
    key = db.query(LlmApiKey).filter(LlmApiKey.id == key_id).first()
    if not key:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="API key not found")

    if payload.api_key is not None and payload.api_key.strip():
        key.api_key = payload.api_key.strip()
    if payload.label is not None:
        key.label = payload.label.strip() or None

    db.commit()
    return await get_llm_config(db=db, current_user=current_user)
