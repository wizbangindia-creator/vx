# VisaXpert — WhatsApp Automation PRD

## What's Live
- Repo cloned + running (React 19 / FastAPI / MongoDB, supervisor-managed)
- AiSensy WhatsApp integration live via `AISENSY_API_KEY` + `WHATSAPP_PROVIDER=aisensy`
- `PUBLIC_BASE_URL` set for absolute media URLs so AiSensy can fetch them

## WhatsApp Templates (seeded)
### Main Landing — fire immediately on form submit
- `landing_india_online` — params: name
- `landing_india_offline` — params: name, branch, branch_address, contact_name, branch_phone

### Germany Fair — 6-step drip per lead (category = `germany_fair`)
| # | Campaign | Trigger | Params | Media |
|---|---|---|---|---|
| 1 | germany_fair_1 | immediate | name, event_date, contact_name, contact_phone | – |
| 2 | germany_fair_2 | fraction 0.25 | name, event_date, contact_name, contact_phone | – |
| 3 | germany_fair_3 | fraction 0.50 | name, contact_name, contact_phone | – |
| 4 | germany_fair_4 | fraction 0.75 | name | – |
| 5 | germany_fair_5 | 1 day before @ 10:00 IST | name, contact_name, contact_phone | image (upload via dashboard) |
| 6 | germany_fair_6 | event day @ 10:00 IST | name, static location URL, contact_name, contact_phone | video (upload via dashboard) |

Branch/contact resolution: based on BRANCH_DIRECTORY for Ludhiana/Amritsar/Pathankot/Jammu.

## Testing Mode (Germany Fair)
- Dashboard toggle: **GF Test Mode ON/OFF**
- When ON: every germany_fair lead fires all 6 templates **1 minute apart**, regardless of schedule
- When OFF (default): real schedule kicks in

## Backend additions
- New trigger type: `fraction` (+ `fraction` field 0..1 on template)
- New field: `send_minute_utc` (0-59)
- New fields: `header_media_url`, `header_media_type` (image | video | document)
- New endpoints:
  - `GET/POST /api/dashboard/whatsapp/gf-test-mode`
  - `POST /api/dashboard/whatsapp/upload-media` (5MB images / 16MB videos)
- Scheduler worker now passes media URL to AiSensy payload

## Dashboard additions
- "GF Test Mode" pill button in WhatsApp header
- Template form: "fraction" trigger option + 25/50/75 dropdown + minute input + media upload card (image/video) with preview & remove

## Seed scripts
- `/app/backend/seed_main_landing_templates.py` (idempotent)
- `/app/backend/seed_germany_fair_templates.py` (idempotent, preserves media URL)

## Verified
- Main online+offline: messages sent via AiSensy (statuses = sent)
- GF: in test mode, GF1/GF2/GF3 confirmed sent at 1-min intervals; remaining 3 would have followed

## Dashboard Credentials
- admin@visaxpert.com / VisaXpert@2024
- sunilarora@visaxpert.co / VisaXpert@2024
- navyaarora@visaxpert.co / VisaXpert@2024

## Next Action Items
- User to upload image for `germany_fair_5` and video for `germany_fair_6` via dashboard
- Confirm param mapping for each of the 6 messages matches the AiSensy campaign's `{{n}}` order
- Turn OFF test mode before going live (currently OFF)
