from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from .config import get_settings

settings = get_settings()

connect_args = {}
if settings.DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(
    settings.DATABASE_URL,
    connect_args=connect_args
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    from .models import user, equipment, manual, attachment, chat_history, location, device_item, vm_item, monitoring_upload, metric_definition, metric_group, metric_group_member, metric_sample, llm_api_key, llm_settings, alert_rule, alert, alert_update, team, user_team, alert_assignment
    Base.metadata.create_all(bind=engine)
