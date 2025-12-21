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

const Trip = require("../src/models/Trip");
const Booking = require("../src/models/Booking");
const User = require("../src/models/User");
const Vehicle = require("../src/models/Vehicle");

async function createDriverTrips() {
  try {
    console.log("🔄 Creating driver trips...");

    // Get Mike driver and other users
    const mikeDriver = await User.findOne({ email: "driver@fleet.com" });
    const customers = await User.find({ role: "customer" });
    const vehicles = await Vehicle.find({});
    const bookings = await Booking.find({});

    if (
      !mikeDriver ||
      customers.length === 0 ||
      vehicles.length === 0 ||
      bookings.length === 0
    ) {
      console.log(
        "❌ Missing required data (driver, customers, vehicles, or bookings)"
      );
      process.exit(1);
    }

    // Clear existing trips for the driver
    await Trip.deleteMany({ driver: mikeDriver._id });

    const trips = [];
    const now = new Date();

    // Create some completed trips
    for (let i = 0; i < 3; i++) {
      const startDate = new Date(
        now.getTime() - (i + 1) * 7 * 24 * 60 * 60 * 1000
      ); // weeks ago
      const endDate = new Date(startDate.getTime() + 3 * 24 * 60 * 60 * 1000); // 3 days later

      trips.push({
        booking: bookings[i % bookings.length]._id,
        customer: customers[i % customers.length]._id,
        driver: mikeDriver._id,
        vehicle: vehicles[i % vehicles.length]._id,
        startTime: startDate,
        endTime: endDate,
        status: "completed",
        startLocation: `Pickup Location ${i + 1}`,
        endLocation: `Drop-off Location ${i + 1}`,
        distance: 50 + i * 20,
        revenue: 150 + i * 50,
        fuelUsed: 5 + i,
        notes: `Completed trip ${i + 1} - Customer satisfied`,
        rating: {
          customerRating: 4.5 + i * 0.1,
          customerReview: `Great service! Trip ${i + 1}`,
        },
        createdAt: startDate,
        updatedAt: endDate,
      });
    }

    // Create some in-progress trips
    for (let i = 0; i < 2; i++) {
      const startDate = new Date(now.getTime() - i * 2 * 60 * 60 * 1000); // hours ago

      trips.push({
        booking: bookings[(i + 3) % bookings.length]._id,
        customer: customers[(i + 1) % customers.length]._id,
        driver: mikeDriver._id,
        vehicle: vehicles[(i + 2) % vehicles.length]._id,
        startTime: startDate,
        status: "in_progress",
        startLocation: `Current Pickup ${i + 1}`,
        endLocation: `Destination ${i + 1}`,
        distance: 30 + i * 15,
        notes: `Trip ${i + 1} currently in progress`,
        createdAt: startDate,
        updatedAt: now,
      });
    }

    // Create some scheduled trips
    for (let i = 0; i < 2; i++) {
      const startDate = new Date(now.getTime() + (i + 1) * 24 * 60 * 60 * 1000); // days from now
      const endDate = new Date(startDate.getTime() + 2 * 24 * 60 * 60 * 1000); // 2 days later

      trips.push({
        booking: bookings[(i + 5) % bookings.length]._id,
        customer: customers[(i + 2) % customers.length]._id,
        driver: mikeDriver._id,
        vehicle: vehicles[(i + 1) % vehicles.length]._id,
        startTime: startDate,
        endTime: endDate,
        status: "scheduled",
        startLocation: `Future Pickup ${i + 1}`,
        endLocation: `Future Destination ${i + 1}`,
        distance: 40 + i * 10,
        notes: `Upcoming trip ${i + 1} - scheduled`,
        createdAt: now,
        updatedAt: now,
      });
    }

    const createdTrips = await Trip.insertMany(trips);

    console.log(
      `✅ Created ${createdTrips.length} trips for driver ${mikeDriver.name}`
    );
    console.log("✅ Driver trips created successfully!");

    // Also create some trip data for other drivers
    const otherDrivers = await User.find({
      role: "driver",
      _id: { $ne: mikeDriver._id },
    });

    for (const driver of otherDrivers.slice(0, 2)) {
      const driverTrips = [];

      for (let i = 0; i < 2; i++) {
        const startDate = new Date(
          now.getTime() - (i + 1) * 5 * 24 * 60 * 60 * 1000
        );
        const endDate = new Date(startDate.getTime() + 1 * 24 * 60 * 60 * 1000);

        driverTrips.push({
          booking: bookings[(i + 2) % bookings.length]._id,
          customer: customers[i % customers.length]._id,
          driver: driver._id,
          vehicle: vehicles[(i + 3) % vehicles.length]._id,
          startTime: startDate,
          endTime: endDate,
          status: "completed",
          startLocation: `${driver.name} Pickup ${i + 1}`,
          endLocation: `${driver.name} Drop-off ${i + 1}`,
          distance: 25 + i * 10,
          revenue: 100 + i * 25,
          createdAt: startDate,
          updatedAt: endDate,
        });
      }

      await Trip.insertMany(driverTrips);
      console.log(
        `✅ Created ${driverTrips.length} trips for driver ${driver.name}`
      );
    }

    process.exit(0);
  } catch (error) {
    console.error("❌ Error creating driver trips:", error);
    process.exit(1);
  }
}

// Run the script
createDriverTrips();
