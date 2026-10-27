# PawCare — Task Tracker

**Version:** 1.0  
**Last Updated:** 2026-10-28

Legend: ✅ Done | 🔄 In Progress | ⏳ Pending | 🚫 Blocked | ❌ Deferred

---

## Phase 1: Requirements and Project Setup

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1.1 | Inspect repository | ✅ Done | Directory empty, starting fresh |
| 1.2 | Create PRD.md | ✅ Done | |
| 1.3 | Create ARCHITECTURE.md | ✅ Done | JWT + DRF + React SPA |
| 1.4 | Create DATABASE_SCHEMA.md | ✅ Done | UUID PKs, single vaccination model |
| 1.5 | Create TASKS.md | ✅ Done | This file |
| 1.6 | Create .env.example | ✅ Done | |
| 1.7 | Create .gitignore | ✅ Done | |
| 1.8 | Create README.md | ✅ Done | |
| 1.9 | Initialize Django project | 🔄 In Progress | |
| 1.10 | Initialize React + TypeScript project | ⏳ Pending | |

---

## Phase 2: Backend Foundation

| # | Task | Status | Notes |
|---|------|--------|-------|
| 2.1 | Configure Django settings (base/dev/prod) | ⏳ Pending | |
| 2.2 | Configure PostgreSQL connection | ⏳ Pending | |
| 2.3 | Configure Django REST Framework | ⏳ Pending | |
| 2.4 | Configure SimpleJWT authentication | ⏳ Pending | |
| 2.5 | Create `accounts` app — User model, register/login/logout views | ⏳ Pending | |
| 2.6 | Create `pets` app — Pet model + migrations | ⏳ Pending | |
| 2.7 | Create `vaccinations` app — VaccinationRecord model + migrations | ⏳ Pending | |
| 2.8 | Create `reports` app — MedicalReport model + migrations | ⏳ Pending | |
| 2.9 | Implement ownership enforcement mixin/utilities | ⏳ Pending | |
| 2.10 | Write initial backend tests (auth, ownership) | ⏳ Pending | |
| 2.11 | Configure CORS for React frontend | ⏳ Pending | |
| 2.12 | Configure private file storage (dev) | ⏳ Pending | |

---

## Phase 3: Pet Profiles and Navigation

| # | Task | Status | Notes |
|---|------|--------|-------|
| 3.1 | Pet CRUD API endpoints | ⏳ Pending | |
| 3.2 | Pet photo upload endpoint | ⏳ Pending | |
| 3.3 | Pet ownership tests | ⏳ Pending | |
| 3.4 | React: Auth context + login/register pages | ⏳ Pending | |
| 3.5 | React: Protected routes | ⏳ Pending | |
| 3.6 | React: Dashboard / pet list | ⏳ Pending | |
| 3.7 | React: Add pet form | ⏳ Pending | |
| 3.8 | React: Edit pet form | ⏳ Pending | |
| 3.9 | React: Pet overview screen | ⏳ Pending | |
| 3.10 | React: Pet-first navigation enforcement | ⏳ Pending | |
| 3.11 | React: Empty state (no pets) | ⏳ Pending | |

---

## Phase 4: Vaccination Management

| # | Task | Status | Notes |
|---|------|--------|-------|
| 4.1 | Vaccination CRUD API | ⏳ Pending | |
| 4.2 | Mark-complete endpoint with administered_date | ⏳ Pending | |
| 4.3 | Status logic (upcoming/overdue/completed) | ⏳ Pending | |
| 4.4 | Dashboard summary endpoint | ⏳ Pending | |
| 4.5 | Vaccination date boundary tests | ⏳ Pending | |
| 4.6 | React: Vaccination reminder list | ⏳ Pending | |
| 4.7 | React: Add/edit vaccination form | ⏳ Pending | |
| 4.8 | React: Mark complete modal | ⏳ Pending | |
| 4.9 | React: Vaccination history view | ⏳ Pending | |
| 4.10 | React: Overdue vaccination alerts on dashboard | ⏳ Pending | |
| 4.11 | Vaccination ownership + isolation tests | ⏳ Pending | |

---

## Phase 5: Medical Reports

| # | Task | Status | Notes |
|---|------|--------|-------|
| 5.1 | Private file storage configuration (dev) | ⏳ Pending | |
| 5.2 | File upload endpoint with MIME validation | ⏳ Pending | |
| 5.3 | File serve/preview endpoint (authenticated) | ⏳ Pending | |
| 5.4 | File download endpoint | ⏳ Pending | |
| 5.5 | Report delete endpoint + storage cleanup | ⏳ Pending | |
| 5.6 | Orphaned file cleanup on DB write failure | ⏳ Pending | |
| 5.7 | Report listing endpoint (pet-scoped) | ⏳ Pending | |
| 5.8 | React: Report list with metadata display | ⏳ Pending | |
| 5.9 | React: Add report modal (camera + gallery + PDF) | ⏳ Pending | |
| 5.10 | React: Camera capture (mobile, graceful fallback) | ⏳ Pending | |
| 5.11 | React: File preview (image viewer + PDF) | ⏳ Pending | |
| 5.12 | React: Download report | ⏳ Pending | |
| 5.13 | React: Delete report confirmation | ⏳ Pending | |
| 5.14 | Medical reports authorization tests | ⏳ Pending | |
| 5.15 | Upload failure + orphan cleanup tests | ⏳ Pending | |

---

## Phase 6: Frontend Integration and Polish

| # | Task | Status | Notes |
|---|------|--------|-------|
| 6.1 | Connect all forms to real API endpoints | ⏳ Pending | |
| 6.2 | Loading states on all async operations | ⏳ Pending | |
| 6.3 | Error states + user-readable messages | ⏳ Pending | |
| 6.4 | Form validation (client-side + server error display) | ⏳ Pending | |
| 6.5 | Mobile responsive layout | ⏳ Pending | |
| 6.6 | Navigation: pet name + photo shown in context | ⏳ Pending | |
| 6.7 | Delete confirmation dialogs | ⏳ Pending | |
| 6.8 | Accessibility audit (contrast, labels, keyboard nav) | ⏳ Pending | |

---

## Phase 7: Quality Assurance

| # | Task | Status | Notes |
|---|------|--------|-------|
| 7.1 | Run all backend tests, document results | ⏳ Pending | |
| 7.2 | Run all frontend tests, document results | ⏳ Pending | |
| 7.3 | End-to-end acceptance scenario | ⏳ Pending | |
| 7.4 | Security audit: authorization, file access | ⏳ Pending | |
| 7.5 | Mobile usability check | ⏳ Pending | |
| 7.6 | Fix critical bugs | ⏳ Pending | |

---

## Phase 8: Deployment Preparation

| # | Task | Status | Notes |
|---|------|--------|-------|
| 8.1 | Production settings (DEBUG=False, ALLOWED_HOSTS, HTTPS) | ⏳ Pending | |
| 8.2 | Production storage backend (django-storages) | ⏳ Pending | |
| 8.3 | Database backup/restore instructions | ⏳ Pending | |
| 8.4 | Gunicorn/ASGI server configuration | ⏳ Pending | |
| 8.5 | Docker Compose for local dev | ⏳ Pending | |
| 8.6 | Deployment documentation | ⏳ Pending | |
| 8.7 | Launch checklist | ⏳ Pending | |

---

## Known Limitations (Updated as Development Progresses)

- Email reminders deferred (requires email provider configuration)
- Google Drive integration deferred (future feature)
- OCR / AI features explicitly excluded from MVP
- Camera capture depends on HTTPS in production; tested on local dev with localhost exception

