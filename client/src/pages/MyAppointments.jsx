import React, { useState, useEffect } from 'react';
import { Calendar, CalendarCheck, CheckCircle2, Clock, Filter, Search, XCircle } from 'lucide-react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import AppointmentCard from '../components/AppointmentCard';
import api from '../services/api';

const MyAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await api.get('/appointments/my');
      if (res.data?.success) {
        setAppointments(res.data.data);
      }
    } catch (err) {
      console.error('[Fetch Appointments Error]:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleCancelAppointment = async (id) => {
    try {
      const res = await api.patch(`/appointments/${id}/cancel`);
      if (res.data?.success) {
        // Update local status
        setAppointments((prev) =>
          prev.map((a) => (a._id === id ? { ...a, status: 'cancelled' } : a))
        );
      }
    } catch (err) {
      alert(`Cancellation failed: ${err.response?.data?.message || err.message}`);
    }
  };

  const filtered = appointments.filter((a) => {
    if (filter === 'all') return true;
    return a.status === filter;
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar />

        <main className="flex-1 p-6 lg:p-8 space-y-6 overflow-y-auto">
          {/* Header & Status Filter */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="w-5 h-5 text-sky-600" />
                <h1 className="text-2xl font-extrabold text-navy-900 tracking-tight">
                  My Appointments
                </h1>
              </div>
              <p className="text-xs text-slate-500">
                Manage your confirmed bookings, print passes, or release scheduled slots
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center rounded-xl bg-white border border-slate-300 p-1 shadow-2xs">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  filter === 'all'
                    ? 'bg-navy-800 text-white shadow-xs'
                    : 'text-slate-600 hover:text-navy-900'
                }`}
              >
                All ({appointments.length})
              </button>
              <button
                onClick={() => setFilter('confirmed')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  filter === 'confirmed'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-emerald-700'
                }`}
              >
                Confirmed
              </button>
              <button
                onClick={() => setFilter('cancelled')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  filter === 'cancelled'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-rose-700'
                }`}
              >
                Cancelled
              </button>
            </div>
          </div>

          {/* Appointments Grid */}
          {loading ? (
            <div className="py-20 text-center text-slate-400 text-xs">
              Retrieving your appointment records...
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-20 text-center text-slate-400 text-xs space-y-2">
              <CalendarCheck className="w-8 h-8 mx-auto text-slate-300" />
              <p>No appointments found under the selected filter.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((app) => (
                <AppointmentCard
                  key={app._id}
                  appointment={app}
                  onCancel={handleCancelAppointment}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default MyAppointments;
