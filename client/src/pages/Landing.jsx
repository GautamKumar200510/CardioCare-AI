import React from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  ArrowRight,
  Bot,
  Compass,
  Heart,
  Hospital,
  Layers,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Users,
} from 'lucide-react';
import Navbar from '../components/Navbar';

const Landing = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-sky-50/70 via-white to-slate-50 py-20 lg:py-28 border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-navy-900 tracking-tight leading-[1.15]">
            Your Intelligent <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-navy-800">
              Multi-Specialty Healthcare
            </span>{' '}
            Appointment Assistant.
          </h1>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-8">
            <Link
              to="/agent"
              className="px-8 py-4 bg-navy-800 hover:bg-navy-900 text-white rounded-2xl text-base font-bold shadow-lg shadow-navy-800/20 hover:shadow-xl transition-all flex items-center gap-2 group"
            >
              <Bot className="w-5 h-5 text-sky-300" />
              <span>Start AI Booking</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              to="/doctors"
              className="px-8 py-4 bg-white hover:bg-slate-100 text-navy-900 rounded-2xl text-base font-bold border border-slate-300 shadow-sm transition-all flex items-center gap-2"
            >
              <Stethoscope className="w-5 h-5 text-sky-600" />
              <span>Doctors & Specialists</span>
            </Link>

            <Link
              to="/hospitals"
              className="px-8 py-4 bg-white hover:bg-slate-100 text-slate-700 rounded-2xl text-base font-semibold border border-slate-300 shadow-sm transition-all flex items-center gap-2"
            >
              <Hospital className="w-5 h-5 text-slate-500" />
              <span>Explore Hospitals (OSM)</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Multi-Specialty Catalog Showcase */}
      <section className="py-16 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-sky-600 bg-sky-50 px-3 py-1 rounded-full border border-sky-200">
                15 Medical Specialties
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-navy-900 tracking-tight mt-2">
                Specialized Care Across All Clinical Fields
              </h2>
            </div>
            <Link
              to="/doctors"
              className="text-xs font-bold text-sky-600 hover:text-navy-900 flex items-center gap-1 group"
            >
              <span>Explore all specialists</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {[
              { name: 'Cardiology', icon: Heart, slug: 'cardiology' },
              { name: 'Orthopedics', icon: Stethoscope, slug: 'orthopedics' },
              { name: 'Dermatology', icon: Sparkles, slug: 'dermatology' },
              { name: 'Neurology', icon: Activity, slug: 'neurology' },
              { name: 'General Medicine', icon: Stethoscope, slug: 'general-medicine' },
              { name: 'Pediatrics', icon: Users, slug: 'pediatrics' },
              { name: 'Gynecology', icon: ShieldCheck, slug: 'gynecology' },
              { name: 'ENT', icon: Compass, slug: 'ent' },
              { name: 'Ophthalmology', icon: Stethoscope, slug: 'ophthalmology' },
              { name: 'Dentistry', icon: Sparkles, slug: 'dentistry' },
              { name: 'Psychiatry', icon: Activity, slug: 'psychiatry' },
              { name: 'Urology', icon: Stethoscope, slug: 'urology' },
              { name: 'Gastroenterology', icon: Layers, slug: 'gastroenterology' },
              { name: 'Pulmonology', icon: Activity, slug: 'pulmonology' },
              { name: 'Oncology', icon: ShieldCheck, slug: 'oncology' },
            ].map((spec) => {
              const Icon = spec.icon;
              return (
                <Link
                  key={spec.slug}
                  to={`/doctors?specialty=${encodeURIComponent(spec.name)}`}
                  className="p-3.5 rounded-2xl bg-slate-50 hover:bg-sky-50/70 border border-slate-200/80 hover:border-sky-300 transition-all flex items-center gap-2.5 group"
                >
                  <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-sky-700 group-hover:bg-sky-600 group-hover:text-white transition-colors shrink-0">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-navy-900 group-hover:text-sky-800 transition-colors truncate">
                    {spec.name}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-navy-900 text-white py-12 border-t border-navy-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-sky-600 flex items-center justify-center text-white font-bold">
                C
              </div>
              <div>
                <span className="font-bold text-base">CardioCare AI</span>
                <p className="text-xs text-slate-400">Autonomous Hospital Appointment Booking Agent</p>
              </div>
            </div>
            <p className="text-xs text-slate-400 text-center md:text-right">
              MERN Stack • Google Gemini AI • OpenStreetMap Overpass API • Academic Research Project 2026
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
