const Trip = require("../models/Trip");
const Booking = require("../models/Booking");
const Vehicle = require("../models/Vehicle");
const { AppError } = require("../middleware/errorHandler");
const { clearTripCaches } = require("../utils/cacheHelper");
const { sendTripCompletion } = require("../utils/emailService");
const logger = require("../utils/logger");

// @desc    Get all trips
// @route   GET /api/trips
// @access  Private
exports.getAllTrips = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10, sort = "-createdAt" } = req.query;

    const query = {};

    // Filter by role
    if (req.user.role === "customer") {
      query.customer = req.user.id;
    } else if (req.user.role === "driver") {
      query.driver = req.user.id;
    } else if (req.user.role === "owner") {
      const vehicles = await Vehicle.find({ owner: req.user.id }).select("_id");
      const vehicleIds = vehicles.map((v) => v._id);
      query.vehicle = { $in: vehicleIds };
    }

    if (status) query.status = status;

    const trips = await Trip.find(query)
      .populate("customer", "name email phone")
      .populate("driver", "name email phone licenseNumber")
      .populate("vehicle", "make model year registrationNumber vehicleType")
      .populate("booking")
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await Trip.countDocuments(query);

    res.status(200).json({
      success: true,
      count: trips.length,
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: Number(page),
      data: trips,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single trip
// @route   GET /api/trips/:id
// @access  Private
exports.getTrip = async (req, res, next) => {
  try {
    const trip = await Trip.findById(req.params.id)
      .populate("customer", "name email phone")
      .populate("driver", "name email phone licenseNumber")
      .populate("vehicle")
      .populate("booking");

    if (!trip) {
      return next(new AppError("Trip not found", 404));
    }

    // Check authorization
    const vehicle = await Vehicle.findById(trip.vehicle._id);
    if (
      req.user.role !== "admin" &&
      trip.customer.toString() !== req.user.id &&
      trip.driver?.toString() !== req.user.id &&
      vehicle.owner.toString() !== req.user.id
    ) {
      return next(new AppError("Not authorized to view this trip", 403));
    }

    res.status(200).json({
      success: true,
      data: trip,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update trip status
// @route   PATCH /api/trips/:id/status
// @access  Private (Driver, Owner, Admin)
exports.updateTripStatus = async (req, res, next) => {
  try {
    const {
      status,
      actualStartLocation,
      actualEndLocation,
      odometerStart,
      odometerEnd,
      fuelLevel,
    } = req.body;

    const trip = await Trip.findById(req.params.id)
      .populate("vehicle")
      .populate("customer", "name email");

    if (!trip) {
      return next(new AppError("Trip not found", 404));
    }

    // Authorization
    const vehicle = await Vehicle.findById(trip.vehicle._id);
    const isAuthorized =
      req.user.role === "admin" ||
      trip.driver?.toString() === req.user.id ||
      vehicle?.owner?.toString() === req.user.id;

    if (!isAuthorized) {
      console.log("Authorization failed for trip update:", {
        userId: req.user.id,
        userRole: req.user.role,
        tripDriver: trip.driver,
        vehicleOwner: vehicle?.owner,
      });
      return next(new AppError("Not authorized to update this trip", 403));
    }

    // Update trip based on status
    trip.status = status;

    if (status === "in_progress") {
      trip.startedAt = Date.now();
      if (actualStartLocation) trip.actualStartLocation = actualStartLocation;
      if (odometerStart) trip.odometerStart = odometerStart;
      if (fuelLevel?.start) trip.fuelLevel.start = fuelLevel.start;
    }

    if (status === "completed") {
      trip.completedAt = Date.now();
      if (actualEndLocation) trip.actualEndLocation = actualEndLocation;
      if (odometerEnd) trip.odometerEnd = odometerEnd;
      if (fuelLevel?.end) trip.fuelLevel.end = fuelLevel.end;

      // Calculate actual distance
      if (trip.odometerEnd && trip.odometerStart) {
        if (!trip.distance || typeof trip.distance !== "object") {
          trip.distance = { planned: 0, actual: 0 };
        }
        trip.distance.actual = trip.odometerEnd - trip.odometerStart;
      } else if (!trip.distance) {
        trip.distance = { planned: 0, actual: 0 };
      }

      // Update booking status
      await Booking.findByIdAndUpdate(trip.booking, { status: "completed" });

      // Update vehicle availability
      vehicle.availability = "available";
      await vehicle.save();

      // Send completion email
      try {
        await sendTripCompletion(trip, trip.customer, vehicle);
      } catch (emailError) {
        logger.error("Trip completion email failed:", emailError);
      }
    }

    await trip.save();
    await clearTripCaches();

    logger.info(`Trip status updated: ${trip._id} to ${status}`);

    res.status(200).json({
      success: true,
      message: "Trip status updated successfully",
      data: trip,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Assign driver to trip
// @route   PATCH /api/trips/:id/assign-driver
// @access  Private (Owner, Admin)
exports.assignDriver = async (req, res, next) => {
  try {
    const { driverId } = req.body;

    const trip = await Trip.findById(req.params.id);

    if (!trip) {
      return next(new AppError("Trip not found", 404));
    }

    // Check authorization
    const vehicle = await Vehicle.findById(trip.vehicle);
    if (req.user.role !== "admin" && vehicle.owner.toString() !== req.user.id) {
      return next(
        new AppError("Not authorized to assign driver to this trip", 403)
      );
    }

    trip.driver = driverId;
    await trip.save();

    await clearTripCaches();

    res.status(200).json({
      success: true,
      message: "Driver assigned successfully",
      data: trip,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add trip rating/review
// @route   POST /api/trips/:id/review
// @access  Private (Customer)
exports.addTripReview = async (req, res, next) => {
  try {
    const { customerRating, customerReview, driverRating, driverReview } =
      req.body;

    const trip = await Trip.findById(req.params.id);

    if (!trip) {
      return next(new AppError("Trip not found", 404));
    }

    // Only customer or driver can review
    if (
      trip.customer.toString() !== req.user.id &&
      trip.driver?.toString() !== req.user.id
    ) {
      return next(new AppError("Not authorized to review this trip", 403));
    }

    // Customer reviews
    if (trip.customer.toString() === req.user.id) {
      if (customerRating) trip.rating.customerRating = customerRating;
      if (customerReview) trip.rating.customerReview = customerReview;
    }

    // Driver reviews
    if (trip.driver?.toString() === req.user.id) {
      if (driverRating) trip.rating.driverRating = driverRating;
      if (driverReview) trip.rating.driverReview = driverReview;
    }

    await trip.save();
    await clearTripCaches();

    res.status(200).json({
      success: true,
      message: "Review added successfully",
      data: trip,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Report issue on trip
// @route   POST /api/trips/:id/issues
// @access  Private
exports.reportIssue = async (req, res, next) => {
  try {
    const { description } = req.body;

    const trip = await Trip.findById(req.params.id);

    if (!trip) {
      return next(new AppError("Trip not found", 404));
    }

    // Check authorization
    if (
      trip.customer.toString() !== req.user.id &&
      trip.driver?.toString() !== req.user.id
    ) {
      return next(
        new AppError("Not authorized to report issues for this trip", 403)
      );
    }

    trip.issues.push({
      description,
      reportedAt: Date.now(),
      status: "open",
    });

    await trip.save();

    logger.info(`Issue reported on trip: ${trip._id}`);

    res.status(201).json({
      success: true,
      message: "Issue reported successfully",
      data: trip,
    });
  } catch (error) {
    next(error);
  }
};
