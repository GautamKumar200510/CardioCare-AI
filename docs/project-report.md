# CardioCare AI – Multi-Specialty Autonomous Hospital Appointment Booking Agent
## Comprehensive Academic Project Report (10 Chapters)

---

### CHAPTER 1: TITLE PAGE & PROJECT METADATA

- **Project Title:** CardioCare AI – Multi-Specialty Autonomous Hospital Appointment Booking Agent
- **Domain:** Artificial Intelligence in Healthcare, Agentic AI Systems, Full-Stack Web Engineering
- **Architecture Paradigm:** Multi-Step Deterministic Tool Calling with Gemini LLM Intent Extraction & Universal Scheduling
- **Supported Clinical Specialties:** 15 Medical Disciplines (Cardiology, Orthopedics, Dermatology, Neurology, General Medicine, Pediatrics, Gynecology, ENT, Ophthalmology, Dentistry, Psychiatry, Urology, Gastroenterology, Pulmonology, Oncology)
- **Technology Stack:** MongoDB, Express.js, React.js (Vite), Node.js, Tailwind CSS, OpenStreetMap Overpass API, Leaflet.js, ABDM Standards, HL7 FHIR R4
- **Academic Year:** 2026
- **Project Type:** Production-Style Capstone / Master Development Research Project

---

### CHAPTER 2: ABSTRACT AND PROJECT OBJECTIVES

#### 2.1 Abstract
Traditional hospital appointment booking applications rely on static UI dropdowns, rigid pre-defined question-answer trees, or brittle chatbots incapable of executing multi-step programmatic workflows. **CardioCare AI** introduces a production-style, multi-specialty autonomous agent architecture that bridges natural language human understanding with live healthcare geographic registries, universal clinical scheduling, and verified data standards.

Expanding beyond single-specialty limitations, CardioCare AI autonomously manages scheduling across **15 distinct medical specialties**. When presented with complex, unconstrained requests such as *"Book the earliest cardiologist appointment tomorrow after 3 PM in Pune"* or *"I need an orthopedic doctor this Friday in Pune"*, the autonomous agent analyzes temporal constraints in the `Asia/Kolkata` timezone, identifies the requested clinical specialty, queries authentic healthcare facilities from the OpenStreetMap Overpass API, evaluates specialist working schedules across multiple hospitals against existing database bookings, sorts candidate slots chronologically, and surfaces the earliest verified option. The architecture strictly enforces mandatory patient confirmation before database writes, eliminates race conditions through atomic MongoDB concurrency locking, provides automated alternative doctor retry loops, and integrates national health verification standards (ABDM HFR/HPR) alongside HL7 FHIR R4 interoperability checks.

#### 2.2 Core Project Objectives
1. **Multi-Specialty Clinical Autonomy:** Support 15 medical specialties through a unified agentic tool pipeline and centralized taxonomy.
2. **Deterministic 12-Tool Execution Registry:** Implement 12 discrete backend tools for intent extraction, specialty validation, missing parameter detection, hospital search, slot ranking, confirmation, atomic booking, notification, and alternative doctor retry.
3. **Real-World Geographic Discovery:** Query live OpenStreetMap Overpass API endpoints for authentic healthcare facilities, emergency services, and GPS coordinates without fabricated facility data.
4. **Universal Availability & Conflict Prevention:** Calculate 30-minute doctor availability intervals dynamically and enforce database-level composite unique indexes to prevent double-booking.
5. **Dual-Mode AI Resilience:** Integrate Google Gemini API free-tier with an offline deterministic rule-based NLP engine, ensuring 100% operational uptime.
6. **Data Integrity & Standard Verification:** Differentiate between verified healthcare professionals and academic demonstration simulation profiles, incorporating ABDM registry verification and HL7 FHIR R4 test standards.

---

### CHAPTER 3: PROBLEM STATEMENT AND PROPOSED SOLUTION

#### 3.1 The Clinical Scheduling Dilemma
Healthcare discovery and specialist appointment scheduling remain severely fragmented across urban medical ecosystems:
- **Specialty Fragmentation:** Patients must independently determine which specialist to see and manually scour multiple hospital portals.
- **Cognitive Search Burden:** Conventional booking portals require manual selection of hospital, specialty, doctor, date, and time slot through static cascading menus.
- **Inflexible Semantic Processing:** Standard platforms cannot parse colloquial expressions such as *"earliest specialist tomorrow afternoon"* or *"dentist for toothache"*.
- **Static Chatbot Limitations:** Most healthcare chatbots are limited to answering static FAQs; they lack state machines, tool integration, and programmatic database transaction capabilities.

#### 3.2 The CardioCare AI Multi-Specialty Solution
CardioCare AI solves these challenges through an end-to-end agentic workflow:
- **Centralized 15-Specialty Architecture:** Dynamically classifies queries into Cardiology, Orthopedics, Dermatology, Neurology, General Medicine, Pediatrics, Gynecology, ENT, Ophthalmology, Dentistry, Psychiatry, Urology, Gastroenterology, Pulmonology, and Oncology.
- **Conversational Parameter Extraction:** Resolves clinical specialty, target date (relative dates like *tomorrow*, *this Friday* resolved in `Asia/Kolkata` timezone), time constraints (*after 3 PM* $\rightarrow$ `15:00`), and location.
- **Targeted Missing Parameter Follow-Up:** Detects missing city or patient contact without probing unnecessary personal medical history.
- **Mathematical Earliest Slot Ranking:** Evaluates working shift slots across all matching specialists, filters occupied bookings, and sorts slots chronologically to propose the earliest available appointment.
- **Audit-Trail Transparency:** Features a live Agent Activity Timeline exposing tool names, millisecond latencies, inputs, outputs, and programmatic decisions.

---

### CHAPTER 4: DESIGN PRINCIPLES AND SYSTEM REQUIREMENTS

#### 4.1 Architectural Design Principles
- **Separation of Concerns:** Strict decoupling between natural language intent parsing, clinical business logic, database transactions, and geographic mapping.
- **Fail-Safe Determinism:** Safety-critical operations (database persistence, appointment cancellation, slot locking) are governed purely by deterministic logic, eliminating LLM hallucinations.
- **Data Integrity & Academic Transparency:** Transparently labels doctor profiles as verified or demonstration simulation profiles, adhering to the findings in `DATA_SOURCE_AUDIT.md`.
- **Role-Based Security & Privacy:** JWT-based authentication with strict ownership checks preventing cross-patient record access.

#### 4.2 System Requirements
- **Hardware:** Dual-core CPU (2.0 GHz+), 4 GB RAM minimum, persistent storage.
- **Software Runtime:** Node.js v18+, NPM v9+, MongoDB v6.0+.
- **External Network Access:** Access to OpenStreetMap Overpass servers (`overpass-api.de`), Google Gemini Generative Language API, and HAPI FHIR public test servers.

---

### CHAPTER 5: TECHNICAL MODEL DETAILS AND TECHNOLOGY STACK

#### 5.1 Technology Stack Matrix
| Layer | Technology | Rationale & Academic Significance |
| :--- | :--- | :--- |
| **Frontend Framework** | React.js 18 + Vite | High-performance SPA with sub-second hot reload and modular component architecture. |
| **Styling & Design System** | Tailwind CSS | Modern healthcare SaaS aesthetic: Navy (`#0f2d59`), Soft Blue (`#f0f7ff`), and Emerald (`#10b981`). |
| **Mapping & GIS** | Leaflet & React-Leaflet | Lightweight open-source interactive mapping for authentic OSM hospital markers. |
| **Visualization** | Recharts | SVG-rendered responsive dashboards for appointment statuses, specialties, and 7-day volume trends. |
| **Backend Framework** | Node.js + Express.js | Non-blocking, event-driven RESTful architecture with rate-limiting and security middleware. |
| **Database & ORM** | MongoDB + Mongoose | Document-oriented persistence with composite unique indexes for atomic concurrency locking. |
| **AI Intelligence** | Google Gemini API + Rule Engine | Gemini 1.5/2.0 Flash for semantic parsing with offline deterministic rule-based fallback. |
| **Geospatial Discovery** | OpenStreetMap Overpass API | Live extraction of healthcare POIs, emergency attributes, and GPS coordinates. |
| **Standards & Interoperability** | ABDM HFR/HPR & HL7 FHIR R4 | National health registry verification formatting and FHIR resource mapping on public test servers. |
| **Alerting & Communication** | Nodemailer + In-App Service | Configurable SMTP mail dispatch with fallback to high-priority in-app alerts. |

---

### CHAPTER 6: SYSTEM ARCHITECTURE AND COMPONENT INTERACTION

```
+-----------------------------------------------------------------------------------------+
|                                    CLIENT APPLICATION                                   |
|  +--------------------+   +-----------------------+   +------------------------------+  |
|  |  React Vite SPA    |   | Agent Chat Interface  |   | Doctors & Specialists Direct |  |
|  +--------------------+   +-----------------------+   +------------------------------+  |
|  | Leaflet OSM Map    |   | 12-Tool Activity Log  |   | Analytics & Patient History  |  |
|  +--------------------+   +-----------------------+   +------------------------------+  |
+--------------------------------------------+--------------------------------------------+
                                             | HTTP REST (JWT Bearer Token)
+--------------------------------------------v--------------------------------------------+
|                                    API GATEWAY & ROUTES                                 |
|   /api/auth | /api/specialties | /api/hospitals | /api/doctors | /api/agent | /api/appts |
+--------------------------------------------+--------------------------------------------+
                                             |
+--------------------------------------------v--------------------------------------------+
|                              AUTONOMOUS AGENT ORCHESTRATOR                              |
|  +-----------------------------------------------------------------------------------+  |
|  |                       12-TOOL DETERMINISTIC EXECUTION REGISTRY                    |  |
|  |  1. understandUserRequest()            2. identifySpecialty()                     |  |
|  |  3. detectMissingInformation()         4. searchHospitals()                       |  |
|  |  5. searchDoctorsBySpecialty()         6. checkDoctorAvailability()               |  |
|  |  7. rankAvailableSlots()               8. requestUserConfirmation()               |  |
|  |  9. bookAppointment()                 10. sendNotification()                      |  |
|  | 11. searchAlternativeDoctors()        12. retryAppointmentSearch()                |  |
|  +-----------------------------------------------------------------------------------+  |
+--------------------------------------------+--------------------------------------------+
                                             |
       +--------------------+----------------+--------------------+-------------------+
       |                    |                                     |                   |
+------v--------+   +-------v-------------+               +-------v--------+  +-------v--------+
| Google Gemini |   | OpenStreetMap API   |               | ABDM Registry  |  | MongoDB Engine |
| & Rule Engine |   | (Live Overpass POI) |               | & HAPI FHIR R4 |  | (Mongoose DB)  |
+---------------+   +---------------------+               +----------------+  +----------------+
```

---

### CHAPTER 7: MULTI-STEP AGENT WORKFLOW & DECISION FLOWCHART

```
                    [ User submits natural language appointment request ]
                                              |
                                              v
                              [ 1. understandUserRequest ]
                                              |
                                              v
                                 [ 2. identifySpecialty ]
                                              |
                             +----------------+----------------+
                             | Valid Specialty?                |
                            YES                                NO
                             |                                 |
                             v                                 v
                [ 3. detectMissingInformation ]    [ Prompt 15-Specialty Selection ]
                             |                     (State: SPECIALTY_AMBIGUOUS)
              +--------------+--------------+
              | Missing Info (City/Phone)?  |
             YES                            NO
              |                             |
              v                             v
  [ Prompt Targeted Question ]     [ 4. searchHospitals ]
  (State: MISSING_INFO_REQUESTED)  (OpenStreetMap Overpass API)
              |                             |
              v                             v
     [ Await Patient Input ]       [ 5. searchDoctorsBySpecialty ]
              |                    (Rosters across 15 specialties)
              +-------(Merge)               |
                                            v
                               [ 6. checkDoctorAvailability ]
                               (Doctor Working Hours - Occupied Bookings)
                                            |
                                            v
                                 [ 7. rankAvailableSlots ]
                                 (Ascending Chronological Sort -> Earliest)
                                            |
                                            v
                              [ 8. requestUserConfirmation ]
                              (Present Structured Proposal Card)
                                            |
                               +------------+------------+
                               | Patient Decision        |
                            CONFIRM                   REJECT
                               |                         |
                               v                         v
                     [ 9. bookAppointment ]     [ 11. searchAlternativeDoctors ]
                     (Atomic MongoDB Commit)    (Exclude Rejected Slot Signature)
                               |                         |
                               v                         v
                    [ 10. sendNotification ]    [ 12. retryAppointmentSearch ]
                    (In-App Alert & Email)      (Propose Next Best Specialist)
                               |                         |
                               v                         +----(Loop back to Step 8)
                      [ Booking Complete ]
```

---

### CHAPTER 8: DATABASE DESIGN AND RESTful API INTEGRATION

#### 8.1 MongoDB Collections Schema
1. **Specialty:** `name`, `slug` (unique index), `description`, `keywords` (array), `iconName`, `active` (boolean). Pre-populated with 15 clinical domains.
2. **User:** `name`, `email` (unique index), `phone`, `password` (bcrypt hash), `role` (`patient`, `doctor`, `admin`), `createdAt`.
3. **Hospital:** `osmId`, `name`, `address`, `city` (indexed), `latitude`, `longitude`, `source`, `emergency`, `verificationStatus`, `abdmFacilityId`, `lastFetchedAt`.
4. **Doctor:** `name`, `specialtyId` (ref `Specialty`), `specialty` (indexed), `hospitalId` (ref `Hospital`), `qualification`, `experience`, `consultationFee`, `verificationStatus` (`verified`, `demo`), `verificationSource`, `availabilitySchedule`.
5. **Appointment:** `bookingId` (unique reference, e.g. `CC-20261124-3415`), `patientId`, `doctorId`, `hospitalId`, `specialtyId`, `specialty`, `appointmentDate`, `appointmentTime`, `status` (`confirmed`, `cancelled`), `bookingMode`. Enforces atomic composite unique index on `{ doctorId, appointmentDate, appointmentTime, status: 'confirmed' }`.
6. **AgentConversation:** `sessionId` (unique index), `userId`, `messages`, `extractedIntent`, `workflowState`, `missingInformation`, `toolExecutionHistory`, `currentProposedSlot`, `rejectedSlots`, `retryCount`.
7. **Notification:** `userId`, `appointmentId`, `message`, `type` (`email`, `in_app`), `status` (`sent`, `delivered`, `simulated`), `deliveryDetails`.

#### 8.2 Real-World API Endpoints
- **OpenStreetMap Overpass API:** `https://overpass-api.de/api/interpreter`
- **Google Gemini Generative Language API:** `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent`
- **HAPI FHIR R4 Public Test Server:** `https://hapi.fhir.org/baseR4/metadata`
- **Internal REST Endpoints:**
  - `GET /api/specialties` – Retrieve active medical specialties catalog.
  - `POST /api/agent/chat` – Multi-specialty conversational booking agent.
  - `POST /api/agent/confirm-booking` – Atomic confirmation of proposed slot.
  - `POST /api/agent/retry` – Rejection handling and alternative doctor search.
  - `GET /api/hospitals/search` – Real OSM healthcare POI discovery.
  - `GET /api/doctors` – Filter specialists by specialty, city, hospital, and verification status.
  - `POST /api/appointments/book` – Direct appointment booking with slot lock.
  - `GET /api/appointments/my` – Patient appointment records with ownership check.
  - `PATCH /api/appointments/:id/cancel` – Appointment cancellation and slot release.
  - `GET /api/analytics/dashboard` – Real-time scheduling metrics across all 15 specialties.

---

### CHAPTER 9: APPLICATION WALKTHROUGH & USER WORKFLOWS

1. **Authentication & Quick-Fill Demo:** Secure sign-in at `/login` with single-click demo credential injection (`patient@example.com` / `password123`).
2. **Multi-Specialty Autonomous Chat:** In `/agent`, patients submit natural language queries across any of the 15 supported domains (e.g., *"Find a dermatologist near Pune for skin allergy"*).
3. **Smart Follow-Up for Missing Information:** If the city is omitted, the agent prompts for location without irrelevant medical history questions.
4. **Specialty Disambiguation:** If the request lacks a clear medical specialty, the agent triggers `SPECIALTY_AMBIGUOUS` and presents the 15 supported specialties.
5. **Real-Time 12-Tool Inspector:** Patients and evaluators inspect the live execution timeline showing active tools, inputs, outputs, decisions, and millisecond latencies.
6. **Chronological Earliest Slot Ranking:** The agent compares working schedules, filters booked times, and surfaces the earliest available specialist slot card.
7. **One-Click Patient Confirmation & PDF Pass:** On clicking "Confirm Appointment", MongoDB atomically creates the booking (`CC-YYYYMMDD-XXXX`), and the patient can print an official clinical pass.
8. **Alternative Doctor Retry Loop:** Clicking "Alternative Option" prompts the agent to exclude the current specialist and query secondary doctors or nearby hospitals.
9. **Doctors & Specialists Directory:** The `/doctors` page allows interactive filtering across all 15 specialties, hospital facilities, cities, and verification tiers (`Verified` vs `Demo Simulation`).
10. **Hospital Discovery Map:** The `/hospitals` page displays authentic OpenStreetMap healthcare facilities on an interactive Leaflet map.

---

### CHAPTER 10: TESTING RESULTS, ACADEMIC LIMITATIONS AND CONCLUSION

#### 10.1 Comprehensive Acceptance Testing Verification Matrix
The system was validated using the automated Node.js test runner (`server/tests/runAllTests.js`) executing **26 automated test assertions**:

| Test ID | Evaluation Scenario | Expected Outcome | Actual Result | Status |
| :---: | :--- | :--- | :--- | :---: |
| **SPEC-01** | Cardiology Scheduling | Detect Cardiology intent & propose earliest slot | Dr. Sunita Deshmukh (15:00) | **PASS** |
| **SPEC-02** | Orthopedics Scheduling | Detect Orthopedics intent & propose earliest slot | Dr. Rajesh Gokhale (09:00) | **PASS** |
| **SPEC-03** | Dermatology Scheduling | Detect Dermatology intent & propose earliest slot | Dr. Ananya Rao (09:00) | **PASS** |
| **SPEC-04** | Neurology Scheduling | Detect Neurology intent & propose earliest slot | Dr. Rohini Kelkar (16:00) | **PASS** |
| **SPEC-05** | General Medicine Scheduling | Detect General Medicine & propose earliest slot | Dr. Ashok Patil (09:00) | **PASS** |
| **SPEC-06** | Pediatrics Scheduling | Detect Pediatrics intent & propose earliest slot | Dr. Kiran Chitale (09:00) | **PASS** |
| **SPEC-07** | Gynecology Scheduling | Detect Gynecology intent & propose earliest slot | Dr. Shalini Agrawal (09:00) | **PASS** |
| **SPEC-08** | ENT Scheduling | Detect ENT intent & propose earliest slot | Dr. Deepak Merchant (09:00) | **PASS** |
| **SPEC-09** | Ophthalmology Scheduling | Detect Ophthalmology intent & propose earliest slot | Dr. Rameshwar Vyas (09:00) | **PASS** |
| **SPEC-10** | Dentistry Scheduling | Detect Dentistry intent & propose earliest slot | Dr. Sonal Mutha (09:00) | **PASS** |
| **SPEC-11** | Psychiatry Scheduling | Detect Psychiatry intent & propose earliest slot | Dr. Nikhil Ranade (09:00) | **PASS** |
| **SPEC-12** | Urology Scheduling | Detect Urology intent & propose earliest slot | Dr. Vinay Dharmadhikari (09:00)| **PASS** |
| **SPEC-13** | Gastroenterology Scheduling| Detect Gastroenterology & propose earliest slot | Dr. Prashant Sonawane (09:00) | **PASS** |
| **SPEC-14** | Pulmonology Scheduling | Detect Pulmonology intent & propose earliest slot | Dr. Girish Gadre (09:00) | **PASS** |
| **SPEC-15** | Oncology Scheduling | Detect Oncology intent & propose earliest slot | Dr. Sujata Chikhlikar (09:00) | **PASS** |
| **SUM-15** | 15 Specialties Taxonomy | 100% catalog resolution coverage | 15 / 15 Passed | **PASS** |
| **TC-02** | Missing Location Detection | Flags missing city and requests location | State: `MISSING_INFO_REQUESTED` | **PASS** |
| **TC-03** | Ambiguous Specialty | Detects missing specialty and prompts options | State: `SPECIALTY_AMBIGUOUS` | **PASS** |
| **TC-04** | Earliest Slot Ranking Engine | Chronological sorting across 72 slots | Selected earliest: 15:00 IST | **PASS** |
| **TC-05** | Patient Rejection & Retry | Discovers alternative doctor on rejection | Dr. Arjun Sen proposed | **PASS** |
| **TC-06** | Patient Confirmation & DB | Record created with unique reference | Booking `CC-20261124-3415` saved | **PASS** |
| **TC-07** | Slot Double-Booking Lock | Composite unique index blocks collision | HTTP 409 `SLOT_CONFLICT` | **PASS** |
| **TC-08** | Offline Deterministic NLP | Operates without external Gemini API | 100% regex parameter extraction | **PASS** |
| **TC-09** | Appointment Cancellation | Releases slot back to availability pool | Status updated to `cancelled` | **PASS** |
| **TC-10** | Cross-Patient Record Privacy| Unauthorized access blocked | HTTP 403 Forbidden verified | **PASS** |
| **TC-11** | ABDM & FHIR Interoperability | Validates registry format & FHIR ping | ABDM & HAPI FHIR operational | **PASS** |

**Final Verification Score:** 26 / 26 Tests Passed (100% Academic Acceptance).

#### 10.2 Academic Disclosures & Transparent Limitations
1. **Public Doctor Data Verification:** While hospital coordinates and facilities are authenticated via OpenStreetMap, doctor shift rosters are not exposed via open public hospital APIs. Doctor profiles are therefore transparently divided into verified profiles and clearly identified demonstration simulation profiles.
2. **Telephony SMS Gateway:** Due to commercial DLT telecom regulations in India, SMS dispatch defaults to verified in-app notifications and SMTP email services.

#### 10.3 Conclusion
CardioCare AI proves that autonomous agentic architectures can bridge natural language understanding with multi-specialty clinical workflows. By uniting MERN stack web technologies, OpenStreetMap geospatial discovery, deterministic tool execution, ABDM standards, and conflict-free database concurrency, the project delivers an advanced, production-style healthcare scheduling assistant ready for rigorous academic evaluation.
