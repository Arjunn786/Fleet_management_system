const express = require("express");
const { body } = require("express-validator");
const {
  getAllTrips,
  getTrip,
  updateTripStatus,
  assignDriver,
  addTripReview,
  reportIssue,
} = require("../controllers/tripController");
const { protect, authorize } = require("../middleware/auth");
const { cacheMiddleware } = require("../utils/cacheHelper");

const router = express.Router();

// All routes are protected
router.use(protect);

router.get("/", getAllTrips);
router.get("/:id", getTrip);
router.patch(
  "/:id/status",
  authorize("driver", "owner", "admin"),
  updateTripStatus
);
router.patch("/:id/assign-driver", authorize("owner", "admin"), assignDriver);
router.post("/:id/review", addTripReview);
router.post("/:id/issues", reportIssue);

module.exports = router;
