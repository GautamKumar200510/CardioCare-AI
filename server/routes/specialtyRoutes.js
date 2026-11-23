const express = require('express');
const router = express.Router();
const Specialty = require('../models/Specialty');
const { SUPPORTED_SPECIALTIES } = require('../config/specialtiesConfig');

/**
 * GET /api/specialties
 * Returns all 15 supported medical specialties
 */
router.get('/', async (req, res) => {
  try {
    let specialties = await Specialty.find({ active: true }).sort({ name: 1 });

    // Fallback to static catalog if DB is initializing
    if (specialties.length === 0) {
      specialties = SUPPORTED_SPECIALTIES;
    }

    return res.json({
      success: true,
      count: specialties.length,
      data: specialties,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * GET /api/specialties/:slug
 */
router.get('/:slug', async (req, res) => {
  try {
    const specialty = await Specialty.findOne({ slug: req.params.slug.toLowerCase() });
    if (!specialty) {
      return res.status(404).json({ success: false, message: 'Specialty not found in registry.' });
    }
    return res.json({ success: true, data: specialty });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
