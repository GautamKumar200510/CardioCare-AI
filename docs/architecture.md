# CardioCare AI – Multi-Specialty Architecture & Technical Specifications

## 1. High-Level Architecture Overview

CardioCare AI combines a **Modern React Single Page Application (SPA)** with an **Autonomous Multi-Specialty Agent Engine** powered by Google Gemini, deterministic NLP orchestration, OpenStreetMap healthcare discovery, ABDM registry verification, and HL7 FHIR R4 interoperability.

```mermaid
flowchart TD
    subgraph Client["Client Tier (React Vite SPA)"]
        UI["Modern Healthcare SaaS UI"]
        AgentChat["Multi-Specialty Agent Chat"]
        Timeline["12-Tool Activity Timeline"]
        Map["Leaflet OpenStreetMap View"]
        Directory["Doctors & Specialists Directory"]
    end

    subgraph Gateway["API Gateway Tier"]
        Auth["JWT Auth Middleware & RBAC"]
        Limiter["Rate Limiting & Security"]
        Router["Express RESTful Routers"]
    end

    subgraph AgentCore["Autonomous Agent Core"]
        Orchestrator["Agent Orchestrator"]
        Registry["12-Tool Execution Registry"]
        Taxonomy["15 Clinical Specialties Catalog"]
        Fallback["Deterministic Rule-Based NLP"]
    end

    subgraph DataServices["Data & External Standards Tier"]
        Overpass["OpenStreetMap Overpass API"]
        Gemini["Google Gemini LLM (Free-Tier)"]
        ABDM["ABDM HFR / HPR Registry Service"]
        FHIR["HAPI FHIR R4 Interoperability"]
        Mongo[("MongoDB Database")]
        Mailer["Nodemailer & In-App Alerting"]
    end

    Client -->|HTTP REST + Bearer Token| Gateway
    Gateway --> AgentCore
    AgentCore --> Taxonomy
    AgentCore --> Registry
    Registry --> Overpass
    Registry --> Gemini
    Registry --> ABDM
    Registry --> FHIR
    Registry --> Mongo
    Registry --> Mailer
    AgentCore --> Fallback
```

---

## 2. Agent Finite State Machine (Workflow States)

The autonomous multi-specialty agent operates as a deterministic finite-state automaton with 11 distinct states:

```mermaid
stateDiagram-v2
    [*] --> IDLE
    IDLE --> INTENT_EXTRACTED: User natural language request
    INTENT_EXTRACTED --> SPECIALTY_AMBIGUOUS: Specialty unclear or missing
    SPECIALTY_AMBIGUOUS --> INTENT_EXTRACTED: User selects specialty
    INTENT_EXTRACTED --> MISSING_INFO_REQUESTED: Location / contact omitted
    MISSING_INFO_REQUESTED --> INTENT_EXTRACTED: User provides city / phone
    INTENT_EXTRACTED --> HOSPITALS_FOUND: All parameters valid & OSM queried
    HOSPITALS_FOUND --> DOCTORS_FOUND: Specialists queried across 15 domains
    DOCTORS_FOUND --> SLOTS_EVALUATED: Doctor schedules & bookings evaluated
    SLOTS_EVALUATED --> CONFIRMATION_REQUESTED: Earliest slot ranked
    CONFIRMATION_REQUESTED --> BOOKING_COMPLETED: User confirms (Explicit yes)
    CONFIRMATION_REQUESTED --> RETRYING_ALTERNATIVE: User rejects / requests alternative
    RETRYING_ALTERNATIVE --> SLOTS_EVALUATED: Alternative doctor or facility selected
    CONFIRMATION_REQUESTED --> FAILED: Retries exceed threshold (> 5)
    BOOKING_COMPLETED --> [*]
```

---

## 3. Sequence Diagram: 12-Tool Multi-Specialty Booking Flow

```mermaid
sequenceDiagram
    autonumber
    actor Patient as Patient
    participant UI as Agent Chat UI
    participant Server as Express Server
    participant Agent as Agent Orchestrator
    participant Tools as 12-Tool Registry
    participant OSM as Overpass API
    participant DB as MongoDB

    Patient->>UI: "I need an orthopedic doctor this Friday after 3 PM in Pune"
    UI->>Server: POST /api/agent/chat
    Server->>Agent: processUserMessage()
    Agent->>Tools: understandUserRequest()
    Tools-->>Agent: Raw extracted intent payload
    Agent->>Tools: identifySpecialty()
    Tools-->>Agent: Validated: "Orthopedics" (Matches 15-Specialty catalog)
    Agent->>Tools: detectMissingInformation()
    Tools-->>Agent: { isComplete: true, patientName: "Rahul Sharma", phone: "+91-9876543210" }
    Agent->>Tools: searchHospitals(city: "Pune")
    Tools->>OSM: Query amenity=hospital in Pune
    OSM-->>Tools: Real hospital POIs with Lat/Lon & OSM IDs
    Tools->>DB: Upsert hospital cache
    Agent->>Tools: searchDoctorsBySpecialty(specialty: "Orthopedics")
    Tools->>DB: Query specialists matching hospitalIds & specialty
    DB-->>Tools: Orthopedic doctor roster & schedules
    Agent->>Tools: checkDoctorAvailability(targetDate, timeAfter: "15:00")
    Tools->>DB: Filter confirmed bookings on target date
    DB-->>Tools: Remaining open 30-min working slots
    Agent->>Tools: rankAvailableSlots()
    Tools-->>Agent: Chronologically earliest candidate slot identified
    Agent->>Tools: requestUserConfirmation()
    Tools-->>Agent: Structured appointment proposal card
    Agent-->>UI: Displays proposed specialist card (Doctor, Hospital, Fee, Time)
    Patient->>UI: Clicks "Confirm Appointment"
    UI->>Server: POST /api/agent/confirm-booking
    Server->>Tools: bookAppointment()
    Tools->>DB: Atomic insert with composite unique index
    DB-->>Tools: Confirmed booking created (ID: CC-YYYYMMDD-XXXX)
    Agent->>Tools: sendNotification()
    Tools-->>DB: High-priority in-app alert & email record
    Tools-->>UI: Official booking confirmed response & printable pass
```

---

## 4. The 12-Tool Execution Registry

Every clinical action is encapsulated as a discrete, deterministic tool registered in `server/services/agent/toolRegistry.js`:

| Tool Name | Input Parameters | Output Payload | Description |
| :--- | :--- | :--- | :--- |
| `understandUserRequest` | `userMessage`, `conversationContext` | `{ intent, rawSpecialty, dateStr, timeConstraint, ... }` | Dual-mode parsing via Gemini LLM or deterministic regex engine. |
| `identifySpecialty` | `rawText`, `extractedSpecialty` | `{ specialty, slug, isSupported, canonicalName }` | Validates against 15 supported medical specialties. |
| `detectMissingInformation` | `extractedData`, `userContext` | `{ isComplete, missingFields, followUpPrompt }` | Flags missing location or contact; prevents irrelevant medical questions. |
| `searchHospitals` | `city`, `area`, `limit` | `{ count, hospitals: [...] }` | Queries OpenStreetMap Overpass API and caches facilities in MongoDB. |
| `searchDoctorsBySpecialty` | `specialty`, `hospitalIds`, `city` | `{ count, doctors: [...] }` | Retrieves specialist rosters across verified and demo tiers. |
| `checkDoctorAvailability` | `doctorId`, `targetDate`, `timeAfter` | `{ availableSlots: [...], bookedSlots: [...] }` | Subtracts occupied bookings from 30-minute working shift intervals. |
| `rankAvailableSlots` | `candidateSlots`, `preference` | `{ selectedSlot, sortedCount }` | Chronologically sorts candidate slots ascending and surfaces the earliest. |
| `requestUserConfirmation` | `candidateSlot`, `patientDetails` | `{ confirmationRequired: true, slotCard: {...} }` | Formulates structured booking card requiring patient authorization. |
| `bookAppointment` | `slotData`, `patientId`, `patientDetails`| `{ bookingId, appointment: {...} }` | Commits atomic record in MongoDB with double-booking prevention. |
| `sendNotification` | `appointment`, `patient` | `{ emailSent, inAppAlertCreated }` | Dispatches email notification and generates verified in-app alert. |
| `searchAlternativeDoctors` | `specialty`, `city`, `excludedIds` | `{ alternativeDoctors: [...] }` | Identifies secondary specialists or alternate hospitals on rejection. |
| `retryAppointmentSearch` | `context`, `rejectedSlot` | `{ nextSlot, retryCount }` | Manages retry state and enforces safety ceiling ($n \le 5$). |

---

## 5. Universal Appointment Booking Engine

The universal appointment engine replaces legacy single-specialty booking:
1. **Dynamic Schedule Calculation:** Each specialist maintains working shifts (e.g., Mon–Sat, 09:00–17:00). Slots are calculated dynamically in 30-minute intervals.
2. **Occupancy Filtering:** Existing bookings on the target date with status `confirmed` are retrieved and excluded from available options.
3. **Double-Booking Prevention:** A partial composite unique index in MongoDB enforces database-level concurrency protection:
   ```javascript
   appointmentSchema.index(
     { doctorId: 1, appointmentDate: 1, appointmentTime: 1, status: 1 },
     { unique: true, partialFilterExpression: { status: 'confirmed' } }
   );
   ```
4. **Transparent Verification Hierarchy:**
   - **Verified Doctors:** Doctors with verified credentials linked to real facilities.
   - **Demo Simulation Doctors:** Clearly marked sample profiles ensuring zero fraudulent academic claims.

---

## 6. External Standards & Data Integrations

1. **OpenStreetMap Overpass API:** Live geospatial queries for hospitals and healthcare centers with latitude, longitude, and emergency tags.
2. **National Health Authority (ABDM):**
   - **Health Facility Registry (HFR):** Public facility ID validation (`IN.XX.YYY.NNNNN`) and portal inspection link generation.
   - **Healthcare Professionals Registry (HPR):** Practitioner ID format verification.
3. **HL7 FHIR R4 Standards:**
   - Standardized mapping of Doctor $\rightarrow$ `Practitioner`, Hospital $\rightarrow$ `Organization`, Appointment $\rightarrow$ `Appointment`.
   - Live connectivity and interoperability evaluation against public test server `https://hapi.fhir.org/baseR4`.
