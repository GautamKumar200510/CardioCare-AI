import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  ArrowRight,
  Bot,
  Calendar,
  CalendarCheck,
  CheckCircle2,
  Clock,
  Heart,
  Hospital,
  ShieldCheck,
  TrendingUp,
  User,
  XCircle,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Dashboard = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [appRes, anaRes] = await Promise.all([
          api.get('/appointments/my'),
          api.get('/analytics/dashboard'),
        ]);

        if (appRes.data?.success) {
          setAppointments(appRes.data.data);
        }
        if (anaRes.data?.success) {
          setAnalytics(anaRes.data);
        }
      } catch (err) {
        console.error('[Dashboard Error]:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const total = appointments.length;
  const upcoming = appointments.filter((a) => a.status === 'confirmed').length;
  const completed = appointments.filter((a) => a.status === 'completed').length;
  const cancelled = appointments.filter((a) => a.status === 'cancelled').length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar />

        <main className="flex-1 p-6 lg:p-8 space-y-8 overflow-y-auto">
          {/* Welcome Banner */}
          <div className="bg-gradient-to-r from-navy-800 to-navy-900 rounded-3xl p-6 lg:p-8 text-white shadow-xl relative overflow-hidden">
            <div className="relative z-10 max-w-2xl space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 text-xs font-bold border border-sky-400/30">
                <ShieldCheck className="w-3.5 h-3.5" /> Patient Health Portal
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Welcome back, {user?.name || 'Patient'}!
              </h1>
              <p className="text-xs sm:text-sm text-sky-100/80 leading-relaxed">
                CardioCare AI is actively monitoring healthcare availability across 15 medical specialties and your preferred hospitals. You can book new appointments in seconds through our conversational agent.
              </p>
              <div className="pt-2">
                <Link
                  to="/agent"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-sky-500 hover:bg-sky-400 text-navy-950 font-bold rounded-xl text-xs sm:text-sm shadow-md transition-all"
                >
                  <Bot className="w-4 h-4" />
                  <span>Launch AI Booking Assistant</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Decorative Heartbeat Graphic */}
            <div className="absolute right-4 bottom-2 opacity-10 pointer-events-none hidden sm:block">
              <Heart className="w-64 h-64 text-white" />
            </div>
          </div>

          {/* Metric Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Total Bookings</span>
                <Calendar className="w-4 h-4 text-sky-600" />
              </div>
              <span className="text-2xl font-black text-navy-900">{total}</span>
              <p className="text-[11px] text-slate-500 mt-1">Across all hospitals</p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Upcoming</span>
                <Clock className="w-4 h-4 text-emerald-600" />
              </div>
              <span className="text-2xl font-black text-emerald-600">{upcoming}</span>
              <p className="text-[11px] text-slate-500 mt-1">Confirmed appointments</p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Completed</span>
                <CheckCircle2 className="w-4 h-4 text-indigo-600" />
              </div>
              <span className="text-2xl font-black text-indigo-600">{completed}</span>
              <p className="text-[11px] text-slate-500 mt-1">Consultations finished</p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Cancelled</span>
                <XCircle className="w-4 h-4 text-rose-500" />
              </div>
              <span className="text-2xl font-black text-rose-500">{cancelled}</span>
              <p className="text-[11px] text-slate-500 mt-1">Released slots</p>
            </div>
          </div>

          {/* Main Grid: Recent Activity & AI Activity Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Recent Appointments */}
            <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-base font-bold text-navy-900">Recent Booking Activity</h3>
                  <p className="text-xs text-slate-500">Your latest cardiologist consultations</p>
                </div>
                <Link
                  to="/appointments"
                  className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1"
                >
                  <span>View All</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {loading ? (
                <div className="py-12 text-center text-slate-400 text-xs">Loading appointments...</div>
              ) : appointments.length === 0 ? (
                <div className="py-12 text-center text-slate-400 space-y-2">
                  <CalendarCheck className="w-8 h-8 mx-auto text-slate-300" />
                  <p className="text-xs">No appointment bookings found yet.</p>
                  <Link
                    to="/agent"
                    className="inline-block mt-2 px-4 py-2 bg-navy-800 text-white rounded-xl text-xs font-semibold"
                  >
                    Schedule with AI Agent
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {appointments.slice(0, 3).map((app) => (
                    <div key={app._id} className="py-3.5 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center font-bold text-sm">
                          {app.doctorId?.name?.charAt(0) || 'D'}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-navy-900">
                            Dr. {app.doctorId?.name || 'Cardiologist'}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            {app.hospitalId?.name} • {app.hospitalId?.city}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-bold text-slate-800 block">
                          {app.appointmentDate} at {app.appointmentTime}
                        </span>
                        <span
                          className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mt-0.5 ${
                            app.status === 'confirmed'
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-rose-50 text-rose-700'
                          }`}
                        >
                          {app.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* AI Agent Activity Summary Card */}
            <div className="lg:col-span-4 bg-gradient-to-br from-white to-sky-50/60 rounded-3xl border border-sky-200/80 p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-sky-600 text-white flex items-center justify-center">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-navy-900">AI Scheduling Engine</h3>
                  <p className="text-[11px] text-slate-500">Deterministic + Gemini Pipeline</p>
                </div>
              </div>

              <div className="space-y-3 text-xs text-slate-600">
                <div className="p-3 rounded-xl bg-white border border-slate-200/80 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Available Specialists
                  </span>
                  <span className="text-lg font-black text-navy-900">
                    {analytics?.summary?.totalDoctors || 10} Cardiologists
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-white border border-slate-200/80 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Discovered Hospitals
                  </span>
                  <span className="text-lg font-black text-navy-900">
                    {analytics?.summary?.totalHospitals || 13} Verified Centers
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-white border border-slate-200/80 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Autonomous Tool Invocations
                  </span>
                  <span className="text-lg font-black text-emerald-600">
                    {analytics?.summary?.totalToolsRun || 24} Executions
                  </span>
                </div>
              </div>

              <Link
                to="/agent"
                className="w-full py-2.5 px-3 bg-navy-800 hover:bg-navy-900 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
              >
                <span>Open Agent Console</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
