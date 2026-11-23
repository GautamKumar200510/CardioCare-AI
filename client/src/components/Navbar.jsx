import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Activity, Bot, Calendar, Heart, Hospital, LogOut, User, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-navy-800 flex items-center justify-center text-white shadow-md group-hover:bg-navy-900 transition-colors">
              <Heart className="w-5 h-5 text-rose-400 fill-rose-400 animate-pulse" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-navy-900 flex items-center gap-1.5">
                CardioCare <span className="text-sky-600 font-extrabold text-sm px-1.5 py-0.5 rounded bg-sky-50 border border-sky-200">AI</span>
              </span>
              <p className="text-[10px] text-slate-500 font-medium tracking-wide -mt-0.5">
                Autonomous Hospital Agent
              </p>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-1">
            <Link
              to="/"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive('/') ? 'text-navy-800 bg-sky-50' : 'text-slate-600 hover:text-navy-800 hover:bg-slate-100'
              }`}
            >
              Home
            </Link>
            <Link
              to="/agent"
              className={`px-3 py-2 rounded-lg text-sm font-semibold flex items-center gap-1.5 transition-colors ${
                isActive('/agent')
                  ? 'text-sky-700 bg-sky-100/70 border border-sky-200'
                  : 'text-sky-600 hover:text-sky-700 hover:bg-sky-50'
              }`}
            >
              <Bot className="w-4 h-4 text-sky-600" />
              AI Agent
            </Link>
            <Link
              to="/hospitals"
              className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors ${
                isActive('/hospitals') ? 'text-navy-800 bg-sky-50' : 'text-slate-600 hover:text-navy-800 hover:bg-slate-100'
              }`}
            >
              <Hospital className="w-4 h-4" />
              Hospitals (OSM)
            </Link>
            <Link
              to="/doctors"
              className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors ${
                isActive('/doctors') ? 'text-navy-800 bg-sky-50' : 'text-slate-600 hover:text-navy-800 hover:bg-slate-100'
              }`}
            >
              <User className="w-4 h-4" />
              Doctors & Specialists
            </Link>
            {isAuthenticated && (
              <>
                <Link
                  to="/dashboard"
                  className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors ${
                    isActive('/dashboard') ? 'text-navy-800 bg-sky-50' : 'text-slate-600 hover:text-navy-800 hover:bg-slate-100'
                  }`}
                >
                  <Activity className="w-4 h-4" />
                  Dashboard
                </Link>
                <Link
                  to="/appointments"
                  className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors ${
                    isActive('/appointments') ? 'text-navy-800 bg-sky-50' : 'text-slate-600 hover:text-navy-800 hover:bg-slate-100'
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                  My Bookings
                </Link>
              </>
            )}
          </div>

          {/* Right Action / Auth Buttons */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex flex-col text-right">
                  <span className="text-xs font-semibold text-slate-800 leading-tight">{user?.name}</span>
                  <span className="text-[10px] text-emerald-600 flex items-center justify-end gap-1">
                    <ShieldCheck className="w-3 h-3" /> Patient Verified
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  title="Sign out"
                  className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-slate-200"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 text-sm font-medium text-slate-700 hover:text-navy-800 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-semibold text-white bg-navy-800 hover:bg-navy-900 rounded-lg shadow-sm transition-all hover:shadow"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
