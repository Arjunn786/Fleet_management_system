const Booking = require("../models/Booking");
const Vehicle = require("../models/Vehicle");
const Trip = require("../models/Trip");
const { AppError } = require("../middleware/errorHandler");
const { clearBookingCaches } = require("../utils/cacheHelper");
const {
  sendBookingConfirmation,
  sendTripCancellation,
} = require("../utils/emailService");
const logger = require("../utils/logger");

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Private (Customer)
exports.createBooking = async (req, res, next) => {
  try {
    const {
      vehicleId,
      startDate,
      endDate,
      startTime,
      endTime,
      pickupLocation,
      dropoffLocation,
      bookingType,
      specialRequests,
    } = req.body;

    // Check if vehicle exists and is available
    const vehicle = await Vehicle.findById(vehicleId).populate(
      "owner",
      "name email"
    );

    if (!vehicle) {
      return next(new AppError("Vehicle not found", 404));
    }

    if (vehicle.availability !== "available") {
      return next(new AppError("Vehicle is not available for booking", 400));
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    const now = new Date();

    if (start < now) {
      return next(new AppError("Start date cannot be in the past", 400));
    }

    if (end <= start) {
      return next(new AppError("End date must be after start date", 400));
    }

    // Check for conflicting bookings
    const conflictingBooking = await Booking.findOne({
      vehicle: vehicleId,
      status: { $in: ["pending", "confirmed", "in_progress"] },
      $or: [{ startDate: { $lte: end }, endDate: { $gte: start } }],
    });

    if (conflictingBooking) {
      return next(
        new AppError("Vehicle is already booked for the selected dates", 400)
      );
    }

    // Calculate duration
    const duration = {
      days: Math.ceil((end - start) / (1000 * 60 * 60 * 24)),
      hours: 0,
    };

    // Calculate pricing
    let basePrice = 0;
    if (bookingType === "hourly" && vehicle.pricePerHour) {
      const hours = Math.ceil((end - start) / (1000 * 60 * 60));
      duration.hours = hours;
      basePrice = vehicle.pricePerHour * hours;
    } else {
      basePrice = vehicle.pricePerDay * duration.days;
    }

    const taxes = basePrice * 0.18; // 18% tax
    const totalPrice = basePrice + taxes;

    // Create booking
    const booking = await Booking.create({
      customer: req.user.id,
      vehicle: vehicleId,
      bookingType,
      startDate,
      endDate,
      startTime,
      endTime,
      pickupLocation,
      dropoffLocation,
      duration,
      pricing: {
        basePrice,
        taxes,
        discount: 0,
        totalPrice,
      },
      specialRequests,
      status: "pending",
    });

    // Update vehicle availability
    vehicle.availability = "booked";
    await vehicle.save();

    // Create trip record
    await Trip.create({
      booking: booking._id,
      vehicle: vehicleId,
      customer: req.user.id,
      status: "scheduled",
    });

    await clearBookingCaches();

    // Populate booking for email
    const populatedBooking = await Booking.findById(booking._id).populate(
      "vehicle"
    );

    // Send booking confirmation email
    try {
      await sendBookingConfirmation(populatedBooking, req.user, vehicle);
    } catch (emailError) {
      logger.error("Booking confirmation email failed:", emailError);
    }

    logger.info(`Booking created: ${booking._id} by user: ${req.user.email}`);

    res.status(201).json({
      success: true,
      message: "Booking created successfully",
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all bookings (with filters)
// @route   GET /api/bookings
// @access  Private
exports.getAllBookings = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10, sort = "-createdAt" } = req.query;

    const query = {};

    // Filter by role
    if (req.user.role === "customer") {
      query.customer = req.user.id;
    } else if (req.user.role === "owner") {
      // Get owner's vehicles
      const vehicles = await Vehicle.find({ owner: req.user.id }).select("_id");
      const vehicleIds = vehicles.map((v) => v._id);
      query.vehicle = { $in: vehicleIds };
    }

    if (status) query.status = status;

    const bookings = await Booking.find(query)
      .populate("customer", "name email phone")
      .populate("vehicle", "make model year registrationNumber vehicleType")
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await Booking.countDocuments(query);

    res.status(200).json({
      success: true,
      count: bookings.length,
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: Number(page),
      data: bookings,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single booking
// @route   GET /api/bookings/:id
// @access  Private
exports.getBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("customer", "name email phone")
      .populate("vehicle")
      .populate("cancelledBy", "name email");

    if (!booking) {
      return next(new AppError("Booking not found", 404));
    }

    // Check authorization
    const vehicle = await Vehicle.findById(booking.vehicle._id);
    if (
      req.user.role !== "admin" &&
      booking.customer._id.toString() !== req.user.id &&
      vehicle.owner.toString() !== req.user.id
    ) {
      return next(new AppError("Not authorized to view this booking", 403));
    }

    res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update booking status
// @route   PATCH /api/bookings/:id/status
// @access  Private
exports.updateBookingStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    const booking = await Booking.findById(req.params.id).populate("vehicle");

    if (!booking) {
      return next(new AppError("Booking not found", 404));
    }

    // Authorization check
    const vehicle = await Vehicle.findById(booking.vehicle._id);
    if (
      req.user.role !== "admin" &&
      booking.customer.toString() !== req.user.id &&
      vehicle.owner.toString() !== req.user.id
    ) {
      return next(new AppError("Not authorized to update this booking", 403));
    }

    booking.status = status;

    if (status === "confirmed") {
      booking.confirmedAt = Date.now();
    }

    await booking.save();
    await clearBookingCaches();

    res.status(200).json({
      success: true,
      message: "Booking status updated successfully",
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel booking
// @route   POST /api/bookings/:id/cancel
// @access  Private
exports.cancelBooking = async (req, res, next) => {
  try {
    const { reason } = req.body;

    const booking = await Booking.findById(req.params.id).populate("vehicle");

    if (!booking) {
      return next(new AppError("Booking not found", 404));
    }

    // Check if booking can be cancelled
    if (booking.status === "completed" || booking.status === "cancelled") {
      return next(
        new AppError(`Cannot cancel a ${booking.status} booking`, 400)
      );
    }

    // Authorization check
    const vehicle = await Vehicle.findById(booking.vehicle._id);
    if (
      req.user.role !== "admin" &&
      booking.customer.toString() !== req.user.id &&
      vehicle.owner.toString() !== req.user.id
    ) {
      return next(new AppError("Not authorized to cancel this booking", 403));
    }

    booking.status = "cancelled";
    booking.cancellationReason = reason;
    booking.cancelledBy = req.user.id;
    booking.cancelledAt = Date.now();
    await booking.save();

    // Update vehicle availability
    vehicle.availability = "available";
    await vehicle.save();

    // Update trip status
    await Trip.findOneAndUpdate(
      { booking: booking._id },
      { status: "cancelled" }
    );

    await clearBookingCaches();

    // Send cancellation email
    try {
      await sendTripCancellation(booking, req.user, vehicle);
    } catch (emailError) {
      logger.error("Cancellation email failed:", emailError);
    }

    logger.info(`Booking cancelled: ${booking._id}`);

    res.status(200).json({
      success: true,
      message: "Booking cancelled successfully",
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get customer booking history
// @route   GET /api/bookings/my/history
// @access  Private (Customer)
exports.getMyBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ customer: req.user.id })
      .populate(
        "vehicle",
        "make model year registrationNumber vehicleType images"
      )
      .sort("-createdAt");

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    next(error);
  }
};
