const express = require("express");
const {
  getOwnerAnalytics,
  getDriverAnalytics,
  getCustomerAnalytics,
} = require("../controllers/analyticsController");
const { protect, authorize } = require("../middleware/auth");
const { cacheMiddleware } = require("../utils/cacheHelper");

const router = express.Router();

// All routes are protected
router.use(protect);

router.get(
  "/owner",
  authorize("owner"),
  cacheMiddleware(120),
  getOwnerAnalytics
);
router.get(
  "/driver",
  authorize("driver"),
  cacheMiddleware(120),
  getDriverAnalytics
);
router.get(
  "/customer",
  authorize("customer"),
  cacheMiddleware(120),
  getCustomerAnalytics
);

module.exports = router;
