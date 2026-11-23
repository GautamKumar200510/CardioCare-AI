const mongoose = require('mongoose');

const availabilityScheduleSchema = new mongoose.Schema({
  dayOfWeek: {
    type: Number, // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    required: true,
  },
  startHour: {
    type: Number, // 24-hr format, e.g. 9
    required: true,
    default: 9,
  },
  endHour: {
    type: Number, // 24-hr format, e.g. 19
    required: true,
    default: 19,
  },
  slotDurationMinutes: {
    type: Number,
    default: 30,
  },
}, { _id: false });

const doctorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  specialtyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Specialty',
    index: true,
  },
  specialty: {
    type: String,
    required: true,
    trim: true,
    index: true,
  },
  hospitalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hospital',
    required: true,
    index: true,
  },
  qualification: {
    type: String,
    default: 'MBBS, MD',
  },
  experience: {
    type: Number, // Years
    default: 10,
  },
  consultationFee: {
    type: Number, // INR
    default: 800,
  },
  verificationStatus: {
    type: String,
    enum: ['verified', 'demo'],
    default: 'demo',
    index: true,
  },
  verificationSource: {
    type: String,
    default: 'ABDM Public Portal / Academic Simulation',
  },
  dataMode: {
    type: String,
    enum: ['live', 'synthetic'],
    default: 'synthetic',
  },
  abdmDoctorId: {
    type: String,
    default: null,
  },
  rating: {
    type: Number,
    default: 4.8,
  },
  bio: {
    type: String,
    default: 'Specialist practitioner providing clinical outpatient consultations.',
  },
  profileImage: {
    type: String,
    default: '',
  },
  availabilitySchedule: {
    type: [availabilityScheduleSchema],
    default: () => [
      { dayOfWeek: 1, startHour: 9, endHour: 19, slotDurationMinutes: 30 },
      { dayOfWeek: 2, startHour: 9, endHour: 19, slotDurationMinutes: 30 },
      { dayOfWeek: 3, startHour: 9, endHour: 19, slotDurationMinutes: 30 },
      { dayOfWeek: 4, startHour: 9, endHour: 19, slotDurationMinutes: 30 },
      { dayOfWeek: 5, startHour: 9, endHour: 19, slotDurationMinutes: 30 },
      { dayOfWeek: 6, startHour: 9, endHour: 18, slotDurationMinutes: 30 },
    ],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

doctorSchema.index({ specialty: 1, hospitalId: 1 });

module.exports = mongoose.model('Doctor', doctorSchema);
