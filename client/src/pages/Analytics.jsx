import React, { useState, useEffect } from 'react';
import {
  Activity,
  Bot,
  Calendar,
  CheckCircle2,
  Cpu,
  Heart,
  Hospital,
  Layers,
  LineChart as LineChartIcon,
  PieChart as PieChartIcon,
  ShieldCheck,
  TrendingUp,
  UserCheck,
  XCircle,
  Zap,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
} from 'recharts';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import api from '../services/api';

const COLORS = ['#10b981', '#ef4444', '#3b82f6', '#f59e0b', '#8b5cf6', '#06b6d4', '#ec4899', '#14b8a6'];

const Analytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get('/analytics/dashboard');
        if (res.data?.success) {
          setData(res.data);
        }
      } catch (err) {
        console.error('[Analytics Fetch Error]:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar />

        <main className="flex-1 p-6 lg:p-8 space-y-8 overflow-y-auto">
          {/* Header */}
          <div className="border-b border-slate-200 pb-5">
            <h1 className="text-2xl font-extrabold text-navy-900 tracking-tight flex items-center gap-2">
              <LineChartIcon className="w-6 h-6 text-sky-600" />
              Multi-Specialty Clinical Analytics
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Live operational metrics, booking distributions across 15 specialties, and AI agent execution logs
            </p>
          </div>

          {/* KPI Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Total Bookings
              </span>
              <span className="text-xl font-black text-navy-900">
                {data?.summary?.totalBookings || 0}
              </span>
              <p className="text-[10px] text-emerald-600 font-medium mt-1 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> In MongoDB
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Confirmed
              </span>
              <span className="text-xl font-black text-emerald-600">
                {data?.summary?.confirmedBookings || 0}
              </span>
              <p className="text-[10px] text-slate-500 mt-1">Active slots</p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Cancelled
              </span>
              <span className="text-xl font-black text-rose-500">
                {data?.summary?.cancelledBookings || 0}
              </span>
              <p className="text-[10px] text-slate-500 mt-1">Freed slots</p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Most Requested
              </span>
              <span className="text-sm font-black text-sky-700 truncate block">
                {data?.summary?.mostRequestedSpecialty || 'Cardiology'}
              </span>
              <p className="text-[10px] text-slate-500 mt-1">Highest patient demand</p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Agent Tool Runs
              </span>
              <span className="text-xl font-black text-sky-600">
                {data?.summary?.totalToolsRun || 0}
              </span>
              <p className="text-[10px] text-slate-500 mt-1">12 Tools Executed</p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Agent Booking Success
              </span>
              <span className="text-xl font-black text-emerald-600">
                {data?.summary?.successfulBookingsCount || 0} / {(data?.summary?.successfulBookingsCount || 0) + (data?.summary?.failedBookingsCount || 0)}
              </span>
              <p className="text-[10px] text-slate-500 mt-1">Autonomous outcomes</p>
            </div>
          </div>

          {/* Charts Row 1: Appointments by Specialty & Status Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Appointments by Specialty Bar Chart */}
            <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <h3 className="text-sm font-bold text-navy-900 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-sky-600" />
                  Appointments by Medical Specialty
                </h3>
              </div>
              <div className="h-64 w-full">
                {data?.specialtyAppointments && data.specialtyAppointments.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.specialtyAppointments}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#0284c7" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-xs text-slate-400">
                    No specialty bookings recorded yet.
                  </div>
                )}
              </div>
            </div>

            {/* Status Pie Chart */}
            <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <h3 className="text-sm font-bold text-navy-900 flex items-center gap-1.5">
                  <PieChartIcon className="w-4 h-4 text-sky-600" />
                  Booking Status Breakdown
                </h3>
              </div>
              <div className="h-64 w-full">
                {data?.statusData && (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data.statusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={85}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {data.statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend verticalAlign="bottom" height={36} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>

          {/* Charts Row 2: 7-Day Booking Trends & Doctor Specialty Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-6 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <h3 className="text-sm font-bold text-navy-900 flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  7-Day Multi-Specialty Booking Trend
                </h3>
              </div>
              <div className="h-60 w-full">
                {data?.bookingTrends && (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data.bookingTrends}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="appointments"
                        stroke="#0f2d59"
                        strokeWidth={3}
                        dot={{ r: 4, fill: '#0f2d59' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            <div className="lg:col-span-6 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <h3 className="text-sm font-bold text-navy-900 flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-indigo-600" />
                  Specialist Directory Across 15 Fields
                </h3>
              </div>
              <div className="h-60 w-full">
                {data?.specialtyData && (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.specialtyData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 9 }} angle={-25} textAnchor="end" height={45} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#4f46e5" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Analytics;
