const Donor = require("../models/Donor");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");

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

// @desc    Get all donors (with filtering)
// @route   GET /api/v1/donors
// @access  Public
exports.getDonors = catchAsync(async (req, res, next) => {
  const queryObj = { ...req.query };
  const excludedFields = ['page', 'sort', 'limit', 'fields'];
  excludedFields.forEach(el => delete queryObj[el]);

  // Advanced Filtering
  let queryStr = JSON.stringify(queryObj);
  
  // 1. Partial Search for Name/Email/Phone (using regex)
  if (req.query.search) {
    const searchRegex = new RegExp(req.query.search, 'i'); // case insensitive
    queryObj.$or = [
      { name: searchRegex },
      { email: searchRegex },
      { phone: searchRegex },
      { bloodGroup: searchRegex },
      { 'location.city': searchRegex },
      { 'location.state': searchRegex },
      { 'location.formattedAddress': searchRegex }
    ];
    delete queryObj.search; // Remove 'search' from exact match fields
  }

  // 2. Exact match filtering (e.g. ?bloodGroup=A+&availability=true)
  // This is already handled by queryObj = { ...req.query } and removing excluded fields

  let query = Donor.find(queryObj);

  // 3. Sorting
  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    query = query.sort('-createdAt'); // Default sort: newest first
  }

  // 4. Field Limiting
  if (req.query.fields) {
    const fields = req.query.fields.split(',').join(' ');
    query = query.select(fields);
  } else {
    query = query.select('-__v');
  }

  // 5. Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  query = query.skip(skip).limit(limit);

  // Execute Query
  const donors = await query;
  const total = await Donor.countDocuments(queryObj);

  res.status(200).json({
    success: true,
    count: donors.length,
    total,
    pagination: {
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    },
    data: donors
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
