from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models.user import User
from ..models.equipment import Equipment
from ..models.manual import ManualContent
from ..models.attachment import Attachment
from ..schemas.equipment import (
    EquipmentCreate,
    EquipmentUpdate,
    EquipmentResponse,
    EquipmentListResponse,
)
from ..schemas.manual import ManualContentCreate
from ..middleware.auth import get_current_user, require_admin

router = APIRouter(prefix="/equipment", tags=["equipment"])


@router.get("/", response_model=List[EquipmentListResponse])
async def list_equipment(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    equipment_list = db.query(Equipment).all()
    result = []

    for eq in equipment_list:
        # Get published attachments for this equipment
        published_attachments = [att for att in eq.attachments if att.is_published]

        doc_count = sum(1 for att in published_attachments if att.type in ['pdf', 'docx', 'web'])
        video_count = sum(1 for att in published_attachments if att.type in ['video', 'youtube'])

        # Get last updated date from most recent attachment
        last_updated = None
        if published_attachments:
            last_updated = max(att.upload_date for att in published_attachments)

        result.append({
            "id": eq.id,
            "name": eq.name,
            "area": eq.area,
            "type": eq.type,
            "vendor": eq.vendor,
            "model": eq.model,
            "quantity": eq.quantity,
            "sop_status": eq.sop_status,
            "email": eq.email,
            "phone": eq.phone,
            "account_type": eq.account_type or "AUTO",
            "security_level": eq.security_level or "LOW",
            "doc_count": doc_count,
            "video_count": video_count,
            "last_updated": last_updated,
        })

    return result


@router.get("/{equipment_id}", response_model=EquipmentResponse)
async def get_equipment(
    equipment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    equipment = db.query(Equipment).filter(Equipment.id == equipment_id).first()
    if not equipment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Equipment not found"
        )
    return equipment


@router.post("/", response_model=EquipmentResponse)
async def create_equipment(
    equipment_data: EquipmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    equipment = Equipment(**equipment_data.model_dump())
    db.add(equipment)
    db.commit()
    db.refresh(equipment)
    return equipment


@router.put("/{equipment_id}", response_model=EquipmentResponse)
async def update_equipment(
    equipment_id: int,
    equipment_data: EquipmentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    equipment = db.query(Equipment).filter(Equipment.id == equipment_id).first()
    if not equipment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Equipment not found"
        )

    update_data = equipment_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(equipment, field, value)

    db.commit()
    db.refresh(equipment)
    return equipment


@router.delete("/{equipment_id}")
async def delete_equipment(
    equipment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    equipment = db.query(Equipment).filter(Equipment.id == equipment_id).first()
    if not equipment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Equipment not found"
        )

    db.delete(equipment)
    db.commit()
    return {"message": "Equipment deleted successfully"}


@router.put("/{equipment_id}/manual", response_model=EquipmentResponse)
async def save_manual(
    equipment_id: int,
    manual_data: ManualContentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    equipment = db.query(Equipment).filter(Equipment.id == equipment_id).first()
    if not equipment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Equipment not found"
        )

    # Check if manual already exists
    existing_manual = db.query(ManualContent).filter(
        ManualContent.equipment_id == equipment_id
    ).first()

    if existing_manual:
        # Update existing manual
        for field, value in manual_data.model_dump().items():
            if field == "links" and value:
                setattr(existing_manual, field, [link.model_dump() if hasattr(link, 'model_dump') else link for link in value])
            else:
                setattr(existing_manual, field, value)
    else:
        # Create new manual
        manual_dict = manual_data.model_dump()
        if manual_dict.get("links"):
            manual_dict["links"] = [link.model_dump() if hasattr(link, 'model_dump') else link for link in manual_dict["links"]]
        manual = ManualContent(equipment_id=equipment_id, **manual_dict)
        db.add(manual)

    # Update equipment SOP status
    equipment.sop_status = "Available"

    db.commit()
    db.refresh(equipment)
    return equipment
