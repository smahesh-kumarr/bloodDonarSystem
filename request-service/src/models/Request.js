const mongoose = require("mongoose");

const requestSchema = new mongoose.Schema({
  requesterId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  donorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Donor",
    // Optional initially, might be assigned later or open to all
  },
  patientName: {
    type: String,
    required: [true, "Please add patient name"],
  },
  bloodGroup: {
    type: String,
    required: [true, "Please add blood group"],
    enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
  },
  units: {
    type: Number,
    required: [true, "Please add number of units"],
    min: 1,
  },
  hospitalName: {
    type: String,
    required: [true, "Please add hospital name"],
  },
  location: {
    type: String,
    required: [true, "Please add location/address"],
  },
  contactNumber: {
    type: String,
    required: [true, "Please add contact number"],
  },
  neededDate: {
    type: Date,
    required: [true, "Please specify when blood is needed"],
  },
  isEmergency: {
    type: Boolean,
    default: false,
  },
  status: {
    type: String,
    enum: ["pending", "accepted", "rejected", "completed", "cancelled"],
    default: "pending",
  },
  note: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Request", requestSchema);
