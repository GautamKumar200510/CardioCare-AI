const nodemailer = require('nodemailer');
const Notification = require('../../models/Notification');
const User = require('../../models/User');

/**
 * Configure Nodemailer transport if SMTP environment variables are present
 */
const getTransporter = () => {
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return null;
};

/**
 * Send booking confirmation notification:
 * Creates persistent in-app Notification record in MongoDB,
 * and sends email via Nodemailer if SMTP configured.
 */
const sendBookingConfirmationNotification = async (appointment, userId) => {
  const patient = await User.findById(userId || appointment.patientId);
  const recipientEmail = patient?.email;
  const patientName = appointment.patientName || patient?.name || 'Valued Patient';

  const docName = appointment.doctorId?.name || 'Cardiologist';
  const hospName = appointment.hospitalId?.name || 'Cardiology Center';
  const dateStr = appointment.appointmentDate;
  const timeStr = appointment.appointmentTime;
  const bookingId = appointment.bookingId;

  const messageText = `CardioCare AI Booking Confirmed: Your cardiologist appointment with ${docName} at ${hospName} is scheduled for ${dateStr} at ${timeStr}. Reference ID: ${bookingId}.`;

  const transporter = getTransporter();
  let emailStatus = 'simulated';
  let deliveryDetails = {
    channel: 'in_app',
    note: 'SMTP not configured; stored as high-priority verified in-app alert.',
  };

  if (transporter && recipientEmail) {
    try {
      await transporter.sendMail({
        from: `"CardioCare AI Healthcare" <${process.env.SMTP_FROM || 'noreply@cardiocare.ai'}>`,
        to: recipientEmail,
        subject: `Appointment Confirmed: ${docName} (${bookingId})`,
        text: messageText,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
            <div style="background-color: #0f2d59; color: #ffffff; padding: 20px; text-align: center;">
              <h2 style="margin: 0;">CardioCare AI</h2>
              <p style="margin: 5px 0 0 0; font-size: 14px;">Autonomous Hospital Appointment Confirmation</p>
            </div>
            <div style="padding: 24px; color: #1e293b;">
              <p>Dear <strong>${patientName}</strong>,</p>
              <p>Your appointment has been successfully scheduled by the CardioCare AI Agent.</p>
              <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 8px; color: #64748b;">Booking Reference:</td>
                  <td style="padding: 8px; font-weight: bold; color: #0f2d59;">${bookingId}</td>
                </tr>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 8px; color: #64748b;">Doctor:</td>
                  <td style="padding: 8px; font-weight: bold;">${docName}</td>
                </tr>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 8px; color: #64748b;">Hospital:</td>
                  <td style="padding: 8px; font-weight: bold;">${hospName}</td>
                </tr>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 8px; color: #64748b;">Date & Time:</td>
                  <td style="padding: 8px; font-weight: bold; color: #16a34a;">${dateStr} at ${timeStr} IST</td>
                </tr>
                <tr>
                  <td style="padding: 8px; color: #64748b;">Booking Mode:</td>
                  <td style="padding: 8px;">${appointment.bookingMode === 'verified_hospital' ? 'Verified Hospital Integration' : 'Demonstration Academic Booking'}</td>
                </tr>
              </table>
              <p style="font-size: 13px; color: #64748b;">Please arrive 15 minutes before your scheduled appointment time.</p>
            </div>
          </div>
        `,
      });
      emailStatus = 'sent';
      deliveryDetails = {
        channel: 'email',
        recipient: recipientEmail,
        timestamp: new Date(),
      };
    } catch (err) {
      emailStatus = 'failed';
      deliveryDetails = {
        channel: 'email',
        error: err.message,
        recipient: recipientEmail,
      };
      console.warn('[Nodemailer] Email send error:', err.message);
    }
  }

  // Create persistent notification in MongoDB
  const notification = new Notification({
    userId: userId || appointment.patientId,
    appointmentId: appointment._id,
    message: messageText,
    type: emailStatus === 'sent' ? 'email' : 'in_app',
    status: emailStatus,
    deliveryDetails,
  });

  await notification.save();
  return notification;
};

module.exports = {
  sendBookingConfirmationNotification,
};
