const mongoose = require('mongoose');

const hospitalSchema = new mongoose.Schema({
  osmId: {
    type: String,
    index: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  address: {
    type: String,
    default: 'Address details pending verification',
  },
  city: {
    type: String,
    required: true,
    index: true,
    trim: true,
  },
  area: {
    type: String,
    trim: true,
  },
  latitude: {
    type: Number,
    required: true,
  },
  longitude: {
    type: Number,
    required: true,
  },
  source: {
    type: String,
    default: 'OpenStreetMap Overpass API',
  },
  amenity: {
    type: String,
    default: 'hospital',
  },
  emergency: {
    type: Boolean,
    default: false,
  },
  phone: {
    type: String,
    default: '+91-20-26000000',
  },
  verified: {
    type: Boolean,
    default: true,
  },
  verificationStatus: {
    type: String,
    enum: ['verified', 'unverified'],
    default: 'verified',
  },
  abdmFacilityId: {
    type: String,
    default: null,
  },
  lastFetchedAt: {
    type: Date,
    default: Date.now,
  },
});

hospitalSchema.index({ city: 1, name: 1 });

module.exports = mongoose.model('Hospital', hospitalSchema);
