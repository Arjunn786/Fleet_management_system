const User = require("../models/User");
const { AppError } = require("../middleware/errorHandler");
const {
  sendTokenResponse,
  verifyRefreshToken,
  generateAccessToken,
} = require("../utils/tokenHelper");
const { getRedisClient } = require("../config/redis");
const logger = require("../utils/logger");

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role, phone, licenseNumber, licenseExpiry } =
      req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new AppError("Email already registered", 400));
    }

    // Create user object
    const userData = {
      name,
      email,
      password,
      role: role || "customer",
      phone,
    };

    // Add driver-specific fields if role is driver
    if (role === "driver") {
      if (!licenseNumber) {
        return next(
          new AppError("License number is required for drivers", 400)
        );
      }
      userData.licenseNumber = licenseNumber;
      userData.licenseExpiry = licenseExpiry;
    }

    // Create user
    const user = await User.create(userData);

    logger.info(`New user registered: ${user.email}`);

    sendTokenResponse(user, 201, res, "User registered successfully");
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return next(new AppError("Please provide email and password", 400));
    }

    // Check for user
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return next(new AppError("Invalid credentials", 401));
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return next(new AppError("Invalid credentials", 401));
    }

    // Check if user is active
    if (!user.isActive) {
      return next(
        new AppError(
          "Your account has been deactivated. Please contact support.",
          403
        )
      );
    }

    logger.info(`User logged in: ${user.email}`);

    sendTokenResponse(user, 200, res, "Login successful");
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
exports.logout = async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];

    // Add token to blacklist
    const redisClient = getRedisClient();
    await redisClient.setEx(`blacklist_${token}`, 900, "true"); // 15 minutes

    logger.info(`User logged out: ${req.user.email}`);

    res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Refresh access token
// @route   POST /api/auth/refresh
// @access  Public
exports.refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return next(new AppError("Refresh token is required", 400));
    }

    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);

    if (!decoded) {
      return next(new AppError("Invalid or expired refresh token", 401));
    }

    // Get user
    const user = await User.findById(decoded.id);

    if (!user) {
      return next(new AppError("User not found", 404));
    }

    // Generate new access token
    const accessToken = generateAccessToken(user._id);

    res.status(200).json({
      success: true,
      message: "Token refreshed successfully",
      data: {
        accessToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user details
// @route   PUT /api/auth/updatedetails
// @access  Private
exports.updateDetails = async (req, res, next) => {
  try {
    const fieldsToUpdate = {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      address: req.body.address,
    };

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: "Details updated successfully",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update password
// @route   PUT /api/auth/updatepassword
// @access  Private
exports.updatePassword = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("+password");

    // Check current password
    if (!(await user.matchPassword(req.body.currentPassword))) {
      return next(new AppError("Current password is incorrect", 401));
    }

    user.password = req.body.newPassword;
    await user.save();

    sendTokenResponse(user, 200, res, "Password updated successfully");
  } catch (error) {
    next(error);
  }
};
