# PawCare — System Architecture

**Version:** 1.0  
**Date:** 2026-10-28

---

## 1. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser / Mobile                      │
│                   React + TypeScript (Vite)                  │
│              Axios → Django REST Framework API               │
└───────────────────────────┬─────────────────────────────────┘
                            │ HTTPS (REST API + CSRF)
┌───────────────────────────▼─────────────────────────────────┐
│                  Django Backend (Python)                      │
│  ┌───────────────┐  ┌────────────────┐  ┌────────────────┐  │
│  │  Auth Module  │  │   Pet Module   │  │ Vaccination    │  │
│  │  (sessions /  │  │  CRUD + photo  │  │ Module         │  │
│  │   JWT tokens) │  │  ownership     │  │ (reminders,    │  │
│  └───────────────┘  └────────────────┘  │  history)      │  │
│                                         └────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Medical Reports Module                               │   │
│  │  Upload → validate → private storage → metadata DB   │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Storage Abstraction Layer                            │   │
│  │  Dev: Private local filesystem (MEDIA_ROOT private)   │   │
│  │  Prod: Configurable (e.g., Backblaze B2 / Cloudflare │   │
│  │        R2 / S3-compatible with private buckets)       │   │
│  └──────────────────────────────────────────────────────┘   │
└───────────────────────────┬─────────────────────────────────┘
                            │
                 ┌──────────▼──────────┐
                 │     PostgreSQL       │
                 │   (main database)    │
                 └─────────────────────┘
```

---

## 2. Technology Stack

### Backend
- **Python 3.11+**
- **Django 5.x** — web framework, ORM, authentication, admin
- **Django REST Framework (DRF)** — API endpoints
- **django-cors-headers** — CORS configuration for separate frontend
- **python-magic** — server-side MIME type validation
- **Pillow** — image validation/processing

### Frontend
- **React 18** with **TypeScript**
- **Vite** — build tool and dev server
- **React Router v6** — client-side routing with pet-first navigation
- **Axios** — HTTP client with CSRF header injection
- **Tailwind CSS** — utility-first styling (clean, accessible, responsive)
- **React Query (TanStack Query)** — server state, caching, loading/error states

### Database
- **PostgreSQL 15+** — primary relational database

### Storage
- **Development:** Django's `FileSystemStorage` pointing to a private directory outside `STATIC_ROOT` and outside any publicly served path. Files served only through authenticated Django views.
- **Production:** Pluggable via Django's storage backend. Recommended: Backblaze B2 (S3-compatible, generous free tier) or Cloudflare R2, using `django-storages`. Files accessed via server-generated signed URLs or proxied through Django.

### Auth
- **JWT-based auth** (SimpleJWT) — stateless, works cleanly with React SPA.
- Access token (short-lived, 15 min) + Refresh token (7 days, HttpOnly cookie).
- CSRF protection via `SameSite=Lax` cookie + DRF default token validation.
- Alternative: Session auth with CSRF if Django template rendering is used. For React SPA, JWT is cleaner.

### Testing
- **Backend:** pytest + pytest-django
- **Frontend:** Vitest + React Testing Library
- **E2E:** Playwright (for critical journeys)

---

## 3. Authentication Design

### JWT Flow
```
1. POST /api/auth/register/     → returns access + refresh tokens
2. POST /api/auth/login/        → returns access + refresh tokens
3. Access token in Authorization: Bearer <token> header
4. Refresh token in HttpOnly cookie
5. POST /api/auth/token/refresh/ → new access token
6. POST /api/auth/logout/        → clears refresh token cookie
```

### Ownership Enforcement
Every DRF view that handles Pet, VaccinationRecord, or MedicalReport:
1. Requires `IsAuthenticated` permission.
2. Filters querysets by `owner = request.user` (Pet) or `pet__owner = request.user` (VaccinationRecord, MedicalReport).
3. Returns 404 (not 403) when a record exists but belongs to another user — avoids leaking existence.

---

## 4. File Storage Design

### Security Principle
Medical documents are NEVER served from a publicly accessible URL. All file access goes through Django's authorized view.

### Development Storage
```
pawcare-backend/
  private_media/          ← NOT in STATIC_ROOT, NOT in any url() route
    pets/photos/
    reports/
```

Django view: `GET /api/reports/{id}/file/` → authenticates → checks ownership → streams file.

### Production Storage
- Use `django-storages` with an S3-compatible backend (e.g., Backblaze B2 or Cloudflare R2).
- Bucket is **private** (no public access).
- Files accessed via time-limited presigned URLs generated server-side (validity: 5 minutes).
- Storage key format: `reports/{pet_id}/{uuid}/{original_filename_sanitized}`
- Pet photos may use public storage separately if desired, or the same private bucket.

### Upload Validation
```
1. Extension check (allowlist: jpg, jpeg, png, webp, pdf)
2. Server-side MIME type check via python-magic (not browser-supplied Content-Type)
3. File size check (configurable MAX_UPLOAD_SIZE, default 10 MB)
4. Image validation via Pillow (confirms file is a valid image for image types)
5. Save file to private storage
6. Create MedicalReport database record
7. If DB write fails → delete orphaned file from storage
```

---

## 5. Database Design Summary

See `DATABASE_SCHEMA.md` for full detail.

**Entities:**
- `User` (Django's built-in `auth.User`)
- `Pet` (FK → User)
- `VaccinationRecord` (FK → Pet, single table, status field)
- `MedicalReport` (FK → Pet, stores storage key not file blob)

**Vaccination Status Logic:**
```python
from django.utils import timezone

def get_vaccination_status(record):
    if record.is_completed:
        return "COMPLETED"
    today = timezone.now().date()
    if record.due_date >= today:
        return "UPCOMING"
    return "OVERDUE"
```

---

## 6. API Structure

```
/api/auth/
  POST  /register/
  POST  /login/
  POST  /logout/
  POST  /token/refresh/
  GET   /me/

/api/pets/
  GET   /           → list user's pets
  POST  /           → create pet
  GET   /{id}/      → get pet detail (ownership verified)
  PUT   /{id}/      → update pet
  DELETE /{id}/     → delete pet

/api/pets/{pet_id}/vaccinations/
  GET   /           → list (filter by status query param)
  POST  /           → create vaccination record
  GET   /{id}/      → detail
  PUT   /{id}/      → update
  PATCH /{id}/complete/ → mark complete
  DELETE /{id}/     → delete

/api/pets/{pet_id}/reports/
  GET   /           → list reports for pet
  POST  /           → upload report (multipart/form-data)
  GET   /{id}/      → report metadata
  GET   /{id}/file/ → stream/serve the actual file (authenticated)
  DELETE /{id}/     → delete report + file

/api/dashboard/
  GET   /           → summary: pets, upcoming vaccinations, overdue vaccinations
```

---

## 7. Frontend Architecture

```
src/
  api/          → Axios instances, API functions per feature
  components/   → Shared UI components (Button, Card, Modal, etc.)
  features/
    auth/       → Login, Register pages + auth context
    pets/       → PetList, PetCard, AddPet, EditPet, PetOverview
    vaccinations/ → VaccinationList, AddVaccination, VaccinationHistory
    reports/    → ReportList, AddReport, ReportCard, FileViewer
    dashboard/  → Dashboard page with summary
  hooks/        → Custom hooks (usePet, useVaccinations, useReports)
  layouts/      → AppLayout (with nav), AuthLayout
  router/       → React Router config with protected routes
  types/        → TypeScript interfaces matching API shapes
  utils/        → Date helpers, file validation, formatting
```

### Protected Routes
- All pet/vaccination/report routes wrapped in `<PrivateRoute>` that redirects to `/login` if not authenticated.
- Pet-scoped routes require a valid `petId` param; the app verifies the pet belongs to the user on load.

---

## 8. Reminder Workflow

**MVP (Dashboard-based):**
- Dashboard fetches vaccinations with `status=UPCOMING` and `status=OVERDUE` for all of the user's pets.
- Overdue vaccinations displayed with visual urgency (red/warning styling).
- Upcoming vaccinations displayed with due-date timeline.

**Future (Email reminders — deferred):**
- Celery + Redis for scheduled tasks.
- Send email N days before due date (configurable).
- Track sent reminders in `ReminderLog` table to prevent duplicates.
- Requires email provider configuration (SendGrid, Mailgun, etc.).

---

## 9. Project Directory Structure

```
pawcare/
├── pawcare-backend/           ← Django project
│   ├── config/                ← Django settings, urls, wsgi
│   │   ├── settings/
│   │   │   ├── base.py
│   │   │   ├── development.py
│   │   │   └── production.py
│   │   ├── urls.py
│   │   └── wsgi.py
│   ├── apps/
│   │   ├── accounts/          ← User auth
│   │   ├── pets/              ← Pet profiles
│   │   ├── vaccinations/      ← Vaccination records
│   │   └── reports/           ← Medical reports
│   ├── private_media/         ← Private file storage (dev only)
│   ├── requirements.txt
│   ├── manage.py
│   └── pytest.ini
│
├── pawcare-frontend/          ← React + TypeScript
│   ├── src/
│   ├── public/
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
│
├── PRD.md
├── TASKS.md
├── ARCHITECTURE.md
├── DATABASE_SCHEMA.md
├── README.md
├── .env.example
└── .gitignore
```

---

## 10. Security Checklist

- [ ] HTTPS enforced in production (redirect HTTP → HTTPS)
- [ ] CSRF protection active (`X-CSRFToken` header or `SameSite` cookies)
- [ ] JWT access tokens short-lived (15 min)
- [ ] Refresh tokens in HttpOnly cookies
- [ ] All file serving authenticated (no public static file URLs for documents)
- [ ] MIME type validated server-side (not browser-provided)
- [ ] Path traversal protection (storage key computed server-side from UUID, not user-supplied path)
- [ ] Ownership verified before serving/deleting any record or file
- [ ] 404 returned (not 403) for unauthorized access to another user's resource
- [ ] No secrets in Git (`.env` gitignored)
- [ ] `DEBUG=False` in production
- [ ] `ALLOWED_HOSTS` set correctly in production
- [ ] CORS restricted to frontend origin in production
- [ ] `Secure`, `HttpOnly`, `SameSite` flags on cookies in production

