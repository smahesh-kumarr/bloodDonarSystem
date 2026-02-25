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
    },
    formattedAddress: String,
    street: String,
    city: String,
    state: String,
    zipcode: String,
    country: String,
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
donorSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("Donor", donorSchema);
