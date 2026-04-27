# VisaXpert - Cloned & Running

## Original Problem Statement
Clone https://github.com/wizbangindia-creator/vx and get it running.

## What Was Done (Apr 27, 2026)
- Cloned repo into /app (backend + frontend + tests)
- Installed Python deps via `pip install -r requirements.txt` (added `resend`)
- Frontend deps already up-to-date (`yarn install`)
- Restarted supervisor - both backend (8001) and frontend (3000) running
- Verified: `/api/health` returns healthy + MongoDB connected
- Verified: Frontend home page renders correctly (lead-capture landing)

## Tech Stack
- Backend: FastAPI + Motor (async Mongo) + Resend (email) + WhatsApp (AiSensy/BSP)
- Frontend: React 19 + CRA/CRACO + Tailwind + Radix UI
- DB: MongoDB (local)

## Optional Env Vars (currently unset, app still works)
- GOOGLE_SHEET_WEBHOOK, RESEND_API_KEY, AISENSY_API_KEY, FB_APP_SECRET, GOOGLE_SHEETS_ID

## Dashboard Credentials (hardcoded in server.py)
- admin@visaxpert.com / VisaXpert@2024 (full access)
- sunilarora@visaxpert.co / VisaXpert@2024 (main landing leads)
- navyaarora@visaxpert.co / VisaXpert@2024 (university change leads)

## Next Action Items
- Add real env vars (Resend, AiSensy, Google Sheets) when needed
- Optional: full e2e regression testing
