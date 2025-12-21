const jwt = require("jsonwebtoken");

// Generate access token
exports.generateAccessToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRY || "15m",
  });
};

// Generate refresh token
exports.generateRefreshToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRY || "7d",
  });
};

// Verify access token
exports.verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_ACCESS_SECRET);
  } catch (error) {
    return null;
  }
};

// Verify refresh token
exports.verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch (error) {
    return null;
  }
};

// Send token response
exports.sendTokenResponse = (user, statusCode, res, message = "Success") => {
  // Generate tokens
  const accessToken = this.generateAccessToken(user._id);
  const refreshToken = this.generateRefreshToken(user._id);

  // Remove password from output
  user.password = undefined;
  user.refreshToken = undefined;

  res.status(statusCode).json({
    success: true,
    message,
    data: {
      user,
      accessToken,
      refreshToken,
    },
  });
};
