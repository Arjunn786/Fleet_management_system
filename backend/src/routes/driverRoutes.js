const express = require("express");
const { body } = require("express-validator");
const {
  getAvailableVehicles,
  registerAsDriver,
  getMyAssignments,
  getAssignedVehicles,
  getAllAssignments,
  reviewAssignment,
  updateAssignmentStatus,
  getAllDrivers,
} = require("../controllers/driverController");
const { protect, authorize } = require("../middleware/auth");
const { cacheMiddleware } = require("../utils/cacheHelper");

const router = express.Router();

// All routes are protected
router.use(protect);

// Driver routes
router.get(
  "/available-vehicles",
  authorize("driver"),
  cacheMiddleware(300),
  getAvailableVehicles
);
router.post("/register", authorize("driver"), registerAsDriver);
router.get("/my-assignments", authorize("driver"), getMyAssignments);
router.get("/assigned-vehicles", authorize("driver"), getAssignedVehicles);

// Owner/Admin routes
router.get("/", authorize("owner", "admin"), getAllDrivers);
router.get("/assignments", authorize("owner", "admin"), getAllAssignments);
router.patch(
  "/assignments/:id/review",
  authorize("owner", "admin"),
  reviewAssignment
);
router.patch(
  "/assignments/:id/status",
  authorize("owner", "admin"),
  updateAssignmentStatus
);

module.exports = router;
