import smtplib
from email.mime.text import MIMEText
from sqlalchemy.orm import Session
from ..config import get_settings
from ..models.team import Team
from ..models.alert import Alert


class EmailService:
    def __init__(self):
        self.settings = get_settings()

    def _is_configured(self) -> bool:
        return bool(self.settings.SMTP_HOST and self.settings.SMTP_FROM)

    def send_team_alert(self, db: Session, team_id: int, alert: Alert):
        team = db.query(Team).filter(Team.id == team_id).first()
        if not team or not team.email_alias:
            return
        self.send_email(team.email_alias, f"Alert: {alert.summary}", f"Alert {alert.id}: {alert.summary}")

    def send_email(self, to_email: str, subject: str, body: str):
        if not self._is_configured():
            return

        msg = MIMEText(body)
        msg['Subject'] = subject
        msg['From'] = self.settings.SMTP_FROM
        msg['To'] = to_email

        with smtplib.SMTP(self.settings.SMTP_HOST, self.settings.SMTP_PORT) as server:
            if self.settings.SMTP_TLS:
                server.starttls()
            if self.settings.SMTP_USER:
                server.login(self.settings.SMTP_USER, self.settings.SMTP_PASSWORD)
            server.send_message(msg)
