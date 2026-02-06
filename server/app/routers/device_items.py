from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from ..database import get_db
from ..models.user import User
from ..models.device_item import DeviceItem
from ..models.location import Location
from ..models.equipment import Equipment
from ..schemas.device_item import (
    DeviceItemCreate,
    DeviceItemUpdate,
    DeviceItemResponse,
    DeviceItemListResponse,
)
from ..middleware.auth import get_current_user, require_admin

router = APIRouter(prefix="/device-items", tags=["device-items"])


@router.get("/", response_model=List[DeviceItemListResponse])
async def list_device_items(
    category: Optional[str] = Query(None, description="Filter by category"),
    location_id: Optional[int] = Query(None, description="Filter by location"),
    status: Optional[str] = Query(None, description="Filter by status"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all device items with optional filters."""
    query = db.query(DeviceItem).options(
        joinedload(DeviceItem.location),
        joinedload(DeviceItem.equipment)
    )

    if category:
        query = query.filter(DeviceItem.category == category)
    if location_id:
        query = query.filter(DeviceItem.location_id == location_id)
    if status:
        query = query.filter(DeviceItem.status == status)

    items = query.all()

    result = []
    for item in items:
        # Get model from equipment if linked, otherwise use direct model field
        model = item.model
        equipment_name = None
        if item.equipment:
            model = f"{item.equipment.vendor} {item.equipment.model}"
            equipment_name = item.equipment.name

        result.append({
            "id": item.id,
            "device_name": item.device_name,
            "hostname": item.hostname,
            "ip_address": item.ip_address,
            "serial_number": item.serial_number,
            "category": item.category,
            "model": model,
            "version": item.version,
            "status": item.status,
            "location_name": item.location.name if item.location else None,
            "equipment_name": equipment_name,
            "grafana_url": item.grafana_url,
            "metric_group_id": item.metric_group_id,
        })

    return result


@router.get("/categories")
async def get_categories(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all unique categories with counts."""
    from sqlalchemy import func

    results = db.query(
        DeviceItem.category,
        func.count(DeviceItem.id).label('count')
    ).group_by(DeviceItem.category).all()

    return [{"category": r.category, "count": r.count} for r in results]


@router.get("/{item_id}", response_model=DeviceItemResponse)
async def get_device_item(
    item_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific device item."""
    item = db.query(DeviceItem).options(
        joinedload(DeviceItem.location),
        joinedload(DeviceItem.equipment)
    ).filter(DeviceItem.id == item_id).first()

    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Device item not found"
        )
    return item


@router.post("/", response_model=DeviceItemResponse)
async def create_device_item(
    item_data: DeviceItemCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Create a new device item (admin only)."""
    # Validate equipment_id if provided
    if item_data.equipment_id:
        equipment = db.query(Equipment).filter(
            Equipment.id == item_data.equipment_id
        ).first()
        if not equipment:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Equipment not found"
            )

    # Validate location_id if provided
    if item_data.location_id:
        location = db.query(Location).filter(
            Location.id == item_data.location_id
        ).first()
        if not location:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Location not found"
            )

    item = DeviceItem(**item_data.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)

    # Reload with relationships
    item = db.query(DeviceItem).options(
        joinedload(DeviceItem.location),
        joinedload(DeviceItem.equipment)
    ).filter(DeviceItem.id == item.id).first()

    return item


@router.post("/bulk", response_model=List[DeviceItemResponse])
async def create_device_items_bulk(
    items_data: List[DeviceItemCreate],
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Create multiple device items at once (admin only)."""
    created_items = []

    for item_data in items_data:
        item = DeviceItem(**item_data.model_dump())
        db.add(item)
        created_items.append(item)

    db.commit()

    # Refresh and reload with relationships
    result = []
    for item in created_items:
        db.refresh(item)
        item = db.query(DeviceItem).options(
            joinedload(DeviceItem.location),
            joinedload(DeviceItem.equipment)
        ).filter(DeviceItem.id == item.id).first()
        result.append(item)

    return result


@router.put("/{item_id}", response_model=DeviceItemResponse)
async def update_device_item(
    item_id: int,
    item_data: DeviceItemUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Update a device item (admin only)."""
    item = db.query(DeviceItem).filter(DeviceItem.id == item_id).first()
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Device item not found"
        )

    update_data = item_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(item, field, value)

    db.commit()
    db.refresh(item)

    # Reload with relationships
    item = db.query(DeviceItem).options(
        joinedload(DeviceItem.location),
        joinedload(DeviceItem.equipment)
    ).filter(DeviceItem.id == item.id).first()

    return item


@router.delete("/{item_id}")
async def delete_device_item(
    item_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Delete a device item (admin only)."""
    item = db.query(DeviceItem).filter(DeviceItem.id == item_id).first()
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Device item not found"
        )

    db.delete(item)
    db.commit()
    return {"message": "Device item deleted successfully"}
