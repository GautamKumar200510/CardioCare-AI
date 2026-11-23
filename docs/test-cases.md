# CardioCare AI – Test Cases & Comprehensive Acceptance Matrix

This document provides complete academic testing documentation for the **Multi-Specialty Autonomous Hospital Appointment Booking Agent** supporting 15 clinical specialties and the full 12-tool agent workflow.

---

### Test Suite Execution Summary
- **Test Runner:** Automated Node.js Verification Suite (`server/tests/runAllTests.js`)
- **API Target:** `http://localhost:5000/api`
- **Database:** MongoDB 8.0.4 Local Instance (`cardiocare_db`)
- **Execution Date:** November 23, 2026
- **Test Outcome:** **26 Passed, 0 Failed (100% Pass Rate)**

---

## Part 1: 15 Clinical Specialties Autonomous Evaluation

The autonomous agent was evaluated across all 15 supported medical specialties using natural language intent parsing, temporal constraint resolution, doctor roster queries, and availability scheduling:

| Test ID | Specialty Evaluated | Natural Language Test Query | Extracted Specialty | Proposed Specialist & Healthcare Facility | Earliest Slot | Status |
| :---: | :--- | :--- | :--- | :--- | :---: | :---: |
| **SPEC-01** | **Cardiology** | *"Book the earliest cardiologist appointment tomorrow after 3 PM in Pune"* | Cardiology | Dr. Sunita Deshmukh (Ruby Hall Clinic - Heart Center) | 15:00 | **PASS** |
| **SPEC-02** | **Orthopedics** | *"I need an orthopedic doctor this Friday in Pune"* | Orthopedics | Dr. Rajesh Gokhale (Ruby Hall Clinic - Heart Center) | 09:00 | **PASS** |
| **SPEC-03** | **Dermatology** | *"Find a dermatologist near Pune for skin allergy"* | Dermatology | Dr. Ananya Rao (Jehangir Hospital Cardiac Unit) | 09:00 | **PASS** |
| **SPEC-04** | **Neurology** | *"Book the earliest neurologist appointment after 4 PM in Pune"* | Neurology | Dr. Rohini Kelkar (Ruby Hall Clinic - Heart Center) | 16:00 | **PASS** |
| **SPEC-05** | **General Medicine** | *"Need a general physician for fever checkup in Pune"* | General Medicine | Dr. Ashok Patil (Ruby Hall Clinic - Heart Center) | 09:00 | **PASS** |
| **SPEC-06** | **Pediatrics** | *"I need a pediatrician for my child in Pune tomorrow"* | Pediatrics | Dr. Kiran Chitale (Jehangir Hospital Cardiac Unit) | 09:00 | **PASS** |
| **SPEC-07** | **Gynecology** | *"Find a gynecologist in Pune for maternal consultation"* | Gynecology | Dr. Shalini Agrawal (Ruby Hall Clinic - Heart Center) | 09:00 | **PASS** |
| **SPEC-08** | **ENT** | *"Book an ENT ear specialist in Pune"* | ENT | Dr. Deepak Merchant (Deenanath Mangeshkar Hospital) | 09:00 | **PASS** |
| **SPEC-09** | **Ophthalmology** | *"Schedule an eye doctor ophthalmologist in Pune"* | Ophthalmology | Dr. Rameshwar Vyas (Jehangir Hospital Cardiac Unit) | 09:00 | **PASS** |
| **SPEC-10** | **Dentistry** | *"I need a dentist for a toothache in Pune"* | Dentistry | Dr. Sonal Mutha (Ruby Hall Clinic - Heart Center) | 09:00 | **PASS** |
| **SPEC-11** | **Psychiatry** | *"Book an appointment with a psychiatrist in Pune"* | Psychiatry | Dr. Nikhil Ranade (Jupiter Hospital Heart Institute) | 09:00 | **PASS** |
| **SPEC-12** | **Urology** | *"I need a consultation with a urologist in Pune"* | Urology | Dr. Vinay Dharmadhikari (Ruby Hall Clinic - Heart Center) | 09:00 | **PASS** |
| **SPEC-13** | **Gastroenterology** | *"Find a gastroenterologist for stomach issues in Pune"* | Gastroenterology | Dr. Prashant Sonawane (Deenanath Mangeshkar Hospital) | 09:00 | **PASS** |
| **SPEC-14** | **Pulmonology** | *"Need a pulmonologist chest specialist in Pune"* | Pulmonology | Dr. Girish Gadre (Jehangir Hospital Cardiac Unit) | 09:00 | **PASS** |
| **SPEC-15** | **Oncology** | *"Book an oncology cancer specialist in Pune"* | Oncology | Dr. Sujata Chikhlikar (Ruby Hall Clinic - Heart Center) | 09:00 | **PASS** |
| **SUM-15** | **All 15 Catalog Coverage** | Complete multi-specialty taxonomy evaluation | All 15 Slugs | 15 / 15 Specialties Successfully Evaluated | — | **PASS** |

---

## Part 2: Core Agent Workflow & System Concurrency Acceptance Tests

### Test Case 2: Missing Information Detection & Follow-Up
- **ID:** TC-02
- **Objective:** Verify agent detects missing required parameters (location, patient contact) and asks focused follow-up questions without probing unnecessary medical history.
- **Input:** `"Book an orthopedic appointment tomorrow"` (City, patient name, and phone omitted).
- **Expected Result:**
  - `detectMissingInformation` flags missing fields: `['location', 'patientName', 'phone']`.
  - Workflow state transitions to `MISSING_INFO_REQUESTED`.
  - Agent prompts: *"I can help you find the earliest available Orthopedics appointment. Which city or area should I search in?"*
- **Actual Result:** Workflow state `MISSING_INFO_REQUESTED` confirmed; follow-up prompt targeted specifically to city inquiry.
- **Verdict:** **PASS**

---

### Test Case 3: Ambiguous or Unspecified Specialty Handling
- **ID:** TC-03
- **Objective:** Verify agent detects ambiguous clinical requests where no supported medical specialty is discernible and guides the user toward the 15 supported domains.
- **Input:** `"Book an appointment tomorrow in Pune"` (Specialty omitted).
- **Expected Result:**
  - `identifySpecialty` returns `null`.
  - Workflow state transitions to `SPECIALTY_AMBIGUOUS`.
  - Agent prompts the user with the list of supported specialties (Cardiology, Orthopedics, Dermatology, etc.).
- **Actual Result:** Agent responded with `SPECIALTY_AMBIGUOUS` state and prompted the user for clarification among supported specialties.
- **Verdict:** **PASS**

---

### Test Case 4: Earliest Slot Mathematical Ranking Engine
- **ID:** TC-04
- **Objective:** Verify candidate appointment slots across multiple healthcare facilities are sorted in ascending chronological order and the earliest available slot after the specified time is selected.
- **Input:** Search for Cardiology appointments in Pune on target date after `15:00`.
- **Condition:** Multiple doctors across 5 hospitals with 72 candidate slots; doctor 0 has a simulated pre-existing booking at `15:00`.
- **Expected Result:** Earliest available open slot is selected (`15:00` for an unbooked specialist or `15:30` if 15:00 is occupied).
- **Actual Result:** Evaluated 72 slots. Correctly selected earliest open candidate slot: `2026-11-24` at `15:00 IST`.
- **Verdict:** **PASS**

---

### Test Case 5: Patient Rejection & Autonomous Alternative Doctor Discovery
- **ID:** TC-05
- **Objective:** Verify that when a patient rejects the first proposed appointment, the agent autonomously executes a retry loop to find an alternative doctor or hospital without repeating the rejected slot.
- **Input:** User rejects first slot (Dr. Sunita Deshmukh at Ruby Hall Clinic) via `/api/agent/retry`.
- **Expected Result:**
  - `retryAppointmentSearch` logs rejected doctor/slot.
  - `searchAlternativeDoctors` queries secondary specialists.
  - Next earliest specialist is proposed (Dr. Arjun Sen at Jehangir Hospital).
  - `retryCount` increments to 1.
- **Actual Result:** Initial doctor replaced by alternative specialist Dr. Arjun Sen at Jehangir Hospital Cardiac Unit (`retryCount = 1`).
- **Verdict:** **PASS**

---

### Test Case 6: Mandatory Patient Confirmation & Persistent MongoDB Record
- **ID:** TC-06
- **Objective:** Verify that clinical appointments are NEVER committed to the database without explicit patient confirmation, and upon confirmation, an immutable record is generated.
- **Input:** Patient confirms slot via `POST /api/agent/confirm-booking` for Dr. Ananya Rao (Dermatology).
- **Expected Result:**
  - Appointment persisted to MongoDB with status `'confirmed'`.
  - Unique booking reference issued with format `CC-YYYYMMDD-XXXX`.
  - In-app notification created.
- **Actual Result:** Persistent record created in MongoDB with booking reference `CC-20261124-3415`.
- **Verdict:** **PASS**

---

### Test Case 7: Slot Double-Booking Prevention (Concurrency Lock)
- **ID:** TC-07
- **Objective:** Prevent concurrent duplicate booking of an already reserved time slot using MongoDB unique composite indexing.
- **Input:** Secondary booking request targeting the exact same doctor, date, and occupied time slot (`15:00`).
- **Expected Result:** Request rejected with HTTP 409 Conflict status and error code `SLOT_CONFLICT`.
- **Actual Result:** Booking attempt rejected with HTTP 409 and `code: 'SLOT_CONFLICT'`.
- **Verdict:** **PASS**

---

### Test Case 8: Resilient Deterministic NLP Fallback
- **ID:** TC-08
- **Objective:** Verify the system operates deterministically when the external Google Gemini API is unconfigured, rate-limited, or offline.
- **Input:** Rule-based extraction engine triggered on: *"I need an orthopedic doctor this Friday in Pune"*.
- **Expected Result:**
  - `source` returns `'deterministic_engine'`.
  - `specialty` resolved to `'Orthopedics'`.
  - `location` resolved to `'Pune'`.
  - `date` dynamically resolved to the coming Friday.
- **Actual Result:** Extracted intent, specialty, location, and date with 100% accuracy using zero external network dependencies.
- **Verdict:** **PASS**

---

### Test Case 9: Patient Appointment Cancellation & Slot Release
- **ID:** TC-09
- **Objective:** Verify a patient can cancel their confirmed booking and the slot is immediately released back to the availability pool.
- **Input:** `PATCH /api/appointments/:id/cancel` with valid patient JWT token.
- **Expected Result:** Appointment record updated to `status: 'cancelled'`.
- **Actual Result:** Record updated to `'cancelled'`; slot verified released.
- **Verdict:** **PASS**

---

### Test Case 10: Role-Based Access Control & Record Privacy
- **ID:** TC-10
- **Objective:** Verify patient cannot view, modify, or cancel another patient's appointment records (HIPAA / Digital Health privacy compliance).
- **Input:** Unauthorized user attempts `GET /api/appointments/:id` on another patient's booking record.
- **Expected Result:** HTTP 403 Forbidden with unauthorized access message.
- **Actual Result:** Access blocked with HTTP 403 Forbidden.
- **Verdict:** **PASS**

---

### Test Case 11: ABDM National Health Registry & HAPI FHIR Verification
- **ID:** TC-11
- **Objective:** Verify integration with National Health Authority Ayushman Bharat Digital Mission (ABDM) facility and professional verification standards, and test HL7 FHIR R4 synthetic healthcare server connectivity.
- **Input:**
  - Validate ABDM Health Facility Registry ID: `IN.MH.PUN.10294`.
  - Validate Healthcare Professionals Registry ID: `HPR-IN-MH-10294`.
  - Query public HAPI FHIR R4 test server (`https://hapi.fhir.org/baseR4`).
- **Expected Result:**
  - ABDM format validation passes and verification portal link generated.
  - HAPI FHIR server responds with operational status.
- **Actual Result:** ABDM facility and doctor HPR formats verified; HAPI FHIR public test server confirmed operational.
- **Verdict:** **PASS**

---

## Acceptance Summary Matrix

| Metric | Result | Target Benchmark | Academic Compliance |
| :--- | :---: | :---: | :---: |
| **Total Test Scenarios** | **26 / 26** | 100% | Full Compliance |
| **Supported Clinical Specialties** | **15 / 15** | 100% | Full Compliance |
| **Multi-Hospital Alternative Discovery** | **5 Hospitals** | $\ge 2$ Facilities | Full Compliance |
| **Slot Double-Booking Prevention** | **100% Rejected** | 100% Atomic Lock | Full Compliance |
| **Deterministic NLP Fallback** | **Operational** | Offline Capable | Full Compliance |
| **Role-Based Access Control (RBAC)** | **Enforced** | Strict Data Privacy | Full Compliance |
| **ABDM Registry & FHIR Interoperability** | **Operational** | Public Standards Audit | Full Compliance |
