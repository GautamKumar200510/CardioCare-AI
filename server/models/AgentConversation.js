const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: {
    type: String,
    enum: ['user', 'agent', 'system'],
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
}, { _id: false });

const toolExecutionSchema = new mongoose.Schema({
  toolName: {
    type: String,
    required: true,
  },
  input: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  output: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  decision: {
    type: String,
    default: '',
  },
  executionTimeMs: {
    type: Number,
    default: 0,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
}, { _id: false });

const agentConversationSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true,
  },
  messages: {
    type: [messageSchema],
    default: [],
  },
  extractedIntent: {
    intent: { type: String, default: null },
    specialty: { type: String, default: null }, // Multi-specialty support
    specialtySlug: { type: String, default: null },
    date: { type: String, default: null },
    resolvedDate: { type: String, default: null }, // YYYY-MM-DD
    timeAfter: { type: String, default: null }, // HH:mm
    location: { type: String, default: null },
    patientName: { type: String, default: null },
    phone: { type: String, default: null },
  },
  workflowState: {
    type: String,
    enum: [
      'IDLE',
      'INTENT_EXTRACTED',
      'SPECIALTY_IDENTIFIED',
      'SPECIALTY_AMBIGUOUS',
      'MISSING_INFO_REQUESTED',
      'HOSPITALS_FOUND',
      'DOCTORS_FOUND',
      'SLOTS_EVALUATED',
      'CONFIRMATION_REQUESTED',
      'BOOKING_COMPLETED',
      'RETRYING_ALTERNATIVE',
      'FAILED',
    ],
    default: 'IDLE',
  },
  missingInformation: {
    type: [String],
    default: [],
  },
  toolExecutionHistory: {
    type: [toolExecutionSchema],
    default: [],
  },
  currentProposedSlot: {
    type: mongoose.Schema.Types.Mixed,
    default: null,
  },
  rejectedSlots: {
    type: [mongoose.Schema.Types.Mixed],
    default: [],
  },
  retryCount: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

agentConversationSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('AgentConversation', agentConversationSchema);
