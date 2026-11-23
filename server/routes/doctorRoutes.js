const express = require('express');
const router = express.Router();
const Doctor = require('../models/Doctor');
const Specialty = require('../models/Specialty');

/**
 * GET /api/doctors
 * Query: specialty, specialtySlug, specialtyId, hospitalId, city, verificationStatus, search
 */
router.get('/', async (req, res) => {
  try {
    const { specialty, specialtySlug, specialtyId, hospitalId, city, verificationStatus, search } = req.query;

    const query = {};

    if (specialtyId) {
      query.specialtyId = specialtyId;
    } else if (specialtySlug) {
      const spec = await Specialty.findOne({ slug: specialtySlug.toLowerCase() });
      if (spec) {
        query.specialtyId = spec._id;
      }
    } else if (specialty && specialty !== 'all') {
      query.specialty = new RegExp(`^${specialty}$`, 'i');
    }

    if (hospitalId) query.hospitalId = hospitalId;
    if (verificationStatus && verificationStatus !== 'all') query.verificationStatus = verificationStatus;

    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { specialty: new RegExp(search, 'i') },
        { qualification: new RegExp(search, 'i') },
      ];
    }

    let doctors = await Doctor.find(query).populate('hospitalId').populate('specialtyId').sort({ rating: -1 });

    if (city) {
      doctors = doctors.filter(
        (d) => d.hospitalId && d.hospitalId.city.toLowerCase() === city.toLowerCase()
      );
    }

    return res.json({
      success: true,
      count: doctors.length,
      data: doctors,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * GET /api/doctors/specialty/:specialty
 */
router.get('/specialty/:specialty', async (req, res) => {
  try {
    const doctors = await Doctor.find({
      specialty: new RegExp(`^${req.params.specialty}$`, 'i'),
    }).populate('hospitalId').populate('specialtyId');

    return res.json({
      success: true,
      specialty: req.params.specialty,
      count: doctors.length,
      data: doctors,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * GET /api/doctors/:id
 */
router.get('/:id', async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id).populate('hospitalId').populate('specialtyId');
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor profile not found.' });
    }
    return res.json({ success: true, data: doctor });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
