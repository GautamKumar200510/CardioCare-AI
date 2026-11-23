const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const { protect } = require('../middleware/authMiddleware');

/**
 * GET /api/notifications
 */
router.get('/', protect, async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id })
      .populate('appointmentId')
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      count: notifications.length,
      data: notifications,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * POST /api/notifications/send
 * Testing / manual dispatch endpoint
 */
router.post('/send', protect, async (req, res) => {
  try {
    const { appointmentId, message, type = 'in_app' } = req.body;

    const notification = await Notification.create({
      userId: req.user._id,
      appointmentId,
      message,
      type,
      status: 'delivered',
      deliveryDetails: { directDispatch: true, timestamp: new Date() },
    });

    return res.status(201).json({
      success: true,
      data: notification,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
