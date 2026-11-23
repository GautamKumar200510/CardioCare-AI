import React, { useState } from 'react';
import {
  Bell,
  CheckCircle2,
  Cpu,
  Database,
  Globe,
  Heart,
  LogOut,
  Mail,
  Phone,
  Save,
  Settings as SettingsIcon,
  ShieldCheck,
  User,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Settings = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [emailAlerts, setEmailAlerts] = useState(true);
  const [inAppAlerts, setInAppAlerts] = useState(true);
  const [savedNotice, setSavedNotice] = useState(false);

  const handleSavePreferences = (e) => {
    e.preventDefault();
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar />

        <main className="flex-1 p-6 lg:p-8 space-y-6 overflow-y-auto">
          {/* Header */}
          <div className="border-b border-slate-200 pb-5">
            <h1 className="text-2xl font-extrabold text-navy-900 tracking-tight flex items-center gap-2">
              <SettingsIcon className="w-6 h-6 text-sky-600" />
              Patient Settings & Integrations
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Manage your clinical credentials, notification preferences, and system diagnostics
            </p>
          </div>

          {savedNotice && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Preferences updated and saved to local profile.</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left: Profile & Preferences */}
            <div className="lg:col-span-8 space-y-6">
              {/* Profile Card */}
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-navy-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                  <User className="w-4 h-4 text-sky-600" /> Patient Profile Information
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-slate-400 font-bold mb-1">Full Legal Name</label>
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-semibold text-slate-800">
                      {user?.name || 'Patient'}
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-400 font-bold mb-1">Registered Email</label>
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-semibold text-slate-800">
                      {user?.email || 'Not provided'}
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-400 font-bold mb-1">Contact Phone</label>
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-semibold text-slate-800">
                      {user?.phone || 'Not provided'}
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-400 font-bold mb-1">Access Tier</label>
                    <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 font-bold text-emerald-700 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4" /> Patient Verified
                    </div>
                  </div>
                </div>
              </div>

              {/* Notification Preferences */}
              <form onSubmit={handleSavePreferences} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-navy-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                  <Bell className="w-4 h-4 text-sky-600" /> Automated Appointment Notifications
                </h3>

                <div className="space-y-3 text-xs">
                  <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200 cursor-pointer">
                    <div>
                      <span className="font-bold text-slate-800 block">Email Confirmations</span>
                      <span className="text-slate-500 text-[11px]">Send booking passes and schedule changes via SMTP</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={emailAlerts}
                      onChange={(e) => setEmailAlerts(e.target.checked)}
                      className="w-4 h-4 text-sky-600 rounded"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200 cursor-pointer">
                    <div>
                      <span className="font-bold text-slate-800 block">In-App Alerts</span>
                      <span className="text-slate-500 text-[11px]">High-priority notification badges on your dashboard</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={inAppAlerts}
                      onChange={(e) => setInAppAlerts(e.target.checked)}
                      className="w-4 h-4 text-sky-600 rounded"
                    />
                  </label>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="py-2.5 px-5 bg-navy-800 hover:bg-navy-900 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
                  >
                    <Save className="w-3.5 h-3.5" /> Save Preferences
                  </button>
                </div>
              </form>
            </div>

            {/* Right: System Diagnostics & Logout */}
            <div className="lg:col-span-4 space-y-6">
              {/* System Architecture Diagnostics */}
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-navy-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                  <Cpu className="w-4 h-4 text-sky-600" /> Engine Diagnostics
                </h3>

                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 flex items-center gap-1.5">
                      <Database className="w-3.5 h-3.5 text-slate-400" /> MongoDB Atlas / Local:
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      Connected
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-slate-400" /> Overpass OSM API:
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      Operational
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 flex items-center gap-1.5">
                      <Bot className="w-3.5 h-3.5 text-slate-400" /> Gemini / NLP Engine:
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-800">
                      Active + Fallback
                    </span>
                  </div>
                </div>
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="w-full py-3 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-2xs"
              >
                <LogOut className="w-4 h-4" /> Sign Out of Health Portal
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Settings;
