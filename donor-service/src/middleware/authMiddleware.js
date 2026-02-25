const jwt = require("jsonwebtoken");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");

exports.protect = catchAsync(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return next(new AppError("Not authorized to access this route", 401));
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Add user info to request (Since this is a decoupled service, we might not have the User model handy to check DB,
    // but we can trust the token signature if we share the secret)
    // Ideally we would double check if user exists via Auth Service communications, but for simple token validation:
    req.user = decoded;

    // Note: If you need role-based access control here, ensure 'role' is inside the JWT payload in auth-service
    // In auth-service/src/controllers/authController.js: generateToken should include role if needed.
    // For now, let's assume we just check valid login.

    next();
  } catch (err) {
    return next(new AppError("Not authorized to access this route", 401));
  }
});
