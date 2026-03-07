const mongoose = require("mongoose");

const hospitalSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.ObjectId,
      required: true,
      unique: true, // A user should only have one hospital profile
    },
    hospitalName: {
      type: String,
      required: [true, "Please add a hospital name"],
    },
    registrationNumber: {
      type: String,
      required: [true, "Please add a registration number"],
    },
    email: {
      type: String,
      required: true,
    },
    contactNumber: {
      type: String,
      required: [true, "Please add a contact number"],
    },
    address: {
      type: String,
      required: [true, "Please add an address"],
    },
    city: {
      type: String,
      required: [true, "Please add a city"],
    },
    location: {
      // GeoJSON Point
      type: {
        type: String,
        enum: ["Point"],
      },
      coordinates: {
        type: [Number], // longitude, latitude
        index: "2dsphere",
      },
      formattedAddress: String,
    },
    inventory: {
      "A+": { type: Number, default: 0 },
      "A-": { type: Number, default: 0 },
      "B+": { type: Number, default: 0 },
      "B-": { type: Number, default: 0 },
      "O+": { type: Number, default: 0 },
      "O-": { type: Number, default: 0 },
      "AB+": { type: Number, default: 0 },
      "AB-": { type: Number, default: 0 },
    },
    redoraContributors: [
      {
        type: mongoose.Schema.ObjectId,
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Hospital", hospitalSchema);
