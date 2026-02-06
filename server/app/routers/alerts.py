from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models.alert import Alert
from ..models.alert_rule import AlertRule
from ..models.alert_update import AlertUpdate
from ..models.alert_assignment import AlertAssignment
from ..schemas.alerts import (
    AlertRuleCreate,
    AlertRuleResponse,
    AlertResponse,
    AlertUpdateCreate,
    AlertUpdateResponse,
    AlertAssignCreate,
)
from ..middleware.auth import get_current_user, require_admin
from ..models.user import User

router = APIRouter(prefix="/alerts", tags=["alerts"])


@router.get("/", response_model=List[AlertResponse])
async def list_alerts(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Alert).order_by(Alert.detected_at.desc()).limit(200).all()


@router.get("/rules", response_model=List[AlertRuleResponse])
async def list_rules(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(AlertRule).all()


@router.post("/rules", response_model=AlertRuleResponse)
async def create_rule(data: AlertRuleCreate, db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    rule = AlertRule(**data.model_dump())
    db.add(rule)
    db.commit()
    db.refresh(rule)
    return rule


@router.put("/rules/{rule_id}", response_model=AlertRuleResponse)
async def update_rule(rule_id: int, data: AlertRuleCreate, db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    rule = db.query(AlertRule).filter(AlertRule.id == rule_id).first()
    if not rule:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Rule not found")
    update_data = data.model_dump()
    for field, value in update_data.items():
        setattr(rule, field, value)
    db.commit()
    db.refresh(rule)
    return rule


@router.delete("/rules/{rule_id}")
async def delete_rule(rule_id: int, db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    rule = db.query(AlertRule).filter(AlertRule.id == rule_id).first()
    if not rule:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Rule not found")
    db.delete(rule)
    db.commit()
    return {"message": "Rule deleted"}


@router.get("/{alert_id}", response_model=AlertResponse)
async def get_alert(alert_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Alert not found")
    return alert


@router.post("/{alert_id}/updates", response_model=AlertUpdateResponse)
async def add_update(alert_id: int, data: AlertUpdateCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Alert not found")
    alert.status = data.status
    update = AlertUpdate(alert_id=alert_id, status=data.status, note=data.note, updated_by=current_user.id)
    db.add(update)
    db.commit()
    db.refresh(update)
    return update


@router.post("/{alert_id}/assign")
async def assign_alert(alert_id: int, data: AlertAssignCreate, db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Alert not found")
    assignment = AlertAssignment(alert_id=alert_id, team_id=data.team_id, user_id=data.user_id)
    db.add(assignment)
    db.commit()
    return {"message": "Assigned"}
