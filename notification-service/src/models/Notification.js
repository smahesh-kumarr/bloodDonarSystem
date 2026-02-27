const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  recipientEmail: {
    type: String,
    required: [true, "Notification must have a recipient email"],
  },
  subject: {
    type: String,
    required: [true, "Notification must have a subject"],
  },
  message: {
    type: String,
    required: [true, "Notification must have a message body"],
  },
  type: {
    type: String,
    enum: ["email", "sms", "push"],
    default: "email",
  },
  status: {
    type: String,
    enum: ["pending", "sent", "failed"],
    default: "pending",
  },
  error: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Notification", notificationSchema);
