# CardioCare AI – Screenshot & Visual Evidence Checklist
**Project:** CardioCare AI – Multi-Specialty Autonomous Hospital Appointment Booking Agent  
**Purpose:** Mapping visual proof to Academic Project Report (Page 8) and Final Jury Slide Deck (Slide 12)

---

## 1. Master Evidence Mapping Table

The table below maps each application interface to its exact report figure, presentation slide, captured functionality, and verification criteria:

| Figure # | Target Filename | Page Route | Report Page | PPT Slide | Mandatory Features Visible in Screenshot | Verification Criteria |
| :---: | :--- | :--- | :---: | :---: | :--- | :--- |
| **Fig 8.1** | `01_landing_page.png` | `/` | Page 8 | Slide 12 | Clean centered Hero section, "Your Intelligent Multi-Specialty Healthcare Appointment Assistant" headline, action buttons ("Start AI Booking", "Doctors & Specialists", "Explore Hospitals"), and the 15 Medical Specialties grid. | Verifies modern aesthetic and 15 clinical domains. |
| **Fig 8.2** | `02_patient_dashboard.png` | `/dashboard` | Page 8 | Slide 12 | Patient greeting ("Welcome back, [Name]!"), top metric summary cards (Total, Upcoming, Completed, Cancelled Appointments), quick action shortcuts, and upcoming appointment cards. | Verifies personalized patient portal metrics. |
| **Fig 8.3** | `03_agent_chat_timeline.png` | `/agent` | Page 8 | Slide 9, 12 | Left: Conversational multi-turn chat with candidate slot proposal card (Doctor, Hospital, Fee, Time). Right: **Agent Activity Timeline** showing active tool execution, millisecond latencies, inputs/outputs JSON. | **Primary Jury Evidence**: Proves agentic multi-tool calling vs static chatbot. |
| **Fig 8.4** | `04_hospital_osm_discovery.png` | `/hospitals` | Page 8 | Slide 4, 12 | Interactive **Leaflet OpenStreetMap** view with real hospital marker pins in Pune/Mumbai, city selector dropdown, hospital cards with real addresses, and OSM attribution. | Proves 100% authentic geospatial hospital integration. |
| **Fig 8.5** | `05_doctors_directory.png` | `/doctors` | Page 8 | Slide 12 | Horizontal 15-specialty filter pill bar (All, Cardiology, Orthopedics, Dermatology, etc.), city filter, verification status filter (`Verified` vs `Demo Simulation`), doctor qualification & fee. | Proves multi-specialty roster & data transparency. |
| **Fig 8.6** | `06_universal_booking.png` | `/book` | Page 8 | Slide 6, 12 | Multi-specialty dropdown, cascading hospital & doctor selection, calendar date picker, dynamic 30-minute slot grid with occupied slots disabled, and patient details form. | Proves dynamic availability calculation engine. |
| **Fig 8.7** | `07_universal_login.png` | `/login` | Page 8 | Slide 12 | Modern patient sign-in card with Email Address, Password, optional Full Name field, "Universal Access" green badge, and clean submit button (no restricted demo buttons). | Proves frictionless universal authentication. |
| **Fig 8.8** | `08_my_appointments.png` | `/appointments` | Page 8 | Slide 12 | Confirmed appointment cards with specialty badges, booking reference ID (`CC-YYYYMMDD-XXXX`), status indicators, "Cancel Appointment" button, and "Print Pass" button. | Proves persistent MongoDB records and RBAC. |
| **Fig 8.9** | `09_analytics_charts.png` | `/analytics` | Page 8 | Slide 12 | Recharts SVG visualizations: 15-Specialty Booking Distribution bar chart, Appointment Status Breakdown donut chart, and 7-Day Scheduling Volume trend chart. | Proves dynamic database aggregation across 15 fields. |
| **Fig 8.10**| `10_test_suite_console.png` | Terminal | Page 9 | Slide 13 | Terminal console showing execution of `node server/tests/runAllTests.js` with `26 / 26 Tests Passed (100% Pass Rate)`. | Proves rigorous automated academic verification. |

---

## 2. Screenshot Capture Instructions for Group Members

To capture production-quality screenshots for the final submission:

1. **Resolution & Viewport:**
   - Use Google Chrome or Microsoft Edge at standard 100% zoom (1920x1080 desktop resolution).
   - Ensure the application is actively running: Client at `http://localhost:3000` and Server at `http://localhost:5000`.

2. **Step-by-Step Capture Guide:**

   - **Screenshot 1 (`01_landing_page.png`):**
     - Navigate to `http://localhost:3000/`.
     - Capture the clean hero section and scroll slightly to capture the 15-specialty showcase grid.

   - **Screenshot 2 (`02_patient_dashboard.png`):**
     - Sign in and navigate to `http://localhost:3000/dashboard`.
     - Ensure metrics show at least 1 upcoming appointment.

   - **Screenshot 3 (`03_agent_chat_timeline.png`) [CRITICAL FOR JURY]:**
     - Navigate to `http://localhost:3000/agent`.
     - In the chat box, send: *"Book the earliest cardiologist appointment tomorrow after 3 PM in Pune for Rahul Sharma phone 9876543210"*.
     - Allow the agent to finish execution. Expand one tool step in the right-hand **Agent Activity Inspector** to display raw input/output JSON.
     - Capture the entire split view (Chat on left, 12-Tool Inspector on right).

   - **Screenshot 4 (`04_hospital_osm_discovery.png`):**
     - Navigate to `http://localhost:3000/hospitals`.
     - Ensure the Leaflet map has loaded tiles and hospital marker pins are visible.

   - **Screenshot 5 (`05_doctors_directory.png`):**
     - Navigate to `http://localhost:3000/doctors`.
     - Click on the "Orthopedics" or "Dermatology" filter pill to demonstrate dynamic multi-specialty filtering.

   - **Screenshot 6 (`06_universal_booking.png`):**
     - Navigate to `http://localhost:3000/book`.
     - Select a specialty (e.g. "Cardiology"), a hospital, and a doctor to reveal the calculated 30-minute slot buttons.

   - **Screenshot 7 (`07_universal_login.png`):**
     - Open an Incognito window or log out, then navigate to `http://localhost:3000/login`.
     - Capture the clean universal login form with the green universal access notice.

   - **Screenshot 8 (`08_my_appointments.png`):**
     - Navigate to `http://localhost:3000/appointments`.
     - Capture the confirmed appointment cards. Click "Print Pass" to display the printable modal if desired.

   - **Screenshot 9 (`09_analytics_charts.png`):**
     - Navigate to `http://localhost:3000/analytics`.
     - Capture the charts showing the 15-specialty distribution and status breakdown.

   - **Screenshot 10 (`10_test_suite_console.png`):**
     - Open PowerShell or Terminal in `cardiocare-ai/server` and run `node tests/runAllTests.js`.
     - Capture the green summary box: `SUMMARY: 26 / 26 Tests Passed (100%)`.

3. **Storage Location:**
   - Save all captured PNG images in the directory: `docs/screenshots/`.
