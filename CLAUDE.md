# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Structure

This is a full-stack application with separate client and server directories:

```
CIMS/
├── client/          # React frontend (Vite + TailwindCSS 4 + TanStack Query)
├── server/          # FastAPI backend (Python + SQLite)
└── (legacy files)   # Old single-page app files (deprecated)
```

## Build and Development Commands

### Frontend (client/)
```bash
cd client
npm install              # Install dependencies
npm run dev              # Start dev server on port 5173
npm run build            # Production build
```

### Backend (server/)
```bash
cd server
pip install -r requirements.txt   # Install Python dependencies
uvicorn app.main:app --reload     # Start server on port 8000
```

## Environment Setup

### Backend (.env in server/)
```
GEMINI_API_KEY=your-gemini-api-key
JWT_SECRET=your-secret-key
ADMIN_EMAIL=phoneme2016@gmail.com
ADMIN_PASSWORD=Solution@1979
```

## Architecture Overview

### Frontend (React 19 + Vite + TailwindCSS 4)

**Entry Points:**
- `client/src/main.tsx` - App initialization with providers
- `client/src/App.tsx` - Main app with auth check and navigation

**State Management:**
- TanStack Query for server state (`hooks/useEquipment.ts`, `hooks/useChat.ts`)
- React Context for auth (`contexts/AuthContext.tsx`) and theme (`contexts/ThemeContext.tsx`)

**API Layer:**
- `api/client.ts` - Fetch wrapper with credentials
- `api/auth.ts`, `api/equipment.ts`, `api/chat.ts` - API modules

**Components:**
| Component | Purpose |
|-----------|---------|
| `Dashboard.tsx` | Metrics with Recharts |
| `InventoryTable.tsx` | Equipment list with search/filter |
| `ChatInterface.tsx` | Streaming AI chat |
| `Library.tsx` | SOP documentation hub |
| `AdminPanel.tsx` | Equipment CRUD + SOP generation |
| `LoginForm.tsx` | Authentication form |

### Backend (FastAPI + SQLite)

**Structure:**
- `app/main.py` - FastAPI app with CORS and routers
- `app/database.py` - SQLAlchemy setup
- `app/models/` - SQLAlchemy models (User, Equipment, ManualContent, Attachment, ChatHistory)
- `app/schemas/` - Pydantic schemas for validation
- `app/routers/` - API endpoints (auth, equipment, chat, attachments, manuals)
- `app/services/gemini_service.py` - Gemini AI integration
- `app/middleware/auth.py` - JWT authentication

**API Endpoints:**
- `POST /api/auth/login` - JWT auth with httpOnly cookie
- `GET /api/equipment` - List equipment
- `POST /api/equipment` - Create equipment (admin)
- `POST /api/chat/stream` - Streaming AI responses
- `POST /api/manuals/generate/{id}` - AI SOP generation

### Authentication

- JWT tokens stored in httpOnly cookies
- Admin credentials: phoneme2016@gmail.com / Solution@1979
- Auto-seeded on first run

### Styling

- TailwindCSS 4 with `@tailwindcss/vite` plugin
- Orange primary color theme (orange-500)
- Dark mode support via ThemeContext
- Font Awesome 6.4.0 for icons
