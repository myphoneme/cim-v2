from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
import os
import uuid
from datetime import datetime
from ..database import get_db
from ..models.user import User
from ..models.equipment import Equipment
from ..models.attachment import Attachment
from ..middleware.auth import get_current_user, require_admin
from ..config import get_settings

settings = get_settings()
router = APIRouter(prefix="/attachments", tags=["attachments"])


@router.post("/{equipment_id}")
async def upload_attachment(
    equipment_id: int,
    file: UploadFile = File(...),
    file_type: str = Form(...),
    document_category: str = Form("implementation"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    equipment = db.query(Equipment).filter(Equipment.id == equipment_id).first()
    if not equipment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Equipment not found"
        )

    # Create upload directory if it doesn't exist
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

    # Generate unique filename
    file_ext = os.path.splitext(file.filename)[1]
    unique_filename = f"{uuid.uuid4()}{file_ext}"
    file_path = os.path.join(settings.UPLOAD_DIR, unique_filename)

    # Save file
    with open(file_path, "wb") as buffer:
        content = await file.read()
        if len(content) > settings.MAX_UPLOAD_SIZE:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail="File too large"
            )
        buffer.write(content)

    # Create attachment record
    attachment = Attachment(
        equipment_id=equipment_id,
        name=file.filename,
        type=file_type,
        url=file_path,
        upload_date=datetime.utcnow(),
        document_category=document_category,
        is_published=True
    )
    db.add(attachment)
    db.commit()
    db.refresh(attachment)

    return {"id": attachment.id, "name": attachment.name, "url": f"/api/attachments/file/{attachment.id}", "document_category": attachment.document_category}


@router.post("/{equipment_id}/url")
async def add_url_attachment(
    equipment_id: int,
    name: str = Form(...),
    url: str = Form(...),
    file_type: str = Form(...),
    document_category: str = Form("implementation"),
    metadata: str = Form(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    equipment = db.query(Equipment).filter(Equipment.id == equipment_id).first()
    if not equipment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Equipment not found"
        )

    import json
    metadata_dict = json.loads(metadata) if metadata else None

    attachment = Attachment(
        equipment_id=equipment_id,
        name=name,
        type=file_type,
        url=url,
        file_metadata=metadata_dict,
        upload_date=datetime.utcnow(),
        document_category=document_category,
        is_published=True
    )
    db.add(attachment)
    db.commit()
    db.refresh(attachment)

    return {"id": attachment.id, "name": attachment.name, "url": attachment.url, "document_category": attachment.document_category}


@router.patch("/{attachment_id}/publish")
async def toggle_publish(
    attachment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    attachment = db.query(Attachment).filter(Attachment.id == attachment_id).first()
    if not attachment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Attachment not found"
        )

    attachment.is_published = not attachment.is_published
    db.commit()
    db.refresh(attachment)

    return {"id": attachment.id, "is_published": attachment.is_published}


@router.delete("/{attachment_id}")
async def delete_attachment(
    attachment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    attachment = db.query(Attachment).filter(Attachment.id == attachment_id).first()
    if not attachment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Attachment not found"
        )

    # Delete file if it's a local file
    if attachment.url.startswith(settings.UPLOAD_DIR) and os.path.exists(attachment.url):
        os.remove(attachment.url)

    db.delete(attachment)
    db.commit()
    return {"message": "Attachment deleted successfully"}


@router.get("/file/{attachment_id}")
async def get_attachment_file(
    attachment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    attachment = db.query(Attachment).filter(Attachment.id == attachment_id).first()
    if not attachment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Attachment not found"
        )

    if not os.path.exists(attachment.url):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found"
        )

    # Determine media type for inline display
    media_types = {
        'pdf': 'application/pdf',
        'mp4': 'video/mp4',
        'webm': 'video/webm',
        'mov': 'video/quicktime',
    }
    file_ext = attachment.name.split('.')[-1].lower() if '.' in attachment.name else ''
    media_type = media_types.get(file_ext, 'application/octet-stream')

    # Return file for inline viewing (not download)
    return FileResponse(
        attachment.url,
        media_type=media_type,
        headers={"Content-Disposition": f"inline; filename=\"{attachment.name}\""}
    )
