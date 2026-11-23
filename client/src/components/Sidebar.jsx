import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Activity,
  Bot,
  Calendar,
  CalendarPlus,
  Hospital,
  LayoutDashboard,
  LineChart,
  Settings as SettingsIcon,
  UserCheck,
} from 'lucide-react';

const Sidebar = () => {
  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'AI Booking Agent', path: '/agent', icon: Bot, highlight: true },
    { name: 'Hospital Discovery', path: '/hospitals', icon: Hospital },
    { name: 'Doctors & Specialists', path: '/doctors', icon: UserCheck },
    { name: 'Direct Booking', path: '/booking', icon: CalendarPlus },
    { name: 'My Appointments', path: '/appointments', icon: Calendar },
    { name: 'Analytics & Trends', path: '/analytics', icon: LineChart },
    { name: 'Settings & Profile', path: '/settings', icon: SettingsIcon },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between shrink-0">
      <div className="space-y-1">
        <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Navigation Portal
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? item.highlight
                      ? 'bg-sky-600 text-white shadow-sm'
                      : 'bg-navy-800 text-white shadow-sm'
                    : item.highlight
                    ? 'text-sky-700 bg-sky-50 hover:bg-sky-100 font-semibold'
                    : 'text-slate-600 hover:text-navy-900 hover:bg-slate-100'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </div>

      {/* Autonomous Agent Status Widget */}
      <div className="mt-6 p-4 rounded-xl bg-gradient-to-br from-sky-50 to-blue-50 border border-sky-100">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-xs font-bold text-navy-900">Agent Core Online</span>
        </div>
        <p className="text-[11px] text-slate-600 leading-relaxed">
          Autonomous multi-step scheduler ready with OSM Overpass API & Earliest Slot Optimizer.
        </p>
      </div>
    </aside>
  );
};

export default Sidebar;
