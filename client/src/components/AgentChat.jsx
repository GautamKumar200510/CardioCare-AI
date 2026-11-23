import React, { useState, useRef, useEffect } from 'react';
import {
  Activity,
  AlertCircle,
  Bot,
  Calendar,
  CheckCircle2,
  Clock,
  CornerDownLeft,
  FileCheck,
  Heart,
  Hospital,
  RefreshCw,
  Send,
  Sparkles,
  User,
  Zap,
} from 'lucide-react';
import api from '../services/api';

const AgentChat = ({
  onStateUpdate,
  initialPrompt = '',
}) => {
  const [messages, setMessages] = useState([
    {
      sender: 'agent',
      text: "Hello! I am your autonomous Multi-Specialty Healthcare Agent. You can speak naturally across 15 medical specialties, for example: 'Book the earliest cardiologist appointment tomorrow after 3 PM' or 'I need an orthopedic doctor this Friday in Pune.' I will discover real hospitals, check specialist schedules, and coordinate your booking.",
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState(initialPrompt);
  const [loading, setLoading] = useState(false);
  const [sessionId] = useState(() => `session-${Date.now()}-${Math.floor(Math.random() * 1000)}`);
  const [proposedSlot, setProposedSlot] = useState(null);
  const [bookingSuccessId, setBookingSuccessId] = useState(null);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSendMessage = async (textToSend = null) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || loading) return;

    // Optimistically push user message
    const newMsgList = [...messages, { sender: 'user', text, timestamp: new Date() }];
    setMessages(newMsgList);
    setInputMessage('');
    setLoading(true);

    try {
      const response = await api.post('/agent/chat', {
        message: text,
        sessionId,
      });

      if (response.data?.success) {
        const { reply, workflowState, currentTools, proposedSlot: newSlot, bookingId, conversation } = response.data;

        setMessages((prev) => [
          ...prev,
          {
            sender: 'agent',
            text: reply,
            timestamp: new Date(),
            proposedSlot: newSlot,
            bookingId,
          },
        ]);

        if (newSlot) setProposedSlot(newSlot);
        if (bookingId) setBookingSuccessId(bookingId);

        // Notify parent page for timeline synchronization
        if (onStateUpdate) {
          onStateUpdate({
            workflowState,
            currentTools,
            conversation,
          });
        }
      }
    } catch (err) {
      console.error('[AgentChat Error]:', err);
      setMessages((prev) => [
        ...prev,
        {
          sender: 'agent',
          text: `⚠️ Agent operational error: ${err.response?.data?.message || err.message}. Please retry or check database connection.`,
          timestamp: new Date(),
          isError: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmSlot = async () => {
    setLoading(true);
    try {
      const response = await api.post('/agent/confirm-booking', { sessionId });
      if (response.data?.success) {
        const { reply, workflowState, bookingId, conversation } = response.data;
        setMessages((prev) => [
          ...prev,
          {
            sender: 'agent',
            text: reply,
            timestamp: new Date(),
            bookingId,
          },
        ]);
        setProposedSlot(null);
        setBookingSuccessId(bookingId);
        if (onStateUpdate) {
          onStateUpdate({ workflowState, conversation });
        }
      }
    } catch (err) {
      console.error('[Confirm Error]:', err);
      setMessages((prev) => [
        ...prev,
        {
          sender: 'agent',
          text: `Error confirming slot: ${err.response?.data?.message || err.message}`,
          timestamp: new Date(),
          isError: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleRejectSlot = async () => {
    setLoading(true);
    try {
      const response = await api.post('/agent/retry', {
        sessionId,
        reason: 'User requested another slot',
      });
      if (response.data?.success) {
        const { reply, workflowState, proposedSlot: newSlot, conversation } = response.data;
        setMessages((prev) => [
          ...prev,
          {
            sender: 'agent',
            text: reply,
            timestamp: new Date(),
            proposedSlot: newSlot,
          },
        ]);
        setProposedSlot(newSlot || null);
        if (onStateUpdate) {
          onStateUpdate({ workflowState, conversation });
        }
      }
    } catch (err) {
      console.error('[Reject Error]:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-full overflow-hidden">
      {/* Chat Header */}
      <div className="p-4 bg-gradient-to-r from-navy-800 to-navy-900 text-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center text-sky-300">
            <Bot className="w-5 h-5 animate-bounce" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold tracking-tight">CardioCare Autonomous Agent</h3>
              <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                Active
              </span>
            </div>
            <p className="text-xs text-sky-200/80">
              Multi-step natural language appointment coordinator
            </p>
          </div>
        </div>
      </div>

      {/* Suggested Quick Prompts across multiple specialties */}
      <div className="px-4 py-2.5 bg-sky-50/50 border-b border-sky-100 flex items-center gap-2 overflow-x-auto text-xs">
        <span className="text-[11px] font-bold text-navy-800 uppercase tracking-wider shrink-0 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-sky-600" /> Try:
        </span>
        <button
          onClick={() => handleSendMessage('Book the earliest cardiologist appointment tomorrow after 3 PM in Pune for Rahul Sharma phone 9876543210')}
          className="px-3 py-1 bg-white hover:bg-sky-50 text-navy-900 font-semibold rounded-full border border-sky-200 shadow-2xs whitespace-nowrap transition-colors"
        >
          "Cardiologist tomorrow after 3 PM"
        </button>
        <button
          onClick={() => handleSendMessage('I need an orthopedic doctor this Friday in Pune for Rahul Sharma phone 9876543210')}
          className="px-3 py-1 bg-white hover:bg-sky-50 text-slate-700 font-medium rounded-full border border-slate-200 whitespace-nowrap transition-colors"
        >
          "Orthopedic doctor this Friday"
        </button>
        <button
          onClick={() => handleSendMessage('Find a dermatologist in Pune tomorrow for Rahul Sharma phone 9876543210')}
          className="px-3 py-1 bg-white hover:bg-sky-50 text-slate-700 font-medium rounded-full border border-slate-200 whitespace-nowrap transition-colors"
        >
          "Dermatologist in Pune"
        </button>
        <button
          onClick={() => handleSendMessage('Book the earliest neurologist appointment after 4 PM in Pune for Rahul Sharma phone 9876543210')}
          className="px-3 py-1 bg-white hover:bg-sky-50 text-slate-700 font-medium rounded-full border border-slate-200 whitespace-nowrap transition-colors"
        >
          "Neurologist after 4 PM"
        </button>
        <button
          onClick={() => handleSendMessage('I need a pediatrician for my child in Pune tomorrow for Rahul Sharma phone 9876543210')}
          className="px-3 py-1 bg-white hover:bg-sky-50 text-slate-700 font-medium rounded-full border border-slate-200 whitespace-nowrap transition-colors"
        >
          "Pediatrician for child"
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="p-4 overflow-y-auto flex-1 space-y-4">
        {messages.map((msg, index) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={index}
              className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="w-8 h-8 rounded-xl bg-navy-800 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                  <Bot className="w-4 h-4 text-sky-300" />
                </div>
              )}

              <div className={`max-w-[85%] space-y-2`}>
                <div
                  className={`p-3.5 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${
                    isUser
                      ? 'bg-navy-800 text-white rounded-tr-none shadow-sm'
                      : msg.isError
                      ? 'bg-rose-50 text-rose-800 border border-rose-200 rounded-tl-none'
                      : 'bg-slate-100 text-slate-800 rounded-tl-none border border-slate-200/60'
                  }`}
                >
                  {msg.text}
                </div>

                {/* Interactive Proposed Slot Card */}
                {msg.proposedSlot && !bookingSuccessId && (
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-white to-sky-50 border-2 border-sky-400 shadow-md">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-sky-800 bg-sky-100 px-2 py-0.5 rounded-full">
                        Recommended Earliest Slot
                      </span>
                      <span className="text-xs font-bold text-emerald-700">
                        ₹{msg.proposedSlot.consultationFee}
                      </span>
                    </div>

                    <div className="space-y-1 text-xs text-slate-700 mb-3">
                      <p className="font-bold text-sm text-navy-900">
                        Dr. {msg.proposedSlot.doctorName}
                      </p>
                      <p className="text-slate-500">
                        {msg.proposedSlot.doctorSpecialty} • {msg.proposedSlot.hospitalName}
                      </p>
                      <p className="text-emerald-700 font-bold flex items-center gap-1 mt-1">
                        <Clock className="w-3.5 h-3.5" />
                        {msg.proposedSlot.appointmentDate} at {msg.proposedSlot.appointmentTime} IST
                      </p>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-sky-100">
                      <button
                        onClick={handleConfirmSlot}
                        disabled={loading}
                        className="flex-1 py-2 px-3 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Confirm Appointment
                      </button>
                      <button
                        onClick={handleRejectSlot}
                        disabled={loading}
                        className="py-2 px-3 text-xs font-semibold rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 transition-colors flex items-center gap-1"
                      >
                        <RefreshCw className="w-3.5 h-3.5" /> Alternative
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {isUser && (
                <div className="w-8 h-8 rounded-xl bg-sky-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {/* Real-time Agent Thinking & Tool Indicator */}
        {loading && (
          <div className="flex gap-3 items-center">
            <div className="w-8 h-8 rounded-xl bg-navy-800 text-white flex items-center justify-center shrink-0 animate-pulse">
              <Bot className="w-4 h-4 text-sky-300" />
            </div>
            <div className="p-3 rounded-2xl bg-sky-50 border border-sky-200 text-xs font-medium text-navy-800 flex items-center gap-2.5">
              <div className="w-4 h-4 border-2 border-sky-600 border-t-transparent rounded-full animate-spin"></div>
              <span>Agent is querying OpenStreetMap, doctor schedules & evaluating earliest slots...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Box */}
      <div className="p-3 bg-slate-50 border-t border-slate-200">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type your request: e.g. 'Orthopedic doctor in Pune this Friday' or 'Cardiologist after 3 PM'"
            disabled={loading}
            className="flex-1 px-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent bg-white shadow-2xs"
          />
          <button
            type="submit"
            disabled={loading || !inputMessage.trim()}
            className="px-4 py-2.5 bg-navy-800 hover:bg-navy-900 disabled:bg-slate-300 text-white rounded-xl text-sm font-semibold flex items-center gap-1.5 transition-all shadow-sm"
          >
            <span>Send</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default AgentChat;
