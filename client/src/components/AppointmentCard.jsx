import React, { useState } from 'react';
import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  Hospital,
  MapPin,
  Printer,
  User,
  XCircle,
} from 'lucide-react';

const AppointmentCard = ({ appointment, onCancel }) => {
  const [cancelling, setCancelling] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);

  const isConfirmed = appointment.status === 'confirmed';
  const isCancelled = appointment.status === 'cancelled';

  const handleCancelClick = async () => {
    if (!window.confirm('Are you sure you wish to cancel this cardiologist appointment?')) {
      return;
    }
    setCancelling(true);
    try {
      await onCancel(appointment._id);
    } finally {
      setCancelling(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <div className="bg-white rounded-2xl border border-slate-200 p-5 hover:border-slate-300 transition-all shadow-sm">
        {/* Top Reference & Status */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3.5">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
              Booking Reference
            </span>
            <span className="text-sm font-bold font-mono text-navy-900">
              {appointment.bookingId}
            </span>
          </div>
          <div>
            {isConfirmed && (
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5" /> Confirmed
              </span>
            )}
            {isCancelled && (
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                <XCircle className="w-3.5 h-3.5" /> Cancelled
              </span>
            )}
            {!isConfirmed && !isCancelled && (
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
                {appointment.status}
              </span>
            )}
          </div>
        </div>

        {/* Doctor & Hospital Info */}
        <div className="space-y-2 mb-4">
          <div className="flex items-start gap-2.5">
            <User className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-navy-900">
                Dr. {appointment.doctorId?.name || 'Cardiologist Specialist'}
              </p>
              <p className="text-xs text-slate-500">
                {appointment.doctorId?.specialty || 'Cardiology'} • {appointment.doctorId?.qualification || 'MBBS, MD'}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <Hospital className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-slate-700">
                {appointment.hospitalId?.name || 'Specialty Heart Institute'}
              </p>
              <p className="text-[11px] text-slate-500 line-clamp-1">
                {appointment.hospitalId?.address || 'Central Healthcare Road'}
              </p>
            </div>
          </div>
        </div>

        {/* Date & Time Pill */}
        <div className="p-3 rounded-xl bg-sky-50/70 border border-sky-100 flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-xs font-bold text-navy-900">
            <Calendar className="w-4 h-4 text-sky-600" />
            <span>{appointment.appointmentDate}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700">
            <Clock className="w-4 h-4" />
            <span>{appointment.appointmentTime} IST</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
          <button
            onClick={() => setShowPrintModal(true)}
            className="flex-1 py-2 px-3 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors flex items-center justify-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" /> Print Pass
          </button>
          {isConfirmed && (
            <button
              onClick={handleCancelClick}
              disabled={cancelling}
              className="py-2 px-3.5 text-xs font-semibold rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors flex items-center gap-1.5 border border-rose-200"
            >
              {cancelling ? 'Cancelling...' : 'Cancel'}
            </button>
          )}
        </div>
      </div>

      {/* Printable Confirmation Modal */}
      {showPrintModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="text-center border-b border-slate-200 pb-4 mb-4">
              <span className="text-xl font-bold text-navy-900">CardioCare AI</span>
              <p className="text-xs text-slate-500 font-medium">Official Clinical Appointment Confirmation Pass</p>
              <div className="mt-2 inline-block px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full">
                Status: {appointment.status.toUpperCase()}
              </div>
            </div>

            <div className="space-y-3 text-xs text-slate-700 mb-6">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400">Booking ID:</span>
                <span className="font-mono font-bold text-navy-900">{appointment.bookingId}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400">Patient Name:</span>
                <span className="font-bold">{appointment.patientName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400">Contact:</span>
                <span>{appointment.patientPhone}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400">Specialist:</span>
                <span className="font-bold">Dr. {appointment.doctorId?.name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400">Hospital:</span>
                <span className="font-bold">{appointment.hospitalId?.name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400">Appointment Date:</span>
                <span className="font-bold text-navy-900">{appointment.appointmentDate}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400">Scheduled Time:</span>
                <span className="font-bold text-emerald-700">{appointment.appointmentTime} IST</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400">Booking Mode:</span>
                <span>{appointment.bookingMode === 'verified_hospital' ? 'Verified Hospital Integration' : 'Demonstration Academic Simulation'}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handlePrint}
                className="flex-1 py-2.5 px-4 bg-navy-800 hover:bg-navy-900 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm"
              >
                <Printer className="w-4 h-4" /> Print / Save as PDF
              </button>
              <button
                onClick={() => setShowPrintModal(false)}
                className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AppointmentCard;
