const mongoose = require("mongoose");

const campaignSchema = new mongoose.Schema(
  {
    hospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hospital",
      required: true,
    },
    title: {
      type: String,
      required: [true, "Please add a campaign title"],
    },
    description: {
      type: String,
    },
    startDate: {
      type: Date,
      required: [true, "Please add a start date"],
    },
    endDate: {
      type: Date,
      required: [true, "Please add an end date"],
    },
    location: {
      type: String,
      required: [true, "Please add a location"],
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "completed"],
      default: "pending",
    },
    registeredDonors: [
      {
        donorId: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
        },
        donorName: String,
        donorEmail: String,
        bloodGroup: String,
        registrationDate: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true },
);

module.exports = mongoose.model("Campaign", campaignSchema);
