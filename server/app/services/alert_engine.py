from typing import Optional
from sqlalchemy.orm import Session
from ..models.alert_rule import AlertRule
from ..models.alert import Alert
from ..models.alert_assignment import AlertAssignment
from ..models.device_item import DeviceItem
from ..models.vm_item import VmItem
from ..services.email_service import EmailService


def _compare(op: str, value: float, threshold: float) -> bool:
    if op == '>':
        return value > threshold
    if op == '>=':
        return value >= threshold
    if op == '<':
        return value < threshold
    if op == '<=':
        return value <= threshold
    return False


def evaluate_sample(db: Session, device_item_id: Optional[int], vm_id: Optional[int], metric_key: str, value: float, source_upload_id: Optional[int] = None):
    group_id = None
    if device_item_id:
        device = db.query(DeviceItem).filter(DeviceItem.id == device_item_id).first()
        group_id = device.metric_group_id if device else None
    if vm_id:
        vm = db.query(VmItem).filter(VmItem.id == vm_id).first()
        group_id = vm.metric_group_id if vm else None

    rules = db.query(AlertRule).filter(
        AlertRule.metric_key == metric_key,
        AlertRule.is_enabled == 1
    )
    if group_id:
        rules = rules.filter(AlertRule.group_id == group_id)

    email_service = EmailService()

    for rule in rules.all():
        if not _compare(rule.operator, value, rule.threshold):
            continue

        existing = db.query(Alert).filter(
            Alert.rule_id == rule.id,
            Alert.device_item_id == device_item_id,
            Alert.vm_id == vm_id,
            Alert.status.in_(['open', 'ack', 'in_progress'])
        ).first()

        summary = rule.message_template or f"{metric_key} {rule.operator} {rule.threshold}"

        if existing:
            existing.latest_value = value
            existing.summary = summary
            db.commit()
            continue

        alert = Alert(
            device_item_id=device_item_id,
            vm_id=vm_id,
            rule_id=rule.id,
            status='open',
            severity=rule.severity,
            latest_value=value,
            summary=summary,
            evidence_upload_id=source_upload_id
        )
        db.add(alert)
        db.commit()
        db.refresh(alert)

        if rule.team_id:
            assignment = AlertAssignment(alert_id=alert.id, team_id=rule.team_id)
            db.add(assignment)
            db.commit()

            email_service.send_team_alert(db, rule.team_id, alert)
