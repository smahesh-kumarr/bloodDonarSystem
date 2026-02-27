// The "External" Donor model for querying donors from the Request Service
// This connects to the 'blood-donation-donor' database, separate from 'blood-donation-request'.

const mongoose = require("mongoose");
const dotenv = require("dotenv");

// Ensure env vars are loaded if this model is required before App.js config
dotenv.config();

// We use createConnection() for secondary databases to avoid singleton conflict
// with the main mongoose.connect() used in App.js
const conn = mongoose.createConnection(
  process.env.DONOR_MONGO_URI ||
    "mongodb://localhost:27017/blood-donation-donor",
);

// We only need the schema for querying, strictness depends on needs.
// A minimal schema is sufficient for find() operations requested.
const donorSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  bloodGroup: {
    type: String,
    required: true,
    enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
  },
  phone: String,
  location: {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point",
    },
    coordinates: {
      type: [Number],
      index: "2dsphere",
    },
    formattedAddress: String,
  },
  availability: {
    type: Boolean,
    default: true,
  },
  lastDonationDate: Date,
});

module.exports = conn.model("Donor", donorSchema);
