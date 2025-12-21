const User = require("../models/User");
const { AppError } = require("../middleware/errorHandler");

// @desc    Get user profile
// @route   GET /api/users/:id
// @access  Private
exports.getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select(
      "-password -refreshToken"
    );

    if (!user) {
      return next(new AppError("User not found", 404));
    }

    // Users can only view their own profile unless they're admin
    if (req.user.role !== "admin" && req.params.id !== req.user.id) {
      return next(new AppError("Not authorized to view this profile", 403));
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/users/:id
// @access  Private
exports.updateUserProfile = async (req, res, next) => {
  try {
    // Users can only update their own profile
    if (req.params.id !== req.user.id) {
      return next(new AppError("Not authorized to update this profile", 403));
    }

    const fieldsToUpdate = {
      name: req.body.name,
      phone: req.body.phone,
      address: req.body.address,
      profileImage: req.body.profileImage,
    };

    // If driver, allow license updates
    if (req.user.role === "driver") {
      if (req.body.licenseNumber)
        fieldsToUpdate.licenseNumber = req.body.licenseNumber;
      if (req.body.licenseExpiry)
        fieldsToUpdate.licenseExpiry = req.body.licenseExpiry;
      if (req.body.experience !== undefined)
        fieldsToUpdate.experience = req.body.experience;
    }

    // If owner, allow business details updates
    if (req.user.role === "owner") {
      if (req.body.businessName)
        fieldsToUpdate.businessName = req.body.businessName;
      if (req.body.businessAddress)
        fieldsToUpdate.businessAddress = req.body.businessAddress;
      if (req.body.businessLicense)
        fieldsToUpdate.businessLicense = req.body.businessLicense;
    }

    const user = await User.findByIdAndUpdate(req.params.id, fieldsToUpdate, {
      new: true,
      runValidators: true,
    }).select("-password -refreshToken");

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};
