# CardioCare AI – Team Contribution & Evaluation Breakdown
## Multi-Specialty Autonomous Hospital Appointment Booking Agent

This document outlines individual role assignments, feature ownership, and evaluation criteria for the academic development team.

---

### Team Member 1: Agentic AI Engineer & System Architect
- **Name:** [Editable Placeholder: Student Name 1]
- **Role:** Agentic AI Engineer & System Architect
- **Assigned Modules:**
  - Designed the **12-Tool Agent Registry** (`server/services/agent/toolRegistry.js`) supporting all 15 clinical specialties.
  - Implemented the Multi-Turn Agent Orchestrator with state machine transitions including `SPECIALTY_AMBIGUOUS` and `MISSING_INFO_REQUESTED` (`agentOrchestrator.js`).
  - Built the dual-mode AI pipeline: Google Gemini API integration with deterministic rule-based NLP fallback (`aiProvider.js`) supporting 15 specialties and colloquial synonyms.
  - Integrated dynamic `Asia/Kolkata` timezone temporal resolution for relative dates (*tomorrow*, *this Friday*, *next Monday*) and time constraints (*after 3 PM* $\rightarrow$ `15:00`).
  - Authored automated tests for all 15 clinical specialties and ambiguous request handling.

---

### Team Member 2: Backend Developer & Database Architect
- **Name:** [Editable Placeholder: Student Name 2]
- **Role:** Backend Developer & Database Architect
- **Assigned Modules:**
  - Designed MongoDB schema and Mongoose models across all entities (`Specialty`, `User`, `Hospital`, `Doctor`, `Appointment`, `AgentConversation`, `Notification`).
  - Implemented atomic unique composite indexes to prevent concurrent double-booking conflicts (`SLOT_CONFLICT`).
  - Developed Express REST API controllers for authentication, specialties (`/api/specialties`), doctors, hospitals, and appointment booking.
  - Implemented JWT authentication, password hashing with bcrypt, and Role-Based Access Control (RBAC).
  - Authored Test Scenarios for database persistence, conflict prevention, cancellation, and authorization security.

---

### Team Member 3: External Data & Standards Engineer
- **Name:** [Editable Placeholder: Student Name 3]
- **Role:** External API & Healthcare Standards Specialist
- **Assigned Modules:**
  - Connected and integrated the OpenStreetMap Overpass API for live healthcare facility discovery (`overpassService.js`) with MongoDB caching.
  - Developed the **ABDM Registry Service** (`abdmService.js`) for Health Facility Registry (HFR) and Healthcare Professionals Registry (HPR) format validation.
  - Developed the **HL7 FHIR R4 Service** (`fhirService.js`) and verified interoperability against the public HAPI FHIR R4 test server.
  - Authored the comprehensive **Data Source Audit** (`DATA_SOURCE_AUDIT.md`) detailing authentication, rate limits, and verification requirements.
  - Built the Earliest Availability & Slot Ranking Engine across multi-specialty doctor schedules.

---

### Team Member 4: Frontend & UI/UX Design Specialist
- **Name:** [Editable Placeholder: Student Name 4]
- **Role:** Frontend & UI/UX Specialist
- **Assigned Modules:**
  - Developed the modern React 18 Single Page Application using Vite and Tailwind CSS.
  - Implemented the 15-specialty showcase grid on the Landing Page and updated navigation.
  - Upgraded the **Doctors & Specialists Directory** (`/doctors`) with horizontal specialty filter pill bar, city filter, and verification tier filtering (`Verified` vs `Demo Simulation`).
  - Built the conversational `AgentChat` interface with multi-specialty quick prompts and the live `AgentTimeline` 12-tool inspector.
  - Upgraded the **Universal Booking Engine** (`/book`) allowing direct booking across all 15 specialties with dynamic slot calculation.
  - Built Recharts data analytics dashboards for appointment distribution across all 15 specialties and 7-day booking trends.
