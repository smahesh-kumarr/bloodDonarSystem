const jwt = require("jsonwebtoken");
const axios = require("axios");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");

exports.protect = catchAsync(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies?.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return next(new AppError("Not authorized to access this route", 401));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Call Auth Service to get user details to populate req.user
    // including role
    const response = await axios.get(
      `${process.env.AUTH_SERVICE_URL}/api/v1/auth/me`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    req.user = response.data.data;
    next();
  } catch (err) {
    return next(new AppError("Not authorized to access this route", 401));
  }
});

exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          `User role ${req.user.role} is not authorized to access this route`,
          403,
        ),
      );
    }
    next();
  };
};
