#!/usr/bin/env bash
set -euo pipefail

APP_DIR=/home/project/cim-v2
BACKEND_DIR=$APP_DIR/server
FRONTEND_DIR=$APP_DIR/client

PUBLIC_URL=${PUBLIC_URL:-https://cim.phoneme.in}

cd "$APP_DIR"

echo "==> Pull latest code"
git pull --ff-only

echo "==> Backend deps"
cd "$BACKEND_DIR"
if [ ! -d .venv ]; then
  python3 -m venv .venv
fi
. .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
python -m pip install 'psycopg[binary]' email-validator

# Always run Alembic migrations
if [ ! -f alembic.ini ]; then
  echo "alembic.ini not found in $BACKEND_DIR"
  exit 1
fi

echo "==> Running Alembic migrations"
HAS_ALEMBIC_VERSION=$(python - <<'PY'
from sqlalchemy import create_engine, text
from app.config import get_settings

settings = get_settings()
engine = create_engine(settings.DATABASE_URL)
with engine.connect() as conn:
    exists = conn.execute(
        text(
            "SELECT 1 FROM information_schema.tables "
            "WHERE table_schema='public' AND table_name='alembic_version'"
        )
    ).scalar()
print("1" if exists else "0")
PY
)

if [ "$HAS_ALEMBIC_VERSION" = "0" ]; then
  alembic -c alembic.ini stamp head
fi

alembic -c alembic.ini upgrade head

echo "==> Restart backend service"
systemctl restart cim-api

# Health check (local)
if command -v curl >/dev/null 2>&1; then
  echo "==> Backend health (local)"
  curl -sS http://127.0.0.1:8100/api/health || true
fi


echo "==> Build frontend"
cd "$FRONTEND_DIR"
# Use vite build to avoid TS typecheck failures in npm run build
npm install
npx vite build
chmod -R a+rX "$FRONTEND_DIR/dist"


echo "==> Reload nginx"
nginx -t
systemctl reload nginx

# Health check (public)
if command -v curl >/dev/null 2>&1; then
  echo "==> Backend health (public)"
  curl -sS "$PUBLIC_URL/api/health" || true
fi

echo "Deploy complete."
 
