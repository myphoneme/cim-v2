from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models.vm_item import VmItem
from ..schemas.vm_item import VmItemCreate, VmItemUpdate, VmItemResponse
from ..middleware.auth import get_current_user, require_admin
from ..models.user import User

router = APIRouter(prefix="/vm-items", tags=["vm-items"])


@router.get("/", response_model=List[VmItemResponse])
async def list_vms(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(VmItem).all()


@router.get("/{vm_id}", response_model=VmItemResponse)
async def get_vm(vm_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    vm = db.query(VmItem).filter(VmItem.id == vm_id).first()
    if not vm:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="VM not found")
    return vm


@router.post("/", response_model=VmItemResponse)
async def create_vm(data: VmItemCreate, db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    vm = VmItem(**data.model_dump())
    db.add(vm)
    db.commit()
    db.refresh(vm)
    return vm


@router.put("/{vm_id}", response_model=VmItemResponse)
async def update_vm(vm_id: int, data: VmItemUpdate, db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    vm = db.query(VmItem).filter(VmItem.id == vm_id).first()
    if not vm:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="VM not found")
    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(vm, field, value)
    db.commit()
    db.refresh(vm)
    return vm


@router.delete("/{vm_id}")
async def delete_vm(vm_id: int, db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    vm = db.query(VmItem).filter(VmItem.id == vm_id).first()
    if not vm:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="VM not found")
    db.delete(vm)
    db.commit()
    return {"message": "VM deleted"}
