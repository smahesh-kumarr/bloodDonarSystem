const Donor = require("../models/Donor");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");
const APIFeatures = require("../utils/APIFeatures");

// @desc    Create or Update Donor Profile
// @route   POST /api/v1/donors
// @access  Private
exports.createDonorProfile = catchAsync(async (req, res, next) => {
  let donor = await Donor.findOne({ userId: req.user.id });

  const incomingLocation = req.body.location || {};
  const street = incomingLocation.street || req.body.address || "";
  const city = incomingLocation.city || req.body.city || "";
  const state = incomingLocation.state || req.body.state || "";
  const zipcode = incomingLocation.zipcode || req.body.zipCode || "";

  const location = {
    type: "Point",
    coordinates:
      Array.isArray(incomingLocation.coordinates) &&
      incomingLocation.coordinates.length === 2
        ? incomingLocation.coordinates
        : [0, 0],
    street,
    city,
    state,
    zipcode,
    formattedAddress: [street, city, state, zipcode].filter(Boolean).join(", "),
  };

  const payload = {
    userId: req.user.id,
    name: req.body.name || req.user?.name,
    email: req.body.email || req.user?.email,
    bloodGroup: req.body.bloodGroup,
    phone: req.body.phone,
    age: Number(req.body.age),
    weight: Number(req.body.weight),
    medicalHistory: Array.isArray(req.body.medicalHistory)
      ? req.body.medicalHistory
      : [],
    lastDonationDate: req.body.lastDonationDate || undefined,
    availability:
      typeof req.body.availability === "boolean" ? req.body.availability : true,
    location,
  };

  const missing = [];
  if (!payload.name) missing.push("name");
  if (!payload.email) missing.push("email");
  if (!payload.bloodGroup) missing.push("bloodGroup");
  if (!payload.phone) missing.push("phone");
  if (!payload.age || Number.isNaN(payload.age)) missing.push("age");
  if (!payload.weight || Number.isNaN(payload.weight)) missing.push("weight");

  if (missing.length) {
    return next(
      new AppError(
        `Missing or invalid required fields: ${missing.join(", ")}`,
        400,
      ),
    );
  }

  if (donor) {
    donor = await Donor.findOneAndUpdate({ userId: req.user.id }, payload, {
      new: true,
      runValidators: true,
    });

    return res.status(200).json({
      success: true,
      data: donor,
    });
  }

  donor = await Donor.create(payload);

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

  // Enforce 90-day cooldown period
  if (donor.lastDonationDate) {
    const lastDonate = new Date(donor.lastDonationDate);
    const currentDate = new Date();
    const diffTime = Math.abs(currentDate - lastDonate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 90) {
      return next(new AppError(`You cannot update your profile. You have to wait ${90 - diffDays} more days before you are eligible again.`, 403));
    }
  }

  const updateData = {};

  if (req.body.name !== undefined) updateData.name = req.body.name;
  if (req.body.email !== undefined) updateData.email = req.body.email;
  if (req.body.bloodGroup !== undefined)
    updateData.bloodGroup = req.body.bloodGroup;
  if (req.body.phone !== undefined) updateData.phone = req.body.phone;
  if (req.body.age !== undefined) updateData.age = Number(req.body.age);
  if (req.body.weight !== undefined)
    updateData.weight = Number(req.body.weight);
  if (req.body.availability !== undefined) {
    updateData.availability = !!req.body.availability;
  }
  if (req.body.lastDonationDate !== undefined) {
    updateData.lastDonationDate = req.body.lastDonationDate || null;
  }
  if (req.body.medicalHistory !== undefined) {
    updateData.medicalHistory = Array.isArray(req.body.medicalHistory)
      ? req.body.medicalHistory
      : [];
  }

  const hasLocationInput =
    req.body.location ||
    req.body.address !== undefined ||
    req.body.city !== undefined ||
    req.body.state !== undefined ||
    req.body.zipCode !== undefined;

  if (hasLocationInput) {
    const incomingLocation = req.body.location || {};
    const street =
      incomingLocation.street !== undefined
        ? incomingLocation.street
        : req.body.address !== undefined
          ? req.body.address
          : donor.location?.street || "";

    const city =
      incomingLocation.city !== undefined
        ? incomingLocation.city
        : req.body.city !== undefined
          ? req.body.city
          : donor.location?.city || "";

    const state =
      incomingLocation.state !== undefined
        ? incomingLocation.state
        : req.body.state !== undefined
          ? req.body.state
          : donor.location?.state || "";

    const zipcode =
      incomingLocation.zipcode !== undefined
        ? incomingLocation.zipcode
        : req.body.zipCode !== undefined
          ? req.body.zipCode
          : donor.location?.zipcode || "";

    updateData.location = {
      type: "Point",
      coordinates:
        Array.isArray(incomingLocation.coordinates) &&
        incomingLocation.coordinates.length === 2
          ? incomingLocation.coordinates
          : donor.location?.coordinates || [0, 0],
      street,
      city,
      state,
      zipcode,
      formattedAddress: [street, city, state, zipcode]
        .filter(Boolean)
        .join(", "),
    };
  }

  donor = await Donor.findOneAndUpdate({ userId: req.user.id }, updateData, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: donor,
  });
});

const escapeRegex = (value = "") =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

exports.getDonors = catchAsync(async (req, res, next) => {
  const filter = {};

  // availability default true
  filter.availability =
    req.query.availability === undefined
      ? true
      : String(req.query.availability) === "true";

  // bloodGroup (ignore all/empty)
  const bloodGroup = String(req.query.bloodGroup || "").trim();
  if (bloodGroup && bloodGroup.toLowerCase() !== "all") {
    filter.bloodGroup = bloodGroup.replace(/ /g, "+");
  }

  // city (ignore empty)
  const city = String(req.query.city || "").trim();
  if (city) {
    const safeCity = escapeRegex(city.split(",")[0].trim());
    filter.$or = [
      { "location.city": { $regex: `^${safeCity}$`, $options: "i" } },
      { "location.formattedAddress": { $regex: safeCity, $options: "i" } },
    ];
  }

  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.max(parseInt(req.query.limit, 10) || 10, 1);
  const skip = (page - 1) * limit;

  const donors = await Donor.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
  const total = await Donor.countDocuments(filter);

  res.set("Cache-Control", "no-store");
  res.status(200).json({
    success: true,
    count: donors.length,
    total,
    pagination: {
      page,
      limit,
      totalPages: Math.ceil(total / limit),
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

  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

  // We updated the index to be on "location.coordinates", so we query "location.coordinates"
  // OR we can still query "location" if using legacy coordinates pairs, but for 2dsphere on coordinates field:
  // It is safer to query the field that is indexed for performance,
  // but $near with 2dsphere works on the field holding the [lng, lat] usually or the object.
  // Given we changed index to "location.coordinates", let's try querying that if specifically needed,
  // but usually standard query works if index is found.
  // EXCEPT: If we use $near on "location", and "location" is NOT a GeoJSON object (it has extra fields),
  // Mongo might still complain if it tries to treat "location" as geometry.
  // So we should query "location.coordinates" if using legacy pairs or just ensure we use $nearSphere on the correct path.

  const donors = await Donor.find({
    "location.coordinates": {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: [parseFloat(lng), parseFloat(lat)],
        },
        $maxDistance: parseFloat(radius) * 1000,
      },
    },
    availability: true,
    $or: [
      { lastDonationDate: { $exists: false } },
      { lastDonationDate: null },
      { lastDonationDate: { $lte: threeMonthsAgo } },
    ],
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
