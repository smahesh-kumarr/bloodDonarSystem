const mongoose = require("mongoose");

const donorSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User", // Reference to the User model (even if in another service logic, we store ID)
  },
  name: {
    type: String,
    required: [true, "Please add a name"],
  },
  email: {
    type: String,
    required: [true, "Please add an email"],
  },
  bloodGroup: {
    type: String,
    required: [true, "Please select a blood group"],
    enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
  },
  phone: {
    type: String,
    required: [true, "Please add a phone number"],
  },
  age: {
    type: Number,
    required: [true, "Please add age"],
  },
  weight: {
    type: Number,
    required: [true, "Please add weight"],
  },
  medicalHistory: {
    type: [String],
    default: [],
  },
  location: {
    // GeoJSON Point
    type: {
      type: String,
      enum: ["Point"],
      default: "Point",
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      index: "2dsphere", // Create a geospatial index
      default: [0, 0],
    },
    formattedAddress: String,
    street: String,
    city: String,
    state: String,
    zipcode: String,
  },
  availability: {
    type: Boolean,
    default: true,
  },
  lastDonationDate: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Create geospatial index for location
// Note: We're indexing location.coordinates for 2dsphere queries if we want to store extra data in location
// However, standard GeoJSON practice suggests keeping geometry pure or using 'properties' field.
// But mongoose schema above mixes them.
// To fix "unknown GeoJSON type", we should either:
// 1. Move address fields out of location
// 2. Or index `location.coordinates` instead of `location` if we want to keep structure
// Let's try indexing coordinates directly which is more robust for custom structures
donorSchema.index({ "location.coordinates": "2dsphere" });
// Remove old index if it exists (Mongo won't remove it automatically but new one will work)
// donorSchema.index({ location: "2dsphere" }); // This was the cause of error

module.exports = mongoose.model("Donor", donorSchema);
