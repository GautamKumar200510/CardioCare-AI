# CardioCare AI – Team Contribution & Module Ownership Breakdown
**Course:** Agentic AI Capstone / Final Jury Examination (Academic Year 2026)  
**Project:** CardioCare AI – Multi-Specialty Autonomous Hospital Appointment Booking Agent  

> **Note to Group Members:** This template provides an objective, code-backed distribution of responsibilities based on the actual codebase commits and file structure. Verify and customize individual percentages, task assignments, and roll numbers before final submission to your evaluation panel.

---

## 1. Group Contribution Summary Matrix

| Member # | Student Name (Placeholder) | Roll Number | Primary Assigned Role | Workload % | Core Code Modules Owned |
| :---: | :--- | :--- | :--- | :---: | :--- |
| **Member 1** | `[Editable: Student Name 1]` | `[Roll Number 1]` | Agentic AI Engineer & System Architect | 28% | `agentOrchestrator.js`, `toolRegistry.js`, `aiProvider.js`, `geminiProvider.js`, `runAllTests.js` |
| **Member 2** | `[Editable: Student Name 2]` | `[Roll Number 2]` | Backend Developer & Database Architect | 26% | `models/*.js`, `authRoutes.js`, `appointmentRoutes.js`, `bookingService.js`, `db.js` |
| **Member 3** | `[Editable: Student Name 3]` | `[Roll Number 3]` | External Data & Standards Engineer | 23% | `overpassService.js`, `abdmService.js`, `fhirService.js`, `slotRankingService.js`, `DATA_SOURCE_AUDIT.md` |
| **Member 4** | `[Editable: Student Name 4]` | `[Roll Number 4]` | Frontend Architect & UI/UX Specialist | 23% | `AgentChat.jsx`, `AgentTimeline.jsx`, `Hospitals.jsx`, `Doctors.jsx`, `Analytics.jsx`, `Booking.jsx` |
| **Total** | — | — | **Full-Stack Agentic AI Engineering** | **100%** | Full Project Repository |

---

## 2. Detailed Technical Contribution per Member

### Member 1: Agentic AI Engineer & System Architect
- **Assigned Student:** `[Editable: Student Name 1]`
- **Roll Number:** `[Editable: Roll Number 1]`
- **Core Specialization:** Agentic Workflows, LLM Prompt Engineering, and Deterministic Orchestration.
- **Specific Technical Deliverables:**
  1. **12-Tool Agent Registry Architecture (`server/services/agent/toolRegistry.js`):** Engineered the 12 discrete programmatic tools (`understandUserRequest`, `identifySpecialty`, `detectMissingInformation`, `searchHospitals`, `searchDoctorsBySpecialty`, `checkDoctorAvailability`, `rankAvailableSlots`, `requestUserConfirmation`, `bookAppointment`, `sendNotification`, `searchAlternativeDoctors`, `retryAppointmentSearch`).
  2. **Finite State Machine Orchestrator (`server/services/agent/agentOrchestrator.js`):** Built the multi-turn state automaton with 11 discrete states (`IDLE`, `INTENT_EXTRACTED`, `SPECIALTY_AMBIGUOUS`, `MISSING_INFO_REQUESTED`, `CONFIRMATION_REQUESTED`, `RETRYING_ALTERNATIVE`, etc.).
  3. **Dual-Mode AI Extraction Pipeline (`server/services/ai/aiProvider.js`):** Integrated Google Gemini 1.5/2.0 Flash REST API with zero-network deterministic regex fallback, resolving relative dates (*tomorrow*, *this Friday*) in `Asia/Kolkata` timezone and time constraints (*after 3 PM* $\rightarrow$ `15:00`).
  4. **Multi-Specialty Automated Test Suite (`server/tests/runAllTests.js`):** Designed and executed the 26-assertion automated test runner validating all 15 clinical specialties, state transitions, and concurrency safety.
- **Self-Assessment / Peer Verification:** `[Verified / Approved by Team]`

---

### Member 2: Backend Developer & Database Architect
- **Assigned Student:** `[Editable: Student Name 2]`
- **Roll Number:** `[Editable: Roll Number 2]`
- **Core Specialization:** Mongoose Data Modeling, Concurrency Control, and API Security.
- **Specific Technical Deliverables:**
  1. **MongoDB Database Schema (`server/models/`):** Designed and implemented schemas for `Specialty`, `User`, `Hospital`, `Doctor`, `Appointment`, `AgentConversation`, and `Notification`.
  2. **Double-Booking Concurrency Lock (`server/models/Appointment.js`):** Implemented the partial compound unique index (`{ doctorId: 1, appointmentDate: 1, appointmentTime: 1, status: 1 }` with `{ status: 'confirmed' }`) that eliminates race conditions and returns HTTP 409 `SLOT_CONFLICT`.
  3. **Universal Authentication & Auto-Registration (`server/routes/authRoutes.js`):** Engineered the frictionless sign-in endpoint that allows anyone to log in with any valid email and password while auto-creating new patient records on the fly.
  4. **Role-Based Access Control (RBAC):** Built JWT verification middleware preventing cross-patient appointment tampering (HTTP 403 Forbidden).
  5. **Seed Data Generator (`server/seed/seedData.js`):** Populated 15 medical specialties, 23 specialist doctor profiles, and 13 authentic OpenStreetMap healthcare facilities.
- **Self-Assessment / Peer Verification:** `[Verified / Approved by Team]`

---

### Member 3: External Data & Standards Engineer
- **Assigned Student:** `[Editable: Student Name 3]`
- **Roll Number:** `[Editable: Roll Number 3]`
- **Core Specialization:** Geospatial Healthcare APIs, Registry Interoperability, and Scheduling Algorithms.
- **Specific Technical Deliverables:**
  1. **OpenStreetMap Overpass Integration (`server/services/hospital/overpassService.js`):** Connected live with Overpass QL servers to query authentic healthcare facilities, GPS coordinates, and emergency attributes, with database caching to mitigate rate limits.
  2. **Earliest Slot Ranking Engine (`server/services/appointment/slotRankingService.js`):** Developed the mathematical sorting algorithm that computes available 30-minute shifts, excludes occupied entries, and returns chronologically earliest candidate slots.
  3. **ABDM National Health Registry Verification (`server/services/hospital/abdmService.js`):** Researched and integrated Health Facility Registry (HFR) and Healthcare Professionals Registry (HPR) format validation standards and public verification portal linkages.
  4. **HL7 FHIR R4 Interoperability Service (`server/services/appointment/fhirService.js`):** Mapped appointment data to standard FHIR R4 Appointment resources and verified connectivity with the public HAPI FHIR test server (`https://hapi.fhir.org/baseR4`).
  5. **Data Source Audit Documentation (`DATA_SOURCE_AUDIT.md`):** Authored the compliance audit transparently documenting live APIs, simulated doctor shift schedules, and licensing restrictions.
- **Self-Assessment / Peer Verification:** `[Verified / Approved by Team]`

---

### Member 4: Frontend Architect & UI/UX Specialist
- **Assigned Student:** `[Editable: Student Name 4]`
- **Roll Number:** `[Editable: Roll Number 4]`
- **Core Specialization:** React Single Page Applications, Tailwind Design Systems, and Real-Time Agent Inspectors.
- **Specific Technical Deliverables:**
  1. **React 18 SPA Architecture (`client/src/`):** Set up Vite build pipeline, Tailwind CSS design system (Navy `#0f2d59`, Soft Blue `#f0f7ff`, Emerald `#10b981`), and React Router navigation.
  2. **Conversational Agent Chat Interface (`client/src/components/AgentChat.jsx`):** Developed the multi-turn conversational chat featuring suggested quick chips, candidate slot cards, and confirmation buttons.
  3. **Real-Time 12-Tool Activity Inspector (`client/src/components/AgentTimeline.jsx`):** Built the live execution audit panel displaying tool names, execution duration in milliseconds, raw input/output JSON, and programmatic decisions.
  4. **Interactive Leaflet Healthcare Map (`client/src/pages/Hospitals.jsx`):** Integrated Leaflet and React-Leaflet to render OpenStreetMap tiles and verified hospital GPS markers across Pune, Mumbai, Delhi, and Bangalore.
  5. **Doctors & Specialists Directory (`client/src/pages/Doctors.jsx`):** Built horizontal 15-specialty filter pill bar, city filters, and verification badges (`Verified` vs `Demo Simulation`).
  6. **Universal Direct Booking Engine (`client/src/pages/Booking.jsx`):** Developed dynamic slot selection UI fetching live availability from backend APIs.
  7. **Analytics Dashboard (`client/src/pages/Analytics.jsx`):** Integrated Recharts SVG visualizations for 15-specialty booking volume, appointment statuses, and 7-day scheduling trends.
- **Self-Assessment / Peer Verification:** `[Verified / Approved by Team]`

---

## 3. Team Sign-Off Verification

| Student Name | Signature Placeholder | Date Verified |
| :--- | :--- | :---: |
| `[Student Name 1]` | _________________________________ | `___/___/2026` |
| `[Student Name 2]` | _________________________________ | `___/___/2026` |
| `[Student Name 3]` | _________________________________ | `___/___/2026` |
| `[Student Name 4]` | _________________________________ | `___/___/2026` |

**Faculty Guide Signature:** _________________________________  
**Date:** `___/___/2026`
