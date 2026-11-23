const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
  },
  message: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['email', 'in_app', 'sms'],
    default: 'in_app',
  },
  status: {
    type: String,
    enum: ['sent', 'delivered', 'failed', 'simulated'],
    default: 'sent',
  },
  deliveryDetails: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Notification', notificationSchema);
