from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from ..database import get_db
from ..models.metric_definition import MetricDefinition
from ..models.metric_group import MetricGroup
from ..models.metric_group_member import MetricGroupMember
from ..models.metric_sample import MetricSample
from ..models.device_item import DeviceItem
from ..models.vm_item import VmItem
from ..models.alert_rule import AlertRule
from ..schemas.metrics import (
    MetricDefinitionCreate,
    MetricDefinitionResponse,
    MetricGroupCreate,
    MetricGroupResponse,
    MetricGroupMemberCreate,
    MetricSampleResponse,
)
from ..middleware.auth import get_current_user, require_admin
from ..models.user import User

router = APIRouter(prefix="/metrics", tags=["metrics"])


@router.get("/definitions", response_model=List[MetricDefinitionResponse])
async def list_definitions(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(MetricDefinition).all()


@router.post("/definitions", response_model=MetricDefinitionResponse)
async def create_definition(data: MetricDefinitionCreate, db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    existing = db.query(MetricDefinition).filter(MetricDefinition.key == data.key).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Metric key already exists")
    metric = MetricDefinition(**data.model_dump())
    db.add(metric)
    db.commit()
    db.refresh(metric)
    return metric


@router.get("/groups", response_model=List[MetricGroupResponse])
async def list_groups(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(MetricGroup).all()


@router.post("/groups", response_model=MetricGroupResponse)
async def create_group(data: MetricGroupCreate, db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    existing = db.query(MetricGroup).filter(MetricGroup.name == data.name).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Group already exists")
    group = MetricGroup(**data.model_dump())
    db.add(group)
    db.commit()
    db.refresh(group)
    return group


@router.put("/groups/{group_id}", response_model=MetricGroupResponse)
async def update_group(group_id: int, data: MetricGroupCreate, db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    group = db.query(MetricGroup).filter(MetricGroup.id == group_id).first()
    if not group:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Group not found")
    update_data = data.model_dump()
    for field, value in update_data.items():
        setattr(group, field, value)
    db.commit()
    db.refresh(group)
    return group


@router.delete("/groups/{group_id}")
async def delete_group(group_id: int, db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    group = db.query(MetricGroup).filter(MetricGroup.id == group_id).first()
    if not group:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Group not found")
    db.query(DeviceItem).filter(DeviceItem.metric_group_id == group_id).update({DeviceItem.metric_group_id: None})
    db.query(VmItem).filter(VmItem.metric_group_id == group_id).update({VmItem.metric_group_id: None})
    db.query(AlertRule).filter(AlertRule.group_id == group_id).update({AlertRule.group_id: None})
    db.delete(group)
    db.commit()
    return {"message": "Group deleted"}


@router.post("/groups/{group_id}/members")
async def add_member(group_id: int, data: MetricGroupMemberCreate, db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    group = db.query(MetricGroup).filter(MetricGroup.id == group_id).first()
    if not group:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Group not found")
    member = MetricGroupMember(group_id=group_id, metric_key=data.metric_key)
    db.add(member)
    db.commit()
    return {"message": "Member added"}


@router.get("/samples", response_model=List[MetricSampleResponse])
async def list_samples(
    device_item_id: Optional[int] = Query(None),
    vm_id: Optional[int] = Query(None),
    metric_key: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(MetricSample)
    if device_item_id:
        query = query.filter(MetricSample.device_item_id == device_item_id)
    if vm_id:
        query = query.filter(MetricSample.vm_id == vm_id)
    if metric_key:
        query = query.filter(MetricSample.metric_key == metric_key)
    return query.order_by(MetricSample.captured_at.desc()).limit(500).all()
