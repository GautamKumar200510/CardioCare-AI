const { extractStructuredIntent, matchSupportedSpecialty } = require('../ai/aiProvider');
const { searchHospitals } = require('../hospital/hospitalService');
const Doctor = require('../../models/Doctor');
const Specialty = require('../../models/Specialty');
const { getDoctorAvailableSlots } = require('../appointment/availabilityService');
const { rankAndSelectBestSlot } = require('../appointment/slotRankingService');
const { createAppointment } = require('../appointment/bookingService');
const { sendBookingConfirmationNotification } = require('../notification/emailService');

/**
 * Universal Multi-Specialty Autonomous Tool Registry
 * Implements the 12 discrete programmatic tools requested in Section 6.
 */
class ToolRegistry {
  /**
   * Tool 1: understandUserRequest()
   * Parses user natural language request into clinical intent and parameters
   */
  async understandUserRequest(input) {
    const startTime = Date.now();
    const result = await extractStructuredIntent(input.userPrompt);
    return {
      toolName: 'understandUserRequest',
      input: { userPrompt: input.userPrompt },
      output: result,
      decision: `Parsed user request. Intent: '${result.intent}', Specialty: '${result.specialty || 'Unspecified'}', Target Date: '${result.resolvedDate}', Time Constraint: '${result.timeAfter || 'None'}'`,
      executionTimeMs: Date.now() - startTime,
    };
  }

  // Alias for backward compatibility
  async extractAppointmentIntent(input) {
    return this.understandUserRequest(input);
  }

  /**
   * Tool 2: identifySpecialty()
   * Validates extracted specialty against supported 15 medical specialties catalog
   */
  async identifySpecialty(input) {
    const startTime = Date.now();
    const { specialtyCandidate } = input;
    const matched = matchSupportedSpecialty(specialtyCandidate);

    let specialtyDoc = null;
    if (matched) {
      specialtyDoc = await Specialty.findOne({ slug: matched.slug });
    }

    return {
      toolName: 'identifySpecialty',
      input: { specialtyCandidate },
      output: {
        isValid: Boolean(matched),
        matchedSpecialty: matched ? matched.name : null,
        slug: matched ? matched.slug : null,
        description: matched ? matched.description : null,
        specialtyId: specialtyDoc?._id || null,
      },
      decision: matched
        ? `Validated specialty '${matched.name}'. Matches catalog standard.`
        : `Specialty '${specialtyCandidate || 'Unknown'}' is ambiguous or unsupported. Clarification required.`,
      executionTimeMs: Date.now() - startTime,
    };
  }

  /**
   * Tool 3: detectMissingInformation()
   * Identifies missing location, patient name, phone, or specialty
   */
  async detectMissingInformation(input) {
    const startTime = Date.now();
    const { extractedIntent, userContext } = input;
    const missing = [];

    // Check Specialty
    if (!extractedIntent.specialty) {
      missing.push('specialty');
    }

    // Check Location / City
    if (!extractedIntent.location) {
      missing.push('location');
    }

    // Check Patient name
    const effectiveName = extractedIntent.patientName || userContext?.name;
    if (!effectiveName) {
      missing.push('patientName');
    }

    // Check Phone number
    const effectivePhone = extractedIntent.phone || userContext?.phone;
    if (!effectivePhone) {
      missing.push('phone');
    }

    return {
      toolName: 'detectMissingInformation',
      input: { extractedIntent, hasUserContext: Boolean(userContext) },
      output: {
        isComplete: missing.length === 0,
        missingFields: missing,
        effectivePatientName: effectiveName || null,
        effectivePhone: effectivePhone || null,
      },
      decision:
        missing.length === 0
          ? 'All clinical booking requirements are complete.'
          : `Missing clinical booking parameters: [${missing.join(', ')}]. Formulating targeted query.`,
      executionTimeMs: Date.now() - startTime,
    };
  }

  /**
   * Tool 4: searchHospitals()
   * Discovers real hospitals via OpenStreetMap Overpass API
   */
  async searchHospitals(input) {
    const startTime = Date.now();
    const city = input.location || 'Pune';
    const hospitals = await searchHospitals(city);

    return {
      toolName: 'searchHospitals',
      input: { city },
      output: {
        count: hospitals.length,
        hospitals: hospitals.map((h) => ({
          id: h._id,
          name: h.name,
          address: h.address,
          city: h.city,
          latitude: h.latitude,
          longitude: h.longitude,
          source: h.source,
          emergency: h.emergency,
          verificationStatus: h.verificationStatus || 'verified',
        })),
      },
      decision: `Discovered ${hospitals.length} authentic healthcare facilities in ${city} via OpenStreetMap Overpass API.`,
      executionTimeMs: Date.now() - startTime,
    };
  }

  /**
   * Tool 5: searchDoctorsBySpecialty()
   * Discovers qualified doctors matching the target specialty across hospitals
   */
  async searchDoctorsBySpecialty(input) {
    const startTime = Date.now();
    const { hospitalIds, specialty = 'General Medicine' } = input;

    let query = {
      specialty: new RegExp(`^${specialty}$`, 'i'),
    };

    if (hospitalIds && hospitalIds.length > 0) {
      query.hospitalId = { $in: hospitalIds };
    }

    let doctors = await Doctor.find(query).populate('hospitalId').populate('specialtyId');

    // If no exact match in specific hospitals, search across the entire city network for that specialty
    if (doctors.length === 0) {
      doctors = await Doctor.find({ specialty: new RegExp(`^${specialty}$`, 'i') }).populate('hospitalId').populate('specialtyId');
    }

    return {
      toolName: 'searchDoctorsBySpecialty',
      input: { specialty, hospitalCount: hospitalIds?.length || 0 },
      output: {
        count: doctors.length,
        doctors: doctors.map((d) => ({
          id: d._id,
          name: d.name,
          specialty: d.specialty,
          qualification: d.qualification,
          experience: d.experience,
          consultationFee: d.consultationFee,
          hospitalId: d.hospitalId?._id,
          hospitalName: d.hospitalId?.name,
          hospitalCity: d.hospitalId?.city,
          verificationStatus: d.verificationStatus,
          verificationSource: d.verificationSource,
        })),
      },
      decision: `Found ${doctors.length} specialists certified in '${specialty}'.`,
      executionTimeMs: Date.now() - startTime,
    };
  }

  // Alias for backward compatibility
  async searchCardiologists(input) {
    return this.searchDoctorsBySpecialty({ ...input, specialty: input.specialty || 'Cardiology' });
  }

  /**
   * Tool 6: checkDoctorAvailability()
   * Evaluates doctor schedules and existing bookings
   */
  async checkDoctorAvailability(input) {
    const startTime = Date.now();
    const { doctorIds, targetDate, timeAfter } = input;

    let allAvailableSlots = [];
    for (const docId of doctorIds) {
      try {
        const slots = await getDoctorAvailableSlots(docId, targetDate, timeAfter);
        allAvailableSlots.push(...slots);
      } catch (err) {
        console.warn(`[checkDoctorAvailability] Error getting slots for doctor ${docId}:`, err.message);
      }
    }

    return {
      toolName: 'checkDoctorAvailability',
      input: { doctorCount: doctorIds.length, targetDate, timeAfter },
      output: {
        totalSlotsFound: allAvailableSlots.length,
        slots: allAvailableSlots,
      },
      decision: `Evaluated schedules across ${doctorIds.length} doctors. Identified ${allAvailableSlots.length} open slots for ${targetDate}${timeAfter ? ` after ${timeAfter}` : ''}.`,
      executionTimeMs: Date.now() - startTime,
    };
  }

  // Alias
  async checkAvailability(input) {
    return this.checkDoctorAvailability(input);
  }

  /**
   * Tool 7: rankAvailableSlots()
   * Sorts slots ascending chronologically and picks earliest
   */
  async rankAvailableSlots(input) {
    const startTime = Date.now();
    const { candidateSlots, rejectedSignatures = [] } = input;

    const rankingResult = rankAndSelectBestSlot(candidateSlots, rejectedSignatures);

    return {
      toolName: 'rankAvailableSlots',
      input: { candidateCount: candidateSlots.length, rejectedCount: rejectedSignatures.length },
      output: rankingResult,
      decision: rankingResult.bestSlot
        ? `Earliest optimal slot selected: ${rankingResult.bestSlot.appointmentTime} with Dr. ${rankingResult.bestSlot.doctorName} at ${rankingResult.bestSlot.hospitalName}.`
        : 'All available candidate slots match previously rejected criteria.',
      executionTimeMs: Date.now() - startTime,
    };
  }

  // Alias
  async rankAppointmentSlots(input) {
    return this.rankAvailableSlots(input);
  }

  /**
   * Tool 8: requestUserConfirmation()
   * Formulates confirmation card requiring explicit user agreement
   */
  async requestUserConfirmation(input) {
    const startTime = Date.now();
    const { bestSlot, patientName, patientPhone } = input;

    const confirmationPayload = {
      doctorId: bestSlot.doctorId,
      doctorName: bestSlot.doctorName,
      doctorSpecialty: bestSlot.doctorSpecialty,
      consultationFee: bestSlot.consultationFee,
      hospitalId: bestSlot.hospitalId,
      hospitalName: bestSlot.hospitalName,
      hospitalAddress: bestSlot.hospitalAddress,
      appointmentDate: bestSlot.appointmentDate,
      appointmentTime: bestSlot.appointmentTime,
      patientName,
      patientPhone,
      bookingMode: bestSlot.isDemonstration ? 'Demonstration booking (Simulated)' : 'Verified hospital booking',
    };

    return {
      toolName: 'requestUserConfirmation',
      input: { slotTime: bestSlot.appointmentTime, doctorName: bestSlot.doctorName },
      output: confirmationPayload,
      decision: 'Formulated appointment confirmation payload. Awaiting explicit patient authorization before writing to MongoDB.',
      executionTimeMs: Date.now() - startTime,
    };
  }

  // Alias
  async requestPatientConfirmation(input) {
    return this.requestUserConfirmation(input);
  }

  /**
   * Tool 9: bookAppointment()
   * Atomically commits appointment to MongoDB
   */
  async bookAppointment(input) {
    const startTime = Date.now();
    const appointment = await createAppointment(input);

    return {
      toolName: 'bookAppointment',
      input: {
        doctorId: input.doctorId,
        appointmentDate: input.appointmentDate,
        appointmentTime: input.appointmentTime,
      },
      output: {
        bookingId: appointment.bookingId,
        id: appointment._id,
        status: appointment.status,
        appointmentDate: appointment.appointmentDate,
        appointmentTime: appointment.appointmentTime,
        doctorName: appointment.doctorId?.name,
        doctorSpecialty: appointment.doctorId?.specialty,
        hospitalName: appointment.hospitalId?.name,
      },
      decision: `Slot confirmed and persisted. Unique Booking ID: ${appointment.bookingId}`,
      executionTimeMs: Date.now() - startTime,
    };
  }

  // Alias
  async createAppointment(input) {
    return this.bookAppointment(input);
  }

  /**
   * Tool 10: sendNotification()
   */
  async sendNotification(input) {
    const startTime = Date.now();
    const { appointment, patientId } = input;

    const notification = await sendBookingConfirmationNotification(appointment, patientId);

    return {
      toolName: 'sendNotification',
      input: { bookingId: appointment.bookingId, userId: patientId },
      output: {
        notificationId: notification._id,
        channel: notification.type,
        status: notification.status,
        deliveryDetails: notification.deliveryDetails,
      },
      decision: `Dispatched notification via channel '${notification.type}' (Status: ${notification.status})`,
      executionTimeMs: Date.now() - startTime,
    };
  }

  /**
   * Tool 11: searchAlternativeDoctors()
   * Finds alternative doctors for the specialty when requested
   */
  async searchAlternativeDoctors(input) {
    const startTime = Date.now();
    const { allSlots, rejectedSlot, rejectedSignatures = [] } = input;

    const remaining = (allSlots || []).filter((s) => {
      const sig = `${s.doctorId}_${s.appointmentDate}_${s.appointmentTime}`;
      return !rejectedSignatures.includes(sig);
    });

    const ranked = rankAndSelectBestSlot(remaining, rejectedSignatures);

    return {
      toolName: 'searchAlternativeDoctors',
      input: { rejectedDoctorName: rejectedSlot?.doctorName, rejectedTime: rejectedSlot?.appointmentTime },
      output: {
        alternativeCount: ranked.rankedSlots.length,
        nextBestSlot: ranked.bestSlot,
      },
      decision: ranked.bestSlot
        ? `Found alternative slot: ${ranked.bestSlot.appointmentTime} with Dr. ${ranked.bestSlot.doctorName} at ${ranked.bestSlot.hospitalName}.`
        : 'No further alternative slots found under current constraints.',
      executionTimeMs: Date.now() - startTime,
    };
  }

  // Alias
  async searchAlternativeAppointments(input) {
    return this.searchAlternativeDoctors(input);
  }

  /**
   * Tool 12: retryAppointmentSearch()
   * Governs retry iterations
   */
  async retryAppointmentSearch(input) {
    const startTime = Date.now();
    const { conversation, reason } = input;

    const nextRetry = (conversation.retryCount || 0) + 1;

    return {
      toolName: 'retryAppointmentSearch',
      input: { currentRetryCount: conversation.retryCount, reason },
      output: {
        newRetryCount: nextRetry,
        maxRetriesReached: nextRetry > 5,
      },
      decision:
        nextRetry > 5
          ? 'Maximum automated retry ceiling reached (5). Halting autonomous loop.'
          : `Initiating search iteration #${nextRetry}. Reason: ${reason}`,
      executionTimeMs: Date.now() - startTime,
    };
  }

  // Alias
  async retryBookingWorkflow(input) {
    return this.retryAppointmentSearch(input);
  }
}

module.exports = new ToolRegistry();
