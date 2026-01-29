# Repository Guidelines

## Project Structure & Module Organization
- Root Vite/React app mounts from `index.tsx`/`App.tsx` with feature UIs in `components/`; shared types and helpers live in `types.ts`, `constants.ts`, and `services/`.
- Legacy client mirror sits under `client/`; only touch when explicitly iterating on that variant.
- FastAPI backend lives in `server/app/` (routers, schemas, services, middleware). SQLite database is `server/database.sqlite`; file uploads land in `server/uploads/`.
- Seeded infrastructure/device data is managed in `server/app/main.py`; locations/devices/VMs can be administered via the Admin panel.

## Build, Test, and Development Commands
- Frontend: `npm install`, then `npm run dev` (localhost:5173) or `npm run build` for a production bundle.
- Backend: from `server/`, create a venv (`python -m venv .venv && source .venv/bin/activate`), `pip install -r requirements.txt`, then `uvicorn app.main:app --reload`.
- When schema or seeds change, restart the backend to let idempotent seeders refresh known locations/devices.

## Coding Style & Naming Conventions
- TypeScript/React with 2-space indentation; favor functional components with hooks and early returns.
- PascalCase components, camelCase variables/props, kebab-case files. Keep lines reasonably short (~100 chars).
- Keep UI logic co-located with its view; avoid scattering a feature across folders.

## Testing Guidelines
- No automated suite yet; add Vitest/RTL for UI logic and pytest for API routes. Mirror source paths (e.g., `components/InfrastructureView.test.tsx`).
- Cover error paths: bulk uploads with odd headers/serial columns, missing locations, empty VM rows; backend validation on create/update.

## Commit & Pull Request Guidelines
- Commit subjects: short, imperative, and scoped (e.g., `Add VM admin editing`, `Fix bulk upload parser`).
- PRs: include summary, bullet list of key changes, linked issue/ID, screenshots of UI, and exact validation steps (`npm run build`, API smoke run).

## Security & Configuration Tips
- Keep secrets out of source. Frontend env: `.env.local`; backend env: `server/.env` (JWT secret, DB path, seed admin). Use sanitized samples when documenting.
- Uploaded files and local DBs should be gitignored; rotate any exposed secrets immediately.

## Admin & Data Management
- Admin panel supports creating locations, categories, and bulk device uploads (paste tabular text; header detection auto-maps). Virtual Machines are editable like other assets.
- Infrastructure tab shows location-wise counts, including Virtual Machines. If counts look wrong, confirm the location exists in the DB and that bulk import columns (Node/Name, IP, Category) align before re-uploading.
