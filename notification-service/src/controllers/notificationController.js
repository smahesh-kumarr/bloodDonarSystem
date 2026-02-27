const Notification = require("../models/Notification");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");
const sendEmail = require("../utils/email");

// @desc    Send a notification (Email)
// @route   POST /api/v1/notifications/send
// @access  Internal Microservice / Admin
exports.sendNotification = catchAsync(async (req, res, next) => {
  const { email, subject, message } = req.body;

  // 1. Save Notification to DB (status: pending)
  const notification = await Notification.create({
    recipientEmail: email,
    subject,
    message,
    status: "pending",
  });

  try {
    // 2. Transmit Email via Nodemailer
    await sendEmail({
      email,
      subject,
      message,
    });

    // 3. Update status on success
    notification.status = "sent";
    await notification.save();

    res.status(200).json({
      success: true,
      data: notification,
    });
  } catch (err) {
    // 4. Update status on failure
    console.error("Email Send Error:", err);
    notification.status = "failed";
    notification.error = err.message;
    await notification.save();

    // Return detailed error for debugging purposes (in dev/demo)
    return next(new AppError(`Email failed: ${err.message}`, 500));
  }
});

// @desc    Get notification history
// @route   GET /api/v1/notifications
exports.getNotifications = catchAsync(async (req, res, next) => {
  const notifications = await Notification.find().sort("-createdAt");

  res.status(200).json({
    success: true,
    count: notifications.length,
    data: notifications,
  });
});
