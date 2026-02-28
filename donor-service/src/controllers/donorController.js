const Donor = require("../models/Donor");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");
const APIFeatures = require("../utils/APIFeatures");

// @desc    Create or Update Donor Profile
// @route   POST /api/v1/donors
// @access  Private
exports.createDonorProfile = catchAsync(async (req, res, next) => {
  // Check if donor profile already exists for this user
  let donor = await Donor.findOne({ userId: req.user.id });

  if (donor) {
    // If exists, update it
    donor = await Donor.findOneAndUpdate({ userId: req.user.id }, req.body, {
      new: true,
      runValidators: true,
    });
    return res.status(200).json({
      success: true,
      data: donor,
    });
  }

  // Else create new
  req.body.userId = req.user.id;

  // If location coordinates are provided as comma separated string or something, ensure its array
  // Assuming frontend sends { type: 'Point', coordinates: [lng, lat] } struct or similar

  donor = await Donor.create(req.body);

  res.status(201).json({
    success: true,
    data: donor,
  });
});

// @desc    Get current donor profile
// @route   GET /api/v1/donors/me
// @access  Private
exports.getMyDonorProfile = catchAsync(async (req, res, next) => {
  const donor = await Donor.findOne({ userId: req.user.id });

  if (!donor) {
    return next(new AppError("No donor profile found", 404));
  }

  res.status(200).json({
    success: true,
    data: donor,
  });
});

// @desc    Update Donor Profile
// @route   PUT /api/v1/donors/me
// @access  Private
exports.updateDonorProfile = catchAsync(async (req, res, next) => {
  let donor = await Donor.findOne({ userId: req.user.id });

  if (!donor) {
    return next(new AppError("No donor profile found", 404));
  }

  // Prevent updating userId
  if (req.body.userId) {
    delete req.body.userId;
  }

  donor = await Donor.findOneAndUpdate({ userId: req.user.id }, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: donor,
  });
});

// @desc    Get all donors (with filtering)
// @route   GET /api/v1/donors
// @access  Public
exports.getDonors = catchAsync(async (req, res, next) => {
  // Fix URL decoding: 'A+' -> 'A ' in req.query.bloodGroup
  if (req.query.bloodGroup && req.query.bloodGroup.includes(" ")) {
    req.query.bloodGroup = req.query.bloodGroup.replace(/ /g, "+");
  }

  const features = new APIFeatures(Donor.find(), req.query)
    .filter()
    .search()
    .build()
    .sort()
    .limitFields()
    .paginate();

  const donors = await features.query;

  // Count total documents for pagination metadata (filtering applied but not pagination)
  const total = await Donor.countDocuments(features.query.getFilter());

  res.status(200).json({
    success: true,
    count: donors.length,
    total,
    pagination: {
      page: parseInt(req.query.page, 10) || 1,
      limit: parseInt(req.query.limit, 10) || 10,
      totalPages: Math.ceil(total / (parseInt(req.query.limit, 10) || 10)),
    },
    data: donors,
  });
});

// @desc    Search donors by radius (Geospatial)
// @route   GET /api/v1/donors/radius/:zipcode/:distance
// @access  Public
// Alternate: GET /api/v1/donors/nearby?lat=x&lng=y&dist=z
exports.getDonorsNearby = catchAsync(async (req, res, next) => {
  const { lat, lng, dist } = req.query;
  // dist in km

  if (!lat || !lng) {
    return next(new AppError("Please provide latitude and longitude", 400));
  }

  const radius = dist || 10; // default 10km

  // MongoDB expects radius in radians? No, for $near we can use maxDistance in meters or $geoWithin/centerSphere
  // Let's use $nearSphere which supports meters if index is 2dsphere

  // Earth Radius = 6378 km
  // radians = distance / radius

  const donors = await Donor.find({
    location: {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: [parseFloat(lng), parseFloat(lat)],
        },
        $maxDistance: parseFloat(radius) * 1000, // convert to meters
      },
    },
  });

  res.status(200).json({
    success: true,
    count: donors.length,
    data: donors,
  });
});

// @desc    Update Donor Availability
// @route   PATCH /api/v1/donors/availability
// @access  Private
exports.toggleAvailability = catchAsync(async (req, res, next) => {
  const donor = await Donor.findOne({ userId: req.user.id });

  if (!donor) {
    return next(new AppError("No donor profile found", 404));
  }

  donor.availability = !donor.availability;
  await donor.save();

  res.status(200).json({
    success: true,
    data: donor,
  });
});
