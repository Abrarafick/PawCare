# PawCare

> **"Your Pet's Health, All in One Place."**

PawCare is a secure, full-stack web application that helps individual pet owners manage vaccination schedules, vaccination records, and private medical documents for all their pets.

---

## Features

- 🐾 **Pet Profiles** — Create and manage profiles for multiple cats, dogs, or other pets.
- 💉 **Vaccination Reminders** — Track upcoming and overdue vaccinations with clear status indicators.
- 📋 **Vaccination History** — View a complete record of administered vaccines per pet.
- 🔒 **Medical Document Vault** — Securely upload, view, download, and manage veterinary documents (images and PDFs). All documents are private and server-authorized.

---

## Technology Stack

| Layer | Technology |
|-------|------------|
| Backend | Python 3.11+, Django 5, Django REST Framework |
| Auth | SimpleJWT (access + refresh tokens) |
| Database | PostgreSQL 15+ |
| Frontend | React 18, TypeScript, Vite, Tailwind CSS |
| File Storage | Private local filesystem (dev) / S3-compatible (prod) |
| Testing | pytest-django, Vitest, React Testing Library, Playwright |

---

## Prerequisites

- Python 3.11+
- Node.js 18+
- PostgreSQL 15+
- pnpm (or npm/yarn)
- (Optional) python-magic system dependency: `libmagic` — see setup notes below

---

## Quick Start

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/pawcare.git
cd pawcare
```

### 2. Backend setup

```bash
cd pawcare-backend

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate        # Linux/macOS
# venv\Scripts\activate         # Windows

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp ../.env.example .env
# Edit .env with your PostgreSQL credentials and Django secret key

# Create the database
createdb pawcare
# (or use psql: CREATE DATABASE pawcare;)

# Run migrations
python manage.py migrate

# Create a superuser (optional, for Django admin)
python manage.py createsuperuser

# Start the development server
python manage.py runserver
```

The backend API will be available at `http://localhost:8000/api/`.

### 3. Frontend setup

```bash
cd pawcare-frontend

# Install dependencies
pnpm install

# Configure environment
cp ../.env.example .env.local
# Set VITE_API_BASE_URL=http://localhost:8000/api

# Start the development server
pnpm dev
```

The frontend will be available at `http://localhost:5173`.

---

## Running Tests

### Backend

```bash
cd pawcare-backend
source venv/bin/activate
pytest
```

### Frontend

```bash
cd pawcare-frontend
pnpm test
```

### End-to-End (Playwright)

```bash
cd pawcare-frontend
pnpm exec playwright test
```

---

## Private File Storage

**Development:** Files are stored in `pawcare-backend/private_media/`. This directory is **never** served statically — all file access goes through authenticated Django views.

**Production:** Configure an S3-compatible private bucket (e.g., Backblaze B2 or Cloudflare R2) by setting the appropriate environment variables in `.env`. See `ARCHITECTURE.md` for details.

> ⚠️ **Never commit the `private_media/` directory or any real user documents to Git.**

---

## Environment Variables

Copy `.env.example` to `.env` (in `pawcare-backend/`) and fill in your values.

Key variables:

| Variable | Description |
|----------|-------------|
| `DJANGO_SECRET_KEY` | Django secret key (generate a new one) |
| `DB_NAME`, `DB_USER`, `DB_PASSWORD` | PostgreSQL credentials |
| `STORAGE_BACKEND` | `local` (dev) or `b2`/`s3` (production) |
| `MAX_UPLOAD_SIZE` | Max file upload size in bytes (default: 10 MB) |
| `CORS_ALLOWED_ORIGINS` | Frontend origin(s) allowed to call the API |
| `VITE_API_BASE_URL` | Backend URL used by React (in `.env.local`) |

---

## Project Structure

```
pawcare/
├── pawcare-backend/       # Django REST API
│   ├── config/            # Settings, URLs, WSGI
│   ├── apps/
│   │   ├── accounts/      # Authentication
│   │   ├── pets/          # Pet profiles
│   │   ├── vaccinations/  # Vaccination records
│   │   └── reports/       # Medical documents
│   ├── private_media/     # Private file storage (dev only, gitignored)
│   └── requirements.txt
│
├── pawcare-frontend/      # React + TypeScript SPA
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── features/
│   │   ├── hooks/
│   │   └── router/
│   └── package.json
│
├── PRD.md                 # Product Requirements Document
├── ARCHITECTURE.md        # System architecture
├── DATABASE_SCHEMA.md     # Database schema
├── TASKS.md               # Implementation task tracker
├── .env.example           # Environment variable template
└── .gitignore
```

---

## Documentation

- [`PRD.md`](PRD.md) — Full product requirements
- [`ARCHITECTURE.md`](ARCHITECTURE.md) — System design and API structure
- [`DATABASE_SCHEMA.md`](DATABASE_SCHEMA.md) — Database tables, indexes, and relationships
- [`TASKS.md`](TASKS.md) — Implementation phases and task tracker

---

## Security Notes

- All medical documents are private and served only through authenticated API endpoints.
- JWT access tokens expire in 15 minutes; refresh tokens are stored in HttpOnly cookies.
- File uploads are validated server-side (MIME type, size, extension).
- Ownership is enforced on every API endpoint — users can only access their own pets and records.
- No production secrets are committed to Git.

---

## License

MIT License — see `LICENSE` for details.

---

## Limitations (Current MVP)

- Email reminders not yet implemented (requires email provider configuration).
- Camera capture requires HTTPS in production (works on `localhost` in dev).
- PDF preview in browser depends on browser's built-in PDF support.
- Production deployment documentation pending.

