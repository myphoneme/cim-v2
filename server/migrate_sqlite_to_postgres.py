"""
Migrate data from SQLite to PostgreSQL using SQLAlchemy reflection.

Usage:
  python migrate_sqlite_to_postgres.py

Environment:
  SQLITE_URL   (default: sqlite:///./database.sqlite)
  POSTGRES_URL (default: DATABASE_URL from .env)
  CLEAN_TARGET (default: 1) -> if 1, truncates target tables before insert
"""

from __future__ import annotations

import os
from typing import Iterable

from dotenv import load_dotenv
from sqlalchemy import create_engine, select, text, func, Integer
from sqlalchemy.engine import make_url
from sqlalchemy.sql.util import sort_tables


def _load_env() -> None:
    here = os.path.dirname(os.path.abspath(__file__))
    load_dotenv(os.path.join(here, ".env"))


def _truncate_tables(pg_conn, tables: Iterable) -> None:
    for table in reversed(list(tables)):
        pg_conn.execute(text(f'TRUNCATE TABLE "{table.name}" CASCADE'))


def _copy_table(sqlite_conn, pg_conn, table, chunk_size: int = 1000) -> int:
    result = sqlite_conn.execute(select(table)).mappings()
    total = 0
    while True:
        rows = result.fetchmany(chunk_size)
        if not rows:
            break
        pg_conn.execute(table.insert(), [dict(r) for r in rows])
        total += len(rows)
    return total


def _reset_sequences(pg_conn, tables: Iterable) -> None:
    for table in tables:
        pk_cols = list(table.primary_key.columns)
        if len(pk_cols) != 1:
            continue
        pk_col = pk_cols[0]
        if not isinstance(pk_col.type, Integer):
            continue
        seq = pg_conn.execute(
            text("SELECT pg_get_serial_sequence(:table, :col)"),
            {"table": table.name, "col": pk_col.name},
        ).scalar()
        if not seq:
            continue
        max_id = pg_conn.execute(select(func.max(pk_col))).scalar()
        if max_id is None:
            continue
        pg_conn.execute(text("SELECT setval(:seq, :val, true)"), {"seq": seq, "val": max_id})


def main() -> None:
    _load_env()
    sqlite_url = os.getenv("SQLITE_URL", "sqlite:///./database.sqlite")
    postgres_url = os.getenv("POSTGRES_URL") or os.getenv("DATABASE_URL")
    if not postgres_url:
        raise SystemExit("POSTGRES_URL or DATABASE_URL is required.")
    if not postgres_url.startswith("postgresql"):
        raise SystemExit("POSTGRES_URL must start with postgresql:// or postgresql+psycopg://")

    create_db = os.getenv("CREATE_DATABASE", "0") == "1"
    if create_db:
        admin_url = make_url(postgres_url).set(database="postgres")
        target_db = make_url(postgres_url).database
        admin_engine = create_engine(admin_url, isolation_level="AUTOCOMMIT")
        with admin_engine.connect() as conn:
            exists = conn.execute(
                text("SELECT 1 FROM pg_database WHERE datname = :name"),
                {"name": target_db},
            ).scalar()
            if not exists:
                conn.execute(text(f'CREATE DATABASE "{target_db}"'))

    sqlite_engine = create_engine(sqlite_url)
    pg_engine = create_engine(postgres_url)

    from app.database import Base  # local import to avoid side effects on module load
    from app.models import user, equipment, manual, attachment, chat_history, location, device_item  # noqa: F401

    metadata = Base.metadata
    tables = sort_tables(list(metadata.tables.values()))
    metadata.create_all(pg_engine)

    clean_target = os.getenv("CLEAN_TARGET", "1") == "1"
    with sqlite_engine.connect() as sqlite_conn, pg_engine.begin() as pg_conn:
        if clean_target:
            _truncate_tables(pg_conn, tables)
        for table in tables:
            count = _copy_table(sqlite_conn, pg_conn, table)
            print(f"Copied {count} rows into {table.name}")
        _reset_sequences(pg_conn, tables)

    print("Migration complete.")


if __name__ == "__main__":
    main()
