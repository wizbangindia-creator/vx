# VisaXpert (vx) — Cloned from GitHub

## Source
- Repo: https://github.com/wizbangindia-creator/vx
- Cloned & set up on: 2026-06-25

## Stack
- Backend: FastAPI (Python 3.11), MongoDB (motor), uvicorn on :8001
- Frontend: React (CRA + craco), Tailwind, served on :3000
- External URL: https://vx-clone-1.preview.emergentagent.com

## Status
- Cloned full repo into /app (preserved .env files and .git)
- Installed Python deps from backend/requirements.txt
- Installed JS deps via yarn
- Supervisor: backend + frontend RUNNING
- Smoke test: /api/ returns {"message":"VisaXpert API","status":"running"}; frontend renders homepage with hero, lead form, and stats

## Notes
- App is a study-abroad consultancy site (VisaXpert) — landing page, countries, branches, lead capture form, stories, FAQ, contact
- backend/server.py is ~213KB — multiple routers including WhatsApp scheduler that started successfully
- No new auth credentials created; using shipped env values

## Next Action Items
- Confirm with user whether further work (new features, deploy, bug fixes) is needed
