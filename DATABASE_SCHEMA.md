# PawCare — Database Schema

**Version:** 1.0  
**Date:** 2026-10-28  
**Database:** PostgreSQL 15+  
**ORM:** Django ORM

---

## 1. Entity Relationship Diagram

```
┌──────────────┐       ┌──────────────────┐       ┌──────────────────────┐
│     User     │       │       Pet         │       │  VaccinationRecord   │
│  (auth.User) │1──────┤  owner_id (FK)   │1──────┤  pet_id (FK)         │
│              │       │  name             │       │  vaccine_name        │
│  id          │       │  species          │       │  due_date            │
│  username    │       │  date_of_birth    │       │  status              │
│  email       │       │  photo_key        │       │  is_completed        │
│  password    │       │  notes            │       │  administered_date   │
│  created_at  │       │  created_at       │       │  vet_clinic          │
│              │       │  updated_at       │       │  next_due_date       │
└──────────────┘       └──────────────────┘       │  notes               │
                              │                    │  created_at          │
                              │                    │  updated_at          │
                              │                    └──────────────────────┘
                              │
                              │       ┌──────────────────────┐
                              └───────┤    MedicalReport     │
                               1─────┤  pet_id (FK)         │
                                     │  title               │
                                     │  document_date       │
                                     │  description         │
                                     │  storage_key         │
                                     │  original_filename   │
                                     │  mime_type           │
                                     │  file_size_bytes     │
                                     │  created_at          │
                                     │  updated_at          │
                                     └──────────────────────┘
```

---

## 2. Table Definitions

### 2.1 User (Django's built-in `auth_user`)

Django manages this table. No custom model needed for MVP.

| Column | Type | Constraints |
|--------|------|-------------|
| id | SERIAL | PRIMARY KEY |
| username | VARCHAR(150) | UNIQUE, NOT NULL |
| email | VARCHAR(254) | NOT NULL |
| password | VARCHAR(128) | NOT NULL (hashed) |
| first_name | VARCHAR(150) | |
| last_name | VARCHAR(150) | |
| is_active | BOOLEAN | DEFAULT TRUE |
| date_joined | TIMESTAMPTZ | NOT NULL |

**Notes:**
- We use `email` as the primary login identifier via Django's authentication backend.
- `username` set to email or auto-generated to satisfy Django's uniqueness requirement.
- Passwords are hashed using Django's PBKDF2+SHA256 (default) or Argon2 if installed.

---

### 2.2 Pet

```sql
CREATE TABLE pets_pet (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id        INTEGER NOT NULL REFERENCES auth_user(id) ON DELETE CASCADE,
    name            VARCHAR(100) NOT NULL,
    species         VARCHAR(50) NOT NULL,          -- 'cat', 'dog', 'other'
    date_of_birth   DATE,                          -- NULL if only estimated age provided
    estimated_age   VARCHAR(50),                   -- e.g., "~3 years" if DOB unknown
    photo_key       VARCHAR(500),                  -- storage key or NULL
    notes           TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_pet_owner ON pets_pet(owner_id);
```

**Field Notes:**
- `id`: UUID prevents enumeration attacks.
- `owner_id`: CASCADE delete removes pets when user is deleted.
- `species`: Stored as string; enforced by choice validation in Django model.
- `date_of_birth` OR `estimated_age`: At least one should be provided; both nullable at DB level, validated at application layer.
- `photo_key`: Storage key (not a public URL). Resolved to URL or signed URL by the backend.

**Django Model (abbreviated):**
```python
class Pet(models.Model):
    SPECIES_CHOICES = [('cat', 'Cat'), ('dog', 'Dog'), ('other', 'Other')]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='pets')
    name = models.CharField(max_length=100)
    species = models.CharField(max_length=50, choices=SPECIES_CHOICES)
    date_of_birth = models.DateField(null=True, blank=True)
    estimated_age = models.CharField(max_length=50, blank=True)
    photo_key = models.CharField(max_length=500, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
```

---

### 2.3 VaccinationRecord

```sql
CREATE TABLE vaccinations_vaccinationrecord (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pet_id              UUID NOT NULL REFERENCES pets_pet(id) ON DELETE CASCADE,
    vaccine_name        VARCHAR(200) NOT NULL,
    due_date            DATE NOT NULL,
    is_completed        BOOLEAN NOT NULL DEFAULT FALSE,
    administered_date   DATE,                       -- NULL until completed
    vet_clinic          VARCHAR(200),               -- optional
    next_due_date       DATE,                       -- optional, user-entered
    notes               TEXT,                       -- optional
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT chk_administered_when_complete
        CHECK (NOT is_completed OR administered_date IS NOT NULL)
);

CREATE INDEX idx_vaccination_pet ON vaccinations_vaccinationrecord(pet_id);
CREATE INDEX idx_vaccination_status ON vaccinations_vaccinationrecord(pet_id, is_completed, due_date);
```

**Status Derivation (computed at application layer):**
```
COMPLETED  → is_completed = TRUE
UPCOMING   → is_completed = FALSE AND due_date >= CURRENT_DATE
OVERDUE    → is_completed = FALSE AND due_date < CURRENT_DATE
```

**Constraint:**
- `chk_administered_when_complete`: Ensures that `administered_date` is always set when `is_completed = TRUE`.

**Field Notes:**
- No separate `status` column (derived to avoid inconsistency).
- `CASCADE` delete: if a Pet is deleted, all its vaccination records are deleted.
- `next_due_date`: Entirely user-entered; PawCare does not auto-calculate or recommend.
- Deleting a reminder: If `is_completed = TRUE`, the frontend must warn the user before deletion.

**Django Model (abbreviated):**
```python
class VaccinationRecord(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    pet = models.ForeignKey(Pet, on_delete=models.CASCADE, related_name='vaccinations')
    vaccine_name = models.CharField(max_length=200)
    due_date = models.DateField()
    is_completed = models.BooleanField(default=False)
    administered_date = models.DateField(null=True, blank=True)
    vet_clinic = models.CharField(max_length=200, blank=True)
    next_due_date = models.DateField(null=True, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    @property
    def status(self):
        from django.utils import timezone
        if self.is_completed:
            return 'COMPLETED'
        today = timezone.now().date()
        return 'UPCOMING' if self.due_date >= today else 'OVERDUE'
```

---

### 2.4 MedicalReport

```sql
CREATE TABLE reports_medicalreport (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pet_id              UUID NOT NULL REFERENCES pets_pet(id) ON DELETE CASCADE,
    title               VARCHAR(200) NOT NULL,
    document_date       DATE NOT NULL,
    description         TEXT,
    storage_key         VARCHAR(500) NOT NULL,      -- private storage path/key
    original_filename   VARCHAR(255) NOT NULL,
    mime_type           VARCHAR(100) NOT NULL,       -- validated server-side
    file_size_bytes     BIGINT NOT NULL,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_report_pet ON reports_medicalreport(pet_id);
CREATE INDEX idx_report_pet_date ON reports_medicalreport(pet_id, document_date DESC);
```

**Field Notes:**
- `storage_key`: The private path/key used to retrieve the file from storage. Never a public URL.
- `mime_type`: Set by the server after validation with `python-magic`, not from browser headers.
- `original_filename`: Sanitized and stored for download filename hints. Not used as a storage path.
- Storage key format: `reports/{pet_id}/{uuid4}/{sanitized_filename}`
- `CASCADE` delete: deleting a Pet cascades to its MedicalReports (file must also be deleted from storage — handled in application code).

**Django Model (abbreviated):**
```python
class MedicalReport(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    pet = models.ForeignKey(Pet, on_delete=models.CASCADE, related_name='reports')
    title = models.CharField(max_length=200)
    document_date = models.DateField()
    description = models.TextField(blank=True)
    storage_key = models.CharField(max_length=500)
    original_filename = models.CharField(max_length=255)
    mime_type = models.CharField(max_length=100)
    file_size_bytes = models.BigIntegerField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
```

---

## 3. Relationships Summary

| Parent | Child | Relationship | On Delete |
|--------|-------|--------------|-----------|
| User | Pet | One-to-many | CASCADE |
| Pet | VaccinationRecord | One-to-many | CASCADE |
| Pet | MedicalReport | One-to-many | CASCADE |

---

## 4. Indexes

| Table | Index | Columns | Purpose |
|-------|-------|---------|---------|
| pets_pet | idx_pet_owner | (owner_id) | Fetch all pets for a user |
| vaccinations_vaccinationrecord | idx_vaccination_pet | (pet_id) | Fetch vaccinations for a pet |
| vaccinations_vaccinationrecord | idx_vaccination_status | (pet_id, is_completed, due_date) | Dashboard upcoming/overdue query |
| reports_medicalreport | idx_report_pet | (pet_id) | Fetch reports for a pet |
| reports_medicalreport | idx_report_pet_date | (pet_id, document_date DESC) | Ordered report listing |

---

## 5. Migration Strategy

1. Django migrations are the sole source of truth for schema changes.
2. Every model change produces a new migration file (never edit existing applied migrations).
3. Migrations run as part of deployment (`python manage.py migrate`).
4. Separate migration files per app: `accounts`, `pets`, `vaccinations`, `reports`.
5. Initial migrations are generated via `python manage.py makemigrations`.
6. Rollback: Django supports `migrate <app> <migration_number>` for rollbacks in development.
7. Production: take a database backup before running migrations.

---

## 6. Data Validation Summary

| Field | Validation |
|-------|------------|
| Pet species | Choices: cat, dog, other |
| Pet name | Required, max 100 chars |
| Vaccination due_date | Required, valid date |
| Vaccination administered_date | Required only when is_completed=True |
| Vaccination next_due_date | Must be >= due_date if provided |
| MedicalReport file | Extension + MIME type + size validated server-side |
| MedicalReport document_date | Required, valid date, not in the future (warning, not hard block) |
| MedicalReport storage_key | Server-generated, never user-supplied |

