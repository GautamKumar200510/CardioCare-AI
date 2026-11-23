const AgentConversation = require('../../models/AgentConversation');
const User = require('../../models/User');
const toolRegistry = require('./toolRegistry');

/**
 * Universal Multi-Specialty Autonomous Agent Orchestrator
 * Coordinates multi-turn conversation across all 15 clinical specialties,
 * executes 12 discrete tools, and handles conflict-free booking confirmation.
 */
class AgentOrchestrator {
  /**
   * Process a user turn in the agent conversation
   */
  async processUserMessage({ sessionId, userId, userMessage }) {
    // 1. Retrieve or initialize conversation document from MongoDB
    let conversation = await AgentConversation.findOne({ sessionId });
    if (!conversation) {
      conversation = new AgentConversation({
        sessionId,
        userId: userId || null,
        messages: [],
        workflowState: 'IDLE',
        extractedIntent: {},
        toolExecutionHistory: [],
        rejectedSlots: [],
      });
    }

    // Load patient context if authenticated
    let userContext = null;
    if (userId) {
      userContext = await User.findById(userId).select('name phone email');
    }

    // Append user message
    conversation.messages.push({
      sender: 'user',
      text: userMessage,
      timestamp: new Date(),
    });

    const currentExecutionBatch = [];

    // Tool 1: understandUserRequest()
    const understandResult = await toolRegistry.understandUserRequest({
      userPrompt: userMessage,
    });
    currentExecutionBatch.push(understandResult);
    conversation.toolExecutionHistory.push(understandResult);

    const newIntent = understandResult.output;

    // Check if the user is confirming a pending proposed slot
    const isAffirmative =
      newIntent.intent === 'confirm_booking' ||
      /^(yes|confirm|book it|proceed|ok|sure|please book|confirm appointment)$/i.test(userMessage.trim());

    const isRejection =
      newIntent.intent === 'reject_slot' ||
      /^(no|reject|different|another|show another|alternative|next|different doctor|other)$/i.test(userMessage.trim());

    if (conversation.workflowState === 'CONFIRMATION_REQUESTED' && conversation.currentProposedSlot) {
      if (isAffirmative) {
        return await this.handleBookingConfirmation(conversation, userContext, currentExecutionBatch);
      } else if (isRejection) {
        return await this.handleBookingRejection(conversation, userContext, currentExecutionBatch);
      }
    }

    // Tool 2: identifySpecialty()
    const specialtyCandidate = newIntent.specialty || conversation.extractedIntent?.specialty;
    const specialtyResult = await toolRegistry.identifySpecialty({ specialtyCandidate });
    currentExecutionBatch.push(specialtyResult);
    conversation.toolExecutionHistory.push(specialtyResult);

    // Merge extracted parameters with conversation state
    const currentIntent = conversation.extractedIntent || {};
    conversation.extractedIntent = {
      intent: newIntent.intent !== 'unknown' ? newIntent.intent : currentIntent.intent || 'book_appointment',
      specialty: specialtyResult.output.isValid ? specialtyResult.output.matchedSpecialty : currentIntent.specialty || null,
      specialtySlug: specialtyResult.output.isValid ? specialtyResult.output.slug : currentIntent.specialtySlug || null,
      date: newIntent.date || currentIntent.date || 'tomorrow',
      resolvedDate: newIntent.resolvedDate || currentIntent.resolvedDate,
      timeAfter: newIntent.timeAfter || currentIntent.timeAfter,
      timePreference: newIntent.timePreference || currentIntent.timePreference,
      location: newIntent.location || currentIntent.location || null,
      patientName: newIntent.patientName || currentIntent.patientName || null,
      phone: newIntent.phone || currentIntent.phone || null,
    };

    // Context-aware extraction of missing parameters in multi-turn dialogue
    if (!conversation.extractedIntent.location) {
      const trimmed = userMessage.trim();
      const knownCities = ['pune', 'mumbai', 'delhi', 'bangalore', 'hyderabad', 'chennai', 'kolkata'];
      for (const city of knownCities) {
        if (new RegExp(`\\b${city}\\b`, 'i').test(trimmed)) {
          conversation.extractedIntent.location = city.charAt(0).toUpperCase() + city.slice(1).toLowerCase();
          break;
        }
      }
    }

    if (!conversation.extractedIntent.phone) {
      const phoneMatch = userMessage.match(/(?:phone|contact|mobile|call)?[:\s]*((?:\+91[\-\s]?)?[6789]\d{9})/i);
      if (phoneMatch) {
        conversation.extractedIntent.phone = phoneMatch[1];
      }
    }

    if (!conversation.extractedIntent.patientName) {
      // 1. Try 2-word proper noun
      const capMatch = userMessage.match(/\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)\b/);
      if (capMatch) {
        const candidate = capMatch[1].trim();
        const forbidden = ['pune maharashtra', 'ruby hall', 'deenanath mangeshkar', 'jehangir hospital', 'heart center'];
        if (!forbidden.includes(candidate.toLowerCase())) {
          conversation.extractedIntent.patientName = candidate;
        }
      }

      // 2. If userMessage is a direct reply with just a name (e.g. "rahul sharma" or "Rahul Sharma")
      if (!conversation.extractedIntent.patientName) {
        let stripped = userMessage
          .replace(/(?:\+91[\-\s]?)?[6789]\d{9}/g, '')
          .replace(/\b(phone|number|contact|mobile|my|name|is|patient|for)\b[:\s]*/gi, '')
          .replace(/[,;:]+/g, ' ')
          .trim();
        const words = stripped.split(/\s+/).filter(w => w.length > 1 && !/^(tomorrow|today|after|at|in|pune|mumbai|delhi|bangalore|cardiology|orthopedics)$/i.test(w));
        if (words.length >= 1 && words.length <= 3 && /^[a-zA-Z\s]+$/.test(words.join(' '))) {
          conversation.extractedIntent.patientName = words
            .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
            .join(' ');
        }
      }
    }

    // Tool 3: detectMissingInformation()
    const missingInfoResult = await toolRegistry.detectMissingInformation({
      extractedIntent: conversation.extractedIntent,
      userContext,
    });
    currentExecutionBatch.push(missingInfoResult);
    conversation.toolExecutionHistory.push(missingInfoResult);

    conversation.missingInformation = missingInfoResult.output.missingFields;

    // Handle missing parameters conversationally
    if (!missingInfoResult.output.isComplete) {
      let agentResponseText = '';

      if (conversation.missingInformation.includes('specialty')) {
        conversation.workflowState = 'SPECIALTY_AMBIGUOUS';
        agentResponseText =
          "I can help you schedule an appointment with a specialist. Which medical specialty do you need? (For example: Cardiology, Orthopedics, Dermatology, Neurology, Pediatrics, Gynecology, ENT, Ophthalmology, Dentistry, General Medicine, Psychiatry, Urology, Gastroenterology, Pulmonology, or Oncology).";
      } else if (conversation.missingInformation.includes('location')) {
        conversation.workflowState = 'MISSING_INFO_REQUESTED';
        agentResponseText =
          `I can help you find the earliest available ${conversation.extractedIntent.specialty} appointment. Which city or area should I search in?`;
      } else if (
        conversation.missingInformation.includes('patientName') ||
        conversation.missingInformation.includes('phone')
      ) {
        conversation.workflowState = 'MISSING_INFO_REQUESTED';
        agentResponseText = `Great. I found healthcare centers in ${conversation.extractedIntent.location} offering ${conversation.extractedIntent.specialty} care. Before proceeding, please provide your full name and contact number.`;
      }

      conversation.messages.push({
        sender: 'agent',
        text: agentResponseText,
        timestamp: new Date(),
        metadata: {
          workflowState: conversation.workflowState,
          missingFields: conversation.missingInformation,
        },
      });

      await conversation.save();

      return {
        reply: agentResponseText,
        workflowState: conversation.workflowState,
        conversation,
        currentTools: currentExecutionBatch,
        proposedSlot: null,
      };
    }

    // All information complete -> Execute Autonomous Multi-Specialty Pipeline
    return await this.executeAutonomousSearchPipeline(conversation, missingInfoResult.output, currentExecutionBatch);
  }

  /**
   * Autonomous Pipeline: Hospital Discovery -> Doctor Search -> Slot Evaluation -> Earliest Ranking -> Confirmation Request
   */
  async executeAutonomousSearchPipeline(conversation, resolvedInfo, currentExecutionBatch) {
    const city = conversation.extractedIntent.location || 'Pune';
    const specialty = conversation.extractedIntent.specialty || 'Cardiology';
    const targetDate = conversation.extractedIntent.resolvedDate || require('../ai/aiProvider').resolveDateInKolkata('tomorrow');
    const timeAfter = conversation.extractedIntent.timeAfter; // e.g. "15:00"
    const patientName = resolvedInfo.effectivePatientName || 'Patient';
    const patientPhone = resolvedInfo.effectivePhone || '+91-9876543210';

    // Tool 4: searchHospitals() (OpenStreetMap Overpass API)
    const hospitalsResult = await toolRegistry.searchHospitals({ location: city });
    currentExecutionBatch.push(hospitalsResult);
    conversation.toolExecutionHistory.push(hospitalsResult);
    conversation.workflowState = 'HOSPITALS_FOUND';

    const hospitalIds = hospitalsResult.output.hospitals.map((h) => h.id);

    // Tool 5: searchDoctorsBySpecialty()
    const doctorsResult = await toolRegistry.searchDoctorsBySpecialty({ hospitalIds, specialty });
    currentExecutionBatch.push(doctorsResult);
    conversation.toolExecutionHistory.push(doctorsResult);
    conversation.workflowState = 'DOCTORS_FOUND';

    if (doctorsResult.output.doctors.length === 0) {
      const noDocMsg = `I searched ${hospitalsResult.output.count} healthcare centers in ${city}, but could not find any active ${specialty} specialists at this moment. Would you like to check a nearby hospital or another specialty?`;
      conversation.messages.push({
        sender: 'agent',
        text: noDocMsg,
        timestamp: new Date(),
      });
      conversation.workflowState = 'FAILED';
      await conversation.save();
      return {
        reply: noDocMsg,
        workflowState: 'FAILED',
        conversation,
        currentTools: currentExecutionBatch,
        proposedSlot: null,
      };
    }

    const doctorIds = doctorsResult.output.doctors.map((d) => d.id);

    // Tool 6: checkDoctorAvailability()
    const availabilityResult = await toolRegistry.checkDoctorAvailability({
      doctorIds,
      targetDate,
      timeAfter,
    });
    currentExecutionBatch.push(availabilityResult);
    conversation.toolExecutionHistory.push(availabilityResult);

    // Tool 7: rankAvailableSlots()
    const rejectedSignatures = (conversation.rejectedSlots || []).map(
      (s) => `${s.doctorId}_${s.appointmentDate}_${s.appointmentTime}`
    );

    const rankingResult = await toolRegistry.rankAvailableSlots({
      candidateSlots: availabilityResult.output.slots,
      rejectedSignatures,
    });
    currentExecutionBatch.push(rankingResult);
    conversation.toolExecutionHistory.push(rankingResult);
    conversation.workflowState = 'SLOTS_EVALUATED';

    const bestSlot = rankingResult.output.bestSlot;

    if (!bestSlot) {
      const noSlotMsg = `I evaluated schedules for all ${specialty} specialists in ${city} for ${targetDate}${timeAfter ? ` after ${timeAfter}` : ''}, but all matching slots are currently occupied or previously rejected. Would you like to check the following day?`;
      conversation.messages.push({
        sender: 'agent',
        text: noSlotMsg,
        timestamp: new Date(),
      });
      conversation.workflowState = 'FAILED';
      await conversation.save();
      return {
        reply: noSlotMsg,
        workflowState: 'FAILED',
        conversation,
        currentTools: currentExecutionBatch,
        proposedSlot: null,
      };
    }

    // Tool 8: requestUserConfirmation()
    const confirmationResult = await toolRegistry.requestUserConfirmation({
      bestSlot,
      patientName,
      patientPhone,
    });
    currentExecutionBatch.push(confirmationResult);
    conversation.toolExecutionHistory.push(confirmationResult);
    conversation.workflowState = 'CONFIRMATION_REQUESTED';
    conversation.currentProposedSlot = confirmationResult.output;

    const formattedTime = bestSlot.appointmentTime;
    const agentReply = `I have discovered the earliest available ${specialty} appointment matching your request:

• Doctor: Dr. ${bestSlot.doctorName} (${bestSlot.doctorSpecialty})
• Hospital: ${bestSlot.hospitalName} (${bestSlot.hospitalCity})
• Date: ${bestSlot.appointmentDate}
• Time: ${formattedTime} IST
• Patient: ${patientName} (${patientPhone})
• Consultation Fee: ₹${bestSlot.consultationFee}
• Mode: ${confirmationResult.output.bookingMode}

Would you like me to confirm and reserve this appointment?`;

    conversation.messages.push({
      sender: 'agent',
      text: agentReply,
      timestamp: new Date(),
      metadata: {
        proposedSlot: confirmationResult.output,
        requiresConfirmation: true,
      },
    });

    await conversation.save();

    return {
      reply: agentReply,
      workflowState: conversation.workflowState,
      conversation,
      currentTools: currentExecutionBatch,
      proposedSlot: confirmationResult.output,
    };
  }

  /**
   * Handle user confirmation: Book appointment (Tool 9) & Notify (Tool 10)
   */
  async handleBookingConfirmation(conversation, userContext, currentExecutionBatch) {
    const slot = conversation.currentProposedSlot;
    const patientId = conversation.userId || userContext?._id;

    try {
      // Tool 9: bookAppointment()
      const createResult = await toolRegistry.bookAppointment({
        patientId,
        patientName: slot.patientName,
        patientPhone: slot.patientPhone,
        doctorId: slot.doctorId,
        hospitalId: slot.hospitalId,
        specialty: slot.doctorSpecialty,
        appointmentDate: slot.appointmentDate,
        appointmentTime: slot.appointmentTime,
        bookingMode: slot.bookingMode?.includes('Verified') ? 'verified_hospital' : 'demonstration',
        notes: `Booked autonomously via CardioCare Multi-Specialty AI Agent (${slot.doctorSpecialty})`,
      });
      currentExecutionBatch.push(createResult);
      conversation.toolExecutionHistory.push(createResult);

      // Tool 10: sendNotification()
      const notifResult = await toolRegistry.sendNotification({
        appointment: createResult.output,
        patientId,
      });
      currentExecutionBatch.push(notifResult);
      conversation.toolExecutionHistory.push(notifResult);

      conversation.workflowState = 'BOOKING_COMPLETED';
      conversation.currentProposedSlot = null;

      const completionMessage = `🎉 Your ${createResult.output.doctorSpecialty || 'specialist'} appointment has been officially confirmed and registered!

• Booking Reference: ${createResult.output.bookingId}
• Doctor: Dr. ${createResult.output.doctorName} (${createResult.output.doctorSpecialty || 'Specialist'})
• Hospital: ${createResult.output.hospitalName}
• Date & Time: ${createResult.output.appointmentDate} at ${createResult.output.appointmentTime} IST
• Status: Confirmed (${notifResult.output.status === 'sent' ? 'Email confirmation dispatched' : 'In-app notification generated'})

You can review or print your confirmation pass anytime from the 'My Appointments' tab.`;

      conversation.messages.push({
        sender: 'agent',
        text: completionMessage,
        timestamp: new Date(),
        metadata: {
          bookingSuccess: true,
          bookingId: createResult.output.bookingId,
        },
      });

      await conversation.save();

      return {
        reply: completionMessage,
        workflowState: 'BOOKING_COMPLETED',
        conversation,
        currentTools: currentExecutionBatch,
        bookingId: createResult.output.bookingId,
      };
    } catch (err) {
      if (err.code === 'SLOT_CONFLICT') {
        return await this.handleBookingRejection(conversation, userContext, currentExecutionBatch, 'Slot occupied concurrently');
      }
      throw err;
    }
  }

  /**
   * Handle user rejection / slot conflict -> Retry with alternative doctor (Tools 11 & 12)
   */
  async handleBookingRejection(conversation, userContext, currentExecutionBatch, reason = 'User requested alternative') {
    if (conversation.currentProposedSlot) {
      conversation.rejectedSlots.push(conversation.currentProposedSlot);
    }

    // Tool 12: retryAppointmentSearch()
    const retryResult = await toolRegistry.retryAppointmentSearch({
      conversation,
      reason,
    });
    currentExecutionBatch.push(retryResult);
    conversation.toolExecutionHistory.push(retryResult);

    conversation.retryCount = retryResult.output.newRetryCount;

    if (retryResult.output.maxRetriesReached) {
      const maxMsg = 'Maximum automated alternatives evaluated (5). Please check the Doctors & Specialists tab to select a specific slot manually.';
      conversation.messages.push({
        sender: 'agent',
        text: maxMsg,
        timestamp: new Date(),
      });
      conversation.workflowState = 'FAILED';
      await conversation.save();
      return {
        reply: maxMsg,
        workflowState: 'FAILED',
        conversation,
        currentTools: currentExecutionBatch,
      };
    }

    conversation.workflowState = 'RETRYING_ALTERNATIVE';

    const resolvedInfo = {
      effectivePatientName: conversation.extractedIntent.patientName || userContext?.name || 'Patient',
      effectivePhone: conversation.extractedIntent.phone || userContext?.phone || '+91-9876543210',
    };

    return await this.executeAutonomousSearchPipeline(conversation, resolvedInfo, currentExecutionBatch);
  }
}

module.exports = new AgentOrchestrator();
