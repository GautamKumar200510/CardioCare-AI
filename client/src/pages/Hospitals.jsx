import React, { useState, useEffect, useMemo } from 'react';
import {
  Compass,
  Globe,
  Hospital as HospitalIcon,
  MapPin,
  RefreshCw,
  Search,
  X,
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import HospitalCard from '../components/HospitalCard';
import api from '../services/api';

// Fix Leaflet marker icon issue in Vite/Webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Map auto-centering controller component
function RecenterMap({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center && typeof center[0] === 'number' && typeof center[1] === 'number') {
      map.setView(center, zoom || 13, { animate: true });
    }
  }, [center, zoom, map]);
  return null;
}

const CITIES = ['All Cities', 'Pune', 'Mumbai', 'Delhi', 'Bangalore'];

const Hospitals = () => {
  const [hospitals, setHospitals] = useState([]);
  const [allHospitals, setAllHospitals] = useState([]);
  const [selectedCity, setSelectedCity] = useState('Pune');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch all hospitals on initial mount for global search resilience
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const res = await api.get('/hospitals/search?city=All');
        if (res.data?.success && Array.isArray(res.data.data)) {
          setAllHospitals(res.data.data);
        }
      } catch (err) {
        console.warn('[Hospitals] Could not fetch all hospitals:', err.message);
      }
    };
    fetchAll();
  }, []);

  const fetchHospitals = async (city, refresh = false) => {
    setLoading(true);
    try {
      const cityParam = city === 'All Cities' ? 'All' : city;
      const res = await api.get(`/hospitals/search?city=${encodeURIComponent(cityParam)}&refresh=${refresh}`);
      if (res.data?.success) {
        setHospitals(res.data.data);
        if (res.data.data.length > 0) {
          setSelectedHospital(res.data.data[0]);
        }
      }
    } catch (err) {
      console.error('[Hospitals Error]:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchHospitals(selectedCity);
  }, [selectedCity]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchHospitals(selectedCity, true);
  };

  // Smart Multi-Keyword & Fuzzy Search
  const filteredHospitals = useMemo(() => {
    const pool = selectedCity === 'All Cities' || searchQuery.trim().length > 0
      ? (allHospitals.length > 0 ? allHospitals : hospitals)
      : hospitals;

    if (!searchQuery || !searchQuery.trim()) {
      return pool;
    }

    const rawQuery = searchQuery.toLowerCase().trim();
    const stopWords = new Set(['and', 'the', 'near', 'in', 'at', 'of', 'for', 'to', 'on', 'with', '&', '-', ',', '.']);

    // Extract search tokens (ignore 1-char noise)
    const tokens = rawQuery
      .split(/[\s,–—\-\/]+/)
      .map((t) => t.replace(/[^a-z0-9]/g, ''))
      .filter((t) => t.length > 1 && !stopWords.has(t));

    const scored = pool.map((h) => {
      const name = (h.name || '').toLowerCase();
      const address = (h.address || '').toLowerCase();
      const area = (h.area || '').toLowerCase();
      const city = (h.city || '').toLowerCase();
      const fullText = `${name} ${address} ${area} ${city}`;

      let score = 0;

      // 1. Exact full query matches
      if (name.includes(rawQuery)) score += 600;
      else if (address.includes(rawQuery)) score += 400;
      else if (fullText.includes(rawQuery)) score += 250;

      // 2. Token-level matching
      let matchedCount = 0;
      for (const token of tokens) {
        if (name.includes(token)) {
          score += 60;
          matchedCount++;
        } else if (address.includes(token)) {
          score += 35;
          matchedCount++;
        } else if (area.includes(token)) {
          score += 30;
          matchedCount++;
        } else if (city.includes(token)) {
          score += 25;
          matchedCount++;
        }
      }

      // Bonus if multiple tokens matched
      if (matchedCount > 0) {
        score += matchedCount * 15;
      }
      if (tokens.length > 1 && matchedCount >= Math.min(2, tokens.length)) {
        score += 100;
      }

      // If user is filtering by a specific city, boost hospitals in that city
      if (selectedCity !== 'All Cities' && city === selectedCity.toLowerCase()) {
        score += 20;
      }

      return { hospital: h, score };
    });

    const results = scored
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((item) => item.hospital);

    return results;
  }, [hospitals, allHospitals, selectedCity, searchQuery]);

  // Auto-select top matched hospital when search results change
  useEffect(() => {
    if (filteredHospitals.length > 0) {
      if (!selectedHospital || !filteredHospitals.some((h) => h._id === selectedHospital._id)) {
        setSelectedHospital(filteredHospitals[0]);
      }
    } else {
      setSelectedHospital(null);
    }
  }, [filteredHospitals]);

  // Calculate dynamic map center
  const mapCenter = useMemo(() => {
    if (selectedHospital && selectedHospital.latitude && selectedHospital.longitude) {
      return [selectedHospital.latitude, selectedHospital.longitude];
    }
    if (filteredHospitals.length > 0 && filteredHospitals[0].latitude) {
      return [filteredHospitals[0].latitude, filteredHospitals[0].longitude];
    }
    switch (selectedCity) {
      case 'Mumbai':
        return [19.076, 72.8777];
      case 'Delhi':
        return [28.6139, 77.209];
      case 'Bangalore':
        return [12.9716, 77.5946];
      default:
        return [18.5204, 73.8567]; // Pune
    }
  }, [selectedHospital, filteredHospitals, selectedCity]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar />

        <main className="flex-1 p-6 lg:p-8 space-y-6 overflow-y-auto">
          {/* Header & Filter Controls */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Compass className="w-5 h-5 text-sky-600" />
                <h1 className="text-2xl font-extrabold text-navy-900 tracking-tight">
                  Hospital Discovery
                </h1>
              </div>
              <p className="text-xs text-slate-500">
                Discovered via OpenStreetMap Overpass API • Authentic Geographic POI Records
              </p>
            </div>

            {/* City Selector & Refresh */}
            <div className="flex items-center gap-2">
              <div className="flex items-center rounded-xl bg-white border border-slate-300 p-1 shadow-2xs">
                {CITIES.map((city) => (
                  <button
                    key={city}
                    onClick={() => {
                      setSelectedCity(city);
                      setSearchQuery('');
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                      selectedCity === city
                        ? 'bg-navy-800 text-white shadow-xs'
                        : 'text-slate-600 hover:text-navy-900'
                    }`}
                  >
                    {city}
                  </button>
                ))}
              </div>

              <button
                onClick={handleRefresh}
                disabled={refreshing}
                title="Force refresh from Overpass API"
                className="p-2.5 rounded-xl bg-white border border-slate-300 text-slate-600 hover:text-navy-900 hover:bg-slate-50 shadow-2xs"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Search Bar with Clear Button */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by hospital name, area, road, landmark, or city (e.g. Deenanath Mangeshkar, Ruby Hall, Bandra)..."
              className="w-full pl-10 pr-10 py-3 bg-white text-xs sm:text-sm rounded-2xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-2xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 p-0.5 rounded-full hover:bg-slate-100"
                title="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Search Active Indicator */}
          {searchQuery && (
            <div className="flex items-center justify-between text-xs text-slate-500 px-1">
              <span>
                Found <strong>{filteredHospitals.length}</strong> hospital(s) matching "<strong>{searchQuery}</strong>"
              </span>
              <button
                onClick={() => setSearchQuery('')}
                className="text-sky-600 hover:text-sky-800 font-bold hover:underline"
              >
                Clear Filter
              </button>
            </div>
          )}

          {/* Main Content: Split Map & Hospital Cards List */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Interactive Leaflet Map */}
            <div className="lg:col-span-6 bg-white rounded-3xl border border-slate-200 p-3 shadow-sm h-[480px] lg:h-[580px] sticky top-20 flex flex-col">
              <div className="px-2 py-1.5 flex items-center justify-between text-[11px] text-slate-500 border-b border-slate-100 mb-2">
                <span className="font-semibold text-navy-900 flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5 text-sky-600" /> OpenStreetMap Healthcare Layer
                </span>
                <span>{filteredHospitals.length} Hospital(s) Mapped</span>
              </div>

              <div className="flex-1 w-full rounded-2xl overflow-hidden relative">
                <MapContainer
                  center={mapCenter}
                  zoom={13}
                  scrollWheelZoom={false}
                  className="w-full h-full"
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <RecenterMap center={mapCenter} zoom={selectedHospital ? 14 : 12} />

                  {filteredHospitals.map((h) => (
                    <Marker
                      key={h._id || h.osmId}
                      position={[h.latitude, h.longitude]}
                      eventHandlers={{
                        click: () => setSelectedHospital(h),
                      }}
                    >
                      <Popup>
                        <div className="text-xs space-y-1">
                          <p className="font-bold text-navy-900">{h.name}</p>
                          <p className="text-slate-500">{h.address}</p>
                          <p className="text-emerald-700 font-bold">{h.city}</p>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              </div>
            </div>

            {/* Right: Hospital Cards Grid */}
            <div className="lg:col-span-6 space-y-4">
              {loading ? (
                <div className="py-20 text-center text-slate-400 text-xs">
                  Querying OpenStreetMap healthcare nodes for {selectedCity}...
                </div>
              ) : filteredHospitals.length === 0 ? (
                <div className="py-16 text-center bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
                  <HospitalIcon className="w-10 h-10 text-slate-300 mx-auto" />
                  <p className="text-sm font-bold text-navy-900">No hospitals matched your search</p>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Try searching by a broader keyword like "Deenanath", "Ruby", "Heart", or select "All Cities".
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCity('All Cities');
                    }}
                    className="px-4 py-2 bg-sky-50 text-sky-700 border border-sky-200 rounded-xl text-xs font-bold hover:bg-sky-100 transition-colors"
                  >
                    View All Hospitals
                  </button>
                </div>
              ) : (
                filteredHospitals.map((hospital) => (
                  <HospitalCard
                    key={hospital._id || hospital.osmId}
                    hospital={hospital}
                    isSelected={selectedHospital?._id === hospital._id}
                    onSelectMap={(h) => setSelectedHospital(h)}
                  />
                ))
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Hospitals;
