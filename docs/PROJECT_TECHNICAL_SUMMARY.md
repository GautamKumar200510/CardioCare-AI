# CardioCare AI – Comprehensive Technical Summary & Codebase Audit
**Project Title:** CardioCare AI – Multi-Specialty Autonomous Hospital Appointment Booking Agent  
**Academic Year:** 2026 | **Course:** Agentic AI Final Jury Examination  
**Architecture:** Multi-Step Deterministic Tool Calling with LLM Semantic Intent Parsing

---

## 1. Executive Project Overview

CardioCare AI is an agentic healthcare appointment booking platform developed using the MERN stack (MongoDB, Express.js, React.js, Node.js), Leaflet GIS mapping, and generative/deterministic AI orchestrators. Expanding beyond single-specialty limitations, it autonomously manages appointment discovery and scheduling across **15 clinical specialties**:
1. Cardiology, 2. Orthopedics, 3. Dermatology, 4. Neurology, 5. General Medicine, 6. Pediatrics, 7. Gynecology, 8. ENT, 9. Ophthalmology, 10. Dentistry, 11. Psychiatry, 12. Urology, 13. Gastroenterology, 14. Pulmonology, 15. Oncology.

Unlike static form-based portals or generic FAQ chatbots, CardioCare AI executes a **12-tool autonomous agent workflow** that:
- Ingests natural language clinical requests (e.g. *"Book the earliest cardiologist appointment tomorrow after 3 PM in Pune"*).
- Resolves temporal constraints in `Asia/Kolkata` timezone (*tomorrow*, *this Friday*, *after 3 PM* $\rightarrow$ `15:00`).
- Validates the clinical domain against a centralized 15-specialty taxonomy; prompts users if the specialty is missing or ambiguous.
- Detects missing parameters (location, patient contact) and initiates targeted follow-up prompts without probing medical history.
- Queries authentic hospital facilities and coordinates from the **OpenStreetMap Overpass API**.
- Evaluates specialist shift schedules, subtracts existing confirmed database bookings, and ranks available 30-minute intervals in ascending chronological order.
- Mandates explicit patient authorization before committing any database writes.
- Enforces atomic composite unique indexing in MongoDB to prevent concurrent double-booking race conditions.
- Autonomously executes alternative doctor/hospital retries upon user rejection.
- Validates national health registry formats (ABDM HFR and HPR) and checks HL7 FHIR R4 interoperability against public test servers.

---

## 2. Actual Codebase Architecture & Technology Stack

| Layer | Component / Library | Implementation Details & Rationale |
| :--- | :--- | :--- |
| **Frontend Runtime** | React 18 + Vite | SPA architecture with React Router DOM v6, modular components, sub-second HMR. |
| **Styling & Theme** | Tailwind CSS | Modern healthcare SaaS design system: Navy (`#0f2d59`), Soft Blue (`#f0f7ff`), Slate (`#f8fafc`), Emerald (`#10b981`). |
| **Icons & UI Assets**| Lucide React | Medical, navigation, and activity indicators (`Stethoscope`, `Heart`, `ShieldCheck`, `Bot`, `Activity`). |
| **Mapping & GIS** | Leaflet & React-Leaflet | Open-source interactive map rendering OpenStreetMap tiles and GPS hospital pins. |
| **Data Analytics** | Recharts | SVG chart rendering for specialty distributions, booking statuses, and 7-day booking trends. |
| **Backend Runtime** | Node.js v24 + Express.js | Event-driven RESTful architecture with CORS and `express-rate-limit` middleware. |
| **Database & ODM** | MongoDB Local/Atlas + Mongoose | Document-oriented store with compound unique indexes and TTL cache collections. |
| **Authentication** | JWT + bcryptjs | Stateless Bearer token authentication, password hashing, and Role-Based Access Control (RBAC). |
| **Universal Access** | Custom Auto-Registration | Universal login endpoint (`POST /api/auth/login`) that seamlessly authenticates existing users or auto-activates new accounts on the fly. |
| **Primary AI Engine**| Google Gemini API | REST client targeting `gemini-1.5-flash` / `gemini-2.0-flash` with structured JSON output schema. |
| **Fallback AI Engine**| Groq API | REST client targeting `llama-3.3-70b-versatile` for high-speed fallback. |
| **Offline Fallback** | Deterministic Regex Parser | Pure rule-based NLP extraction engine guaranteeing 100% operational uptime without internet or API keys. |
| **Geospatial API** | OpenStreetMap Overpass API | Overpass QL querying live `amenity=hospital` nodes and ways in target cities. |
| **Standards Tier** | ABDM & HL7 FHIR R4 | National Health Authority format validation and HAPI FHIR R4 public testbed connectivity. |
| **Alerting System** | Nodemailer + In-App Engine | SMTP email dispatch with fallback to high-priority verified in-app notifications. |

---

## 3. Actual Directory Structure

```
cardiocare-ai/
├── DATA_SOURCE_AUDIT.md            # Comprehensive audit of OSM, ABDM, and FHIR data sources
├── client/                         # React 18 + Vite Frontend Application
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx          # Top navigation with responsive routes & user profile
│   │   │   ├── Sidebar.jsx         # Dashboard navigation sidebar
│   │   │   ├── AgentChat.jsx       # Interactive chat interface with multi-specialty quick chips
│   │   │   ├── AgentTimeline.jsx   # Real-time 12-tool execution audit inspector
│   │   │   ├── DoctorCard.jsx      # Doctor card displaying verification tier & specialty
│   │   │   ├── HospitalCard.jsx    # Hospital card with OSM attribution & coordinates
│   │   │   └── AppointmentCard.jsx # Appointment card with PDF pass print & cancellation
│   │   ├── pages/
│   │   │   ├── Landing.jsx         # Minimalist hero & 15-specialty showcase grid
│   │   │   ├── Login.jsx           # Universal sign-in & instant account activation
│   │   │   ├── Register.jsx        # Full legal name, email, phone registration
│   │   │   ├── Dashboard.jsx       # Patient health metrics & booking shortcuts
│   │   │   ├── Agent.jsx           # Dedicated autonomous agent scheduling workspace
│   │   │   ├── Hospitals.jsx       # Leaflet interactive hospital exploration map
│   │   │   ├── Doctors.jsx         # Doctors & Specialists directory with 15 filter pills
│   │   │   ├── Booking.jsx         # Universal direct booking engine with dynamic slots
│   │   │   ├── MyAppointments.jsx  # Confirmed bookings, printable pass modal, slot release
│   │   │   ├── Analytics.jsx       # Recharts dashboards for volume, status, specialties
│   │   │   └── Settings.jsx        # User profile information & system configuration
│   │   ├── services/api.js         # Axios client with JWT request interceptor
│   │   ├── context/AuthContext.jsx # Global auth provider (user, token, universal login)
│   │   ├── App.jsx                 # Route definitions & ProtectedRoute wrappers
│   │   └── main.jsx                # Application root mount
│   ├── package.json
│   └── vite.config.js
│
├── server/                         # Node.js + Express + Mongoose Backend
│   ├── config/
│   │   ├── db.js                   # Mongoose connection with automatic reconnection
│   │   └── specialtiesConfig.js    # Centralized 15-specialty catalog & keyword anchors
│   ├── models/
│   │   ├── Specialty.js            # Specialty taxonomy schema
│   │   ├── User.js                 # Patient, Doctor, Admin user schema with bcrypt
│   │   ├── Hospital.js             # OSM hospital schema with GPS & ABDM facility ID
│   │   ├── Doctor.js               # Doctor schema with schedule, specialty, verification
│   │   ├── Appointment.js          # Appointment schema with compound unique concurrency index
│   │   ├── AgentConversation.js    # Multi-turn conversation state & 12-tool logs
│   │   └── Notification.js         # In-app and email alert delivery records
│   ├── routes/
│   │   ├── authRoutes.js           # Universal login, registration, and profile retrieval
│   │   ├── specialtyRoutes.js      # Active specialties catalog endpoint
│   │   ├── hospitalRoutes.js       # OSM search, city query, caching
│   │   ├── doctorRoutes.js         # Doctor queries filtered by specialty, hospital, city
│   │   ├── appointmentRoutes.js    # Dynamic availability, atomic booking, cancellation
│   │   ├── agentRoutes.js          # Autonomous agent chat, confirmation, and retry
│   │   ├── analyticsRoutes.js      # Aggregated metrics across all 15 specialties
│   │   └── notificationRoutes.js   # Patient notification retrieval & status updates
│   ├── services/
│   │   ├── ai/
│   │   │   ├── geminiProvider.js   # Google Gemini 1.5/2.0 Flash REST provider
│   │   │   ├── groqProvider.js     # Groq llama-3.3-70b fallback REST provider
│   │   │   └── aiProvider.js       # Temporal parser, keyword validator, offline regex engine
│   │   ├── agent/
│   │   │   ├── toolRegistry.js     # 12-tool execution registry & backward-compat aliases
│   │   │   └── agentOrchestrator.js# Multi-turn FSM orchestrator (11 workflow states)
│   │   ├── hospital/
│   │   │   ├── overpassService.js  # Overpass API caller with authentic city fallbacks
│   │   │   └── abdmService.js      # ABDM HFR / HPR format validation & portal links
│   │   ├── appointment/
│   │   │   ├── bookingService.js   # Atomic booking creation with concurrency check
│   │   │   ├── slotRankingService.js# Chronological ascending earliest slot ranking
│   │   │   └── fhirService.js      # HL7 FHIR R4 schema mapping & HAPI FHIR testbed
│   │   └── notification/
│   │       ├── emailService.js     # Nodemailer SMTP mailer with in-app alert fallback
│   │       └── inAppNotificationService.js # In-app persistent notification alerts
│   ├── seed/seedData.js            # Database seeder (15 specialties, 23 doctors, 13 OSM hospitals)
│   ├── tests/runAllTests.js        # Automated test suite (26 assertions covering 15 specialties)
│   ├── app.js                      # Express application middleware & route mounting
│   ├── server.js                   # Server bootstrap & daemon entrypoint
│   └── package.json
│
├── docs/                           # Complete Academic Documentation Suite
│   ├── project-report.md           # 10-Chapter Project Report
│   ├── architecture.md             # Mermaid System Architecture & Sequence Diagrams
│   ├── test-cases.md               # 26-Test Acceptance Matrix
│   ├── presentation-slides.md      # 12-Slide Final Presentation Deck Content
│   ├── demo-script.md              # 3-Minute Video Demonstration Script
│   └── team-contributions.md       # 4-Member Contribution Breakdown
│
├── package.json                    # Root workspace package scripts
└── README.md                       # Master project overview & badges
```

---

## 4. Actual REST API Endpoints

| Category | Method | Route | Description & Parameters |
| :--- | :---: | :--- | :--- |
| **Auth** | `POST` | `/api/auth/login` | Universal login: Authenticates existing user or auto-creates new account on the fly. |
| **Auth** | `POST` | `/api/auth/register` | Standard registration with name, email, phone, password. |
| **Auth** | `GET` | `/api/auth/me` | Protected route returning current JWT user profile. |
| **Specialties** | `GET` | `/api/specialties` | Returns all 15 active clinical specialties with descriptions, keywords, icons. |
| **Hospitals** | `GET` | `/api/hospitals/search` | Search OSM hospitals by `city` (default: Pune) with caching. |
| **Hospitals** | `GET` | `/api/hospitals/osm-discover` | Direct Overpass API query with `refresh=true` option. |
| **Doctors** | `GET` | `/api/doctors` | Filter doctors by `specialty`, `city`, `hospitalId`, `verificationStatus`, `search`. |
| **Appointments**| `POST` | `/api/appointments/check-availability`| Computes open 30-min slots across doctors after target time. |
| **Appointments**| `POST` | `/api/appointments/book` | Direct atomic appointment booking with slot collision lock. |
| **Appointments**| `GET` | `/api/appointments/my` | Retrieves logged-in patient's bookings (RBAC ownership enforced). |
| **Appointments**| `PATCH`| `/api/appointments/:id/cancel`| Cancels booking and immediately frees slot in availability pool. |
| **Agent** | `POST` | `/api/agent/chat` | Main conversational agent endpoint executing multi-turn tool calling. |
| **Agent** | `POST` | `/api/agent/confirm-booking` | Programmatic slot confirmation triggering atomic persistence. |
| **Agent** | `POST` | `/api/agent/retry` | Rejection handling and autonomous alternative doctor discovery. |
| **Agent** | `GET` | `/api/agent/conversation/:id` | Full session history and 12-tool execution audit trail. |
| **Analytics** | `GET` | `/api/analytics/dashboard` | Real-time aggregated metrics across all 15 specialties. |
| **Notifications**| `GET`| `/api/notifications/my` | Retrieves patient in-app notification alerts. |

---

## 5. Actual Database Schema (MongoDB Mongoose)

### 5.1 Specialty Collection (`Specialty.js`)
```javascript
{
  name: { type: String, required: true, unique: true }, // e.g. "Cardiology"
  slug: { type: String, required: true, unique: true }, // e.g. "cardiology"
  description: { type: String },
  keywords: [{ type: String }],                         // e.g. ["cardio", "heart", "ecg"]
  iconName: { type: String, default: 'Stethoscope' },
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
}
```

### 5.2 Hospital Collection (`Hospital.js`)
```javascript
{
  osmId: { type: String, required: true, unique: true }, // e.g. "node/2573981123"
  name: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true, index: true },
  area: { type: String },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  phone: { type: String },
  emergency: { type: Boolean, default: false },
  source: { type: String, default: 'OpenStreetMap Overpass API' },
  verificationStatus: { type: String, enum: ['verified', 'unverified'], default: 'verified' },
  abdmFacilityId: { type: String },                     // e.g. "IN.MH.PUN.10294"
  lastFetchedAt: { type: Date, default: Date.now }
}
```

### 5.3 Doctor Collection (`Doctor.js`)
```javascript
{
  name: { type: String, required: true },
  specialtyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Specialty' },
  specialty: { type: String, required: true, index: true },
  hospitalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital', required: true },
  qualification: { type: String, required: true },
  experience: { type: Number, required: true },
  consultationFee: { type: Number, required: true },
  verificationStatus: { type: String, enum: ['verified', 'demo'], default: 'demo' },
  verificationSource: { type: String, default: 'Internal Clinical Roster' },
  dataMode: { type: String, enum: ['real', 'simulation'], default: 'simulation' },
  availabilitySchedule: {
    workingDays: [{ type: Number }],                     // [1, 2, 3, 4, 5, 6] (Mon-Sat)
    shifts: [{ startTime: String, endTime: String }],    // e.g. "09:00" - "17:00"
    slotDurationMinutes: { type: Number, default: 30 }
  }
}
```

### 5.4 Appointment Collection (`Appointment.js`)
```javascript
{
  bookingId: { type: String, required: true, unique: true }, // e.g. "CC-20261124-3415"
  bookingReference: { type: String, required: true, index: true },
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  patientName: { type: String, required: true },
  patientPhone: { type: String, required: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
  hospitalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital', required: true },
  specialtyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Specialty' },
  specialty: { type: String, required: true, index: true },
  appointmentDate: { type: String, required: true },         // YYYY-MM-DD
  appointmentTime: { type: String, required: true },         // HH:mm
  status: { type: String, enum: ['confirmed', 'completed', 'cancelled'], default: 'confirmed', index: true },
  bookingMode: { type: String, enum: ['verified_hospital', 'demonstration'], default: 'demonstration' },
  notes: { type: String }
}

// CONCURRENCY SAFETY: Compound Unique Index
appointmentSchema.index(
  { doctorId: 1, appointmentDate: 1, appointmentTime: 1, status: 1 },
  { unique: true, partialFilterExpression: { status: 'confirmed' } }
);
```

### 5.5 AgentConversation Collection (`AgentConversation.js`)
```javascript
{
  sessionId: { type: String, required: true, unique: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  messages: [{
    sender: { type: String, enum: ['user', 'agent', 'system'] },
    text: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
  }],
  extractedIntent: {
    intent: String,
    specialty: String,
    specialtySlug: String,
    date: String,
    resolvedDate: String,
    timePreference: String,
    timeAfter: String,
    location: String,
    patientName: String,
    phone: String,
    source: String
  },
  workflowState: {
    type: String,
    enum: [
      'IDLE', 'INTENT_EXTRACTED', 'SPECIALTY_AMBIGUOUS', 'MISSING_INFO_REQUESTED',
      'HOSPITALS_FOUND', 'DOCTORS_FOUND', 'SLOTS_EVALUATED',
      'CONFIRMATION_REQUESTED', 'BOOKING_COMPLETED', 'RETRYING_ALTERNATIVE', 'FAILED'
    ],
    default: 'IDLE'
  },
  missingInformation: [{ type: String }],
  toolExecutionHistory: [{
    tool: String,
    status: String,
    input: mongoose.Schema.Types.Mixed,
    output: mongoose.Schema.Types.Mixed,
    decision: String,
    executionTimeMs: Number,
    timestamp: Date
  }],
  currentProposedSlot: mongoose.Schema.Types.Mixed,
  rejectedSlots: [{ type: String }],
  retryCount: { type: Number, default: 0 }
}
```

---

## 6. Actual 12 Agent Tools in Registry

All clinical operations are decoupled into 12 tools in `server/services/agent/toolRegistry.js`:

1. **`understandUserRequest`**: Ingests user message and context; attempts Gemini LLM $\rightarrow$ Groq $\rightarrow$ Offline Deterministic Regex parser.
2. **`identifySpecialty`**: Matches extracted specialty against 15 supported medical specialties. Flags ambiguous queries.
3. **`detectMissingInformation`**: Evaluates completeness of booking parameters (`location`, `patientName`, `phone`). Initiates non-intrusive follow-up prompts.
4. **`searchHospitals`**: Queries OpenStreetMap Overpass API for real healthcare facilities in target city. Caches results in MongoDB.
5. **`searchDoctorsBySpecialty`**: Pulls specialist doctor records matching the validated specialty and hospital IDs.
6. **`checkDoctorAvailability`**: Dynamically calculates 30-minute working shift intervals and subtracts existing confirmed MongoDB bookings.
7. **`rankAvailableSlots`**: Sorts remaining open slots ascending chronologically and selects the earliest slot after requested time constraint.
8. **`requestUserConfirmation`**: Formulates clinical appointment proposal card requiring explicit patient approval.
9. **`bookAppointment`**: Atomically commits booking record to MongoDB with composite unique index lock to prevent concurrency collisions.
10. **`sendNotification`**: Dispatches SMTP email and saves persistent high-priority in-app alert.
11. **`searchAlternativeDoctors`**: Queries secondary specialists or alternate hospitals when patient rejects first slot.
12. **`retryAppointmentSearch`**: Manages retry loop state, increments retry counter, and enforces safety ceiling ($n \le 5$).

---

## 7. Feature Audit Matrix: Working vs Simulated vs Missing

| Feature Domain | Status Classification | Precise Technical Reality |
| :--- | :---: | :--- |
| **15 Clinical Specialties Intent Parsing** | **Fully Implemented & Tested** | Parses all 15 specialties via word-boundary regexes & LLM. 15/15 pass automated tests. |
| **Temporal Date & Time Resolution** | **Fully Implemented & Tested** | Dynamically resolves *tomorrow*, *this Friday*, *after 3 PM* $\rightarrow$ `15:00` in `Asia/Kolkata` timezone. |
| **Missing Parameter Disambiguation** | **Fully Implemented & Tested** | Detects missing location or contact; transitions to `MISSING_INFO_REQUESTED`. |
| **Ambiguous Specialty Handling** | **Fully Implemented & Tested** | Detects requests missing clear specialty; transitions to `SPECIALTY_AMBIGUOUS` with prompt. |
| **OpenStreetMap Hospital Discovery** | **Fully Implemented & Tested** | Queries Overpass API live. Authenticated POIs in Pune, Mumbai, Delhi, Bangalore with real GPS pins. |
| **Earliest Slot Ranking Engine** | **Fully Implemented & Tested** | Chronologically sorts candidate slots ascending and surfaces earliest option. |
| **Mandatory Patient Confirmation** | **Fully Implemented & Tested** | Zero database writes occur before explicit user click/confirmation. |
| **Atomic Concurrency Protection** | **Fully Implemented & Tested** | Composite unique index in MongoDB rejects concurrent duplicate slot booking with HTTP 409 `SLOT_CONFLICT`. |
| **Alternative Doctor Retry Loop** | **Fully Implemented & Tested** | Autonomous retry replaces rejected doctor/slot with next earliest candidate without repeating. |
| **Universal Sign-In & Registration** | **Fully Implemented & Tested** | Anyone can sign in with any email & password; new accounts auto-registered instantly on the fly. |
| **Role-Based Access Control (RBAC)** | **Fully Implemented & Tested** | Enforces patient ownership over appointments. Unauthorized cross-patient access returns HTTP 403. |
| **Offline Fallback Engine** | **Fully Implemented & Tested** | Deterministic rule engine runs 100% offline without requiring internet or Gemini API key. |
| **HAPI FHIR R4 Health Check** | **Fully Implemented & Tested** | Pings `https://hapi.fhir.org/baseR4/metadata` and validates FHIR version 4.0.1 operational status. |
| **Doctor Shift Schedules** | **Simulated / Demo-Only** | Private hospital IT systems do not publish real-time internal doctor shifts. Schedules are mathematically simulated 30-min intervals based on doctor's model configuration. |
| **Hospital ERP Database Write** | **Simulated / Demo-Only** | Hospital bookings are persisted in CardioCare's MongoDB database. Direct write to proprietary hospital internal ERP software is simulated (as real hospitals require commercial HL7/FHIR site licenses). |
| **ABDM Registry Gateway** | **Partially Implemented** | Validates official ABDM HFR/HPR registration formats and generates direct public portal verification links. Live ABDM M1/M2/M3 API calls require institutional government sign-off. |
| **Telephony SMS Dispatch** | **Not Implemented** | Requires commercial Indian DLT telecom gateway licenses. Handled via SMTP email and verified in-app alerts. |
| **Voice-Activated Speech Input** | **Not Implemented** | Web Speech API not integrated; all interaction is natural language text. |

---

## 8. Verified Automated Test Suite Results

The automated test runner (`server/tests/runAllTests.js`) was executed against the active backend server (`http://localhost:5000/api`):

```
========================================================================
 CardioCare AI – Comprehensive Multi-Specialty Verification Suite
 Testing All 15 Clinical Specialties & Autonomous Agent Tools
 API Target: http://localhost:5000/api
========================================================================

--- PART 1: 15 Medical Specialties Comprehensive Evaluation ---
[✅ PASS] SPEC-Cardiology: Matched 'Cardiology', Proposed Doctor: Dr. Sunita Deshmukh at Ruby Hall Clinic (15:00)
[✅ PASS] SPEC-Orthopedics: Matched 'Orthopedics', Proposed Doctor: Dr. Rajesh Gokhale at Ruby Hall Clinic (09:00)
[✅ PASS] SPEC-Dermatology: Matched 'Dermatology', Proposed Doctor: Dr. Ananya Rao at Jehangir Hospital (09:00)
[✅ PASS] SPEC-Neurology: Matched 'Neurology', Proposed Doctor: Dr. Rohini Kelkar at Ruby Hall Clinic (16:00)
[✅ PASS] SPEC-General Medicine: Matched 'General Medicine', Proposed Doctor: Dr. Ashok Patil at Ruby Hall Clinic (09:00)
[✅ PASS] SPEC-Pediatrics: Matched 'Pediatrics', Proposed Doctor: Dr. Kiran Chitale at Jehangir Hospital (09:00)
[✅ PASS] SPEC-Gynecology: Matched 'Gynecology', Proposed Doctor: Dr. Shalini Agrawal at Ruby Hall Clinic (09:00)
[✅ PASS] SPEC-ENT: Matched 'ENT', Proposed Doctor: Dr. Deepak Merchant at Deenanath Mangeshkar Hospital (09:00)
[✅ PASS] SPEC-Ophthalmology: Matched 'Ophthalmology', Proposed Doctor: Dr. Rameshwar Vyas at Jehangir Hospital (09:00)
[✅ PASS] SPEC-Dentistry: Matched 'Dentistry', Proposed Doctor: Dr. Sonal Mutha at Ruby Hall Clinic (09:00)
[✅ PASS] SPEC-Psychiatry: Matched 'Psychiatry', Proposed Doctor: Dr. Nikhil Ranade at Jupiter Hospital (09:00)
[✅ PASS] SPEC-Urology: Matched 'Urology', Proposed Doctor: Dr. Vinay Dharmadhikari at Ruby Hall Clinic (09:00)
[✅ PASS] SPEC-Gastroenterology: Matched 'Gastroenterology', Proposed Doctor: Dr. Prashant Sonawane at Deenanath Mangeshkar (09:00)
[✅ PASS] SPEC-Pulmonology: Matched 'Pulmonology', Proposed Doctor: Dr. Girish Gadre at Jehangir Hospital (09:00)
[✅ PASS] SPEC-Oncology: Matched 'Oncology', Proposed Doctor: Dr. Sujata Chikhlikar at Ruby Hall Clinic (09:00)
[✅ PASS] SUMMARY-15-SPECIALTIES: Passed 15 / 15 Specialties (100%)

--- PART 2: Core Agent Workflow & Concurrency Acceptance Tests ---
[✅ PASS] TEST-02: Missing location detection & follow-up prompt (State: MISSING_INFO_REQUESTED)
[✅ PASS] TEST-03: Ambiguous/missing specialty detection & targeted prompt (State: SPECIALTY_AMBIGUOUS)
[✅ PASS] TEST-04: Earliest slot ranking engine (Chronologically selected earliest: 15:00 IST)
[✅ PASS] TEST-05: Patient rejects slot -> Alternative doctor discovery (Dr. Arjun Sen, Retry Count: 1)
[✅ PASS] TEST-06: Patient confirmation -> Persistent MongoDB record creation (Booking ID: CC-20261124-3013)
[✅ PASS] TEST-07: Slot conflict prevention (Atomic composite unique index rejected occupied slot with SLOT_CONFLICT)
[✅ PASS] TEST-08: Deterministic rule-based NLP fallback when AI API unavailable (Source: deterministic_engine)
[✅ PASS] TEST-09: Patient appointment cancellation & slot release (Status updated to 'cancelled')
[✅ PASS] TEST-10: Unauthorized patient access protection (RBAC security: HTTP 403 Forbidden verified)
[✅ PASS] TEST-11: ABDM Registry Verification & HAPI FHIR Interoperability Check (Both verified operational)

========================================================================
 SUMMARY: 26 / 26 Tests Passed (100% Pass Rate)
========================================================================
```
