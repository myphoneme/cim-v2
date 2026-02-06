from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models.team import Team
from ..schemas.teams import TeamCreate, TeamResponse
from ..middleware.auth import get_current_user, require_admin
from ..models.user import User

router = APIRouter(prefix="/teams", tags=["teams"])


@router.get("/", response_model=List[TeamResponse])
async def list_teams(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Team).all()


@router.post("/", response_model=TeamResponse)
async def create_team(data: TeamCreate, db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    existing = db.query(Team).filter(Team.name == data.name).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Team already exists")
    team = Team(**data.model_dump())
    db.add(team)
    db.commit()
    db.refresh(team)
    return team
