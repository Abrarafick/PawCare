# 👵 Grandma-Proof Usability Testing Log & Guide

> **Hackathon Requirement (Rule 6 — Grandma-Proof):**  
> *"Conduct usability testing with at least one real older adult and document feedback and subsequent improvements."*  
> **Privacy & Consent (Rule 8):** Obtain verbal or written consent from your participant before testing, recording, or quoting their feedback. Do not include sensitive personal information (such as full address, phone numbers, or medical details) in public repositories.

---

## 1. Participant & Consent Checklist

- **Tester Profile (No sensitive PII):** Paternal grandmother (*Dadi*), older adult family member testing PawCare live on a phone/screen with the creator present.
- **Consent Obtained:** `[x] Yes — Participant verbally agreed to test the app and share feedback`
- **Device Tested On:** `[x] Phone  [ ] Tablet  [ ] Laptop / Desktop`
- **Date of Session:** `2026-11-26`

---

## 2. Guided Test Tasks (Ask Your Tester to Try These Without Help First)

1. **Task 1 — Log In & Orient:** Open PawCare and log into the demo account (`demo@pawcare.com` / `PawCare123!`). Ask: *"Can you tell whose pet you are looking at right now?"*
2. **Task 2 — Turn On Easy Mode & Test Reading:** Find and tap **"Easy Mode"** in the top bar (or inside **Profile → Easy Reading & Accessibility**). Ask: *"Are the words, buttons, and bottom bar labels easier to read?"*
3. **Task 3 — Listen to the Summary:** Tap **"Read Aloud"** on the Home page or Vaccination Reminders page. Ask: *"Is the voice speed clear and easy to understand?"*
4. **Task 4 — Check Next Vaccine & Switch Pets:** Switch from **Milo** to **Luna**, then check when the next vaccine is due. Ask: *"Do you know what to do next today?"*
5. **Task 5 — Save Vet Phone & Use Help:** Open **"Help"** in the top bar, and try adding a dummy vet clinic phone number in **"Trusted Vet Contact"**. Ask: *"If you needed to call the vet, could you find the button right away?"*

---

## 3. Observed Feedback Log (Real Session Notes)

During the live walkthrough with Dadi, she reviewed the screens and shared three core usability observations:

| Focus Area | What Went Well | Confusion / Friction Observed | Participant Feedback Summary |
|---|---|---|---|
| **Text Size & Readability** | Existing fonts and Easy Mode sizing were comfortable to read. | Features and main actions did not stand out visually enough at a glance. | *"Font sizes are fine, but the features don't catch the eye enough."* |
| **Pet Profile Photo** | Wanted to personalize her pet card with a real photo. | Adding a pet photo directly by taking a picture with her phone camera was not obvious/direct enough. | *"For the pet's picture, it would be much better if I could just take a photo of my pet with my phone and put it there."* |
| **Vaccination History, Deadlines & Vet Papers** | Wanted automatic date tracking without typing clinic details manually. | Manually figuring out the previous vaccination date vs. next deadline and separately saving the paper felt tedious. | *"If I take a picture of the previous vaccination paper, the app should understand when it was given and the deadline, set the reminder automatically, and save that photo as a document inside the app."* |

---

## 4. Improvements Made Based on Real Feedback

1. **Issue Observed:** *"The fonts are fine, but the features don't catch the eye enough."*  
   **Change Implemented:**
   - Added a prominent 2-column **Feature Spotlight** section directly on `DashboardPage` (`Snap Old Vaccine Paper` and `Take Pet's Photo`) with gradient surfaces, large icon bubbles, and clear action sublabels.
   - Moved the **Trusted Vet Contact** card higher on the Home screen so urgent calls and main actions sit front-and-center.
   - Upgraded Quick Care navigation cards (`Pets`, `Vaccination Reminders`, `Saved Vet Papers`, `Health Overview`) with larger `54px` vibrant color-coded icon bubbles and higher border/text contrast.

2. **Issue Observed:** *"I want to take a photo of my pet directly using my phone camera and show it on the pet's profile."*  
   **Change Implemented:**
   - Added direct phone camera capture (`<input type="file" accept="image/*" capture="environment" />`) alongside phone gallery selection inside both `PetFormPage` (Create/Edit Pet) and `PhotoModal` (plus a floating camera badge directly on the Hero Pet avatar on `DashboardPage`).
   - Built client-side image compression (`prepareCameraImage` in `src/utils/imageCompress.ts`) so high-resolution smartphone photos resize smoothly under backend limits.
   - Fixed authenticated private pet photo display by replacing raw `<img>` tags (which failed `401` on JWT-protected `/api/pets/<id>/photo/`) with `<AuthenticatedPetPhoto />` across `DashboardPage`, `PetsPage`, `PetHeader`, and `ProfilePage`.

3. **Issue Observed:** *"When I snap a picture of a previous vaccination paper, the app should automatically read when the shot was given and when the deadline is, set the reminder, and keep the photo saved as a document inside the app."*  
   **Change Implemented:**
   - Built **Snap Vaccine Paper** (`src/components/VaccineCardScannerModal.tsx` + `src/utils/vaccineOcrParser.ts` powered by on-device `tesseract.js` OCR), accessible directly from the Home spotlight and the `VaccinationsPage` header.
   - Snapping a vaccine slip extracts the vaccine name (e.g., Rabies, DHPP, FVRCP, Bordetella, Deworming), vet clinic, previous shot date, and next due deadline (auto-calculating the next booster deadline if only a previous shot date is printed).
   - After a one-tap confirmation step (with optional **Read Aloud** summary), one button simultaneously: (a) saves the snapped photo permanently inside **Saved Vet Papers** (`reportsApi.upload`), (b) records the previous vaccination into completed History (`vaccinationsApi.markComplete`) when detected, and (c) creates the upcoming/overdue vaccination reminder (`vaccinationsApi.create`).
