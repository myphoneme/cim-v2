from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form, BackgroundTasks, Query
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import List, Optional
import os
import uuid
from datetime import datetime
from ..database import get_db, SessionLocal
from ..models.user import User
from ..models.monitoring_upload import MonitoringUpload
from ..models.metric_sample import MetricSample
from ..models.device_item import DeviceItem
from ..models.vm_item import VmItem
from ..schemas.monitoring_upload import MonitoringUploadResponse, MonitoringConfirmRequest
from ..middleware.auth import get_current_user
from ..services.metrics_extraction_service import MetricsExtractionService
from ..services.alert_engine import evaluate_sample
from ..config import get_settings

settings = get_settings()
router = APIRouter(prefix="/monitoring-uploads", tags=["monitoring-uploads"])


def process_upload(upload_id: int):
    db = SessionLocal()
    try:
        upload = db.query(MonitoringUpload).filter(MonitoringUpload.id == upload_id).first()
        if not upload:
            return

        extraction = MetricsExtractionService().extract_from_image(upload.file_path)
        metrics = extraction.get("metrics", [])
        upload.raw_text = extraction.get("raw_text")
        upload.parse_status = "ready" if extraction.get("status", "ok") == "ok" else "error"
        upload.parse_confidence = extraction.get("confidence")
        upload.parse_error = extraction.get("error")
        upload.extracted_metrics = metrics
        if extraction.get("capture_time"):
            upload.capture_time = extraction.get("capture_time")

        db.commit()
    except Exception:
        db.rollback()
        upload = db.query(MonitoringUpload).filter(MonitoringUpload.id == upload_id).first()
        if upload:
            upload.parse_status = "error"
            db.commit()
    finally:
        db.close()


@router.post("/", response_model=MonitoringUploadResponse)
async def upload_monitoring_screenshot(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    device_item_id: Optional[int] = Form(None),
    vm_id: Optional[int] = Form(None),
    location_id: Optional[int] = Form(None),
    capture_time: Optional[str] = Form(None),
    dashboard_label: Optional[str] = Form(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    os.makedirs(os.path.join(settings.UPLOAD_DIR, "monitoring"), exist_ok=True)

    file_ext = os.path.splitext(file.filename)[1]
    unique_filename = f"{uuid.uuid4()}{file_ext}"
    file_path = os.path.join(settings.UPLOAD_DIR, "monitoring", unique_filename)

    content = await file.read()
    if len(content) > settings.MAX_UPLOAD_SIZE:
        raise HTTPException(status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, detail="File too large")

    with open(file_path, "wb") as buffer:
        buffer.write(content)

    capture_dt = None
    if capture_time:
        try:
            capture_dt = datetime.fromisoformat(capture_time)
        except Exception:
            capture_dt = None

    upload = MonitoringUpload(
        device_item_id=device_item_id,
        vm_id=vm_id,
        location_id=location_id,
        file_path=file_path,
        file_name=file.filename,
        mime_type=file.content_type,
        uploaded_by_user_id=current_user.id,
        capture_time=capture_dt,
        dashboard_label=dashboard_label,
        parse_status="pending"
    )
    db.add(upload)
    db.commit()
    db.refresh(upload)

    background_tasks.add_task(process_upload, upload.id)

    return upload


@router.get("/", response_model=List[MonitoringUploadResponse])
async def list_uploads(
    device_item_id: Optional[int] = Query(None),
    vm_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(MonitoringUpload)
    if device_item_id:
        query = query.filter(MonitoringUpload.device_item_id == device_item_id)
    if vm_id:
        query = query.filter(MonitoringUpload.vm_id == vm_id)
    return query.order_by(MonitoringUpload.created_at.desc()).limit(200).all()


@router.get("/{upload_id}", response_model=MonitoringUploadResponse)
async def get_upload(upload_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    upload = db.query(MonitoringUpload).filter(MonitoringUpload.id == upload_id).first()
    if not upload:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Upload not found")
    return upload


@router.get("/{upload_id}/file")
async def get_upload_file(upload_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    upload = db.query(MonitoringUpload).filter(MonitoringUpload.id == upload_id).first()
    if not upload or not os.path.exists(upload.file_path):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="File not found")
    return FileResponse(upload.file_path, media_type=upload.mime_type)


@router.post("/{upload_id}/confirm")
async def confirm_upload(
    upload_id: int,
    data: MonitoringConfirmRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    upload = db.query(MonitoringUpload).filter(MonitoringUpload.id == upload_id).first()
    if not upload:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Upload not found")

    metrics = data.metrics if data.metrics is not None else (upload.extracted_metrics or [])
    capture_time = data.capture_time or upload.capture_time or datetime.utcnow()

    for metric in metrics:
        metric_data = metric.model_dump() if hasattr(metric, "model_dump") else metric
        ip_address = metric_data.get("ip_address")
        device_item_id = metric_data.get("device_item_id") or upload.device_item_id
        vm_id = metric_data.get("vm_id") or upload.vm_id

        if ip_address and not device_item_id and not vm_id:
            vm = db.query(VmItem).filter(VmItem.ip_address == ip_address).first()
            if vm:
                vm_id = vm.id
            else:
                device = db.query(DeviceItem).filter(DeviceItem.ip_address == ip_address).first()
                if device:
                    device_item_id = device.id

        if not device_item_id and not vm_id:
            continue

        if not metric_data.get("key"):
            continue

        sample = MetricSample(
            device_item_id=device_item_id,
            vm_id=vm_id,
            captured_at=capture_time,
            metric_key=metric_data.get("key"),
            value=metric_data.get("value", 0),
            unit=metric_data.get("unit"),
            source_upload_id=upload.id,
            confidence=metric_data.get("confidence")
        )
        db.add(sample)
        db.flush()
        evaluate_sample(db, device_item_id, vm_id, sample.metric_key, sample.value, upload.id)

    upload.parse_status = "ok"
    db.commit()
    return {"message": "Upload confirmed"}
