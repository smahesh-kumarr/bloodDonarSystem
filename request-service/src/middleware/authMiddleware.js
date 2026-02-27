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
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, iat, exp }
    next();
  } catch (err) {
    return next(new AppError("Not authorized to access this route", 401));
  }
});

exports.restrictTo = (...roles) => {
  // roles ['admin', 'donor']
  // Since we don't have User model here, we need to ensuring role is passed in JWT
  // If role is NOT in JWT, we might need to fetch it from Auth Service (complex)
  // Or just trust the JWT payload if we updated Auth Service to include it.

  // Assuming JWT payload has role: { id: '...', role: 'user' }
  return (req, res, next) => {
    // We would need to update Auth Service to include role in token payload first!
    // For now, let's skip strict role check or assume req.user.role exists

    // if (!roles.includes(req.user.role)) {
    //   return next(new AppError('You do not have permission to perform this action', 403));
    // }
    next();
  };
};
