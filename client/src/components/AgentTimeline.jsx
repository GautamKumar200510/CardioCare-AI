import React, { useState } from 'react';
import {
  Activity,
  AlertCircle,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Compass,
  Cpu,
  Layers,
  RefreshCw,
  Search,
  ShieldCheck,
  Stethoscope,
  Terminal,
  User,
} from 'lucide-react';

const getToolIcon = (toolName) => {
  switch (toolName) {
    case 'understandUserRequest':
    case 'extractAppointmentIntent':
      return Terminal;
    case 'identifySpecialty':
      return Stethoscope;
    case 'detectMissingInformation':
      return Search;
    case 'searchHospitals':
      return Compass;
    case 'searchDoctorsBySpecialty':
    case 'searchCardiologists':
      return User;
    case 'checkDoctorAvailability':
    case 'checkAvailability':
      return Clock;
    case 'rankAvailableSlots':
    case 'rankAppointmentSlots':
      return Layers;
    case 'requestUserConfirmation':
    case 'requestPatientConfirmation':
      return ShieldCheck;
    case 'bookAppointment':
    case 'createAppointment':
      return Calendar;
    case 'sendNotification':
      return CheckCircle2;
    case 'searchAlternativeDoctors':
    case 'searchAlternativeAppointments':
    case 'retryAppointmentSearch':
    case 'retryBookingWorkflow':
      return RefreshCw;
    default:
      return Cpu;
  }
};

const getStatusBadge = (state) => {
  switch (state) {
    case 'BOOKING_COMPLETED':
      return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">Completed</span>;
    case 'CONFIRMATION_REQUESTED':
      return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">Awaiting Patient Action</span>;
    case 'MISSING_INFO_REQUESTED':
      return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-sky-100 text-sky-800 border border-sky-200">Collecting Missing Parameters</span>;
    case 'RETRYING_ALTERNATIVE':
      return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">Retrying Alternative</span>;
    case 'FAILED':
      return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-200">Needs Adjustment</span>;
    default:
      return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-800 border border-slate-200">{state || 'IDLE'}</span>;
  }
};

const AgentTimeline = ({
  workflowState = 'IDLE',
  toolExecutionHistory = [],
  retryCount = 0,
  extractedIntent = {},
}) => {
  const [expandedIndex, setExpandedIndex] = useState(null);

  const toggleExpand = (idx) => {
    setExpandedIndex(expandedIndex === idx ? null : idx);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="p-4 bg-slate-50 border-b border-slate-200">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-navy-900">Agent Activity Timeline</h3>
              <p className="text-[11px] text-slate-500">Autonomous tool execution inspection</p>
            </div>
          </div>
          {getStatusBadge(workflowState)}
        </div>

        {/* Live Metrics Row */}
        <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-200/60 text-center">
          <div className="bg-white p-2 rounded-lg border border-slate-100">
            <span className="block text-[10px] text-slate-400 font-medium">Tools Run</span>
            <span className="text-sm font-bold text-slate-800">{toolExecutionHistory.length}</span>
          </div>
          <div className="bg-white p-2 rounded-lg border border-slate-100">
            <span className="block text-[10px] text-slate-400 font-medium">Retry Count</span>
            <span className={`text-sm font-bold ${retryCount > 0 ? 'text-amber-600' : 'text-slate-800'}`}>
              {retryCount} / 5
            </span>
          </div>
          <div className="bg-white p-2 rounded-lg border border-slate-100">
            <span className="block text-[10px] text-slate-400 font-medium">Target Date</span>
            <span className="text-[11px] font-bold text-sky-700">
              {extractedIntent.resolvedDate || 'Auto'}
            </span>
          </div>
        </div>
      </div>

      {/* Tools Timeline Body */}
      <div className="p-4 overflow-y-auto flex-1 space-y-3">
        {toolExecutionHistory.length === 0 ? (
          <div className="text-center py-10 px-4">
            <Activity className="w-8 h-8 mx-auto text-slate-300 animate-pulse mb-2" />
            <p className="text-xs font-medium text-slate-500">
              Agent is awaiting user request.
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              Example: "Book the earliest cardiologist appointment tomorrow after 3 PM."
            </p>
          </div>
        ) : (
          toolExecutionHistory.map((item, index) => {
            const Icon = getToolIcon(item.toolName);
            const isExpanded = expandedIndex === index;

            return (
              <div
                key={index}
                className="border border-slate-200 rounded-xl bg-slate-50/60 hover:bg-slate-50 transition-colors overflow-hidden"
              >
                <div
                  onClick={() => toggleExpand(index)}
                  className="p-3 flex items-start gap-2.5 cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-sky-700 shrink-0 mt-0.5">
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-bold text-navy-900 truncate">
                        {item.toolName}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono shrink-0">
                        {item.executionTimeMs}ms
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-0.5 leading-snug line-clamp-2">
                      {item.decision || 'Executed step successfully.'}
                    </p>
                  </div>
                  <div className="text-slate-400 shrink-0 ml-1">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </div>

                {/* Collapsible Tool Input / Output Inspector */}
                {isExpanded && (
                  <div className="px-3 pb-3 pt-1 border-t border-slate-200 text-[10px] font-mono space-y-2 bg-white">
                    <div>
                      <span className="text-slate-500 font-semibold block mb-0.5">Tool Input:</span>
                      <pre className="p-2 rounded bg-slate-100 text-slate-700 overflow-x-auto max-h-28">
                        {JSON.stringify(item.input, null, 2)}
                      </pre>
                    </div>
                    <div>
                      <span className="text-slate-500 font-semibold block mb-0.5">Tool Output:</span>
                      <pre className="p-2 rounded bg-sky-50 text-sky-900 overflow-x-auto max-h-36">
                        {JSON.stringify(item.output, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default AgentTimeline;
