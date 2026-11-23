const Doctor = require('../../models/Doctor');
const Appointment = require('../../models/Appointment');

/**
 * Generate all potential time slots between startHour and endHour (in 30-min intervals)
 */
const generateTimeSlots = (startHour = 9, endHour = 19, slotDuration = 30) => {
  const slots = [];
  for (let hour = startHour; hour < endHour; hour++) {
    for (let min = 0; min < 60; min += slotDuration) {
      const hStr = hour.toString().padStart(2, '0');
      const mStr = min.toString().padStart(2, '0');
      slots.push(`${hStr}:${mStr}`);
    }
  }
  return slots;
};

/**
 * Get available appointment slots for a specific doctor on a target date
 * @param {string} doctorId
 * @param {string} targetDate - Format YYYY-MM-DD
 * @param {string} timeAfter - Optional filter, e.g. "15:00"
 */
const getDoctorAvailableSlots = async (doctorId, targetDate, timeAfter = null) => {
  const doctor = await Doctor.findById(doctorId).populate('hospitalId');
  if (!doctor) {
    throw new Error(`Doctor not found with ID ${doctorId}`);
  }

  // Parse target date and get day of the week (0 = Sun, 1 = Mon, ..., 6 = Sat)
  const dateObj = new Date(`${targetDate}T00:00:00+05:30`);
  const dayOfWeek = dateObj.getDay();

  // Find doctor's schedule for this day
  const daySchedule = doctor.availabilitySchedule?.find((s) => s.dayOfWeek === dayOfWeek) || {
    dayOfWeek,
    startHour: 9,
    endHour: 19,
    slotDurationMinutes: 30,
  };

  // Generate doctor's candidate slots
  const allPotentialSlots = generateTimeSlots(
    daySchedule.startHour,
    daySchedule.endHour,
    daySchedule.slotDurationMinutes || 30
  );

  // Fetch all already confirmed bookings for this doctor on this date
  const bookedAppointments = await Appointment.find({
    doctorId,
    appointmentDate: targetDate,
    status: 'confirmed',
  }).select('appointmentTime');

  const bookedTimes = new Set(bookedAppointments.map((a) => a.appointmentTime));

  // Filter slots
  const availableSlots = allPotentialSlots
    .filter((slotTime) => {
      // 1. Must not already be booked
      if (bookedTimes.has(slotTime)) return false;

      // 2. Must satisfy timeAfter filter if provided (e.g. "15:00" -> >= 15:00)
      if (timeAfter) {
        if (slotTime < timeAfter) return false;
      }

      return true;
    })
    .map((slotTime) => ({
      doctorId: doctor._id,
      doctorName: doctor.name,
      doctorSpecialty: doctor.specialty,
      doctorQualification: doctor.qualification,
      consultationFee: doctor.consultationFee,
      verificationStatus: doctor.verificationStatus,
      hospitalId: doctor.hospitalId?._id,
      hospitalName: doctor.hospitalId?.name || 'Heart Specialty Hospital',
      hospitalAddress: doctor.hospitalId?.address || 'Cardiology Wing',
      hospitalCity: doctor.hospitalId?.city || 'Pune',
      hospitalLatitude: doctor.hospitalId?.latitude,
      hospitalLongitude: doctor.hospitalId?.longitude,
      appointmentDate: targetDate,
      appointmentTime: slotTime,
      isDemonstration: doctor.verificationStatus === 'demo',
    }));

  return availableSlots;
};

/**
 * Check availability across all cardiologists in a given city or list of hospital IDs
 */
const checkCityWideAvailability = async ({
  city = 'Pune',
  specialty = 'Cardiology',
  targetDate,
  timeAfter = null,
  hospitalIds = null,
}) => {
  let doctorQuery = {};

  if (specialty) {
    doctorQuery.specialty = new RegExp(specialty, 'i');
  }

  if (hospitalIds && hospitalIds.length > 0) {
    doctorQuery.hospitalId = { $in: hospitalIds };
  }

  let doctors = await Doctor.find(doctorQuery).populate('hospitalId');

  // Filter by city if hospitalIds wasn't specified
  if (city && (!hospitalIds || hospitalIds.length === 0)) {
    doctors = doctors.filter(
      (doc) => doc.hospitalId && doc.hospitalId.city.toLowerCase() === city.toLowerCase()
    );
  }

  let allAvailableSlots = [];
  for (const doc of doctors) {
    const docSlots = await getDoctorAvailableSlots(doc._id, targetDate, timeAfter);
    allAvailableSlots.push(...docSlots);
  }

  return allAvailableSlots;
};

module.exports = {
  generateTimeSlots,
  getDoctorAvailableSlots,
  checkCityWideAvailability,
};
