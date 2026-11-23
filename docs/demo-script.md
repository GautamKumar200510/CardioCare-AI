# CardioCare AI – 3-Minute Demonstration Script
## Multi-Specialty Autonomous Hospital Appointment Booking Agent

**Video Demonstration Guide for Project Jury & Academic Evaluation**
- **Duration:** 3 Minutes (180 Seconds)
- **Target Audience:** University Evaluators, Technical Jury, Healthcare Innovators

---

### Timing Breakdown & Action Cues

#### [0:00 - 0:30] Introduction & Multi-Specialty Vision
- **On Screen:** Landing Page (`http://localhost:3000`). Scroll through the Hero section, the **15 Medical Specialties** showcase grid (Cardiology, Orthopedics, Dermatology, Neurology, Pediatrics, etc.), and How It Works.
- **Speaker:** 
  > *"Good morning, respected evaluators. Today we present CardioCare AI — an autonomous multi-specialty hospital appointment booking agent. Unlike static chatbots that merely answer FAQs, CardioCare AI is an agentic system that understands natural language clinical requests across 15 medical specialties and executes multi-step programmatic workflows to schedule appointments in real healthcare facilities."*

#### [0:30 - 1:15] Multi-Specialty Natural Language Scheduling & Missing Info
- **On Screen:** Navigate to `/agent`. Click the suggested chip or type: *"I need an orthopedic doctor this Friday in Pune for Rahul Sharma phone 9876543210"*.
- **Speaker:**
  > *"Let's test an orthopedic request: 'I need an orthopedic doctor this Friday in Pune.' The agent understands the clinical specialty as Orthopedics, resolves this Friday's date in the Asia/Kolkata timezone, queries real Pune hospitals using the OpenStreetMap Overpass API, and checks specialist schedules."*
- **On Screen:** Now type an incomplete query: *"Book a dermatologist appointment tomorrow"*.
- **Speaker:**
  > *"Notice what happens when information is missing: instead of hallucinating, the agent detects that the location is missing and asks: 'Which city or area should I search in?' And if a query is completely ambiguous like 'Book an appointment tomorrow', the agent prompts the user to select from our 15 supported clinical specialties."*

#### [1:15 - 1:55] 12-Tool Activity Inspector & Mandatory Confirmation
- **On Screen:** Type *"Pune"*. Watch the right-hand **Agent Activity Inspector** live timeline. Expand a tool step to reveal raw input and output JSON.
- **Speaker:**
  > *"Look at the right-hand Agent Activity Inspector. In real time, the agent executes our 12-tool registry: understanding the request, identifying the specialty, searching OSM hospitals, pulling verified and simulation doctors, evaluating 30-minute intervals, and mathematically ranking the earliest slot."*
- **On Screen:** Show the generated candidate slot card (e.g., Dr. Ananya Rao or Dr. Rajesh Gokhale).
- **Speaker:**
  > *"Crucially, CardioCare AI enforces a strict safety protocol: it will NEVER create an appointment without explicit patient authorization. We click 'Confirm Appointment' — and atomically, MongoDB creates the booking with a unique reference number, preventing concurrent double-booking."*

#### [1:55 - 2:30] Doctors & Specialists Directory & OpenStreetMap Discovery
- **On Screen:** Click **Doctors & Specialists** in the navigation bar. Demonstrate filtering by specialty pill (e.g. click "Dermatology", "Pediatrics", "Cardiology"), city, and verification status (`Verified` vs `Demo Simulation`).
- **Speaker:**
  > *"Next, we explore our universal Doctors & Specialists directory. Users can filter across all 15 medical specialties, hospital affiliations, and cities. Profiles are transparently categorized as verified or academic demonstration simulation profiles, adhering to our published data source audit."*
- **On Screen:** Click **Hospitals (OSM)**. Show the interactive Leaflet map with real hospital markers in Pune and other cities.
- **Speaker:**
  > *"Under Hospitals, we see real-world facilities queried directly from OpenStreetMap Overpass API, with verified GPS coordinates and emergency attributes."*

#### [2:30 - 2:45] My Appointments & Printable PDF Pass
- **On Screen:** Navigate to **My Appointments** (`/appointments`). Show the confirmed appointment card with specialty badge. Click **Print Pass**.
- **Speaker:**
  > *"In My Appointments, patients can review their bookings, cancel visits to instantly release slots back to the pool, or print an official clinical appointment pass."*

#### [2:45 - 3:00] 26/26 Automated Test Matrix & Conclusion
- **On Screen:** Show the automated test suite console output: `26 / 26 Tests Passed (100%)`.
- **Speaker:**
  > *"CardioCare AI has been validated against 26 comprehensive automated tests across all 15 specialties, ABDM registry verification, HAPI FHIR interoperability, and atomic concurrency locks. Thank you, and we welcome your questions."*
