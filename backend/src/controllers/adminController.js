const User = require("../models/User");
const Vehicle = require("../models/Vehicle");
const Trip = require("../models/Trip");
const Booking = require("../models/Booking");
const DriverAssignment = require("../models/DriverAssignment");
const { AppError } = require("../middleware/errorHandler");
const {
  clearAnalyticsCaches,
  clearVehicleCaches,
  clearBookingCaches,
  clearTripCaches,
} = require("../utils/cacheHelper");
const logger = require("../utils/logger");

// @desc    Get admin dashboard stats
// @route   GET /api/admin/dashboard
// @access  Private (Admin)
exports.getDashboardStats = async (req, res, next) => {
  try {
    // Get counts
    const [
      totalVehicles,
      totalDrivers,
      totalCustomers,
      totalTrips,
      completedTrips,
      cancelledTrips,
      activeBookings,
    ] = await Promise.all([
      Vehicle.countDocuments({ isDeleted: false }),
      User.countDocuments({ role: "driver", isDeleted: false }),
      User.countDocuments({ role: "customer", isDeleted: false }),
      Trip.countDocuments({ isDeleted: false }),
      Trip.countDocuments({ status: "completed", isDeleted: false }),
      Booking.countDocuments({ status: "cancelled", isDeleted: false }),
      Booking.countDocuments({
        status: { $in: ["pending", "confirmed", "in_progress"] },
        isDeleted: false,
      }),
    ]);

    // Calculate revenue
    const revenueData = await Trip.aggregate([
      { $match: { status: "completed", isDeleted: { $ne: true } } },
      { $group: { _id: null, totalRevenue: { $sum: "$revenue" } } },
    ]);

    const totalRevenue =
      revenueData.length > 0 ? revenueData[0].totalRevenue : 0;

    // Monthly revenue
    const monthlyRevenue = await Trip.aggregate([
      {
        $match: {
          status: "completed",
          isDeleted: { $ne: true },
          completedAt: {
            $gte: new Date(new Date().setMonth(new Date().getMonth() - 6)),
          },
        },
      },
      {
        $group: {
          _id: { $month: "$completedAt" },
          month: { $first: { $month: "$completedAt" } },
          revenue: { $sum: "$revenue" },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Vehicle type distribution
    const vehicleTypeStats = await Vehicle.aggregate([
      { $match: { isDeleted: { $ne: true } } },
      { $group: { _id: "$vehicleType", count: { $sum: 1 } } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalVehicles,
          totalDrivers,
          totalCustomers,
          totalTrips,
          completedTrips,
          cancelledTrips,
          activeBookings,
          totalRevenue,
        },
        monthlyRevenue,
        vehicleTypeStats,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users with filters
// @route   GET /api/admin/users
// @access  Private (Admin)
exports.getAllUsers = async (req, res, next) => {
  try {
    const { role, page = 1, limit = 10, search } = req.query;

    const query = {};

    if (role) query.role = role;
    if (search) {
      query.$or = [
        { name: new RegExp(search, "i") },
        { email: new RegExp(search, "i") },
      ];
    }

    const users = await User.find(query)
      .select("-password -refreshToken")
      .sort("-createdAt")
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      count: users.length,
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: Number(page),
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user (soft delete)
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin)
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return next(new AppError("User not found", 404));
    }

    if (user.role === "admin") {
      return next(new AppError("Cannot delete admin users", 403));
    }

    user.isDeleted = true;
    user.deletedAt = Date.now();
    user.isActive = false;
    await user.save();

    logger.info(`User soft deleted: ${user.email} by admin: ${req.user.email}`);

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all vehicles with filters (admin)
// @route   GET /api/admin/vehicles
// @access  Private (Admin)
exports.getAllVehicles = async (req, res, next) => {
  try {
    const { status, vehicleType, page = 1, limit = 10 } = req.query;

    const query = {};

    if (status) query.availability = status;
    if (vehicleType) query.vehicleType = vehicleType;

    const vehicles = await Vehicle.find(query, null, { includeDeleted: true })
      .populate("owner", "name email phone")
      .sort("-createdAt")
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

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

// @desc    Delete vehicle (soft delete)
// @route   DELETE /api/admin/vehicles/:id
// @access  Private (Admin)
exports.deleteVehicle = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
      return next(new AppError("Vehicle not found", 404));
    }

    vehicle.isDeleted = true;
    vehicle.deletedAt = Date.now();
    vehicle.availability = "unavailable";
    await vehicle.save();

    // Cancel all pending/confirmed bookings for this vehicle
    await Booking.updateMany(
      { vehicle: vehicle._id, status: { $in: ["pending", "confirmed"] } },
      { status: "cancelled", cancellationReason: "Vehicle deleted by admin" }
    );

    await clearVehicleCaches();
    await clearBookingCaches();

    logger.info(
      `Vehicle soft deleted: ${vehicle.registrationNumber} by admin: ${req.user.email}`
    );

    res.status(200).json({
      success: true,
      message: "Vehicle deleted successfully",
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all bookings (admin)
// @route   GET /api/admin/bookings
// @access  Private (Admin)
exports.getAllBookings = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10, search } = req.query;

    const query = {};

    if (status) query.status = status;

    // Search by customer name or vehicle
    if (search) {
      const users = await User.find({
        name: { $regex: search, $options: "i" },
      }).select("_id");

      const vehicles = await Vehicle.find({
        $or: [
          { make: { $regex: search, $options: "i" } },
          { model: { $regex: search, $options: "i" } },
        ],
      }).select("_id");

      query.$or = [
        { customer: { $in: users.map((u) => u._id) } },
        { vehicle: { $in: vehicles.map((v) => v._id) } },
      ];
    }

    const bookings = await Booking.find(query, null, { includeDeleted: true })
      .populate("customer", "name email phone")
      .populate("vehicle", "make model year registrationNumber")
      .sort("-createdAt")
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

// @desc    Delete booking (soft delete)
// @route   DELETE /api/admin/bookings/:id
// @access  Private (Admin)
exports.deleteBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return next(new AppError("Booking not found", 404));
    }

    booking.isDeleted = true;
    booking.deletedAt = Date.now();
    booking.status = "cancelled";
    await booking.save();

    await clearBookingCaches();

    logger.info(
      `Booking soft deleted: ${booking._id} by admin: ${req.user.email}`
    );

    res.status(200).json({
      success: true,
      message: "Booking deleted successfully",
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all trips (admin)
// @route   GET /api/admin/trips
// @access  Private (Admin)
exports.getAllTrips = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const query = {};

    if (status) query.status = status;

    const trips = await Trip.find(query, null, { includeDeleted: true })
      .populate("customer", "name email phone")
      .populate("driver", "name email phone")
      .populate("vehicle", "make model registrationNumber")
      .sort("-createdAt")
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

// @desc    Delete trip (soft delete)
// @route   DELETE /api/admin/trips/:id
// @access  Private (Admin)
exports.deleteTrip = async (req, res, next) => {
  try {
    const trip = await Trip.findById(req.params.id);

    if (!trip) {
      return next(new AppError("Trip not found", 404));
    }

    trip.isDeleted = true;
    trip.deletedAt = Date.now();
    await trip.save();

    await clearTripCaches();

    logger.info(`Trip soft deleted: ${trip._id} by admin: ${req.user.email}`);

    res.status(200).json({
      success: true,
      message: "Trip deleted successfully",
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user role
// @route   PATCH /api/admin/users/:id/role
// @access  Private (Admin)
exports.updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;

    if (!["customer", "driver", "owner"].includes(role)) {
      return next(new AppError("Invalid role", 400));
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return next(new AppError("User not found", 404));
    }

    user.role = role;
    await user.save();

    res.status(200).json({
      success: true,
      message: "User role updated successfully",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update trip
// @route   PUT /api/admin/trips/:id
// @access  Private (Admin)
exports.updateTrip = async (req, res, next) => {
  try {
    const { status, distance, duration } = req.body;

    const trip = await Trip.findById(req.params.id);

    if (!trip) {
      return next(new AppError("Trip not found", 404));
    }

    // Update trip fields
    if (status) trip.status = status;
    if (distance) trip.distance = distance;
    if (duration) trip.duration = duration;

    // Set completion date if status is completed
    if (status === "completed" && trip.status !== "completed") {
      trip.completedAt = new Date();
    }

    await trip.save();

    // Clear related caches
    await clearTripCaches();

    logger.info(`Trip updated: ${trip._id} by admin: ${req.user.email}`);

    res.status(200).json({
      success: true,
      message: "Trip updated successfully",
      data: trip,
    });
  } catch (error) {
    next(error);
  }
};
