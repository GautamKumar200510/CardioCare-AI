# CardioCare AI – Data Source & API Integration Audit

This audit document transparently details every data category, external API integration, authentication requirement, caching strategy, and verification status across the CardioCare AI platform.

---

## 1. External & Internal Data Sources Audit Matrix

| Category | Data Source / Provider | API Endpoint | Real / Simulated | Auth Requirement | Last Fetched / Verification Time | Safe to Call Live Data? | Notes & Academic Limitations |
| :--- | :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| **Hospitals (Discovery)** | OpenStreetMap (OSM) via Overpass API | `https://overpass-api.de/api/interpreter`, mirrors: `https://lz4.overpass-api.de/api/interpreter`, `https://z.overpass-api.de/api/interpreter` | **Real Live Data** | None (Public QL endpoint) | Real-time on search, cached in MongoDB with timestamp | **YES** | Queries real healthcare nodes, ways, and relations tagged `amenity=hospital`. Returns real GPS coordinates, street addresses, and emergency flags. |
| **Hospitals (Verification)** | ABDM Health Facility Registry (National Health Authority, India) | `https://facility.abdm.gov.in/` / ABDM Sandbox HFR Registry Gateway | **Real Public Registry (Explored & Linked)** | Client ID + Client Secret (ABDM Sandbox M1/M2/M3 Token) | Explored; public registry portal verification link active | **YES (for registry metadata); Read-only public directory** | Official ABDM API requires signed institutional registration and Sandbox onboarding. Public facility verification IDs are validated against official ABDM facility format. |
| **Doctors (Verification)** | ABDM Healthcare Professionals Registry (HPR) | `https://hpr.abdm.gov.in/` | **Real Public Registry (Verified IDs & Demo Simulation)** | ABDM API Token (Restricted to authorized health entities) | Real-time lookup link provided for public doctor registration IDs | **YES (via public verification check); Sample profiles marked demo** | Public doctor registries do not provide unrestricted open REST APIs for third-party shift schedules. Profiles without verified ABDM HPR numbers are explicitly flagged as `demo`. |
| **AI Intent Extraction** | Google Gemini Generative Language API | `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent` | **Real AI Model Output** | `GEMINI_API_KEY` (Free tier) | Real-time on user chat turn | **YES (when API key is present)** | Structured JSON output mode (`responseMimeType: "application/json"`). Temperature 0.1 for high determinism. |
| **AI Fallback** | Deterministic Regex & Rule-Based NLP Parser | Local Node.js execution (`aiProvider.js`) | **Deterministic Algorithm** | None (Local execution) | Instantaneous (< 5ms) | **YES (100% offline uptime)** | Activated automatically whenever `GEMINI_API_KEY` is unavailable, expired, or network-throttled. |
| **AI Alternative Fallback** | Groq Cloud API | `https://api.groq.com/openai/v1/chat/completions` (model: `llama-3.3-70b-versatile`) | **Real AI Model Output** | `GROQ_API_KEY` (Optional) | Real-time fallback if Gemini throws 429/500 | **YES (when configured)** | Returns structured JSON matching identical schema. |
| **Appointment Schedules** | Dynamic Slot Availability Engine | Local MongoDB `appointments` & `doctors` collections | **Deterministic Mathematical Engine (Simulated Availability)** | Local DB Authentication / Session | Dynamic per request | **NO (Simulated schedules for academic demo)** | Generates 30-minute candidate slots between configured working hours (9:00 - 19:00), minus confirmed bookings in MongoDB. Clearly designated as `demonstration` booking mode. |
| **Database Persistence** | MongoDB Database | `mongodb://127.0.0.1:27017/cardiocare_db` | **Real Persistent Database** | MongoDB URI credentials | Persistent across sessions | **YES** | Stores Users, Hospitals, Specialties, Doctors, Appointments, Conversations, and Notifications. Uses unique composite index to prevent duplicate slot bookings. |
| **Clinical Interoperability** | HAPI FHIR Public Test Server (HL7 FHIR R4) | `https://hapi.fhir.org/baseR4` | **Real Public Clinical Test Server** | None (Public FHIR R4 test sandbox) | Real-time query & bundle dispatch | **YES (for synthetic clinical workflows)** | Connects to international HL7 FHIR standard testbed to validate synthetic `Patient`, `Practitioner`, `HealthcareService`, and `Appointment` resources. |
| **Notifications** | Nodemailer SMTP + In-App Notification Store | Configured SMTP Host (e.g. Gmail / Mailgun / Ethereal) | **Real Email Delivery + Persistent In-App Store** | SMTP credentials | On appointment confirmation | **YES (In-App is 100% persistent; Email is active when SMTP configured)** | Never claims email was sent if SMTP transport fails; marks delivery status as `simulated` or `failed` transparently. |

---

## 2. Hardcoded vs Dynamic Element Audit

1. **Cardiology References:**
   - Previously, `specialty: 'cardiology'` was hardcoded in `AgentConversation.js`, `Doctor.js`, and `Landing.jsx`.
   - **Resolution:** Replaced with dynamic specialty extraction from a centralized 15-specialty catalog (`Specialty` schema and registry).
2. **Hospital Discovery:**
   - Real OSM Overpass QL queries run live against `overpass-api.de`.
   - A verified fallback dictionary (`FALLBACK_OSM_HOSPITALS`) containing authentic OpenStreetMap node and way IDs is maintained solely as a network resilience measure in case Overpass public servers throttle requests.
3. **Doctor Verification Status:**
   - Every doctor record includes `verificationStatus` (`verified` or `demo`), `verificationSource` (e.g. `ABDM Registry Link` or `Academic Simulation`), and `dataMode` (`live` or `synthetic`).
   - Doctors without verified registry data are visibly flagged as **Demo Simulation** in both the frontend UI and database.

---

## 3. Academic Integrity & Safety Statement
- No synthetic hospital names or fictitious coordinates are generated.
- Slot availability is strictly governed by configured schedule rules and persistent database checks.
- The system never claims to represent real hospital admission or hospital-confirmed appointments without an authorized hospital HIS/EMR integration.
