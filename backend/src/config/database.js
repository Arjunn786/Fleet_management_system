const mongoose = require("mongoose");
const logger = require("../utils/logger");

const connectDB = async () => {
  try {
    console.log("🔄 Attempting to connect to MongoDB...");
    console.log("MongoDB URI:", process.env.MONGODB_URI ? "Set" : "Not set");

    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI environment variable is not set");
    }

    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 30000, // 30 second timeout
      connectTimeoutMS: 30000,
      socketTimeoutMS: 30000,
    });

    logger.info(`MongoDB Connected: ${conn.connection.host}`);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    logger.error("MongoDB connection error:", error);
    console.error("❌ MongoDB connection error:", error.message);

    // Exit process on MongoDB connection failure
    process.exit(1);
  }
};

module.exports = connectDB;
