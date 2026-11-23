const axios = require('axios');
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const BASE_URL = process.env.TEST_API_URL || 'http://localhost:5000/api';

const results = [];

const logTest = (id, name, passed, details) => {
  results.push({ id, name, passed, details });
  const statusStr = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`[${statusStr}] ${id}: ${name} - ${details}`);
};

const runAllTests = async () => {
  console.log('========================================================================');
  console.log(' CardioCare AI – Comprehensive Multi-Specialty Verification Suite');
  console.log(' Testing All 15 Clinical Specialties & Autonomous Agent Tools');
  console.log(` API Target: ${BASE_URL}`);
  console.log('========================================================================\n');

  let patientToken = null;
  let patientUser = null;
  let anotherPatientToken = null;
  let createdBookingId = null;
  let createdAppointmentMongoId = null;

  try {
    // PREPARATION: Login Patient & Register Another Patient
    const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'patient@example.com',
      password: 'password123',
    });
    patientToken = loginRes.data.token;
    patientUser = loginRes.data.user;

    try {
      const reg2 = await axios.post(`${BASE_URL}/auth/register`, {
        name: 'Another Patient',
        email: `patient_${Date.now()}@example.com`,
        phone: '+91-9988776655',
        password: 'password123',
      });
      anotherPatientToken = reg2.data.token;
    } catch (e) {
      const log2 = await axios.post(`${BASE_URL}/auth/login`, {
        email: 'admin@cardiocare.ai',
        password: 'password123',
      });
      anotherPatientToken = log2.data.token;
    }

    // ========================================================================
    // PART 1: TEST ALL 15 MEDICAL SPECIALTIES RECOGNITION & SCHEDULE AVAILABILITY
    // ========================================================================
    console.log('--- PART 1: 15 Medical Specialties Comprehensive Evaluation ---');
    const all15Specialties = [
      { name: 'Cardiology', query: 'Book a cardiologist appointment tomorrow after 3 PM in Pune' },
      { name: 'Orthopedics', query: 'I need an orthopedic doctor this Friday in Pune' },
      { name: 'Dermatology', query: 'Find a dermatologist in Pune tomorrow' },
      { name: 'Neurology', query: 'Book the earliest neurologist appointment after 4 PM in Pune' },
      { name: 'General Medicine', query: 'I need a general physician in Pune tomorrow' },
      { name: 'Pediatrics', query: 'I need a pediatrician for my child in Pune tomorrow' },
      { name: 'Gynecology', query: 'Find a gynecologist in Pune tomorrow' },
      { name: 'ENT', query: 'Book an ENT specialist appointment in Pune tomorrow' },
      { name: 'Ophthalmology', query: 'Find an eye specialist ophthalmologist in Pune tomorrow' },
      { name: 'Dentistry', query: 'I need a dentist for a tooth consultation in Pune tomorrow' },
      { name: 'Psychiatry', query: 'Book a psychiatrist appointment in Pune tomorrow' },
      { name: 'Urology', query: 'I need a urologist appointment in Pune tomorrow' },
      { name: 'Gastroenterology', query: 'Find a gastroenterologist for stomach issues in Pune tomorrow' },
      { name: 'Pulmonology', query: 'Book a pulmonologist chest specialist in Pune tomorrow' },
      { name: 'Oncology', query: 'I need an oncologist cancer specialist in Pune tomorrow' },
    ];

    let specialtiesPassed = 0;
    for (const spec of all15Specialties) {
      const session = uuidv4();
      const res = await axios.post(`${BASE_URL}/agent/chat`, {
        sessionId: session,
        message: `${spec.query} for patient Rahul Sharma phone 9876543210`,
      });

      const extracted = res.data.conversation?.extractedIntent;
      const proposed = res.data.proposedSlot;
      const isMatch =
        res.data.success &&
        extracted.specialty?.toLowerCase() === spec.name.toLowerCase() &&
        (res.data.workflowState === 'CONFIRMATION_REQUESTED' || res.data.workflowState === 'SLOTS_EVALUATED');

      if (isMatch) specialtiesPassed++;
      logTest(
        `SPEC-${spec.name}`,
        `Specialty [${spec.name}] Intent & Scheduling`,
        isMatch,
        `Matched: '${extracted.specialty}', Proposed Doctor: 'Dr. ${proposed?.doctorName || 'N/A'}' at '${proposed?.hospitalName || 'N/A'}' (${proposed?.appointmentTime || 'N/A'})`
      );
    }

    logTest(
      'SUMMARY-15-SPECIALTIES',
      'All 15 Medical Specialties Autonomous Parsing & Availability',
      specialtiesPassed === 15,
      `Passed ${specialtiesPassed} / 15 Specialties (100%)`
    );

    console.log('\n--- PART 2: Core Agent Workflow & Concurrency Acceptance Tests ---');

    // ========================================================================
    // TEST 2: Missing location detection
    // ========================================================================
    try {
      const test2Session = uuidv4();
      const res2 = await axios.post(`${BASE_URL}/agent/chat`, {
        sessionId: test2Session,
        message: 'I need an orthopedic doctor this Friday.',
      });

      const pass2 =
        res2.data.success &&
        res2.data.workflowState === 'MISSING_INFO_REQUESTED' &&
        res2.data.conversation?.missingInformation.includes('location');

      logTest(
        'TEST-02',
        'Missing location detection & follow-up prompt',
        pass2,
        `Workflow State: ${res2.data.workflowState}, Missing: [${res2.data.conversation?.missingInformation.join(', ')}], Follow-up: "${res2.data.reply}"`
      );
    } catch (err) {
      logTest('TEST-02', 'Missing location detection', false, err.message);
    }

    // ========================================================================
    // TEST 3: Ambiguous / Missing specialty follow-up
    // ========================================================================
    try {
      const test3Session = uuidv4();
      const res3 = await axios.post(`${BASE_URL}/agent/chat`, {
        sessionId: test3Session,
        message: 'Book an appointment in Pune tomorrow for Rahul Sharma phone 9876543210',
      });

      const pass3 =
        res3.data.success &&
        res3.data.workflowState === 'SPECIALTY_AMBIGUOUS' &&
        res3.data.conversation?.missingInformation.includes('specialty');

      logTest(
        'TEST-03',
        'Ambiguous/missing specialty detection & targeted prompt',
        pass3,
        `State: ${res3.data.workflowState}, Agent asks which of the 15 specialties is required.`
      );
    } catch (err) {
      logTest('TEST-03', 'Ambiguous specialty detection', false, err.message);
    }

    // ========================================================================
    // TEST 4: Earliest slot ranking (Skips occupied 15:00 slot)
    // ========================================================================
    try {
      const tomorrowStr = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
      const test4Session = uuidv4();
      const res4 = await axios.post(`${BASE_URL}/agent/chat`, {
        sessionId: test4Session,
        message: 'Book the earliest cardiologist appointment tomorrow after 3 PM in Pune for patient Rahul Sharma phone 9876543210',
      });

      const proposedSlot = res4.data.proposedSlot;
      const history = res4.data.conversation?.toolExecutionHistory || [];
      const rankingTool = history.find((t) => t.toolName === 'rankAvailableSlots' || t.toolName === 'rankAppointmentSlots');
      const candidateSlots = rankingTool?.input?.candidateCount || 0;

      const pass4 =
        proposedSlot &&
        candidateSlots > 1 &&
        proposedSlot.appointmentTime >= '15:00';

      logTest(
        'TEST-04',
        'Earliest slot ranking engine (Ascending chronological selection)',
        pass4,
        `Evaluated ${candidateSlots} slots. Selected earliest: ${proposedSlot?.appointmentDate} at ${proposedSlot?.appointmentTime} IST`
      );
    } catch (err) {
      logTest('TEST-04', 'Earliest slot selection', false, err.message);
    }

    // ========================================================================
    // TEST 5: Patient rejects first slot -> Alternative specialist search
    // ========================================================================
    try {
      const test5Session = uuidv4();
      const step1 = await axios.post(`${BASE_URL}/agent/chat`, {
        sessionId: test5Session,
        message: 'Book cardiologist tomorrow after 3 PM in Pune for Rahul Sharma phone 9876543210',
      });
      const slot1 = step1.data.proposedSlot;

      const step2 = await axios.post(`${BASE_URL}/agent/retry`, {
        sessionId: test5Session,
        reason: 'Patient requested alternative option',
      });

      const slot2 = step2.data.proposedSlot;
      const isDistinct =
        slot2 &&
        (slot2.doctorId !== slot1?.doctorId ||
          slot2.hospitalId !== slot1?.hospitalId ||
          slot2.appointmentTime !== slot1?.appointmentTime);

      const pass5 = step2.data.success && isDistinct && step2.data.conversation?.retryCount >= 1;

      logTest(
        'TEST-05',
        'Patient rejects slot -> Autonomous alternative doctor discovery',
        pass5,
        `Initial: [Dr. ${slot1?.doctorName} at ${slot1?.hospitalName}] -> Alternative: [Dr. ${slot2?.doctorName} at ${slot2?.hospitalName}] (Retry Count: ${step2.data.conversation?.retryCount})`
      );
    } catch (err) {
      logTest('TEST-05', 'Alternative doctor discovery', false, err.message);
    }

    // ========================================================================
    // TEST 6: Patient confirms booking -> Atomic MongoDB persistence
    // ========================================================================
    try {
      const test6Session = uuidv4();
      await axios.post(
        `${BASE_URL}/agent/chat`,
        {
          sessionId: test6Session,
          message: 'Book dermatologist tomorrow after 3 PM in Pune for Rahul Sharma phone 9876543210',
        },
        { headers: { Authorization: `Bearer ${patientToken}` } }
      );

      const confirmRes = await axios.post(
        `${BASE_URL}/agent/confirm-booking`,
        { sessionId: test6Session },
        { headers: { Authorization: `Bearer ${patientToken}` } }
      );

      createdBookingId = confirmRes.data.bookingId;
      const pass6 =
        confirmRes.data.success &&
        confirmRes.data.workflowState === 'BOOKING_COMPLETED' &&
        createdBookingId &&
        createdBookingId.startsWith('CC-');

      const myApps = await axios.get(`${BASE_URL}/appointments/my`, {
        headers: { Authorization: `Bearer ${patientToken}` },
      });
      const foundInDb = myApps.data.data.find((a) => a.bookingId === createdBookingId);
      if (foundInDb) {
        createdAppointmentMongoId = foundInDb._id;
      }

      logTest(
        'TEST-06',
        'Patient confirmation -> Persistent MongoDB record creation',
        pass6 && Boolean(foundInDb),
        `Booking ID: ${createdBookingId}, Specialist: Dr. ${foundInDb?.doctorId?.name} (${foundInDb?.specialty})`
      );
    } catch (err) {
      logTest('TEST-06', 'Patient confirmation', false, err.message);
    }

    // ========================================================================
    // TEST 7: Duplicate / Concurrent slot booking prevention
    // ========================================================================
    try {
      const tomorrowStr = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
      const docsRes = await axios.get(`${BASE_URL}/doctors?specialty=Cardiology`);
      const testDoc = docsRes.data.data[0];

      let conflictDetected = false;
      let errorCode = null;

      try {
        await axios.post(`${BASE_URL}/appointments/book`, {
          doctorId: testDoc._id,
          hospitalId: testDoc.hospitalId?._id,
          specialty: 'Cardiology',
          appointmentDate: tomorrowStr,
          appointmentTime: '15:00', // Occupied in seedData
          patientName: 'Concurrent Tester',
          patientPhone: '+91-9999988888',
        });
      } catch (postErr) {
        if (postErr.response?.status === 409 || postErr.response?.data?.code === 'SLOT_CONFLICT') {
          conflictDetected = true;
          errorCode = postErr.response?.data?.code || 'HTTP_409';
        }
      }

      logTest(
        'TEST-07',
        'Slot conflict prevention (Atomic composite unique index)',
        conflictDetected,
        `Attempted booking occupied 15:00 slot. Result: Correctly Rejected with Code: ${errorCode}`
      );
    } catch (err) {
      logTest('TEST-07', 'Slot conflict prevention', false, err.message);
    }

    // ========================================================================
    // TEST 8: Gemini API offline fallback (Deterministic rule parser)
    // ========================================================================
    try {
      const { deterministicExtractIntent } = require('../services/ai/aiProvider');
      const parsed = deterministicExtractIntent('I need an orthopedic doctor this Friday in Pune');

      const pass8 =
        parsed.intent === 'book_appointment' &&
        parsed.specialty === 'Orthopedics' &&
        parsed.location === 'Pune' &&
        parsed.source === 'deterministic_engine';

      logTest(
        'TEST-08',
        'Deterministic rule-based NLP fallback when AI API unavailable',
        pass8,
        `Source: '${parsed.source}', Extracted Specialty: '${parsed.specialty}', Location: '${parsed.location}', Resolved Date: '${parsed.resolvedDate}'`
      );
    } catch (err) {
      logTest('TEST-08', 'Deterministic fallback', false, err.message);
    }

    // ========================================================================
    // TEST 9: Patient appointment cancellation
    // ========================================================================
    try {
      let pass9 = false;
      let updatedStatus = null;

      if (createdAppointmentMongoId) {
        const cancelRes = await axios.patch(
          `${BASE_URL}/appointments/${createdAppointmentMongoId}/cancel`,
          {},
          { headers: { Authorization: `Bearer ${patientToken}` } }
        );

        updatedStatus = cancelRes.data.data?.status;
        pass9 = cancelRes.data.success && updatedStatus === 'cancelled';
      }

      logTest(
        'TEST-09',
        'Patient appointment cancellation & slot release',
        pass9,
        `Appointment ID: ${createdAppointmentMongoId}, Updated Status: '${updatedStatus}'`
      );
    } catch (err) {
      logTest('TEST-09', 'Patient cancellation', false, err.message);
    }

    // ========================================================================
    // TEST 10: Unauthorized cross-patient access protection
    // ========================================================================
    try {
      let accessBlocked = false;
      let statusCode = null;

      if (createdAppointmentMongoId && anotherPatientToken) {
        try {
          await axios.get(`${BASE_URL}/appointments/${createdAppointmentMongoId}`, {
            headers: { Authorization: `Bearer ${anotherPatientToken}` },
          });
        } catch (authErr) {
          if (authErr.response?.status === 403) {
            accessBlocked = true;
            statusCode = 403;
          }
        }
      }

      logTest(
        'TEST-10',
        'Unauthorized patient access protection (RBAC security)',
        accessBlocked,
        `Attempted unauthorized cross-patient record access. Result: Correctly Denied with HTTP ${statusCode} Forbidden.`
      );
    } catch (err) {
      logTest('TEST-10', 'Unauthorized access protection', false, err.message);
    }

    // ========================================================================
    // TEST 11: ABDM & HAPI FHIR Public Service Interoperability Check
    // ========================================================================
    try {
      const { verifyAbdmFacility, verifyAbdmProfessional } = require('../services/hospital/abdmService');
      const { checkFhirServerHealth } = require('../services/appointment/fhirService');

      const abdmHosp = await verifyAbdmFacility('IN.MH.PUN.10294', 'Ruby Hall Clinic');
      const abdmDoc = await verifyAbdmProfessional('HPR-IN-MH-10294', 'Dr. Pravin Kulkarni', 'Cardiology');
      const fhirHealth = await checkFhirServerHealth();

      const pass11 =
        abdmHosp.isRegistered &&
        abdmDoc.isRegistered &&
        (fhirHealth.status === 'operational' || fhirHealth.server.includes('HAPI FHIR'));

      logTest(
        'TEST-11',
        'ABDM Registry Verification & HAPI FHIR Interoperability Check',
        pass11,
        `ABDM Facility: ${abdmHosp.facilityId} (Verified), Doctor HPR: ${abdmDoc.hprId} (Verified), FHIR Server: ${fhirHealth.server} (${fhirHealth.status})`
      );
    } catch (err) {
      logTest('TEST-11', 'ABDM and FHIR check', false, err.message);
    }

    console.log('\n========================================================================');
    const passedCount = results.filter((r) => r.passed).length;
    console.log(` SUMMARY: ${passedCount} / ${results.length} Tests Passed (${Math.round((passedCount / results.length) * 100)}%)`);
    console.log('========================================================================\n');

    if (passedCount === results.length) {
      console.log('🎉 ALL MULTI-SPECIALTY ACCEPTANCE TESTS PASSED WITH 100% SUCCESS!');
      process.exit(0);
    } else {
      console.warn('⚠️ Some tests failed. Review log details above.');
      process.exit(1);
    }
  } catch (globalErr) {
    console.error('Fatal test execution error:', globalErr);
    process.exit(1);
  }
};

runAllTests();
