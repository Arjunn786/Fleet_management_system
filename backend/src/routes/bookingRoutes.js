const express = require("express");
const { body } = require("express-validator");
const {
  createBooking,
  getAllBookings,
  getBooking,
  updateBookingStatus,
  cancelBooking,
  getMyBookings,
} = require("../controllers/bookingController");
const { protect, authorize } = require("../middleware/auth");
const { cacheMiddleware } = require("../utils/cacheHelper");

const router = express.Router();

// Validation
const bookingValidation = [
  body("vehicleId").notEmpty().withMessage("Vehicle ID is required"),
  body("startDate")
    .isISO8601()
    .toDate()
    .withMessage("Valid start date is required"),
  body("endDate")
    .isISO8601()
    .toDate()
    .withMessage("Valid end date is required"),
  body("pickupLocation.address")
    .notEmpty()
    .withMessage("Pickup address is required"),
  body("bookingType")
    .optional()
    .isIn(["hourly", "daily", "weekly", "monthly"])
    .withMessage("Invalid booking type"),
];

// All routes are protected
router.use(protect);

router.post("/", authorize("customer"), bookingValidation, createBooking);
router.get("/", getAllBookings);
router.get("/my/history", authorize("customer"), getMyBookings);
router.get("/:id", getBooking);
router.patch("/:id/status", updateBookingStatus);
router.post("/:id/cancel", cancelBooking);

module.exports = router;
