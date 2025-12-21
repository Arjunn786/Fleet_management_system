const Vehicle = require("../models/Vehicle");
const User = require("../models/User");
const { AppError } = require("../middleware/errorHandler");
const { clearVehicleCaches } = require("../utils/cacheHelper");
const logger = require("../utils/logger");

// @desc    Get all vehicles
// @route   GET /api/vehicles
// @access  Public
exports.getAllVehicles = async (req, res, next) => {
  try {
    const {
      vehicleType,
      minPrice,
      maxPrice,
      availability,
      city,
      features,
      page = 1,
      limit = 10,
      sort = "-createdAt",
    } = req.query;

    // Build query
    const query = {};

    if (vehicleType) query.vehicleType = vehicleType;
    if (availability) query.availability = availability;
    if (city) query["location.city"] = new RegExp(city, "i");
    if (features) {
      const featureArray = features.split(",");
      query.features = { $all: featureArray };
    }
    if (minPrice || maxPrice) {
      query.pricePerDay = {};
      if (minPrice) query.pricePerDay.$gte = Number(minPrice);
      if (maxPrice) query.pricePerDay.$lte = Number(maxPrice);
    }

    // Execute query with pagination
    const vehicles = await Vehicle.find(query)
      .populate("owner", "name email phone")
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    // Get total count
    const count = await Vehicle.countDocuments(query);

    res.status(200).json({
      success: true,
      count: vehicles.length,
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: Number(page),
      data: vehicles,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single vehicle
// @route   GET /api/vehicles/:id
// @access  Public
exports.getVehicle = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id).populate(
      "owner",
      "name email phone"
    );

    if (!vehicle) {
      return next(new AppError("Vehicle not found", 404));
    }

    res.status(200).json({
      success: true,
      data: vehicle,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new vehicle
// @route   POST /api/vehicles
// @access  Private (Owner)
exports.createVehicle = async (req, res, next) => {
  try {
    // Add user as owner
    req.body.owner = req.user.id;

    const vehicle = await Vehicle.create(req.body);

    await clearVehicleCaches();

    logger.info(
      `Vehicle created: ${vehicle.registrationNumber} by user: ${req.user.email}`
    );

    res.status(201).json({
      success: true,
      message: "Vehicle created successfully",
      data: vehicle,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update vehicle
// @route   PUT /api/vehicles/:id
// @access  Private (Owner of vehicle or Admin)
exports.updateVehicle = async (req, res, next) => {
  try {
    let vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
      return next(new AppError("Vehicle not found", 404));
    }

    // Make sure user is vehicle owner or admin
    if (vehicle.owner.toString() !== req.user.id && req.user.role !== "admin") {
      return next(new AppError("Not authorized to update this vehicle", 403));
    }

    vehicle = await Vehicle.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    await clearVehicleCaches();

    res.status(200).json({
      success: true,
      message: "Vehicle updated successfully",
      data: vehicle,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete vehicle (soft delete)
// @route   DELETE /api/vehicles/:id
// @access  Private (Owner or Admin)
exports.deleteVehicle = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
      return next(new AppError("Vehicle not found", 404));
    }

    // Make sure user is vehicle owner or admin
    if (vehicle.owner.toString() !== req.user.id && req.user.role !== "admin") {
      return next(new AppError("Not authorized to delete this vehicle", 403));
    }

    // Soft delete
    vehicle.isDeleted = true;
    vehicle.deletedAt = Date.now();
    vehicle.availability = "unavailable";
    await vehicle.save();

    await clearVehicleCaches();

    logger.info(`Vehicle soft deleted: ${vehicle.registrationNumber}`);

    res.status(200).json({
      success: true,
      message: "Vehicle deleted successfully",
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get vehicles owned by logged in user
// @route   GET /api/vehicles/my/vehicles
// @access  Private (Owner)
exports.getMyVehicles = async (req, res, next) => {
  try {
    const vehicles = await Vehicle.find({ owner: req.user.id });

    res.status(200).json({
      success: true,
      count: vehicles.length,
      data: vehicles,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update vehicle availability
// @route   PATCH /api/vehicles/:id/availability
// @access  Private (Owner or Admin)
exports.updateAvailability = async (req, res, next) => {
  try {
    const { availability } = req.body;

    if (
      !["available", "booked", "maintenance", "unavailable"].includes(
        availability
      )
    ) {
      return next(new AppError("Invalid availability status", 400));
    }

    const vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
      return next(new AppError("Vehicle not found", 404));
    }

    // Make sure user is vehicle owner or admin
    if (vehicle.owner.toString() !== req.user.id && req.user.role !== "admin") {
      return next(new AppError("Not authorized to update this vehicle", 403));
    }

    vehicle.availability = availability;
    await vehicle.save();

    await clearVehicleCaches();

    res.status(200).json({
      success: true,
      message: "Availability updated successfully",
      data: vehicle,
    });
  } catch (error) {
    next(error);
  }
};
