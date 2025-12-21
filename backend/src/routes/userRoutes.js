const express = require("express");
const {
  getUserProfile,
  updateUserProfile,
} = require("../controllers/userController");
const { protect } = require("../middleware/auth");

const router = express.Router();

// All routes are protected
router.use(protect);

// Add a new route for user profile (must be before /:id route)
router.get("/profile", (req, res) => {
  // Set the user ID in params for getUserProfile to use
  req.params.id = req.user.id;
  getUserProfile(req, res);
});

router.get("/:id", getUserProfile);
router.put("/:id", updateUserProfile);

module.exports = router;
