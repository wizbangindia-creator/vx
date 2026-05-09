# VisaXpert — Cloned & Running

## Original problem statement
> https://github.com/wizbangindia-creator/vx hey clone this app here and make it running

User chose: install deps and run as-is (option **a**).

## What's live (2026-01-09)
- Repo `wizbangindia-creator/vx` cloned into `/app` (preserving git + env files).
- Stack: React 19 (CRA + craco) + FastAPI + MongoDB, supervisor-managed.
- Backend up on `:8001` — `GET /api/` → `{"message":"VisaXpert API","status":"running"}`, MongoDB connected, WhatsApp scheduler loop started.
- Frontend up on `:3000`, served externally via `REACT_APP_BACKEND_URL`.
- Routes verified rendering:
  - `/` — VisaXpert landing page with lead-capture form
  - `/dashboard` — Leads Dashboard sign-in screen
  - `/university-change` — University change landing
  - `/germany-fair` — Germany Fair landing
- DB name set to `visaxpert` (matches the app's seed scripts).

## Env / integrations status
All optional integrations have empty defaults — app boots fine without them. They will silently no-op until keys are provided:
- `AISENSY_API_KEY` (WhatsApp via AiSensy) — **MOCKED / NO-OP**: not configured
- `RESEND_API_KEY` (transactional email) — **MOCKED / NO-OP**: not configured
- `WHATSAPP_ACCESS_TOKEN` (legacy BSP) — **MOCKED / NO-OP**
- `GOOGLE_SHEETS_ID` / `GOOGLE_SHEET_WEBHOOK` — **MOCKED / NO-OP**
- `FB_APP_SECRET` / `FB_VERIFY_TOKEN` (Meta webhook) — **MOCKED / NO-OP**

To activate real WhatsApp/email/sheet sync, drop the corresponding keys into `/app/backend/.env` and restart backend.

## Files of interest
- `backend/server.py` — single-file FastAPI app (~3.4k lines)
- `backend/seed_main_landing_templates.py` — idempotent template seeder
- `backend/seed_germany_fair_templates.py` — idempotent template seeder
- `frontend/src/App.js` — 4-route SPA
- `frontend/src/pages/{LandingPage,Dashboard,UniversityChangePage,GermanyFairPage}.jsx`

## Backlog (deferred)
- P1: Wire up real AiSensy + Resend keys when user provides them.
- P1: Run `seed_main_landing_templates.py` and `seed_germany_fair_templates.py` after AiSensy is configured.
- P2: Run testing subagent end-to-end on the cloned app once integrations are live.

## Next action items
- User shares any keys they want active (AiSensy, Resend, Google Sheets, Meta).
- Then we re-seed templates and verify the WhatsApp drip flow.
