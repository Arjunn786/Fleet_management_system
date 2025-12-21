const express = require("express");
const {
  getDashboardStats,
  getAllUsers,
  deleteUser,
  getAllVehicles,
  deleteVehicle,
  getAllBookings,
  deleteBooking,
  getAllTrips,
  updateTrip,
  deleteTrip,
  updateUserRole,
} = require("../controllers/adminController");
const { protect, authorize } = require("../middleware/auth");
const { cacheMiddleware } = require("../utils/cacheHelper");

const router = express.Router();

// All routes are protected and admin only
router.use(protect);
router.use(authorize("admin"));

// Dashboard
router.get("/dashboard", cacheMiddleware(60), getDashboardStats);

// Users management
router.get("/users", getAllUsers);
router.delete("/users/:id", deleteUser);
router.patch("/users/:id/role", updateUserRole);

// Vehicles management
router.get("/vehicles", getAllVehicles);
router.delete("/vehicles/:id", deleteVehicle);

// Bookings management
router.get("/bookings", getAllBookings);
router.delete("/bookings/:id", deleteBooking);

// Trips management
router.get("/trips", getAllTrips);
router.put("/trips/:id", updateTrip);
router.delete("/trips/:id", deleteTrip);

module.exports = router;
