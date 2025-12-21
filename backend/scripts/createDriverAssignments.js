const mongoose = require("mongoose");
require("dotenv").config();

// Connect to MongoDB
mongoose.connect(
  process.env.MONGODB_URI || "mongodb://localhost:27017/fleet_management",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

const DriverAssignment = require("../src/models/DriverAssignment");
const User = require("../src/models/User");
const Vehicle = require("../src/models/Vehicle");

async function createDriverAssignments() {
  try {
    console.log("🔄 Creating driver assignments...");

    // Clear existing assignments
    await DriverAssignment.deleteMany({});

    // Get drivers and vehicles
    const drivers = await User.find({ role: "driver" });
    const vehicles = await Vehicle.find({});

    if (drivers.length === 0 || vehicles.length === 0) {
      console.log("❌ No drivers or vehicles found");
      process.exit(1);
    }

    const assignments = [];

    // Assign first two vehicles to drivers with approved status
    for (let i = 0; i < Math.min(drivers.length, vehicles.length); i++) {
      assignments.push({
        driver: drivers[i]._id,
        vehicle: vehicles[i]._id,
        status: "approved",
        approvedBy: await User.findOne({ email: "owner@fleet.com" }).select(
          "_id"
        ),
        assignedDate: new Date(),
        notes: `Vehicle assigned to ${drivers[i].name}`,
      });
    }

    // Create a few pending assignments
    if (drivers.length > 0 && vehicles.length > 2) {
      assignments.push({
        driver: drivers[0]._id,
        vehicle: vehicles[2]._id,
        status: "pending",
        notes: "Request for additional vehicle",
      });
    }

    const createdAssignments = await DriverAssignment.insertMany(assignments);

    console.log(`✅ Created ${createdAssignments.length} driver assignments`);
    console.log("✅ Driver assignments created successfully!");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error creating driver assignments:", error);
    process.exit(1);
  }
}

// Run the script
createDriverAssignments();
