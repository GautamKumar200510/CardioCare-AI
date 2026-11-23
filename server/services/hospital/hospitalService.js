const Hospital = require('../../models/Hospital');
const { fetchHospitalsFromOverpass } = require('./overpassService');

/**
 * Search hospitals by city name, caching Overpass results to MongoDB
 */
const searchHospitals = async (city = 'Pune', forceRefresh = false) => {
  const normalizedCity = (city || 'Pune').trim();

  // Return all hospitals if "all" or "all cities" is requested
  if (normalizedCity.toLowerCase() === 'all' || normalizedCity.toLowerCase() === 'all cities') {
    return await Hospital.find({}).sort({ city: 1, name: 1 });
  }

  if (!forceRefresh) {
    const existing = await Hospital.find({
      city: new RegExp(`^${normalizedCity}$`, 'i'),
    }).sort({ name: 1 });

    if (existing && existing.length >= 3) {
      return existing;
    }
  }

  // Fetch from Overpass API
  const overpassHospitals = await fetchHospitalsFromOverpass(normalizedCity);

  const savedHospitals = [];
  for (const h of overpassHospitals) {
    const filter = h.osmId ? { osmId: h.osmId } : { name: h.name, city: h.city };
    const saved = await Hospital.findOneAndUpdate(
      filter,
      {
        ...h,
        lastFetchedAt: new Date(),
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    savedHospitals.push(saved);
  }

  return savedHospitals;
};

/**
 * Get hospital by its MongoDB ID
 */
const getHospitalById = async (id) => {
  return await Hospital.findById(id);
};

/**
 * Calculate distance between two lat/lon points using Haversine formula (km)
 */
const calculateDistanceKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
};

/**
 * Discover nearby hospitals within a radius (km)
 */
const getNearbyHospitals = async (lat, lon, radiusKm = 15) => {
  const allHospitals = await Hospital.find({});
  return allHospitals
    .map((h) => {
      const distance = calculateDistanceKm(lat, lon, h.latitude, h.longitude);
      return {
        ...h.toObject(),
        distanceKm: distance,
      };
    })
    .filter((h) => h.distanceKm <= radiusKm)
    .sort((a, b) => a.distanceKm - b.distanceKm);
};

module.exports = {
  searchHospitals,
  getHospitalById,
  getNearbyHospitals,
  calculateDistanceKm,
};
