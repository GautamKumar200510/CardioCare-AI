const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  bookingId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  bookingReference: {
    type: String,
    index: true,
  },
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  patientName: {
    type: String,
    required: true,
    trim: true,
  },
  patientPhone: {
    type: String,
    required: true,
    trim: true,
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true,
    index: true,
  },
  hospitalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hospital',
    required: true,
  },
  specialtyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Specialty',
  },
  specialty: {
    type: String,
    default: 'General Medicine',
    trim: true,
    index: true,
  },
  appointmentDate: {
    type: String, // YYYY-MM-DD
    required: true,
    index: true,
  },
  appointmentTime: {
    type: String, // HH:mm
    required: true,
    index: true,
  },
  status: {
    type: String,
    enum: ['confirmed', 'cancelled', 'completed', 'rescheduled'],
    default: 'confirmed',
    index: true,
  },
  bookingStatus: {
    type: String,
    enum: ['confirmed', 'cancelled', 'completed', 'rescheduled'],
    default: 'confirmed',
  },
  bookingMode: {
    type: String,
    enum: ['demonstration', 'verified_hospital'],
    default: 'demonstration',
  },
  fhirAppointmentId: {
    type: String,
    default: null,
  },
  reason: {
    type: String,
    default: 'Specialist clinical consultation',
  },
  notes: {
    type: String,
    default: 'Booked autonomously via Multi-Specialty AI Agent',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

appointmentSchema.pre('save', function (next) {
  if (!this.bookingReference && this.bookingId) {
    this.bookingReference = this.bookingId;
  }
  if (!this.bookingStatus && this.status) {
    this.bookingStatus = this.status;
  }
  next();
});

// Composite unique index preventing concurrent double-booking of same doctor at same date & time
appointmentSchema.index(
  { doctorId: 1, appointmentDate: 1, appointmentTime: 1, status: 1 },
  { unique: true, partialFilterExpression: { status: 'confirmed' } }
);

module.exports = mongoose.model('Appointment', appointmentSchema);
