const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const connectDB = require("./config/database");
const connectRedis = require("./config/redis");
const { errorHandler } = require("./middleware/errorHandler");
const logger = require("./utils/logger");

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Connect to Redis conditionally
if (process.env.REDIS_ENABLED !== "false") {
  connectRedis();
}

// Middleware
app.use(helmet()); // Security headers
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:3001",
      "http://127.0.0.1:3000",
      "http://127.0.0.1:3001",
    ],
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  morgan("combined", {
    stream: { write: (message) => logger.info(message.trim()) },
  })
);

// Health check route
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "Fleet Management API is running",
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/vehicles", require("./routes/vehicleRoutes"));
app.use("/api/drivers", require("./routes/driverRoutes"));
app.use("/api/bookings", require("./routes/bookingRoutes"));
app.use("/api/trips", require("./routes/tripRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/analytics", require("./routes/analyticsRoutes"));

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  logger.info(
    `🚀 Server running on port ${PORT} in ${process.env.NODE_ENV} mode`
  );
  console.log(`🚀 Server running on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  logger.error("Unhandled Rejection:", err);
  console.log("Shutting down server due to unhandled promise rejection");
  process.exit(1);
});
