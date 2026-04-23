# VisaXpert (vx) — Cloned Project PRD

## Problem Statement
Cloned from https://github.com/techvisaxpert-sketch/vx and iteratively extended.

## Tech Stack
- FastAPI + MongoDB backend (`/app/backend/server.py`)
- React (CRA + CRACO + Tailwind) frontend
- Pages: LandingPage, UniversityChangePage, GermanyFairPage, Dashboard

## What's Been Implemented

### 2026-04-22 (Iter 1)
- Repo cloned into `/app` (preserved `.env`, `.git`, `.emergent`)
- Landing CEO video: `object-cover` -> `object-contain` (no more zoom/crop)
- Logo slider sped up (`.animate-scroll` 8s -> 5s)
- University Change page: hardcoded testimonials removed; reviews now sliding marquee
- Germany Fair page: added Cologne Business School (custom SVG); removed EU Business & Global University System logos; reviews now sliding marquee
- Dashboard AddReviewModal: single-page select -> multi-page checkboxes; one submit creates 1 review per selected page

### 2026-04-22 (Iter 2)
- **Backend**: new `partner_logos` collection + endpoints
  - `GET /api/partner-logos?page=<page>` (public)
  - `GET/POST/PATCH/DELETE /api/dashboard/partner-logos[/id[/toggle]]` (admin)
  - Accepts multipart upload (file + name + pages csv), 3MB limit, PNG/JPEG/WebP/GIF/SVG
- **Dashboard**: new "Partner Logos" tab with `PartnerLogosManager` + `AddPartnerLogoModal` (multi-page checkboxes like reviews). Existing "Logos" renamed "Header Logo" for clarity.
- **Public pages**: each page fetches `partner-logos?page=<its_page>` and merges into existing sliding carousel (Landing "Our Partner Universities", UniversityChange "Universities We Work With", GermanyFair "Participating Universities").
- **Germany Fair footer**: "Fair Locations" section replaced with "Our Branches" showing all 4 branches with full address + tel link (Jammu, Pathankot, Amritsar, Ludhiana).

## Testing (Iter 2)
- Backend pytest: 19/19 pass — `/app/backend/tests/test_reviews_partner_logos.py`
- Frontend E2E: login -> Reviews (multi-page) -> Partner Logos upload -> verified on all 3 public pages -> footer branches verified.

## Backlog / Next
- Split Dashboard.jsx (~2700 lines) — move PartnerLogos* to its own file
- Extract `<PageMultiSelect>` shared component (used by reviews + partner logos)
- Optional: partial-success toast for multi-page review create
- Optional: early Content-Length rejection for large logo uploads
