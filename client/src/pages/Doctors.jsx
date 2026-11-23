import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Award,
  Filter,
  Search,
  Stethoscope,
  UserCheck,
  Building,
  ShieldCheck,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import DoctorCard from '../components/DoctorCard';
import api from '../services/api';

const SPECIALTY_OPTIONS = [
  'All',
  'Cardiology',
  'Orthopedics',
  'Dermatology',
  'Neurology',
  'General Medicine',
  'Pediatrics',
  'Gynecology',
  'ENT',
  'Ophthalmology',
  'Dentistry',
  'Psychiatry',
  'Urology',
  'Gastroenterology',
  'Pulmonology',
  'Oncology',
];

const Doctors = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSpecialty = searchParams.get('specialty') || 'All';

  const [doctors, setDoctors] = useState([]);
  const [selectedSpecialty, setSelectedSpecialty] = useState(initialSpecialty);
  const [selectedCity, setSelectedCity] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [verificationFilter, setVerificationFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDoctors = async () => {
      setLoading(true);
      try {
        let endpoint = '/doctors';
        const params = [];
        if (selectedSpecialty && selectedSpecialty !== 'All') {
          params.push(`specialty=${encodeURIComponent(selectedSpecialty)}`);
        }
        if (selectedCity && selectedCity !== 'All') {
          params.push(`city=${encodeURIComponent(selectedCity)}`);
        }
        if (verificationFilter && verificationFilter !== 'all') {
          params.push(`verificationStatus=${verificationFilter}`);
        }
        if (params.length > 0) {
          endpoint += `?${params.join('&')}`;
        }

        const res = await api.get(endpoint);
        if (res.data?.success) {
          setDoctors(res.data.data);
        }
      } catch (err) {
        console.error('[Doctors Fetch Error]:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, [selectedSpecialty, selectedCity, verificationFilter]);

  const handleSpecialtyChange = (spec) => {
    setSelectedSpecialty(spec);
    if (spec === 'All') {
      searchParams.delete('specialty');
    } else {
      searchParams.set('specialty', spec);
    }
    setSearchParams(searchParams);
  };

  const filteredDoctors = doctors.filter((doc) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      doc.name.toLowerCase().includes(q) ||
      doc.specialty.toLowerCase().includes(q) ||
      doc.qualification.toLowerCase().includes(q) ||
      (doc.hospitalId?.name && doc.hospitalId.name.toLowerCase().includes(q))
    );
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar />

        <main className="flex-1 p-6 lg:p-8 space-y-6 overflow-y-auto">
          {/* Header & Verification Filter */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Stethoscope className="w-5 h-5 text-sky-600" />
                <h1 className="text-2xl font-extrabold text-navy-900 tracking-tight">
                  Doctors & Specialists Directory
                </h1>
              </div>
              <p className="text-xs text-slate-500">
                15 Medical Specialties • Verified Practitioners & Academic Simulation Specialists
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center rounded-xl bg-white border border-slate-300 p-1 shadow-2xs">
              <button
                onClick={() => setVerificationFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  verificationFilter === 'all'
                    ? 'bg-navy-800 text-white shadow-xs'
                    : 'text-slate-600 hover:text-navy-900'
                }`}
              >
                All Specialists ({doctors.length})
              </button>
              <button
                onClick={() => setVerificationFilter('verified')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  verificationFilter === 'verified'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-emerald-700'
                }`}
              >
                Verified
              </button>
              <button
                onClick={() => setVerificationFilter('demo')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  verificationFilter === 'demo'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-amber-700'
                }`}
              >
                Demo Simulation
              </button>
            </div>
          </div>

          {/* Specialty Horizontal Filter Bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {SPECIALTY_OPTIONS.map((spec) => (
              <button
                key={spec}
                onClick={() => handleSpecialtyChange(spec)}
                className={`px-3.5 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-all ${
                  selectedSpecialty === spec
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                }`}
              >
                {spec}
              </button>
            ))}
          </div>

          {/* Search & City Filter Bar */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            <div className="md:col-span-9 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by doctor name, specialty, qualification, or hospital..."
                className="w-full pl-10 pr-4 py-2.5 bg-white text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-2xs"
              />
            </div>

            <div className="md:col-span-3">
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full p-2.5 bg-white text-xs sm:text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500"
              >
                <option value="All">All Cities</option>
                <option value="Pune">Pune</option>
                <option value="Mumbai">Mumbai</option>
                <option value="Delhi">Delhi</option>
                <option value="Bangalore">Bangalore</option>
              </select>
            </div>
          </div>

          {/* Doctors Grid */}
          {loading ? (
            <div className="py-20 text-center text-slate-400 text-xs">
              Filtering clinical specialist directory across {selectedSpecialty}...
            </div>
          ) : filteredDoctors.length === 0 ? (
            <div className="py-20 text-center text-slate-400 text-xs">
              No specialists found matching criteria in {selectedCity === 'All' ? 'the network' : selectedCity}.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDoctors.map((doc) => (
                <DoctorCard key={doc._id} doctor={doc} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Doctors;
