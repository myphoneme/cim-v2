"""
Verify SQLite -> Postgres migration by comparing table row counts.

Usage:
  python verify_db_migration.py

Environment:
  SQLITE_URL   (default: sqlite:///./database.sqlite)
  POSTGRES_URL (default: DATABASE_URL from .env)
"""

from __future__ import annotations

import os

from dotenv import load_dotenv
from sqlalchemy import create_engine, select, func


def _load_env() -> None:
    here = os.path.dirname(os.path.abspath(__file__))
    load_dotenv(os.path.join(here, ".env"))


def main() -> None:
    _load_env()
    sqlite_url = os.getenv("SQLITE_URL", "sqlite:///./database.sqlite")
    postgres_url = os.getenv("POSTGRES_URL") or os.getenv("DATABASE_URL")
    if not postgres_url:
        raise SystemExit("POSTGRES_URL or DATABASE_URL is required.")

    from app.database import Base  # local import
    from app.models import user, equipment, manual, attachment, chat_history, location, device_item  # noqa: F401

    tables = list(Base.metadata.tables.values())

    sqlite_engine = create_engine(sqlite_url)
    pg_engine = create_engine(postgres_url)

    mismatch = False
    with sqlite_engine.connect() as sqlite_conn, pg_engine.connect() as pg_conn:
        for table in tables:
            sqlite_count = sqlite_conn.execute(select(func.count()).select_from(table)).scalar()
            pg_count = pg_conn.execute(select(func.count()).select_from(table)).scalar()
            status = "OK" if sqlite_count == pg_count else "DIFF"
            if status == "DIFF":
                mismatch = True
            print(f"{table.name}: sqlite={sqlite_count} postgres={pg_count} [{status}]")

    if mismatch:
        raise SystemExit("Mismatch detected. Please review counts above.")
    print("All table counts match.")


if __name__ == "__main__":
    main()
