const Request = require("../models/Request");
const ExternalDonor = require("../models/ExternalDonor");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");
const APIFeatures = require("../utils/APIFeatures");
const {
  getCompatibleDonorBloodGroups,
} = require("../utils/bloodCompatibility");
const { notifyDonors } = require("../utils/notificationClient");

// @desc    Create a blood request
exports.createRequest = catchAsync(async (req, res, next) => {
  req.body.requesterId = req.user.id;

  // 1. Create Request
  const request = await Request.create(req.body);

  // 2. Find Compatible Donor Groups
  const compatibleGroups = getCompatibleDonorBloodGroups(req.body.bloodGroup);

  // 3. Find Matching Donors in External DB
  // only select necessary fields to protect privacy
  // Exclude the requester themselves from the donor search
  const compatibleDonors = await ExternalDonor.find({
    bloodGroup: { $in: compatibleGroups },
    availability: true,
    userId: { $ne: req.user.id }
  }).select("name bloodGroup location phone email");

  // 4. Notify Donors (Fire and Forget)
  if (compatibleDonors.length > 0) {
    notifyDonors(compatibleDonors, request);
  }

  res.status(201).json({
    success: true,
    data: {
      request,
      matchingDonors: compatibleDonors,
      message: `Request created. Found ${compatibleDonors.length} compatible donors. Notifications sent.`,
    },
  });
});

// @desc    Get all ACTIVE requests (excludes completed)
exports.getAllRequests = catchAsync(async (req, res, next) => {
  const baseFilter = { status: { $ne: "completed" } };

  const features = new APIFeatures(Request.find(baseFilter), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const requests = await features.query;
  const total = await Request.countDocuments(features.query.getFilter());

  res.status(200).json({
    success: true,
    count: requests.length,
    total,
    data: requests,
  });
});

// @desc    Get COMPLETED requests only
exports.getCompletedRequests = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(
    Request.find({ status: "completed" }),
    req.query,
  )
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const requests = await features.query;

  res.status(200).json({
    success: true,
    count: requests.length,
    data: requests,
  });
});

// @desc    Get single request
exports.getRequest = catchAsync(async (req, res, next) => {
  const request = await Request.findById(req.params.id);
  if (!request) return next(new AppError("No request found with that ID", 404));
  res.status(200).json({ success: true, data: request });
});

// @desc    Update request status
exports.updateRequestStatus = catchAsync(async (req, res, next) => {
  const { status } = req.body;

  const request = await Request.findById(req.params.id);
  if (!request) return next(new AppError("No request found with that ID", 404));

  // Logic for 'completed' status
  if (status === "completed") {
    // If a donor is assigned (accepted request), STRICTLY check if current user is that donor
    if (request.donorId) {
      // Since donorId refers to the Donor Profile ID, we must find the current user's donor profile
      const currentDonor = await ExternalDonor.findOne({ userId: req.user.id });

      if (
        !currentDonor ||
        currentDonor._id.toString() !== request.donorId.toString()
      ) {
        return next(
          new AppError(
            "Only the assigned donor can mark this request as completed",
            403,
          ),
        );
      }
    } else {
      // If NOT assigned to a donor yet, only the requester can complete/cancel it
      if (request.requesterId.toString() !== req.user.id) {
        return next(
          new AppError("Not authorized to complete this request", 403),
        );
      }
    }
  }

  const updatedRequest = await Request.findByIdAndUpdate(
    req.params.id,
    { status },
    {
      new: true,
      runValidators: true,
    },
  );

  res.status(200).json({ success: true, data: updatedRequest });
});

// @desc    Accept a request (Donor Action)
// @route   PATCH /api/v1/requests/:id/accept
exports.acceptRequest = catchAsync(async (req, res, next) => {
  // 1. Find Request
  const request = await Request.findById(req.params.id);
  if (!request) return next(new AppError("Request not found", 404));

  if (request.status !== "pending") {
    return next(new AppError("This request is no longer pending", 400));
  }

  // 2. Identify Donor
  const donor = await ExternalDonor.findOne({ userId: req.user.id });
  if (!donor) {
    return next(
      new AppError("You must be a registered donor to accept requests", 403),
    );
  }

  // 3. Check Compatibility
  const compatibleGroups = getCompatibleDonorBloodGroups(request.bloodGroup);
  if (!compatibleGroups.includes(donor.bloodGroup)) {
    return next(
      new AppError(
        `Your blood group ${donor.bloodGroup} is not compatible with patient's ${request.bloodGroup}`,
        400,
      ),
    );
  }

  // 4. Update Request
  request.donorId = donor._id;
  request.status = "accepted";
  await request.save();

  res.status(200).json({
    success: true,
    data: request,
    message:
      "You have accepted the request. Please proceed to the hospital/location.",
  });
});

// @desc    Delete request
exports.deleteRequest = catchAsync(async (req, res, next) => {
  const request = await Request.findById(req.params.id);
  if (!request) return next(new AppError("No request found with that ID", 404));
  if (request.requesterId.toString() !== req.user.id) {
    return next(new AppError("Not authorized to delete this request", 401));
  }
  await Request.findByIdAndDelete(req.params.id);
  res.status(200).json({ success: true, data: {} });
});
