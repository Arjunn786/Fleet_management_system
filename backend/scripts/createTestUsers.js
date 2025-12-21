// Quick script to create test users for all roles
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

// Connect to MongoDB
mongoose.connect(
  process.env.MONGODB_URI || "mongodb://localhost:27017/fleetdb",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

const userSchema = new mongoose.Schema(
  {
    name: String,
    email: String,
    password: String,
    role: String,
    phone: String,
    address: Object,
    licenseNumber: String,
    licenseExpiry: Date,
    isActive: Boolean,
    isDeleted: Boolean,
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

async function createTestUsers() {
  try {
    console.log("🔄 Creating test users...\n");

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("password123", salt);

    const testUsers = [
      {
        name: "Admin User",
        email: "admin@fleet.com",
        password: hashedPassword,
        role: "admin",
        phone: "1234567890",
        address: {
          street: "123 Admin St",
          city: "New York",
          state: "NY",
          zipCode: "10001",
          country: "USA",
        },
        isActive: true,
        isDeleted: false,
      },
      {
        name: "John Customer",
        email: "customer@fleet.com",
        password: hashedPassword,
        role: "customer",
        phone: "2345678901",
        address: {
          street: "456 Customer Ave",
          city: "Los Angeles",
          state: "CA",
          zipCode: "90001",
          country: "USA",
        },
        isActive: true,
        isDeleted: false,
      },
      {
        name: "Mike Driver",
        email: "driver@fleet.com",
        password: hashedPassword,
        role: "driver",
        phone: "3456789012",
        address: {
          street: "789 Driver Rd",
          city: "Chicago",
          state: "IL",
          zipCode: "60601",
          country: "USA",
        },
        licenseNumber: "DL123456789",
        licenseExpiry: new Date("2026-12-31"),
        isActive: true,
        isDeleted: false,
      },
      {
        name: "Sarah Owner",
        email: "owner@fleet.com",
        password: hashedPassword,
        role: "owner",
        phone: "4567890123",
        address: {
          street: "321 Owner Blvd",
          city: "Houston",
          state: "TX",
          zipCode: "77001",
          country: "USA",
        },
        isActive: true,
        isDeleted: false,
      },
    ];

    // Delete existing test users
    await User.deleteMany({
      email: {
        $in: [
          "admin@fleet.com",
          "customer@fleet.com",
          "driver@fleet.com",
          "owner@fleet.com",
        ],
      },
    });

    // Insert test users
    const createdUsers = await User.insertMany(testUsers);

    console.log("✅ Test users created successfully!\n");
    console.log("📧 Login Credentials:\n");
    console.log("==========================================");
    console.log("ADMIN:");
    console.log("  Email: admin@fleet.com");
    console.log("  Password: password123");
    console.log("  URL: http://localhost:3001 (Admin Portal)\n");

    console.log("CUSTOMER:");
    console.log("  Email: customer@fleet.com");
    console.log("  Password: password123");
    console.log("  URL: http://localhost:3000\n");

    console.log("DRIVER:");
    console.log("  Email: driver@fleet.com");
    console.log("  Password: password123");
    console.log("  URL: http://localhost:3000\n");

    console.log("OWNER:");
    console.log("  Email: owner@fleet.com");
    console.log("  Password: password123");
    console.log("  URL: http://localhost:3000\n");
    console.log("==========================================");

    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error creating test users:", error);
    process.exit(1);
  }
}

createTestUsers();
