const mongoose = require("mongoose");

const transferSchema = new mongoose.Schema(
  {
    fromHospital: {
      type: mongoose.Schema.ObjectId,
      ref: "Hospital",
      required: true,
    },
    toHospital: {
      type: mongoose.Schema.ObjectId,
      ref: "Hospital", // The hospital receiving the transfer request
      required: true,
    },
    bloodGroup: {
      type: String,
      enum: ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"],
      required: true,
    },
    units: {
      type: Number,
      required: true,
      min: 1,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "completed", "rejected"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Transfer", transferSchema);
