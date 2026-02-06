from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from pathlib import Path
from ..models.monitoring_upload import MonitoringUpload
from ..models.metric_sample import MetricSample


def purge_old_monitoring_data(db: Session, days: int = 30):
    cutoff = datetime.utcnow() - timedelta(days=days)

    old_uploads = db.query(MonitoringUpload).filter(MonitoringUpload.created_at < cutoff).all()
    old_upload_ids = [u.id for u in old_uploads]

    if old_upload_ids:
        db.query(MetricSample).filter(MetricSample.source_upload_id.in_(old_upload_ids)).delete(synchronize_session=False)

    for upload in old_uploads:
        try:
            path = Path(upload.file_path)
            if path.exists():
                path.unlink()
        except Exception:
            pass

    if old_uploads:
        db.query(MonitoringUpload).filter(MonitoringUpload.id.in_(old_upload_ids)).delete(synchronize_session=False)

    db.commit()
