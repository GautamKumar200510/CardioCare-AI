const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const Hospital = require('../models/Hospital');
const Specialty = require('../models/Specialty');
const AgentConversation = require('../models/AgentConversation');

/**
 * GET /api/analytics/dashboard
 * Aggregates all clinical metrics dynamically from MongoDB
 */
router.get('/dashboard', async (req, res) => {
  try {
    const totalBookings = await Appointment.countDocuments();
    const confirmedBookings = await Appointment.countDocuments({ status: 'confirmed' });
    const cancelledBookings = await Appointment.countDocuments({ status: 'cancelled' });
    const totalDoctors = await Doctor.countDocuments();
    const totalHospitals = await Hospital.countDocuments();
    const totalSpecialties = await Specialty.countDocuments();

    // Dynamic appointments by specialty aggregation
    const specialtyAppointmentsAgg = await Appointment.aggregate([
      { $match: { specialty: { $exists: true, $ne: null } } },
      { $group: { _id: '$specialty', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Most requested specialty
    const mostRequestedSpecialty = specialtyAppointmentsAgg.length > 0
      ? specialtyAppointmentsAgg[0]._id
      : 'Cardiology';

    // Doctor distribution by specialty
    const doctorSpecialtyAgg = await Doctor.aggregate([
      { $group: { _id: '$specialty', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Booking Status breakdown
    const statusData = [
      { name: 'Confirmed', value: confirmedBookings, color: '#10b981' },
      { name: 'Cancelled', value: cancelledBookings, color: '#ef4444' },
      { name: 'Completed', value: Math.max(0, totalBookings - confirmedBookings - cancelledBookings), color: '#3b82f6' },
    ];

    // Recent 7 days booking trend
    const recentAppointments = await Appointment.find({})
      .sort({ createdAt: -1 })
      .limit(60);

    const dateMap = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dStr = d.toISOString().slice(0, 10);
      dateMap[dStr] = 0;
    }

    recentAppointments.forEach((a) => {
      if (a.appointmentDate && dateMap[a.appointmentDate] !== undefined) {
        dateMap[a.appointmentDate]++;
      }
    });

    const bookingTrends = Object.keys(dateMap).map((date) => ({
      date: date.slice(5), // MM-DD
      appointments: dateMap[date],
    }));

    // Autonomous Agent executions metrics
    const conversations = await AgentConversation.find({});
    let totalToolsRun = 0;
    let successfulBookingsCount = 0;
    let failedBookingsCount = 0;

    conversations.forEach((c) => {
      totalToolsRun += c.toolExecutionHistory?.length || 0;
      if (c.workflowState === 'BOOKING_COMPLETED') {
        successfulBookingsCount++;
      } else if (c.workflowState === 'FAILED') {
        failedBookingsCount++;
      }
    });

    return res.json({
      success: true,
      summary: {
        totalBookings,
        confirmedBookings,
        cancelledBookings,
        totalDoctors,
        totalHospitals,
        totalSpecialties,
        mostRequestedSpecialty,
        totalToolsRun,
        successfulBookingsCount,
        failedBookingsCount,
        activeConversations: conversations.length,
      },
      statusData,
      specialtyAppointments: specialtyAppointmentsAgg.map((s) => ({ name: s._id, count: s.count })),
      specialtyData: doctorSpecialtyAgg.map((s) => ({ name: s._id, count: s.count })),
      bookingTrends,
    });
  } catch (err) {
    console.error('[Analytics Error]:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
