# VisaXpert — PRD

## Original problem statement
"Clone https://github.com/wizbangindia-creator/vx into /app and make it working."
Follow-up: On the main landing-page form, replace the "City" input with a
"Preferred Counselling Mode" dropdown (Online — Google/Zoom, or Offline Branch
Visit). When Offline is chosen, also show a "Choose Your Nearest Branch"
dropdown listing the four India branches. Send WhatsApp messages to the user
after submission. In the dashboard, add a "WhatsApp Config" area so the admin
can create templates per flow (e.g. "Main Page Online Counselling",
"Main Page Offline Counselling"); the admin will fill in the real BSP template
names later.

## Stack
- Backend: FastAPI + Motor (MongoDB) on :8001
- Frontend: React (CRA + craco) on :3000, Tailwind + Radix UI
- Integrations (pre-existing, hot-pluggable via env vars): Resend e-mail,
  Google Sheets CSV sync, Meta (Facebook) Lead-Ads webhook, Google Ads webhook,
  TechMet IVR webhook, nirvachanguru WhatsApp BSP (Meta Cloud API shape).

## User personas
- Prospective study-abroad student (fills the main landing form).
- University-change student (separate page /university-change).
- Germany-Fair attendee (separate page).
- Admin / branch operator (dashboard login) — manages leads, reviews, logos,
  WhatsApp templates & message log.

## Architecture highlights
- Leads are unified in `db.leads` regardless of channel (webhook, form, IVR,
  Google Sheets sync, Meta leadgen).
- WhatsApp automation has two collections:
  - `db.whatsapp_templates` — admin-editable templates, now with a `category`
    discriminator (germany_fair | main_online | main_offline).
  - `db.whatsapp_messages` — scheduled / sent / failed send log; a 60-second
    background loop (`_scheduler_loop`) dispatches pending messages via BSP.

## What's been implemented (2026-04-23)
- Cloned the GitHub repo into `/app`, preserving `.git` / `.emergent`.
- Installed backend deps (including the missing `resend` package) and frontend
  deps; both services start cleanly under supervisor.
- **Main landing form**: City input replaced with a required "Preferred
  Counselling Mode" dropdown. When "Offline Branch Visit" is chosen a second
  required "Choose Your Nearest Branch" dropdown appears (Ludhiana, Amritsar,
  Pathankot, Jammu). Submit payload now carries `counselling_mode` +
  `preferred_branch`; validation is enforced on both client and server.
- **Lead record**: `city` is auto-derived — "Online (Google/Zoom)" for online,
  branch name for offline. `extra_data.counselling_mode` and
  `extra_data.preferred_branch` are persisted so dashboard reports can filter
  on the raw choice.
- **WhatsApp templates**: added `category` field (germany_fair | main_online |
  main_offline, default germany_fair for backward-compat). Germany-Fair
  templates still schedule multi-touch reminders; main_* templates fire
  immediately on form submit only.
- **Param sources** extended with `preferred_branch` and `counselling_mode`
  placeholders so templates can use `{{1}} = preferred_branch` etc.
- **Dashboard → WhatsApp Config**: renamed header, updated help text, added a
  Category select in the template form (Germany Fair / Main Page - Online /
  Main Page - Offline) and a category badge on each template card.
- End-to-end verified via curl: online and offline form submissions enqueue
  the matching category templates in `db.whatsapp_messages` with fully
  resolved body/header params.

## Config knobs (via env)
- `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_TEMPLATE_NAME`
- `RESEND_API_KEY`, `SENDER_EMAIL`
- `GOOGLE_SHEET_WEBHOOK`, `GOOGLE_SHEETS_ID`, `GOOGLE_SHEETS_RANGE`
- `FB_APP_SECRET`, `FB_VERIFY_TOKEN`

## Prioritized backlog / Next tasks
- P1: User to create the actual BSP-approved WhatsApp templates and paste the
  real `wa_template_name`s + `body_params` via Dashboard → WhatsApp Config for
  both "Main Page - Online Counselling" and "Main Page - Offline Counselling".
- P1: Add `WHATSAPP_ACCESS_TOKEN` to `/app/backend/.env` so the scheduler
  starts dispatching real sends (currently messages queue up as "pending").
- P2: Dashboard leads table / filters could surface counselling_mode +
  preferred_branch as dedicated columns (currently visible only in the city
  column and extra_data).
- P2: Optional extra category "Main Page - Follow-Up 24h" with a delayed
  trigger, re-using the existing scheduler.
