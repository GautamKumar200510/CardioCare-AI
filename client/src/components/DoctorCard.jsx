import React from 'react';
import { Award, CalendarCheck, Clock, Heart, Hospital, ShieldCheck, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

const DoctorCard = ({ doctor }) => {
  const isVerified = doctor.verificationStatus === 'verified';

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 hover:border-slate-300 hover:shadow-sm transition-all flex flex-col justify-between">
      <div>
        {/* Header with Verification Status */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-navy-800 to-sky-700 text-white flex items-center justify-center font-bold text-lg shadow-sm">
              {doctor.name.charAt(0)}
            </div>
            <div>
              <h4 className="text-base font-bold text-navy-900 leading-tight">
                Dr. {doctor.name}
              </h4>
              <p className="text-xs font-semibold text-sky-700 mt-0.5">
                {doctor.specialty}
              </p>
            </div>
          </div>
          {isVerified ? (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
              <ShieldCheck className="w-3 h-3" /> Verified Doctor
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 shrink-0">
              Demo Simulation
            </span>
          )}
        </div>

        {/* Qualifications & Bio */}
        <div className="space-y-1.5 text-xs text-slate-600 mb-4">
          <div className="flex items-center gap-1.5 text-slate-700 font-medium">
            <Award className="w-3.5 h-3.5 text-sky-600 shrink-0" />
            <span className="truncate">{doctor.qualification}</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-600">
            <Hospital className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">
              {doctor.hospitalId?.name || 'Healthcare Center'}, {doctor.hospitalId?.city || 'Pune'}
            </span>
          </div>
          {doctor.verificationSource && (
            <div className="text-[10px] text-slate-400 truncate font-mono">
              Source: {doctor.verificationSource}
            </div>
          )}
        </div>

        {/* Experience & Fee Badges */}
        <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-center">
          <div>
            <span className="text-[10px] text-slate-400 block font-medium">Experience</span>
            <span className="text-xs font-bold text-slate-800">{doctor.experience} Years</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block font-medium">Consultation Fee</span>
            <span className="text-xs font-bold text-emerald-600">₹{doctor.consultationFee}</span>
          </div>
        </div>
      </div>

      {/* Booking Action */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
        <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
          <Star className="w-3.5 h-3.5 fill-amber-400" />
          <span>{doctor.rating || 4.8}</span>
        </div>
        <Link
          to={`/booking?doctorId=${doctor._id}&hospitalId=${doctor.hospitalId?._id || ''}`}
          className="py-2 px-3.5 text-xs font-semibold rounded-xl bg-navy-800 hover:bg-navy-900 text-white transition-colors flex items-center gap-1.5 shadow-sm"
        >
          <CalendarCheck className="w-3.5 h-3.5" /> Book Consultation
        </Link>
      </div>
    </div>
  );
};

export default DoctorCard;
