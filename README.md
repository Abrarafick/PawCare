# 🐾 PawCare

> **"Your Pet's Health, All in One Place."**

PawCare is a full-stack web and mobile-responsive pet health management platform built with **Django REST Framework** and **React 19**. It features a modern **Claymorphism** UI, dynamic species-based color themes (Dog & Cat), native touch-swipe sliding transitions, and private authenticated medical document storage.

---

## ✨ Features

- 🐶🐱 **Species-Aware Claymorphism UI** — Soft, tactile 3D clay aesthetic with dynamic color themes:
  - **Dog Theme:** Mint-green palette with cute puppy line-art floating background icons.
  - **Cat Theme:** Pastel warm butter-yellow palette with cute kitten line-art floating background icons.
  - **Neutral Theme:** Clean neutral clay palette for other pets.
- 📱 **Mobile-App Sliding Experience** — Native touch and swipe gestures (swipe left/right to slide between tabs) with an animated floating bottom navigation bar and fixed parallax background.
- 🐾 **Pet Profile Management** — Manage multiple pets with photo uploads, species, breed, birth date, weight, microchip ID, and medical notes.
- 💉 **Vaccination Tracking** — Automatic status calculation (**Upcoming**, **Overdue**, and **Completed**) with completion logging and full history timelines.
- 🔒 **Private Medical Document Vault** — Securely upload, view, and download veterinary records (JPEG, PNG, WebP, and PDF). All documents are private and protected by server-side authorization.
- 📊 **Interactive Dashboard** — Quick summary cards for overdue vaccines, upcoming shots, and instant pet switching.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Backend** | Python 3.11+, Django 5.1, Django REST Framework |
| **Authentication** | SimpleJWT (Access + Refresh tokens with auto-refresh) |
| **Database** | SQLite (Zero-config local development) / PostgreSQL 15+ (Production) |
| **File Storage** | Private local storage (`private_media/` in dev) / S3-compatible (Production) |
| **Frontend** | React 19, TypeScript, Vite, React Router 7, TanStack Query 5, Axios, Lucide Icons |
| **Styling** | Custom Claymorphism Design System (Pure CSS with custom variables) |
| **Testing & Linting** | `pytest-django` (34 test cases), `oxlint`, TypeScript compiler |

---

## 🚀 Quick Start (Windows)

PawCare includes convenient one-click scripts for Windows:

### One-Click Start
Double-click **`run-pawcare.bat`** in the project root. This automatically:
1. Starts the Django backend on `http://localhost:8000`
2. Starts the Vite frontend on `http://localhost:5173`
3. Opens PawCare in your default browser

### Demo Account
- **Email:** `demo@pawcare.com`
- **Password:** `PawCare123!`

---

## 💻 Manual Setup Guide

### Prerequisites
- **Python 3.11+**
- **Node.js 18+** & **npm**

---

### 1. Backend Setup

```bash
cd pawcare-backend

# 1. Create and activate virtual environment
python -m venv venv

# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Run database migrations (uses SQLite by default - no DB setup needed!)
python manage.py migrate

# 4. (Optional) Create demo data or superuser
python manage.py createsuperuser

# 5. Start the development server
python manage.py runserver 0.0.0.0:8000
```

The API is now live at: `http://localhost:8000/api/`

---

### 2. Frontend Setup

In a new terminal window:

```bash
cd pawcare-frontend

# 1. Install dependencies
npm install

# 2. Start the Vite development server
npm run dev
```

The frontend application will open at: `http://localhost:5173`

> 💡 **API Proxy Note:** Vite is pre-configured with a development proxy that forwards all `/api` requests to `http://localhost:8000`, so no manual environment variable configuration is required for local dev.

---

## 🧪 Testing & Verification

### Run Backend Tests (34 test cases)

```bash
cd pawcare-backend
venv\Scripts\activate   # Windows (or source venv/bin/activate on Unix)
pytest
```

Tests cover:
- User registration, duplicate email rejection, login, and JWT token issuance.
- Pet CRUD and strict cross-user data isolation.
- Vaccination status computation (Upcoming, Due Today, Overdue, Completed).
- Medical document uploads, MIME validation, and private permission checks.
- Dashboard count aggregations.

### Run Frontend Typecheck & Linter

```bash
cd pawcare-frontend

# Type checking & production build verification
npm run build

# Fast code linting with Oxlint
npm run lint
```

---

## 📂 Project Structure

```
PawCare/
├── pawcare-backend/            # Django REST Framework API
│   ├── apps/
│   │   ├── accounts/           # User authentication & JWT endpoints
│   │   ├── dashboard/          # Summary statistics & counts
│   │   ├── pets/               # Pet CRUD & photo handling
│   │   ├── reports/            # Medical reports & private file storage
│   │   └── vaccinations/       # Vaccination schedules & logs
│   ├── config/
│   │   └── settings/
│   │       ├── base.py         # Shared configuration
│   │       ├── development.py  # Dev settings (SQLite, CORS open)
│   │       └── production.py   # Production settings (PostgreSQL, S3)
│   ├── private_media/          # Private medical uploads (never served statically)
│   ├── manage.py
│   ├── pytest.ini
│   ├── requirements.txt
│   └── tests.py                # Comprehensive test suite (34 tests)
│
├── pawcare-frontend/           # React 19 + TypeScript SPA
│   ├── src/
│   │   ├── api/                # Axios API clients & interceptors
│   │   ├── assets/             # Images & static assets
│   │   ├── components/         # Claymorphism cards, bottom nav, modals
│   │   ├── context/            # Auth, Pet, and Theme React contexts
│   │   ├── pages/              # Dashboard, Pets, Vaccinations, Reports, Profile
│   │   ├── types/              # TypeScript interfaces & types
│   │   ├── App.tsx             # Root router with sliding page wrapper
│   │   └── index.css           # Claymorphism design system & animations
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts          # Vite configuration with /api proxy
│
├── run-pawcare.bat             # 1-Click launcher (starts backend + frontend)
├── start-backend.bat           # Starts backend server on port 8000
├── start-frontend.bat          # Starts frontend server on port 5173
├── README.md                   # Project documentation
├── PRD.md                      # Product Requirements Document
├── ARCHITECTURE.md             # System architecture & API specifications
└── DATABASE_SCHEMA.md          # Database schema & entity relationships
```

---

## 🔐 Security Architecture

1. **Private File Storage:** Medical reports and pet photos are stored in `private_media/` and are **never** accessible via static URLs. All file requests pass through Django authenticated views that verify pet ownership.
2. **Server-Side File Validation:** Uploaded documents are inspected using `python-magic` to check actual binary MIME types (allowing only JPEG, PNG, WebP, and PDF up to 10 MB).
3. **Data Isolation:** Every database query strictly filters by the authenticated user (`request.user`), preventing IDOR (Insecure Direct Object Reference) vulnerabilities.
4. **JWT Lifecycle:** Access tokens are short-lived. The client automatically refreshes tokens via response interceptors when receiving a `401 Unauthorized`.

---

## 📄 License

This project is licensed under the MIT License.
