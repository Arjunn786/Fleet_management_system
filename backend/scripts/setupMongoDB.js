const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

// MongoDB Connection String - Working Atlas demo cluster
const MONGODB_URI =
  "mongodb+srv://fleetuser:FleetDemo2025!@fleet-cluster.6yxojag.mongodb.net/fleet_management?retryWrites=true&w=majority&appName=fleet-cluster";

// User Schema (simplified for setup)
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false,
    },
    role: {
      type: String,
      enum: ["admin", "customer", "driver", "vehicle_owner"],
      default: "customer",
    },
    phone: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "suspended"],
      default: "active",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    // Driver specific fields
    licenseNumber: {
      type: String,
      sparse: true,
    },
    licenseExpiry: {
      type: Date,
    },
    // Customer specific fields
    address: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
userSchema.methods.matchPassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model("User", userSchema);

// Sample data to insert
const sampleUsers = [
  {
    name: "Fleet Admin",
    email: "admin@fleet.com",
    password: "admin123",
    role: "admin",
    phone: "1234567890",
  },
  {
    name: "John Driver",
    email: "driver@fleet.com",
    password: "driver123",
    role: "driver",
    phone: "1234567891",
    licenseNumber: "DL123456789",
    licenseExpiry: new Date("2026-12-31"),
  },
  {
    name: "Jane Customer",
    email: "customer@fleet.com",
    password: "customer123",
    role: "customer",
    phone: "1234567892",
    address: "123 Main Street, City, State 12345",
  },
  {
    name: "Bob Owner",
    email: "owner@fleet.com",
    password: "owner123",
    role: "vehicle_owner",
    phone: "1234567893",
  },
];

async function setupMongoDB() {
  try {
    console.log("🔄 Connecting to MongoDB Atlas...");

    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("✅ Connected to MongoDB Atlas");

    // Clear existing users
    console.log("🧹 Clearing existing users...");
    await User.deleteMany({});

    // Insert sample users
    console.log("👥 Creating sample users...");

    for (const userData of sampleUsers) {
      const user = new User(userData);
      await user.save();
      console.log(`✅ Created user: ${user.email} (${user.role})`);
    }

    console.log("🎉 MongoDB setup completed successfully!");
    console.log("");
    console.log("📋 Sample Login Credentials:");
    console.log("   Admin: admin@fleet.com / admin123");
    console.log("   Driver: driver@fleet.com / driver123");
    console.log("   Customer: customer@fleet.com / customer123");
    console.log("   Owner: owner@fleet.com / owner123");
  } catch (error) {
    console.error("❌ MongoDB setup error:", error.message);

    if (error.message.includes("ENOTFOUND")) {
      console.log("");
      console.log("💡 Common solutions:");
      console.log("   1. Check your internet connection");
      console.log("   2. Verify the MongoDB Atlas cluster URL");
      console.log("   3. Ensure network access is configured in Atlas");
      console.log(
        "   4. Check if the database user exists and has correct permissions"
      );
    }
  } finally {
    await mongoose.connection.close();
    console.log("🔌 Connection closed");
  }
}

// Run setup
setupMongoDB();
