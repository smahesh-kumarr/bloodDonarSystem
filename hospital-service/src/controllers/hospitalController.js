const Hospital = require("../models/Hospital");
const Transfer = require("../models/Transfer");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");
const axios = require("axios");

// NOTE: Uses notification-service via a simple axios call if needed, or notificationClient generic util if copied over.
// We'll assume a basic axios request to the notification service
const notify = async (email, subject, message) => {
  try {
    await axios.post(
      `${process.env.NOTIFICATION_SERVICE_URL}/api/v1/notifications/email`,
      {
        email,
        subject,
        message,
      },
    );
  } catch (error) {
    console.error("Failed to push notification:", error.message);
  }
};

// @desc    Create hospital profile
// @route   POST /api/v1/hospital/profile
// @access  Private (hospital)
exports.createProfile = catchAsync(async (req, res, next) => {
  const userId = req.user._id || req.user.id;
  req.body.userId = userId; // from authMiddleware protect

  // Check if hospital profile already exists
  const existingProfile = await Hospital.findOne({ userId });
  if (existingProfile) {
    return next(
      new AppError("Hospital profile already exists for this user", 400),
    );
  }

  const hospital = await Hospital.create(req.body);

  res.status(201).json({
    success: true,
    data: hospital,
  });
});

// @desc    Update hospital profile
// @route   PUT /api/v1/hospital/profile
// @access  Private (hospital)
exports.updateProfile = catchAsync(async (req, res, next) => {
  const userId = req.user._id || req.user.id;
  let hospital = await Hospital.findOne({ userId });

  if (!hospital) {
    return next(new AppError("Hospital profile not found", 404));
  }

  hospital = await Hospital.findOneAndUpdate(
    { userId },
    req.body,
    {
      new: true,
      runValidators: true,
    },
  );

  res.status(200).json({
    success: true,
    data: hospital,
  });
});

// @desc    Get current hospital profile
// @route   GET /api/v1/hospital/me
// @access  Private (hospital)
exports.getMe = catchAsync(async (req, res, next) => {
  const userId = req.user._id || req.user.id;
  const hospital = await Hospital.findOne({ userId });

  if (!hospital) {
    return next(new AppError("Hospital profile not found", 404));
  }

  res.status(200).json({
    success: true,
    data: hospital,
  });
});

// @desc    Get all active hospitals
// @route   GET /api/v1/hospital/all
// @access  Public
exports.getAllHospitals = catchAsync(async (req, res, next) => {
  const hospitals = await Hospital.find({ isActive: true });

  res.status(200).json({
    success: true,
    count: hospitals.length,
    data: hospitals,
  });
});

// @desc    Update Inventory
// @route   PUT /api/v1/hospital/inventory
// @access  Private (hospital)
exports.updateInventory = catchAsync(async (req, res, next) => {
  // req.body should be an object representing blood groups and change amounts: {"A+": 2, "O-": -1}
  const userId = req.user._id || req.user.id;
  const hospital = await Hospital.findOne({ userId });

  if (!hospital) {
    return next(new AppError("Hospital profile not found", 404));
  }

  for (const [group, units] of Object.entries(req.body)) {
    if (hospital.inventory[group] !== undefined) {
      // Prevent negative inventory
      if (hospital.inventory[group] + units < 0) {
        return next(
          new AppError(`Cannot reduce ${group} inventory below zero`, 400),
        );
      }
      hospital.inventory[group] += units;
    }
  }

  await hospital.save();

  res.status(200).json({
    success: true,
    data: hospital.inventory,
  });
});

// @desc    Request a Transfer from another hospital
// @route   POST /api/v1/hospital/transfer
// @access  Private (hospital)
exports.createTransfer = catchAsync(async (req, res, next) => {
  const { toHospitalId, bloodGroup, units } = req.body;

  const userId = req.user._id || req.user.id;
  const requester = await Hospital.findOne({ userId });
  if (!requester) return next(new AppError("Hospital profile not found", 404));

  const targetHospital = await Hospital.findById(toHospitalId);
  if (!targetHospital)
    return next(new AppError("Target hospital not found", 404));

  const transfer = await Transfer.create({
    fromHospital: requester._id,
    toHospital: targetHospital._id,
    bloodGroup,
    units,
  });

  // Notify target hospital
  notify(
    targetHospital.email,
    "New Blood Transfer Request",
    `Your hospital has received a request for ${units} units of ${bloodGroup} from ${requester.hospitalName}.`,
  );

  res.status(201).json({
    success: true,
    data: transfer,
  });
});

// @desc    Get transfers relevant to hospital
// @route   GET /api/v1/hospital/transfer
// @access  Private (hospital)
exports.getTransfers = catchAsync(async (req, res, next) => {
  const userId = req.user._id || req.user.id;
  const hospital = await Hospital.findOne({ userId });
  if (!hospital) return next(new AppError("Hospital profile not found", 404));

  const transfers = await Transfer.find({
    $or: [{ fromHospital: hospital._id }, { toHospital: hospital._id }],
  }).populate("fromHospital toHospital", "hospitalName email contactNumber");

  res.status(200).json({
    success: true,
    count: transfers.length,
    data: transfers,
  });
});

// @desc    Accept blood transfer
// @route   PUT /api/v1/hospital/transfer/:id/accept
// @access  Private (hospital)
exports.acceptTransfer = catchAsync(async (req, res, next) => {
  const userId = req.user._id || req.user.id;
  const hospital = await Hospital.findOne({ userId });
  const transfer = await Transfer.findById(req.params.id).populate(
    "fromHospital",
  );

  if (!transfer) return next(new AppError("Transfer not found", 404));
  if (transfer.toHospital.toString() !== hospital._id.toString()) {
    return next(new AppError("Not authorized to accept this transfer", 403));
  }

  // Check inventory
  if (hospital.inventory[transfer.bloodGroup] < transfer.units) {
    return next(new AppError("Insufficient inventory to accept transfer", 400));
  }

  transfer.status = "accepted";
  await transfer.save();

  notify(
    transfer.fromHospital.email,
    "Transfer Accepted",
    `${hospital.hospitalName} has accepted your request for ${transfer.units} units of ${transfer.bloodGroup}.`,
  );

  res.status(200).json({
    success: true,
    data: transfer,
  });
});

// @desc    Complete blood transfer
// @route   PUT /api/v1/hospital/transfer/:id/complete
// @access  Private (hospital)
exports.completeTransfer = catchAsync(async (req, res, next) => {
  // Only the receiving (requesting) hospital standardly marks it as completed when physical delivery arrives,
  // Or the sending hospital. Let's allow either, but usually receiving hospital.
  // For safety, let's process the inventory update here.

  const userId = req.user._id || req.user.id;
  const hospital = await Hospital.findOne({ userId });
  const transfer = await Transfer.findById(req.params.id)
    .populate("fromHospital")
    .populate("toHospital");

  if (!transfer) return next(new AppError("Transfer not found", 404));
  if (transfer.status !== "accepted")
    return next(
      new AppError("Transfer must be accepted before completion", 400),
    );

  // Actually execute the inventory subtraction and addition
  const fromHosp = await Hospital.findById(transfer.toHospital._id); // This is who GIVES blood (toHospital of the request)
  const toHosp = await Hospital.findById(transfer.fromHospital._id); // This is who GETS blood (fromHospital of the request)

  // Double check
  if (fromHosp.inventory[transfer.bloodGroup] < transfer.units) {
    return next(
      new AppError("Sending hospital no longer has sufficient units", 400),
    );
  }

  fromHosp.inventory[transfer.bloodGroup] -= transfer.units;
  toHosp.inventory[transfer.bloodGroup] += transfer.units;

  await fromHosp.save();
  await toHosp.save();

  transfer.status = "completed";
  await transfer.save();

  res.status(200).json({
    success: true,
    data: transfer,
  });
});
