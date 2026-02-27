const Request = require("../models/Request");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");
const APIFeatures = require("../utils/APIFeatures");

// @desc    Create a blood request
// @route   POST /api/v1/requests
// @access  Private
exports.createRequest = catchAsync(async (req, res, next) => {
  // Add user to req.body
  req.body.requesterId = req.user.id;

  const request = await Request.create(req.body);

  res.status(201).json({
    success: true,
    data: request,
  });
});

// @desc    Get all active requests (excludes completed)
// @route   GET /api/v1/requests
// @access  Private (Admin/User sees own?) or Public?
exports.getAllRequests = catchAsync(async (req, res, next) => {
  // Modify query to exclude completed requests by default
  const filter = { status: { $ne: "completed" } };

  const features = new APIFeatures(Request.find(filter), req.query)
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

// @desc    Get all completed requests
// @route   GET /api/v1/requests/history/completed
// @access  Private
exports.getCompletedRequests = catchAsync(async (req, res, next) => {
  const filter = { status: "completed" };

  const features = new APIFeatures(Request.find(filter), req.query)
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

// @desc    Get single request
// @route   GET /api/v1/requests/:id
// @access  Private
exports.getRequest = catchAsync(async (req, res, next) => {
  const request = await Request.findById(req.params.id);

  if (!request) {
    return next(new AppError(`No request found with that ID`, 404));
  }

  res.status(200).json({
    success: true,
    data: request,
  });
});

// @desc    Update request status
// @route   PATCH /api/v1/requests/:id/status
// @access  Private
exports.updateRequestStatus = catchAsync(async (req, res, next) => {
  const { status } = req.body;

  let request = await Request.findById(req.params.id);

  if (!request) {
    return next(new AppError(`No request found with that ID`, 404));
  }

  // Logic: Who can update?
  // - Requester can cancel.
  // - Donor can Accept?? (Requires logic to link donorId)
  // - Admin can change anything.

  // Simple update for now
  request = await Request.findByIdAndUpdate(
    req.params.id,
    { status },
    {
      new: true,
      runValidators: true,
    },
  );

  res.status(200).json({
    success: true,
    data: request,
  });
});

// @desc    Delete request
// @route   DELETE /api/v1/requests/:id
// @access  Private (Requester/Admin)
exports.deleteRequest = catchAsync(async (req, res, next) => {
  const request = await Request.findById(req.params.id);

  if (!request) {
    return next(new AppError(`No request found with that ID`, 404));
  }

  // Check ownership
  if (request.requesterId.toString() !== req.user.id) {
    // Allow admin override later
    return next(new AppError(`Not authorized to delete this request`, 401));
  }

  await Request.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    data: {},
  });
});
