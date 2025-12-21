const jwt = require("jsonwebtoken");
const { AppError } = require("./errorHandler");
const User = require("../models/User");
const { getRedisClient } = require("../config/redis");

// Protect routes - verify JWT token
exports.protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in headers
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return next(new AppError("Not authorized to access this route", 401));
    }

    try {
      // Check if token is blacklisted
      const redisClient = getRedisClient();
      const isBlacklisted = await redisClient.get(`blacklist_${token}`);

      if (isBlacklisted) {
        return next(
          new AppError("Token is invalid. Please log in again.", 401)
        );
      }

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

      // Get user from token
      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        return next(new AppError("User no longer exists", 401));
      }

      next();
    } catch (error) {
      return next(new AppError("Not authorized to access this route", 401));
    }
  } catch (error) {
    next(error);
  }
};

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          `User role '${req.user.role}' is not authorized to access this route`,
          403
        )
      );
    }
    next();
  };
};
