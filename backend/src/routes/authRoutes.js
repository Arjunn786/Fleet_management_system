const express = require("express");
const { body } = require("express-validator");
const {
  register,
  login,
  logout,
  refreshToken,
  getMe,
  updateDetails,
  updatePassword,
} = require("../controllers/authController");
const { protect } = require("../middleware/auth");
const { authLimiter } = require("../middleware/rateLimiter");

const router = express.Router();

// Validation middleware
const registerValidation = [
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Valid email is required"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
  body("role")
    .optional()
    .isIn(["customer", "driver", "owner"])
    .withMessage("Invalid role"),
  body("phone")
    .optional()
    .matches(/^[0-9]{10}$/)
    .withMessage("Invalid phone number"),
];

const loginValidation = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Valid email is required"),
  body("password").notEmpty().withMessage("Password is required"),
];

const updatePasswordValidation = [
  body("currentPassword")
    .notEmpty()
    .withMessage("Current password is required"),
  body("newPassword")
    .isLength({ min: 6 })
    .withMessage("New password must be at least 6 characters"),
];

// Routes
router.post("/register", authLimiter, registerValidation, register);
router.post("/login", authLimiter, loginValidation, login);
router.post("/logout", protect, logout);
router.post("/refresh", refreshToken);
router.get("/me", protect, getMe);
router.put("/updatedetails", protect, updateDetails);
router.put(
  "/updatepassword",
  protect,
  updatePasswordValidation,
  updatePassword
);

module.exports = router;
