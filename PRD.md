# PawCare — Product Requirements Document (PRD)

**Version:** 1.0  
**Date:** 2026-10-28  
**Tagline:** "Your Pet's Health, All in One Place."

---

## 1. Product Overview

PawCare is a secure, full-stack web application that helps individual pet owners manage their pets' vaccination schedules, completed vaccination records, and private medical documents in one place.

### Problem Statement
Pet owners struggle to keep track of vaccination due dates, maintain accessible records of past medical care, and store veterinary documents (prescriptions, lab reports) in an organized, retrievable way.

### Target Users
- Cat and dog owners
- Multi-pet households
- Pet owners who need to organize veterinary prescriptions, test reports, and vaccination records

### Out of Scope (Initial MVP)
PawCare is a **record-management tool**, not a veterinary diagnostic application. It does not provide medical advice, diagnose conditions, or generate veterinary guidance.

---

## 2. Core MVP Features

### Feature A: Pet Profiles

**User stories:**
- As a user, I can register and sign in to PawCare.
- As a user, I can create multiple pet profiles.
- As a user, I can view, edit, and delete my pet profiles.
- As a user, I can upload or select a pet profile photo.
- As a user, I can store my pet's name, species, date of birth (or estimated age), and optional notes.
- As a user, my pets are private — no other user can see or access them.

**Acceptance criteria:**
- Registration and login work with secure password hashing.
- A user's pets never appear for another user.
- Pet deletion requires explicit confirmation.
- Each pet has its own independent vaccination and medical record context.

---

### Feature B: Vaccination Reminders

**User stories:**
- As a user, I can add a vaccination record (vaccine name + due date) for a pet.
- As a user, I can edit a reminder.
- As a user, I can view upcoming and overdue vaccinations on the dashboard.
- As a user, I can mark a vaccination as completed and record the actual administration date.
- As a user, I can optionally record the vet/clinic name and a next due date.
- As a user, I can delete an incorrect reminder.

**Status rules (authoritative):**

| Condition | Status |
|-----------|--------|
| `is_completed = false` AND `due_date >= today` | **UPCOMING** |
| `is_completed = false` AND `due_date < today` | **OVERDUE** |
| `is_completed = true` | **COMPLETED** (appears in History only) |

- A vaccination due today is **upcoming**, not overdue, until the day has passed.
- A completed vaccination must not appear as an outstanding reminder.
- Completing a vaccination updates the record in-place (no duplicate creation).
- The administration date is required when marking complete.
- Deleting a reminder must not silently destroy a completed vaccination history record (present a warning if applicable).

**Business rules:**
- Do not invent veterinary schedules or dosage recommendations.
- Next due dates are always optional and user-entered.
- PawCare is a record tool, not a medical advisor.

---

### Feature C: Medical Reports — Private Document Vault

**User stories:**
- As a user, I can photograph a medical document using my device camera.
- As a user, I can upload an existing image (JPEG, PNG, WEBP) or PDF.
- As a user, I can review the file before saving.
- As a user, I can enter a document title, date, and optional description.
- As a user, I can view the list of saved reports for a selected pet.
- As a user, I can view/preview an image or PDF report.
- As a user, I can download the original file to my device.
- As a user, I can delete a report after confirmation.

**Security requirements:**
- Documents are **never** in a publicly accessible static directory.
- Every preview, download, and deletion request is authorized server-side.
- Ownership of pet → report chain is verified before any file operation.
- File type is validated by MIME type inspection (not just filename extension).
- File size limits are configurable and clearly communicated in the UI.
- Storage credentials and private tokens are never exposed to the frontend.
- Orphaned files are cleaned up if metadata creation fails.
- Deletion failures are logged; the API does not claim success on storage failure.

**Supported file types:** JPEG, PNG, WEBP, PDF  
**Default max file size:** 10 MB (configurable)

**Camera capture:**
- Implemented via `<input type="file" accept="image/*" capture="environment">` for mobile.
- Falls back gracefully when camera is unavailable or denied.
- Camera access requires HTTPS in production.

---

### Feature D: Vaccination History

**User stories:**
- As a user, I can view all completed vaccinations for a selected pet.
- As a user, I can see the vaccine name, administration date, vet/clinic name, and next due date.
- As a user, I can edit a completed record to correct data.

**Implementation:**
- Single `VaccinationRecord` model with a `status` field.
- History view filters records where `status = COMPLETED`.
- Reminder view filters records where `status IN (UPCOMING, OVERDUE)`.
- No duplicate records; no separate history table.

---

## 3. Navigation Requirements

```
Dashboard → Select Pet → Pet Overview → [Vaccination Reminders | Medical Reports | Vaccination History]
```

- The user must select a pet before accessing any pet-specific feature.
- All data displayed belongs to the selected pet.
- The selected pet's name and photo are shown throughout the pet context.
- Users can return to the dashboard/pet list at any time.
- Deep links to pet records verify ownership before rendering.
- Empty state shown when a user has no pets, with "Add Your First Pet" CTA.

---

## 4. Authentication & Authorization

- Django built-in authentication (session-based).
- CSRF protection on all state-changing requests.
- Passwords hashed with Django's default PBKDF2/Argon2 algorithm.
- No plaintext passwords stored.
- No hardcoded credentials or secrets.
- Server-side ownership checks on every endpoint (pet, vaccination, report).
- Authorization errors do not leak existence of another user's records.
- Password reset: implemented if secure email configuration is available.

---

## 5. Dashboard Summary

The dashboard provides:
- List of the user's pets (cards with photo, name, species).
- Count of upcoming vaccinations per pet.
- Overdue vaccination alerts (highlighted, urgent styling).
- Quick actions: Add Pet, Select Pet.
- Vaccination summary never exposes records of another user.

---

## 6. Non-Functional Requirements

| Requirement | Specification |
|-------------|---------------|
| Security | HTTPS in production, CSRF, authorization on all endpoints |
| Privacy | Medical documents private, never publicly accessible |
| Performance | Paginated lists, responsive UI |
| Accessibility | WCAG AA contrast, keyboard navigation, readable labels |
| Responsiveness | Mobile, tablet, desktop layouts |
| Scalability | Architecture extensible for deferred features |
| Testing | Backend unit/integration tests, frontend component tests, E2E acceptance scenario |

---

## 7. Explicitly Deferred Features (Do Not Build in MVP)

- AI diagnosis or medical advice
- OCR / automatic report data extraction
- Pet expense tracking
- Pet marketplace or social networking
- Veterinary clinic management portal
- Google Drive integration
- Paid SMS reminders
- Complex analytics
- Microservices

---

## 8. Definition of Done

The MVP is complete when:

1. ✅ A user can register and log in.
2. ✅ The user can create and manage multiple pets.
3. ✅ The user must select a pet before accessing that pet's records.
4. ✅ Vaccination reminders work with upcoming, overdue, and completed states.
5. ✅ Completed vaccinations appear correctly in Vaccination History.
6. ✅ Users can capture or upload medical reports.
7. ✅ Users can save, list, view, download, and delete their own reports.
8. ✅ Medical documents are private and ownership is enforced by the backend.
9. ✅ The application works on supported mobile and desktop browsers.
10. ✅ Critical automated tests have been run and results documented.
11. ✅ Setup and deployment instructions are complete.
12. ✅ No critical feature is a static mockup.

