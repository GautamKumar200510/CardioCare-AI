import React from 'react';
import { ExternalLink, Globe, Hospital as HospitalIcon, MapPin, Phone, ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';

const HospitalCard = ({ hospital, onSelectMap, isSelected = false }) => {
  return (
    <div
      className={`p-5 rounded-2xl border transition-all ${
        isSelected
          ? 'bg-sky-50/50 border-sky-400 shadow-md ring-1 ring-sky-300'
          : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm'
      }`}
    >
      <div className="flex items-start justify-between gap-3 mb-2.5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-700 shrink-0">
            <HospitalIcon className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-base font-bold text-navy-900 leading-snug">
              {hospital.name}
            </h4>
            <span className="inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600">
              {hospital.amenity || 'General / Cardiac Center'}
            </span>
          </div>
        </div>
        {hospital.emergency && (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-200 shrink-0">
            <ShieldAlert className="w-3 h-3" /> 24/7 Emergency
          </span>
        )}
      </div>

      {/* Address */}
      <div className="flex items-start gap-2 text-xs text-slate-600 mt-3">
        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
        <span className="line-clamp-2">{hospital.address}</span>
      </div>

      {/* Phone */}
      {hospital.phone && (
        <div className="flex items-center gap-2 text-xs text-slate-600 mt-1.5">
          <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>{hospital.phone}</span>
        </div>
      )}

      {/* Coordinates & OpenStreetMap Source */}
      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
        <div className="flex items-center gap-1 font-mono text-[10px]">
          <span>{hospital.latitude?.toFixed(4)}°N</span>,
          <span>{hospital.longitude?.toFixed(4)}°E</span>
        </div>
        <span className="text-[10px] text-slate-400 truncate max-w-[150px]" title={hospital.source}>
          {hospital.source}
        </span>
      </div>

      {/* Action Buttons */}
      <div className="mt-4 flex items-center gap-2">
        <button
          onClick={() => onSelectMap && onSelectMap(hospital)}
          className="flex-1 py-2 px-3 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors flex items-center justify-center gap-1.5"
        >
          <Globe className="w-3.5 h-3.5" /> View on Map
        </button>
        <Link
          to={`/booking?hospitalId=${hospital._id}&city=${encodeURIComponent(hospital.city)}`}
          className="flex-1 py-2 px-3 text-xs font-semibold rounded-xl bg-navy-800 hover:bg-navy-900 text-white transition-colors flex items-center justify-center gap-1.5 shadow-sm"
        >
          Book Appointment
        </Link>
      </div>
    </div>
  );
};

export default HospitalCard;
