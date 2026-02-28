const axios = require("axios");

/**
 * Sends an email using the Notification Service
 * @param {Object} options - Email options
 * @param {string} options.email - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.message - Email message body
 */
exports.sendEmail = async (options) => {
  const notificationUrl =
    process.env.NOTIFICATION_SERVICE_URL || "http://localhost:5004";

  try {
    await axios.post(`${notificationUrl}/api/v1/notifications/send`, {
      email: options.email,
      subject: options.subject,
      message: options.message,
    });
    console.log(`Email sent to ${options.email}`);
  } catch (err) {
    console.error(`Failed to send email to ${options.email}:`, err.message);
    // Don't throw error if notification service is down, just log it?
    // Actually for password reset, we should probably let the user know if email failed.
    throw new Error("Email could not be sent");
  }
};
