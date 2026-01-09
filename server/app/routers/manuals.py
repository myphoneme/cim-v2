from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.user import User
from ..models.equipment import Equipment
from ..models.manual import ManualContent
from ..schemas.manual import ManualContentResponse
from ..middleware.auth import require_admin
from ..services.gemini_service import GeminiService

router = APIRouter(prefix="/manuals", tags=["manuals"])


@router.post("/generate/{equipment_id}", response_model=ManualContentResponse)
async def generate_manual(
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

    gemini = GeminiService()

    try:
        # Generate manual content using Gemini AI
        manual_data = await gemini.generate_enhanced_manual(equipment)

        # Check if manual already exists
        existing_manual = db.query(ManualContent).filter(
            ManualContent.equipment_id == equipment_id
        ).first()

        if existing_manual:
            # Update existing manual
            existing_manual.summary = manual_data["summary"]
            existing_manual.monitoring = manual_data["monitoring"]
            existing_manual.maintenance = manual_data["maintenance"]
            existing_manual.troubleshooting = manual_data["troubleshooting"]
            existing_manual.links = manual_data.get("links", [])
            existing_manual.illustration_prompt = manual_data.get("illustration_prompt")
            existing_manual.image_url = manual_data.get("image_url")
            manual = existing_manual
        else:
            # Create new manual
            manual = ManualContent(
                equipment_id=equipment_id,
                summary=manual_data["summary"],
                monitoring=manual_data["monitoring"],
                maintenance=manual_data["maintenance"],
                troubleshooting=manual_data["troubleshooting"],
                links=manual_data.get("links", []),
                illustration_prompt=manual_data.get("illustration_prompt"),
                image_url=manual_data.get("image_url")
            )
            db.add(manual)

        # Update equipment SOP status
        equipment.sop_status = "Available"

        db.commit()
        db.refresh(manual)
        return manual

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate manual: {str(e)}"
        )
