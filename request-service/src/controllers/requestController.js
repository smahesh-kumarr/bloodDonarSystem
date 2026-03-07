const Request = require("../models/Request");
const ExternalDonor = require("../models/ExternalDonor");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");
const APIFeatures = require("../utils/APIFeatures");
const axios = require("axios");
const {
  getCompatibleDonorBloodGroups,
} = require("../utils/bloodCompatibility");
const { notifyDonors } = require("../utils/notificationClient");

// @desc    Create a blood request
exports.createRequest = catchAsync(async (req, res, next) => {
  const userId = req.user._id || req.user.id;
  req.body.requesterId = userId;
  req.body.createdByType = req.user.role === "hospital" ? "hospital" : "user";

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
    userId: { $ne: userId },
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
    // Check if it was accepted by a hospital
    if (request.acceptedByHospitalId) {
      if (
        request.acceptedByHospitalId.toString() !==
        (req.user._id || req.user.id).toString()
      ) {
        return next(
          new AppError(
            "Only the hospital that accepted the request can mark it completed",
            403,
          ),
        );
      }
      // Hospital doesn't have 90-day cooldown, proceed to complete.
    }
    // If a donor is assigned (accepted request), STRICTLY check if current user is that donor
    else if (request.donorId) {
      // Since donorId refers to the Donor Profile ID, we must find the current user's donor profile
      const currentDonor = await ExternalDonor.findOne({
        userId: req.user._id || req.user.id,
      });

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

      // Check 90-day cooldown before completing (just in case they shouldn't be here)
      if (currentDonor.lastDonationDate) {
        const lastDonate = new Date(currentDonor.lastDonationDate);
        const currentDate = new Date();
        const diffDays = Math.ceil(
          Math.abs(currentDate - lastDonate) / (1000 * 60 * 60 * 24),
        );
        if (diffDays < 90) {
          return next(
            new AppError(
              `You cannot complete a request right now. You are still within your 90-day cooldown.`,
              403,
            ),
          );
        }
      }

      // Mark donor explicitly unavailable for 90 days following completion
      await ExternalDonor.updateOne(
        { _id: currentDonor._id },
        {
          $set: {
            lastDonationDate: new Date(),
            availability: false,
          },
        },
      );
    } else {
      // If NOT assigned to a donor yet, only the requester can complete/cancel it
      const userId = req.user._id || req.user.id;
      if (request.requesterId.toString() !== userId.toString()) {
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
  const userId = req.user._id || req.user.id;

  // Prevent users/hospitals from accepting their own requests
  if (request.requesterId.toString() === userId.toString()) {
    return next(new AppError("You cannot accept your own request", 400));
  }
  // --- HOSPITAL FLOW ---
  if (req.user.role === "hospital") {
    try {
      // Deduct from hospital inventory via API
      const inventoryUpdate = {};
      inventoryUpdate[request.bloodGroup] = -request.units; // subtract

      let token = "";
      if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
      ) {
        token = req.headers.authorization.split(" ")[1];
      } else if (req.cookies?.token) {
        token = req.cookies.token;
      }

      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };

      await axios.put(
        `${process.env.HOSPITAL_SERVICE_URL || "http://localhost:5005"}/api/v1/hospital/inventory`,
        inventoryUpdate,
        config,
      );
    } catch (error) {
      if (error.response && error.response.status === 400) {
        return next(
          new AppError("Insufficient inventory to accept request", 400),
        );
      }
      return next(
        new AppError(
          "Failed to update hospital inventory: " + error.message,
          500,
        ),
      );
    }

    const userId = req.user._id || req.user.id;
    request.acceptedByHospitalId = userId;
    request.status = "accepted";
    await request.save();

    return res.status(200).json({
      success: true,
      data: request,
      message: `Hospital has accepted the request. Deducted ${request.units} units of ${request.bloodGroup} from inventory.`,
    });
  }

  // --- DONOR FLOW ---  // 2. Identify Donor
  const qId = req.user._id || req.user.id;
  console.log(
    "Looking up donor in request-service with userId:",
    qId,
    "typeof:",
    typeof qId,
  );
  const donor = await ExternalDonor.findOne({ userId: qId });
  if (!donor) {
    return next(
      new AppError("You must be a registered donor to accept requests", 403),
    );
  }

  // 2.5 Check 90-day cooldown
  if (donor.lastDonationDate) {
    const lastDonate = new Date(donor.lastDonationDate);
    const currentDate = new Date();
    const diffTime = Math.abs(currentDate - lastDonate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 90) {
      return next(
        new AppError(
          `You cannot accept requests. You are under a 90-day cooldown period. Wait ${90 - diffDays} more days.`,
          403,
        ),
      );
    }
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

  const userId = req.user._id || req.user.id;
  if (request.requesterId.toString() !== userId.toString()) {
    return next(new AppError("Not authorized to delete this request", 403));
  }

  await Request.findByIdAndDelete(req.params.id);

  res.status(204).json({
    success: true,
    data: null,
  });
});
