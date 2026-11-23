import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Calendar,
  CalendarCheck,
  CheckCircle2,
  Clock,
  Heart,
  Hospital as HospitalIcon,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  User,
  Layers,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Booking = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [specialties, setSpecialties] = useState([]);
  const [selectedSpecialty, setSelectedSpecialty] = useState(searchParams.get('specialty') || 'Cardiology');
  const [hospitals, setHospitals] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [selectedHospital, setSelectedHospital] = useState(searchParams.get('hospitalId') || '');
  const [selectedDoctor, setSelectedDoctor] = useState(searchParams.get('doctorId') || '');

  // Default date: tomorrow YYYY-MM-DD
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultDateStr = tomorrow.toISOString().slice(0, 10);

  const [appointmentDate, setAppointmentDate] = useState(defaultDateStr);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [slotsLoading, setSlotsLoading] = useState(false);

  // Patient Info
  const [patientName, setPatientName] = useState(user?.name || '');
  const [patientPhone, setPatientPhone] = useState(user?.phone || '');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?.name && !patientName) setPatientName(user.name);
    if (user?.phone && !patientPhone) setPatientPhone(user.phone);
  }, [user]);

  // Fetch Specialties
  useEffect(() => {
    const fetchSpecialties = async () => {
      try {
        const res = await api.get('/specialties');
        if (res.data?.success) {
          setSpecialties(res.data.data);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchSpecialties();
  }, []);

  // Fetch Hospitals
  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        const res = await api.get('/hospitals/search?city=Pune');
        if (res.data?.success) {
          setHospitals(res.data.data);
          if (!selectedHospital && res.data.data.length > 0) {
            setSelectedHospital(res.data.data[0]._id);
          }
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchHospitals();
  }, []);

  // Fetch Doctors for selected Specialty and Hospital
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        let endpoint = `/doctors?specialty=${encodeURIComponent(selectedSpecialty)}`;
        if (selectedHospital) {
          endpoint += `&hospitalId=${selectedHospital}`;
        }
        const res = await api.get(endpoint);
        if (res.data?.success) {
          setDoctors(res.data.data);
          if (res.data.data.length > 0) {
            // Keep selected doctor if in list, else pick first
            const exists = res.data.data.some((d) => d._id === selectedDoctor);
            if (!exists) {
              setSelectedDoctor(res.data.data[0]._id);
            }
          } else {
            // If none at this hospital, search specialty-wide
            const fallbackRes = await api.get(`/doctors?specialty=${encodeURIComponent(selectedSpecialty)}`);
            if (fallbackRes.data?.success && fallbackRes.data.data.length > 0) {
              setDoctors(fallbackRes.data.data);
              setSelectedDoctor(fallbackRes.data.data[0]._id);
            } else {
              setSelectedDoctor('');
            }
          }
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchDoctors();
  }, [selectedSpecialty, selectedHospital]);

  // Fetch Slots for selected Doctor & Date
  useEffect(() => {
    const fetchSlots = async () => {
      if (!selectedDoctor || !appointmentDate) return;
      setSlotsLoading(true);
      setError('');
      try {
        const res = await api.post('/appointments/check-availability', {
          doctorId: selectedDoctor,
          targetDate: appointmentDate,
          timeAfter: '15:00', // Highlights slots after 3 PM by default
        });
        if (res.data?.success) {
          setAvailableSlots(res.data.data);
          if (res.data.data.length > 0) {
            setSelectedSlot(res.data.data[0].appointmentTime);
          } else {
            setSelectedSlot('');
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setSlotsLoading(false);
      }
    };
    fetchSlots();
  }, [selectedDoctor, appointmentDate]);

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSlot) {
      setError('Please select an available appointment slot.');
      return;
    }

    setBookingLoading(true);
    setError('');

    try {
      const res = await api.post('/appointments/book', {
        doctorId: selectedDoctor,
        hospitalId: selectedHospital,
        specialty: selectedSpecialty,
        appointmentDate,
        appointmentTime: selectedSlot,
        patientName,
        patientPhone,
        bookingMode: 'demonstration',
      });

      if (res.data?.success) {
        setBookingSuccess(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Slot booking failed.');
    } finally {
      setBookingLoading(false);
    }
  };

  const currentDoctorObj = doctors.find((d) => d._id === selectedDoctor);
  const currentHospitalObj = hospitals.find((h) => h._id === selectedHospital);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar />

        <main className="flex-1 p-6 lg:p-8 space-y-6 overflow-y-auto">
          <div className="border-b border-slate-200 pb-5">
            <h1 className="text-2xl font-extrabold text-navy-900 tracking-tight flex items-center gap-2">
              <CalendarCheck className="w-6 h-6 text-sky-600" />
              Universal Clinical Appointment Booking
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Select medical specialty, hospital facility, specialist doctor, and earliest available time slot
            </p>
          </div>

          {bookingSuccess ? (
            <div className="max-w-xl mx-auto p-8 bg-white rounded-3xl border border-emerald-200 shadow-xl text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold text-navy-900">Appointment Confirmed!</h2>
              <p className="text-xs text-slate-600">
                Your consultation has been persistently reserved in the clinical database.
              </p>
              <div className="p-4 rounded-2xl bg-slate-50 text-left text-xs space-y-1.5 border border-slate-200">
                <p><strong className="text-slate-400">Reference:</strong> <span className="font-mono font-bold text-navy-900">{bookingSuccess.bookingId}</span></p>
                <p><strong className="text-slate-400">Specialty:</strong> {bookingSuccess.specialty || selectedSpecialty}</p>
                <p><strong className="text-slate-400">Patient:</strong> {bookingSuccess.patientName}</p>
                <p><strong className="text-slate-400">Date & Time:</strong> {bookingSuccess.appointmentDate} at {bookingSuccess.appointmentTime} IST</p>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => navigate('/appointments')}
                  className="flex-1 py-3 bg-navy-800 text-white rounded-xl text-xs font-bold shadow-sm"
                >
                  View My Appointments
                </button>
                <button
                  onClick={() => setBookingSuccess(null)}
                  className="py-3 px-4 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold"
                >
                  Book Another
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleBookingSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Column: Form Fields */}
              <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-5">
                {error && (
                  <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
                    {error}
                  </div>
                )}

                {/* Specialty Selection */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-sky-600" />
                    Medical Specialty (15 Supported)
                  </label>
                  <select
                    value={selectedSpecialty}
                    onChange={(e) => setSelectedSpecialty(e.target.value)}
                    className="w-full p-3 text-xs sm:text-sm rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-sky-500 font-semibold text-navy-900"
                  >
                    {specialties.map((s) => (
                      <option key={s.slug} value={s.name}>
                        {s.name} — {s.description}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Hospital Selection */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                    <HospitalIcon className="w-4 h-4 text-sky-600" />
                    Select Healthcare Facility
                  </label>
                  <select
                    value={selectedHospital}
                    onChange={(e) => setSelectedHospital(e.target.value)}
                    className="w-full p-3 text-xs sm:text-sm rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-sky-500"
                  >
                    {hospitals.map((h) => (
                      <option key={h._id} value={h._id}>
                        {h.name} — {h.city} ({h.area || 'Central Area'})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Doctor Selection */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                    <Stethoscope className="w-4 h-4 text-sky-600" />
                    Select Specialist Doctor
                  </label>
                  <select
                    value={selectedDoctor}
                    onChange={(e) => setSelectedDoctor(e.target.value)}
                    className="w-full p-3 text-xs sm:text-sm rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-sky-500"
                  >
                    {doctors.map((d) => (
                      <option key={d._id} value={d._id}>
                        Dr. {d.name} ({d.specialty} • Fee: ₹{d.consultationFee} • {d.verificationStatus === 'verified' ? 'Verified' : 'Demo'})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date Selection */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-sky-600" />
                    Target Appointment Date
                  </label>
                  <input
                    type="date"
                    value={appointmentDate}
                    min={new Date().toISOString().slice(0, 10)}
                    onChange={(e) => setAppointmentDate(e.target.value)}
                    className="w-full p-3 text-xs sm:text-sm rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                {/* Available Slots Grid */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-sky-600" /> Available Time Slots (After 3 PM)
                    </span>
                    <span className="text-[11px] text-emerald-600 font-bold">
                      {availableSlots.length} Slots Available
                    </span>
                  </label>

                  {slotsLoading ? (
                    <div className="py-6 text-center text-xs text-slate-400">
                      Evaluating doctor availability schedules...
                    </div>
                  ) : availableSlots.length === 0 ? (
                    <div className="p-4 rounded-xl bg-slate-50 text-center text-xs text-slate-500">
                      No matching slots found on this date.
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 pt-1">
                      {availableSlots.map((slot, idx) => {
                        const isEarliest = idx === 0;
                        const isSelected = selectedSlot === slot.appointmentTime;

                        return (
                          <button
                            key={slot.appointmentTime}
                            type="button"
                            onClick={() => setSelectedSlot(slot.appointmentTime)}
                            className={`p-2 rounded-xl text-xs font-bold border transition-all text-center relative ${
                              isSelected
                                ? 'bg-navy-800 text-white border-navy-800 shadow-sm'
                                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                            }`}
                          >
                            {isEarliest && (
                              <span className="absolute -top-2 left-1/2 -translate-x-1/2 px-1.5 py-0.2 bg-emerald-500 text-white text-[8px] font-extrabold rounded-full">
                                Earliest
                              </span>
                            )}
                            {slot.appointmentTime}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Patient Information Inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-100">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Patient Full Name</label>
                    <input
                      type="text"
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      required
                      className="w-full p-2.5 text-xs sm:text-sm rounded-xl border border-slate-300"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Contact Phone</label>
                    <input
                      type="text"
                      value={patientPhone}
                      onChange={(e) => setPatientPhone(e.target.value)}
                      required
                      className="w-full p-2.5 text-xs sm:text-sm rounded-xl border border-slate-300"
                    />
                  </div>
                </div>
              </div>

              {/* Right Column: Booking Summary Card */}
              <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="text-base font-bold text-navy-900 border-b border-slate-100 pb-3 mb-4">
                    Booking Summary
                  </h3>

                  <div className="space-y-3 text-xs text-slate-600">
                    <div>
                      <span className="text-slate-400 block text-[11px]">Specialty</span>
                      <span className="font-bold text-sky-700 text-sm">{selectedSpecialty}</span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[11px]">Specialist</span>
                      <span className="font-bold text-navy-900 text-sm">
                        Dr. {currentDoctorObj?.name || 'Selected Doctor'}
                      </span>
                      <p className="text-[11px] text-slate-500">{currentDoctorObj?.qualification}</p>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[11px]">Hospital</span>
                      <span className="font-bold text-slate-800">
                        {currentHospitalObj?.name || 'Selected Facility'}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[11px]">Scheduled Slot</span>
                      <span className="font-bold text-emerald-700 text-sm">
                        {appointmentDate} at {selectedSlot || '--:--'} IST
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[11px]">Consultation Fee</span>
                      <span className="font-bold text-slate-800 text-sm">
                        ₹{currentDoctorObj?.consultationFee || 800}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[11px]">Booking Mode</span>
                      <span className="text-[11px] text-slate-600">
                        Demonstration booking (Simulated schedule)
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={bookingLoading || !selectedSlot}
                  className="w-full py-3 bg-navy-800 hover:bg-navy-900 disabled:bg-slate-300 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md transition-all flex items-center justify-center gap-2"
                >
                  {bookingLoading ? 'Reserving...' : 'Confirm & Reserve Slot'}
                </button>
              </div>
            </form>
          )}
        </main>
      </div>
    </div>
  );
};

export default Booking;
