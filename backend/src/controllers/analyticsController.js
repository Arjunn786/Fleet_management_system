const Vehicle = require("../models/Vehicle");
const Trip = require("../models/Trip");
const Booking = require("../models/Booking");
const { AppError } = require("../middleware/errorHandler");

// @desc    Get owner analytics
// @route   GET /api/analytics/owner
// @access  Private (Owner)
exports.getOwnerAnalytics = async (req, res, next) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get owner's vehicles
    const vehicles = await Vehicle.find({
      owner: req.user.id,
      isDeleted: false,
    });
    const vehicleIds = vehicles.map((v) => v._id);

    // Build date filter for analytics
    const dateFilter = { createdAt: { $gte: startDate } };

    // Total revenue
    const revenueData = await Trip.aggregate([
      {
        $match: {
          vehicle: { $in: vehicleIds },
          status: "completed",
          isDeleted: { $ne: true },
          ...dateFilter,
        },
      },
      { $group: { _id: null, totalRevenue: { $sum: "$revenue" } } },
    ]);
    const totalRevenue =
      revenueData.length > 0 ? revenueData[0].totalRevenue : 0;

    // Total bookings
    const totalBookings = await Booking.countDocuments({
      vehicle: { $in: vehicleIds },
      isDeleted: false,
    });

    // Total cancellations
    const totalCancellations = await Booking.countDocuments({
      vehicle: { $in: vehicleIds },
      status: "cancelled",
      isDeleted: false,
    });

    // Completed trips
    const completedTrips = await Trip.countDocuments({
      vehicle: { $in: vehicleIds },
      status: "completed",
      isDeleted: false,
    });

    // Trip history with details
    const tripHistory = await Trip.find({
      vehicle: { $in: vehicleIds },
      isDeleted: false,
    })
      .populate("customer", "name email")
      .populate("vehicle", "make model registrationNumber")
      .populate("driver", "name email")
      .sort("-createdAt")
      .limit(20);

    // Vehicle-wise performance
    const vehiclePerformance = await Trip.aggregate([
      {
        $match: {
          vehicle: { $in: vehicleIds },
          status: "completed",
          isDeleted: { $ne: true },
        },
      },
      {
        $group: {
          _id: "$vehicle",
          totalTrips: { $sum: 1 },
          totalRevenue: { $sum: "$revenue" },
          avgRating: { $avg: "$rating.customerRating" },
        },
      },
    ]);

    // Populate vehicle details
    const vehiclePerformanceWithDetails = await Vehicle.populate(
      vehiclePerformance,
      {
        path: "_id",
        select: "make model registrationNumber vehicleType",
      }
    );

    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalVehicles: vehicles.length,
          totalRevenue,
          totalBookings,
          totalCancellations,
          completedTrips,
        },
        vehiclePerformance: vehiclePerformanceWithDetails,
        recentTrips: tripHistory,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get driver analytics
// @route   GET /api/analytics/driver
// @access  Private (Driver)
exports.getDriverAnalytics = async (req, res, next) => {
  try {
    // Trips assigned to driver
    const trips = await Trip.find({
      driver: req.user.id,
      isDeleted: false,
    })
      .populate("vehicle", "make model registrationNumber")
      .populate("customer", "name email")
      .sort("-createdAt");

    // Completed trips
    const completedTrips = trips.filter((t) => t.status === "completed");

    // Total earnings (if driver gets a commission)
    const totalEarnings = completedTrips.reduce(
      (sum, trip) => sum + (trip.revenue || 0),
      0
    );

    // Average rating
    const ratingsReceived = completedTrips.filter(
      (t) => t.rating?.customerRating
    );
    const avgRating =
      ratingsReceived.length > 0
        ? ratingsReceived.reduce(
            (sum, trip) => sum + trip.rating.customerRating,
            0
          ) / ratingsReceived.length
        : 0;

    // Total distance covered
    const totalDistance = completedTrips.reduce((sum, trip) => {
      return sum + (trip.distance?.actual || trip.distance?.planned || 0);
    }, 0);

    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalTrips: trips.length,
          completedTrips: completedTrips.length,
          totalEarnings,
          avgRating: avgRating.toFixed(2),
          totalDistance: totalDistance.toFixed(2),
        },
        recentTrips: trips.slice(0, 20),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get customer analytics
// @route   GET /api/analytics/customer
// @access  Private (Customer)
exports.getCustomerAnalytics = async (req, res, next) => {
  try {
    // Customer's bookings
    const bookings = await Booking.find({
      customer: req.user.id,
      isDeleted: false,
    })
      .populate("vehicle", "make model vehicleType images")
      .sort("-createdAt");

    // Total spent
    const totalSpent = bookings
      .filter((b) => b.status !== "cancelled")
      .reduce((sum, booking) => sum + (booking.pricing?.totalPrice || 0), 0);

    // Completed trips count
    const completedBookings = bookings.filter(
      (b) => b.status === "completed"
    ).length;

    // Cancelled bookings
    const cancelledBookings = bookings.filter(
      (b) => b.status === "cancelled"
    ).length;

    // Favorite vehicle type
    const vehicleTypeCount = {};
    bookings.forEach((b) => {
      if (b.vehicle?.vehicleType) {
        vehicleTypeCount[b.vehicle.vehicleType] =
          (vehicleTypeCount[b.vehicle.vehicleType] || 0) + 1;
      }
    });

    const favoriteVehicleType = Object.keys(vehicleTypeCount).reduce(
      (a, b) => (vehicleTypeCount[a] > vehicleTypeCount[b] ? a : b),
      Object.keys(vehicleTypeCount)[0] || "N/A"
    );

    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalBookings: bookings.length,
          completedBookings,
          cancelledBookings,
          totalSpent,
          favoriteVehicleType,
        },
        recentBookings: bookings.slice(0, 20),
      },
    });
  } catch (error) {
    next(error);
  }
};
