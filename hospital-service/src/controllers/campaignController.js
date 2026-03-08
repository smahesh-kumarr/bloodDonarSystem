const Campaign = require("../models/Campaign");
const Hospital = require("../models/Hospital");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");
const axios = require("axios");

// notification util
const notify = async (email, subject, message) => {
  try {
    await axios.post(
      `${process.env.NOTIFICATION_SERVICE_URL || "http://localhost:5004"}/api/v1/notifications/send`,
      { email, subject, message },
    );
  } catch (error) {
    console.error("Failed to push notification:", error.message);
  }
};

exports.createCampaign = catchAsync(async (req, res, next) => {
  const userId = req.user._id || req.user.id;
  const hospital = await Hospital.findOne({ userId });
  if (!hospital) {
    return next(new AppError("Hospital profile not found", 404));
  }

  const { title, description, startDate, endDate, location } = req.body;

  const campaign = await Campaign.create({
    hospitalId: hospital._id,
    title,
    description,
    startDate,
    endDate,
    location,
    status: "pending",
  });

  // Notify admin
  const approveUrl = `http://localhost:5005/api/v1/hospital/campaigns/${campaign._id}/approve`;
  const rejectUrl = `http://localhost:5005/api/v1/hospital/campaigns/${campaign._id}/reject`;

  const adminEmail = "maheshkumarawsdevops@gmail.com";
  const emailMsg = `New campaign created by ${hospital.hospitalName}.\n\nTitle: ${campaign.title}\nDescription: ${campaign.description}\n\nTo approve, click here: ${approveUrl}\nTo reject, click here: ${rejectUrl}`;

  await notify(adminEmail, "Action Required: Approve Blood Campaign", emailMsg);

  res.status(201).json({
    success: true,
    data: campaign,
    message: "Campaign created and pending admin approval.",
  });
});

exports.approveCampaign = catchAsync(async (req, res, next) => {
  const campaign = await Campaign.findById(req.params.id);
  if (!campaign) return next(new AppError("Campaign not found", 404));

  campaign.status = "approved";
  await campaign.save();

  // Notify hospital
  const hospital = await Hospital.findById(campaign.hospitalId);
  if (hospital) {
    await notify(
      hospital.email,
      "Campaign Approved",
      `Your campaign "${campaign.title}" has been approved.`,
    );
  }

  res
    .status(200)
    .send(
      "<h1>Campaign Approved Successfully</h1><p>You can close this window.</p>",
    );
});

exports.rejectCampaign = catchAsync(async (req, res, next) => {
  const campaign = await Campaign.findById(req.params.id);
  if (!campaign) return next(new AppError("Campaign not found", 404));

  campaign.status = "rejected";
  await campaign.save();

  // Notify hospital
  const hospital = await Hospital.findById(campaign.hospitalId);
  if (hospital) {
    await notify(
      hospital.email,
      "Campaign Rejected",
      `Your campaign "${campaign.title}" has been rejected.`,
    );
  }

  res
    .status(200)
    .send("<h1>Campaign Rejected</h1><p>You can close this window.</p>");
});

exports.getApprovedCampaigns = catchAsync(async (req, res, next) => {
  const campaigns = await Campaign.find({ status: "approved" }).populate(
    "hospitalId",
    "hospitalName email contactNumber address",
  );
  res
    .status(200)
    .json({ success: true, count: campaigns.length, data: campaigns });
});

exports.getHospitalCampaigns = catchAsync(async (req, res, next) => {
  const userId = req.user._id || req.user.id;
  const hospital = await Hospital.findOne({ userId });
  if (!hospital) return next(new AppError("Hospital profile not found", 404));

  const campaigns = await Campaign.find({ hospitalId: hospital._id });
  res
    .status(200)
    .json({ success: true, count: campaigns.length, data: campaigns });
});

exports.registerForCampaign = catchAsync(async (req, res, next) => {
  const campaign = await Campaign.findById(req.params.id);
  if (!campaign) return next(new AppError("Campaign not found", 404));
  if (campaign.status !== "approved")
    return next(new AppError("Campaign is not active", 400));

  const userId = req.user._id || req.user.id;

  const { name, email, bloodGroup } = req.body;

  const alreadyRegistered = campaign.registeredDonors.find(
    (d) => d.donorId.toString() === userId.toString(),
  );
  if (alreadyRegistered) {
    return next(
      new AppError("You are already registered for this campaign", 400),
    );
  }

  campaign.registeredDonors.push({
    donorId: userId,
    donorName: name || req.user?.name || "Donor",
    donorEmail: email || req.user?.email || "unknown@email.com",
    bloodGroup: bloodGroup || "Unknown",
  });

  await campaign.save();

  res.status(200).json({
    success: true,
    message: "Successfully registered for the campaign",
    data: campaign,
  });
});

exports.getCampaignParticipants = catchAsync(async (req, res, next) => {
  const userId = req.user._id || req.user.id;
  const hospital = await Hospital.findOne({ userId });

  const campaign = await Campaign.findById(req.params.id);
  if (!campaign) return next(new AppError("Campaign not found", 404));

  if (campaign.hospitalId.toString() !== hospital._id.toString()) {
    return next(
      new AppError(
        "Not authorized to view participants for this campaign",
        403,
      ),
    );
  }

  res.status(200).json({
    success: true,
    count: campaign.registeredDonors.length,
    data: campaign.registeredDonors,
  });
});
