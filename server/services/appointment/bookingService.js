const Appointment = require('../../models/Appointment');
const Doctor = require('../../models/Doctor');
const Hospital = require('../../models/Hospital');
const { sendBookingConfirmationNotification } = require('../notification/emailService');

/**
 * Generate unique human-readable booking ID: CC-YYYYMMDD-XXXX
 */
const generateBookingId = (dateStr) => {
  const cleanDate = (dateStr || new Date().toISOString().slice(0, 10)).replace(/-/g, '');
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `CC-${cleanDate}-${randomSuffix}`;
};

/**
 * Book an appointment with concurrency conflict prevention
 */
const createAppointment = async ({
  patientId,
  patientName,
  patientPhone,
  doctorId,
  hospitalId,
  appointmentDate,
  appointmentTime,
  bookingMode = 'demonstration',
  notes = 'Booked autonomously via CardioCare AI Agent',
}) => {
  if (!patientName || !patientPhone) {
    throw new Error('Patient name and phone number are strictly required for booking.');
  }

  // Double check existing confirmed booking for this doctor at this slot
  const conflict = await Appointment.findOne({
    doctorId,
    appointmentDate,
    appointmentTime,
    status: 'confirmed',
  });

  if (conflict) {
    const conflictErr = new Error('Selected slot is no longer available. Slot conflict detected.');
    conflictErr.code = 'SLOT_CONFLICT';
    throw conflictErr;
  }

  const bookingId = generateBookingId(appointmentDate);

  // Fetch doctor to populate specialty if not passed
  const doctor = await Doctor.findById(doctorId);

  const appointment = new Appointment({
    bookingId,
    bookingReference: bookingId,
    patientId,
    patientName,
    patientPhone,
    doctorId,
    hospitalId: hospitalId || doctor?.hospitalId,
    specialtyId: doctor?.specialtyId,
    specialty: doctor?.specialty || 'General Medicine',
    appointmentDate,
    appointmentTime,
    status: 'confirmed',
    bookingStatus: 'confirmed',
    bookingMode,
    notes,
  });

  try {
    await appointment.save();
  } catch (err) {
    if (err.code === 11000) {
      const conflictErr = new Error('Slot was concurrently booked by another patient.');
      conflictErr.code = 'SLOT_CONFLICT';
      throw conflictErr;
    }
    throw err;
  }

  // Populate doctor and hospital details for clean response
  await appointment.populate([
    { path: 'doctorId', select: 'name specialty qualification consultationFee' },
    { path: 'hospitalId', select: 'name address city emergency phone latitude longitude' },
  ]);

  // Trigger notification service
  try {
    await sendBookingConfirmationNotification(appointment, patientId);
  } catch (notifErr) {
    console.warn('[BookingService] Notification delivery alert:', notifErr.message);
  }

  return appointment;
};

/**
 * Cancel an appointment
 */
const cancelAppointment = async (appointmentId, userId) => {
  const appointment = await Appointment.findById(appointmentId);
  if (!appointment) {
    throw new Error('Appointment not found.');
  }

  // Check authorization: User must own the appointment or be admin
  if (userId && appointment.patientId.toString() !== userId.toString()) {
    const authErr = new Error('Unauthorized: You can only cancel your own appointments.');
    authErr.statusCode = 403;
    throw authErr;
  }

  appointment.status = 'cancelled';
  await appointment.save();

  return appointment;
};

module.exports = {
  generateBookingId,
  createAppointment,
  cancelAppointment,
};
