const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const { protect, optionalAuth } = require('../middleware/authMiddleware');
const { getDoctorAvailableSlots, checkCityWideAvailability } = require('../services/appointment/availabilityService');
const { createAppointment, cancelAppointment } = require('../services/appointment/bookingService');

/**
 * POST /api/appointments/check-availability
 * Body: { doctorId, city, specialty, targetDate, timeAfter }
 */
router.post('/check-availability', async (req, res) => {
  try {
    const { doctorId, city, specialty, targetDate, timeAfter } = req.body;

    if (!targetDate) {
      return res.status(400).json({ success: false, message: 'targetDate (YYYY-MM-DD) is required.' });
    }

    if (doctorId) {
      const slots = await getDoctorAvailableSlots(doctorId, targetDate, timeAfter);
      return res.json({
        success: true,
        count: slots.length,
        data: slots,
      });
    }

    // City-wide search
    const slots = await checkCityWideAvailability({
      city: city || 'Pune',
      specialty: specialty || 'Cardiology',
      targetDate,
      timeAfter,
    });

    return res.json({
      success: true,
      count: slots.length,
      data: slots,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * POST /api/appointments/book
 * Body: { doctorId, hospitalId, appointmentDate, appointmentTime, patientName, patientPhone, notes }
 */
router.post('/book', optionalAuth, async (req, res) => {
  try {
    const {
      doctorId,
      hospitalId,
      appointmentDate,
      appointmentTime,
      patientName,
      patientPhone,
      bookingMode,
      notes,
    } = req.body;

    const effectivePatientId = req.user?._id || req.body.patientId;
    const effectiveName = patientName || req.user?.name;
    const effectivePhone = patientPhone || req.user?.phone;

    if (!effectiveName || !effectivePhone) {
      return res.status(400).json({
        success: false,
        message: 'Patient full name and phone number are required for appointment booking.',
      });
    }

    const appointment = await createAppointment({
      patientId: effectivePatientId,
      patientName: effectiveName,
      patientPhone: effectivePhone,
      doctorId,
      hospitalId,
      appointmentDate,
      appointmentTime,
      bookingMode: bookingMode || 'demonstration',
      notes,
    });

    return res.status(201).json({
      success: true,
      message: 'Appointment confirmed successfully.',
      data: appointment,
    });
  } catch (err) {
    if (err.code === 'SLOT_CONFLICT') {
      return res.status(409).json({
        success: false,
        code: 'SLOT_CONFLICT',
        message: err.message,
      });
    }
    return res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * GET /api/appointments/my
 */
router.get('/my', protect, async (req, res) => {
  try {
    const appointments = await Appointment.find({ patientId: req.user._id })
      .populate('doctorId', 'name specialty qualification consultationFee profileImage')
      .populate('hospitalId', 'name address city phone emergency latitude longitude')
      .sort({ appointmentDate: -1, appointmentTime: -1 });

    return res.json({
      success: true,
      count: appointments.length,
      data: appointments,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * GET /api/appointments/:id
 */
router.get('/:id', protect, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('doctorId')
      .populate('hospitalId');

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment record not found.' });
    }

    // Verify ownership
    if (
      req.user.role !== 'admin' &&
      appointment.patientId.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: You do not have permission to view this appointment.',
      });
    }

    return res.json({ success: true, data: appointment });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * PATCH /api/appointments/:id/cancel
 */
router.patch('/:id/cancel', protect, async (req, res) => {
  try {
    const appointment = await cancelAppointment(req.params.id, req.user._id);
    return res.json({
      success: true,
      message: 'Appointment cancelled successfully.',
      data: appointment,
    });
  } catch (err) {
    const status = err.statusCode || (err.message.includes('Unauthorized') ? 403 : 500);
    return res.status(status).json({ success: false, message: err.message });
  }
});

module.exports = router;
