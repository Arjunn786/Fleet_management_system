const express = require("express");
const { body } = require("express-validator");
const {
  getAllVehicles,
  getVehicle,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  getMyVehicles,
  updateAvailability,
} = require("../controllers/vehicleController");
const { protect, authorize } = require("../middleware/auth");
const { cacheMiddleware } = require("../utils/cacheHelper");

const router = express.Router();

// Validation
const vehicleValidation = [
  body("make").trim().notEmpty().withMessage("Make is required"),
  body("model").trim().notEmpty().withMessage("Model is required"),
  body("year").isInt({ min: 1900 }).withMessage("Valid year is required"),
  body("registrationNumber")
    .trim()
    .notEmpty()
    .withMessage("Registration number is required"),
  body("vehicleType")
    .isIn(["sedan", "suv", "van", "truck", "luxury", "electric", "hybrid"])
    .withMessage("Invalid vehicle type"),
  body("pricePerDay")
    .isFloat({ min: 0 })
    .withMessage("Valid price per day is required"),
  body("capacity.passengers")
    .isInt({ min: 1 })
    .withMessage("Passenger capacity is required"),
];

// Public routes
router.get("/", cacheMiddleware(300), getAllVehicles);
router.get("/:id", cacheMiddleware(300), getVehicle);

// Protected routes
router.use(protect);

router.get("/my/vehicles", authorize("owner", "admin"), getMyVehicles);
router.post("/", authorize("owner", "admin"), vehicleValidation, createVehicle);
router.put("/:id", authorize("owner", "admin"), updateVehicle);
router.delete("/:id", authorize("owner", "admin"), deleteVehicle);
router.patch(
  "/:id/availability",
  authorize("owner", "admin"),
  updateAvailability
);

module.exports = router;
