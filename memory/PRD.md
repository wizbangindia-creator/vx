# VisaXpert — Product Requirements & Status

## Origin
Cloned from GitHub repo `wizbangindia-creator/vx` and made runnable in the Emergent environment (June 2026).

## Overview
VisaXpert is a study-abroad consultancy marketing/lead-gen web app.
- **Stack:** FastAPI (backend) + React 19 / CRACO / Tailwind + shadcn UI (frontend) + MongoDB.
- **Purpose:** Landing pages, country/branch info, lead capture, WhatsApp/email automation, University-Change (Berlin) booking, and an admin dashboard for leads.

## Architecture
- Backend: `/app/backend/server.py` (single large FastAPI app, all routes prefixed `/api`).
- Frontend: `/app/frontend/src` — pages under `pages/`, site components under `components/site/`.
- Data seeded via `backend/seed_*.py` scripts (landing templates, Germany-fair templates, university-change logos).

## Key Routes (frontend)
`/` home, `/study-abroad`, `/dashboard`, `/berlin` (university change), `/germany-fair`,
`/ielts-celebration`, `/countries`, `/countries/:slug`, `/branches`, `/branches/:slug`,
`/contact`, `/faq`, plus privacy/terms/impressum pages.

## Key APIs
- `POST /api/webhook/lead` — lead capture (used by LeadForm). Verified working.
- `GET /api/` — health check. Verified.
- Dashboard lead APIs, UC-booking APIs, Facebook/WhatsApp webhooks.

## Integrations (optional — degrade gracefully when keys absent)
- Resend (email), AiSensy / WhatsApp Cloud API, Google Sheets sync, Stripe, Facebook lead webhook.
- All read from env with sane fallbacks; missing keys just skip that channel.

## Status (as of clone/run — June 2026)
- ✅ Repo cloned into `/app`, deps installed (pip + yarn).
- ✅ Backend running, connected to MongoDB, health check 200.
- ✅ Frontend running, homepage + lead form verified end-to-end.
- ✅ Seed scripts run (landing templates, Germany-fair templates, university-change logos).
- Env `.env` files preserved from Emergent environment (MONGO_URL, DB_NAME=test_database, REACT_APP_BACKEND_URL).

## Backlog / Next

### Media Design University Webinar landing page (added June 2026)
- Route: `/webinar/media-design` (alias `/media-design-webinar`) → `pages/MediaDesignWebinarPage.jsx`.
- Purpose: register students who want to change/shift their university to Germany (from any EU country) for a live webinar with Media Design University of Applied Sciences experts — covers programs, scholarships, discounts, complete visa process, plus a post-webinar 1-on-1 meeting.
- Registration form captures: name, email, phone, present country, native country, highest qualification.
- Posts to `POST /api/webhook/lead` with `source: "media_design_webinar"`; custom fields land flat in `extra_data`. Backend excludes this source from the legacy WhatsApp auto-send. Verified end-to-end (lead saved + fields persisted).
- Dark editorial theme (Fraunces + Manrope, amber/blue accents), standalone (own nav/footer).

- Optional: provide real integration keys (Resend, WhatsApp/AiSensy, Google Sheets) to enable notifications.
- Optional: full QA pass across all pages and the admin dashboard.
