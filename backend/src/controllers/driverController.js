const DriverAssignment = require("../models/DriverAssignment");
const Vehicle = require("../models/Vehicle");
const User = require("../models/User");
const { AppError } = require("../middleware/errorHandler");
const logger = require("../utils/logger");

// @desc    Get available vehicles for driver registration
// @route   GET /api/drivers/available-vehicles
// @access  Private (Driver)
exports.getAvailableVehicles = async (req, res, next) => {
  try {
    // Get all vehicles that are not deleted
    const vehicles = await Vehicle.find({ isDeleted: false })
      .populate("owner", "name email phone")
      .select(
        "make model year registrationNumber vehicleType pricePerDay availability location images"
      );

    res.status(200).json({
      success: true,
      count: vehicles.length,
      data: vehicles,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Register as driver for a vehicle
// @route   POST /api/drivers/register
// @access  Private (Driver)
exports.registerAsDriver = async (req, res, next) => {
  try {
    const { vehicleId, notes } = req.body;

    // Check if user is a driver
    if (req.user.role !== "driver") {
      return next(new AppError("Only drivers can register for vehicles", 403));
    }

    // Check if vehicle exists
    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return next(new AppError("Vehicle not found", 404));
    }

    // Check if driver already has a pending or active assignment for this vehicle
    const existingAssignment = await DriverAssignment.findOne({
      driver: req.user.id,
      vehicle: vehicleId,
      status: { $in: ["pending", "approved", "active"] },
    });

    if (existingAssignment) {
      return next(
        new AppError("You already have an assignment for this vehicle", 400)
      );
    }

    // Create driver assignment
    const assignment = await DriverAssignment.create({
      driver: req.user.id,
      vehicle: vehicleId,
      notes,
      status: "pending",
    });

    logger.info(
      `Driver registration created: ${assignment._id} for vehicle: ${vehicleId}`
    );

    res.status(201).json({
      success: true,
      message: "Driver registration submitted successfully. Awaiting approval.",
      data: assignment,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get assigned vehicles for driver
// @route   GET /api/drivers/assigned-vehicles
// @access  Private (Driver)
exports.getAssignedVehicles = async (req, res, next) => {
  try {
    const assignments = await DriverAssignment.find({
      driver: req.user.id,
      status: "approved",
    }).populate("vehicle");

    const vehicles = assignments
      .map((assignment) => assignment.vehicle)
      .filter((v) => v);

    res.status(200).json({
      success: true,
      count: vehicles.length,
      data: vehicles,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get driver assignments
// @route   GET /api/drivers/my-assignments
// @access  Private (Driver)
exports.getMyAssignments = async (req, res, next) => {
  try {
    const assignments = await DriverAssignment.find({ driver: req.user.id })
      .populate(
        "vehicle",
        "make model year registrationNumber vehicleType images"
      )
      .populate("approvedBy", "name email")
      .sort("-createdAt");

    res.status(200).json({
      success: true,
      count: assignments.length,
      data: assignments,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all driver assignments for vehicle owner
// @route   GET /api/drivers/assignments
// @access  Private (Owner, Admin)
exports.getAllAssignments = async (req, res, next) => {
  try {
    const { status, vehicleId, page = 1, limit = 10 } = req.query;

    const query = {};

    // If owner, only show assignments for their vehicles
    if (req.user.role === "owner") {
      const vehicles = await Vehicle.find({ owner: req.user.id }).select("_id");
      const vehicleIds = vehicles.map((v) => v._id);
      query.vehicle = { $in: vehicleIds };
    }

    if (status) query.status = status;
    if (vehicleId) query.vehicle = vehicleId;

    const assignments = await DriverAssignment.find(query)
      .populate("driver", "name email phone licenseNumber licenseExpiry")
      .populate("vehicle", "make model year registrationNumber vehicleType")
      .populate("approvedBy", "name email")
      .sort("-createdAt")
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await DriverAssignment.countDocuments(query);

    res.status(200).json({
      success: true,
      count: assignments.length,
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: Number(page),
      data: assignments,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve/Reject driver assignment
// @route   PATCH /api/drivers/assignments/:id/review
// @access  Private (Owner, Admin)
exports.reviewAssignment = async (req, res, next) => {
  try {
    const { status } = req.body; // 'approved' or 'rejected'

    if (!["approved", "rejected"].includes(status)) {
      return next(
        new AppError("Invalid status. Use approved or rejected", 400)
      );
    }

    const assignment = await DriverAssignment.findById(req.params.id).populate(
      "vehicle"
    );

    if (!assignment) {
      return next(new AppError("Assignment not found", 404));
    }

    // Check authorization
    const vehicle = await Vehicle.findById(assignment.vehicle._id);
    if (req.user.role !== "admin" && vehicle.owner.toString() !== req.user.id) {
      return next(
        new AppError("Not authorized to review this assignment", 403)
      );
    }

    assignment.status = status;
    assignment.approvedBy = req.user.id;
    assignment.approvedDate = Date.now();
    await assignment.save();

    logger.info(`Driver assignment ${status}: ${assignment._id}`);

    res.status(200).json({
      success: true,
      message: `Driver assignment ${status} successfully`,
      data: assignment,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update assignment status (activate/deactivate)
// @route   PATCH /api/drivers/assignments/:id/status
// @access  Private (Owner, Admin)
exports.updateAssignmentStatus = async (req, res, next) => {
  try {
    const { status } = req.body; // 'active' or 'inactive'

    if (!["active", "inactive"].includes(status)) {
      return next(new AppError("Invalid status. Use active or inactive", 400));
    }

    const assignment = await DriverAssignment.findById(req.params.id);

    if (!assignment) {
      return next(new AppError("Assignment not found", 404));
    }

    // Check authorization
    const vehicle = await Vehicle.findById(assignment.vehicle);
    if (req.user.role !== "admin" && vehicle.owner.toString() !== req.user.id) {
      return next(
        new AppError("Not authorized to update this assignment", 403)
      );
    }

    assignment.status = status;
    await assignment.save();

    res.status(200).json({
      success: true,
      message: "Assignment status updated successfully",
      data: assignment,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all drivers
// @route   GET /api/drivers
// @access  Private (Admin, Owner)
exports.getAllDrivers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const drivers = await User.find({ role: "driver", isDeleted: false })
      .select("-password -refreshToken")
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await User.countDocuments({
      role: "driver",
      isDeleted: false,
    });

    res.status(200).json({
      success: true,
      count: drivers.length,
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: Number(page),
      data: drivers,
    });
  } catch (error) {
    next(error);
  }
};
