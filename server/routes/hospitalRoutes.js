const express = require('express');
const router = express.Router();
const Hospital = require('../models/Hospital');
const { searchHospitals, getNearbyHospitals } = require('../services/hospital/hospitalService');

/**
 * GET /api/hospitals/search
 * Query params: city, refresh
 */
router.get('/search', async (req, res) => {
  try {
    const { city = 'Pune', refresh, q } = req.query;
    const forceRefresh = refresh === 'true';

    let hospitals;
    const normCity = city.trim().toLowerCase();

    if (normCity === 'all' || normCity === 'all cities') {
      hospitals = await Hospital.find({}).sort({ city: 1, name: 1 });
    } else if (q && q.trim()) {
      const cleanQ = q.trim();
      const escapedQ = cleanQ.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(escapedQ, 'i');
      hospitals = await Hospital.find({
        $or: [
          { name: regex },
          { address: regex },
          { area: regex },
          { city: regex },
        ],
      }).sort({ name: 1 });

      if (!hospitals || hospitals.length === 0) {
        hospitals = await searchHospitals(city, forceRefresh);
      }
    } else {
      hospitals = await searchHospitals(city, forceRefresh);
    }

    return res.json({
      success: true,
      city,
      count: hospitals.length,
      source: 'OpenStreetMap Overpass API / Persistent Cache',
      data: hospitals,
    });
  } catch (err) {
    console.error('[Hospital Search Error]:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * GET /api/hospitals/nearby
 * Query params: lat, lon, radius
 */
router.get('/nearby', async (req, res) => {
  try {
    const lat = parseFloat(req.query.lat || '18.5204');
    const lon = parseFloat(req.query.lon || '73.8567');
    const radius = parseFloat(req.query.radius || '20');

    const hospitals = await getNearbyHospitals(lat, lon, radius);

    return res.json({
      success: true,
      count: hospitals.length,
      data: hospitals,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * GET /api/hospitals/:id
 */
router.get('/:id', async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.params.id);
    if (!hospital) {
      return res.status(404).json({ success: false, message: 'Hospital not found.' });
    }
    return res.json({ success: true, data: hospital });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
