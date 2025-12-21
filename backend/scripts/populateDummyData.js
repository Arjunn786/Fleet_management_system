// Populate dummy data for testing UI
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

// Define schemas
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

const vehicleSchema = new mongoose.Schema(
  {
    owner: mongoose.Schema.Types.ObjectId,
    make: String,
    model: String,
    year: Number,
    registrationNumber: String,
    vehicleType: String,
    capacity: Object,
    features: [String],
    fuelType: String,
    mileage: Number,
    pricePerDay: Number,
    pricePerHour: Number,
    location: String,
    availability: String,
    status: String,
    isDeleted: Boolean,
  },
  { timestamps: true }
);

const bookingSchema = new mongoose.Schema(
  {
    customer: mongoose.Schema.Types.ObjectId,
    vehicle: mongoose.Schema.Types.ObjectId,
    startDate: Date,
    endDate: Date,
    totalDays: Number,
    totalAmount: Number,
    pickupLocation: String,
    dropoffLocation: String,
    status: String,
    isDeleted: Boolean,
  },
  { timestamps: true }
);

const tripSchema = new mongoose.Schema(
  {
    booking: mongoose.Schema.Types.ObjectId,
    customer: mongoose.Schema.Types.ObjectId,
    driver: mongoose.Schema.Types.ObjectId,
    vehicle: mongoose.Schema.Types.ObjectId,
    destination: String,
    startTime: Date,
    endTime: Date,
    distance: Number,
    duration: Number,
    revenue: Number,
    status: String,
    rating: Number,
    comment: String,
    completedAt: Date,
    isDeleted: Boolean,
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
const Vehicle = mongoose.model("Vehicle", vehicleSchema);
const Booking = mongoose.model("Booking", bookingSchema);
const Trip = mongoose.model("Trip", tripSchema);

async function populateDummyData() {
  try {
    console.log("🔄 Populating dummy data...\n");

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("password123", salt);

    // Clear existing data (but keep the test users from createTestUsers.js)
    await Vehicle.deleteMany({});
    await Booking.deleteMany({});
    await Trip.deleteMany({});
    console.log("✅ Existing data cleared");

    // Create additional users if they don't exist
    const additionalUsers = [
      {
        name: "Alice Johnson",
        email: "alice@example.com",
        password: hashedPassword,
        role: "customer",
        phone: "5551234567",
        address: {
          street: "123 Oak St",
          city: "Boston",
          state: "MA",
          zipCode: "02101",
        },
        isActive: true,
        isDeleted: false,
      },
      {
        name: "Bob Smith",
        email: "bob@example.com",
        password: hashedPassword,
        role: "customer",
        phone: "5552345678",
        address: {
          street: "456 Pine Ave",
          city: "Seattle",
          state: "WA",
          zipCode: "98101",
        },
        isActive: true,
        isDeleted: false,
      },
      {
        name: "Carol White",
        email: "carol@example.com",
        password: hashedPassword,
        role: "customer",
        phone: "5553456789",
        address: {
          street: "789 Maple Dr",
          city: "Austin",
          state: "TX",
          zipCode: "73301",
        },
        isActive: true,
        isDeleted: false,
      },
      {
        name: "David Driver",
        email: "david@example.com",
        password: hashedPassword,
        role: "driver",
        phone: "5554567890",
        address: {
          street: "321 Elm St",
          city: "Miami",
          state: "FL",
          zipCode: "33101",
        },
        licenseNumber: "DL987654321",
        licenseExpiry: new Date("2027-12-31"),
        isActive: true,
        isDeleted: false,
      },
      {
        name: "Emma Brown",
        email: "emma@example.com",
        password: hashedPassword,
        role: "driver",
        phone: "5555678901",
        address: {
          street: "654 Birch Ln",
          city: "Denver",
          state: "CO",
          zipCode: "80201",
        },
        licenseNumber: "DL456789123",
        licenseExpiry: new Date("2028-06-30"),
        isActive: true,
        isDeleted: false,
      },
    ];

    // Insert only users that don't exist
    for (const userData of additionalUsers) {
      const existingUser = await User.findOne({ email: userData.email });
      if (!existingUser) {
        await User.create(userData);
        console.log(`✅ Created user: ${userData.email}`);
      } else {
        console.log(`ℹ️  User already exists: ${userData.email}`);
      }
    }

    // Get users from database
    const owner = await User.findOne({ email: "owner@fleet.com" });
    const customers = await User.find({ role: "customer" });
    const drivers = await User.find({ role: "driver" });

    if (!owner) {
      console.log(
        "⚠️  Owner user not found. Please run createTestUsers.js first."
      );
      process.exit(1);
    }

    // Create vehicles
    const vehicles = await Vehicle.insertMany([
      {
        owner: owner._id,
        make: "Toyota",
        model: "Camry",
        year: 2023,
        registrationNumber: "ABC1234",
        vehicleType: "sedan",
        capacity: { passengers: 5, luggage: 3 },
        features: ["ac", "gps", "bluetooth", "cruise_control"],
        fuelType: "petrol",
        mileage: 15000,
        pricePerDay: 50,
        pricePerHour: 8,
        location: "New York, NY",
        availability: "available",
        status: "active",
        isDeleted: false,
      },
      {
        owner: owner._id,
        make: "Honda",
        model: "CR-V",
        year: 2024,
        registrationNumber: "XYZ5678",
        vehicleType: "suv",
        capacity: { passengers: 7, luggage: 5 },
        features: ["ac", "gps", "bluetooth", "sunroof", "parking_camera"],
        fuelType: "hybrid",
        mileage: 8000,
        pricePerDay: 75,
        pricePerHour: 12,
        location: "Los Angeles, CA",
        availability: "available",
        status: "active",
        isDeleted: false,
      },
      {
        owner: owner._id,
        make: "Ford",
        model: "Transit",
        year: 2022,
        registrationNumber: "VAN9012",
        vehicleType: "van",
        capacity: { passengers: 12, luggage: 8 },
        features: ["ac", "gps", "bluetooth"],
        fuelType: "diesel",
        mileage: 45000,
        pricePerDay: 100,
        pricePerHour: 15,
        location: "Chicago, IL",
        availability: "available",
        status: "active",
        isDeleted: false,
      },
      {
        owner: owner._id,
        make: "Tesla",
        model: "Model 3",
        year: 2024,
        registrationNumber: "EV3456",
        vehicleType: "electric",
        capacity: { passengers: 5, luggage: 2 },
        features: [
          "ac",
          "gps",
          "bluetooth",
          "sunroof",
          "parking_camera",
          "wifi",
        ],
        fuelType: "electric",
        mileage: 5000,
        pricePerDay: 120,
        pricePerHour: 18,
        location: "San Francisco, CA",
        availability: "available",
        status: "active",
        isDeleted: false,
      },
      {
        owner: owner._id,
        make: "BMW",
        model: "7 Series",
        year: 2023,
        registrationNumber: "LUX7890",
        vehicleType: "luxury",
        capacity: { passengers: 5, luggage: 3 },
        features: [
          "ac",
          "gps",
          "bluetooth",
          "sunroof",
          "leather_seats",
          "parking_camera",
          "cruise_control",
          "wifi",
        ],
        fuelType: "petrol",
        mileage: 12000,
        pricePerDay: 200,
        pricePerHour: 30,
        location: "Miami, FL",
        availability: "unavailable",
        status: "maintenance",
        isDeleted: false,
      },
      {
        owner: owner._id,
        make: "Chevrolet",
        model: "Silverado",
        year: 2023,
        registrationNumber: "TRK4567",
        vehicleType: "truck",
        capacity: { passengers: 5, luggage: 10 },
        features: ["ac", "gps", "bluetooth", "parking_camera"],
        fuelType: "diesel",
        mileage: 25000,
        pricePerDay: 90,
        pricePerHour: 14,
        location: "Houston, TX",
        availability: "available",
        status: "active",
        isDeleted: false,
      },
    ]);

    console.log(`✅ Created ${vehicles.length} vehicles`);

    // Create bookings
    const now = new Date();
    const bookings = [];

    // Pending booking
    bookings.push({
      customer: customers[0]._id,
      vehicle: vehicles[0]._id,
      startDate: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
      endDate: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
      totalDays: 3,
      totalAmount: 150,
      pickupLocation: "JFK Airport",
      dropoffLocation: "Manhattan Hotel",
      status: "pending",
      isDeleted: false,
    });

    // Confirmed booking
    bookings.push({
      customer: customers[1]._id,
      vehicle: vehicles[1]._id,
      startDate: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000), // 1 day from now
      endDate: new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000), // 4 days from now
      totalDays: 3,
      totalAmount: 225,
      pickupLocation: "LAX Airport",
      dropoffLocation: "Santa Monica Beach",
      status: "confirmed",
      isDeleted: false,
    });

    // In progress booking
    bookings.push({
      customer: customers[2]._id,
      vehicle: vehicles[2]._id,
      startDate: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      endDate: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
      totalDays: 3,
      totalAmount: 300,
      pickupLocation: "O'Hare Airport",
      dropoffLocation: "Downtown Chicago",
      status: "in_progress",
      isDeleted: false,
    });

    // Completed bookings
    for (let i = 0; i < 5; i++) {
      bookings.push({
        customer: customers[i % 3]._id,
        vehicle: vehicles[i % 6]._id,
        startDate: new Date(now.getTime() - (10 + i * 2) * 24 * 60 * 60 * 1000),
        endDate: new Date(now.getTime() - (7 + i * 2) * 24 * 60 * 60 * 1000),
        totalDays: 3,
        totalAmount: 50 * (i + 2),
        pickupLocation: "City Center",
        dropoffLocation: "Airport",
        status: "completed",
        isDeleted: false,
      });
    }

    // Cancelled booking
    bookings.push({
      customer: customers[0]._id,
      vehicle: vehicles[3]._id,
      startDate: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
      endDate: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
      totalDays: 3,
      totalAmount: 360,
      pickupLocation: "SFO Airport",
      dropoffLocation: "Silicon Valley",
      status: "cancelled",
      isDeleted: false,
    });

    const createdBookings = await Booking.insertMany(bookings);
    console.log(`✅ Created ${createdBookings.length} bookings`);

    // Create trips for completed bookings
    const completedBookings = createdBookings.filter(
      (b) => b.status === "completed"
    );
    const trips = [];

    for (let i = 0; i < completedBookings.length; i++) {
      const booking = completedBookings[i];
      const driver = drivers[i % 2];

      trips.push({
        booking: booking._id,
        customer: booking.customer,
        driver: driver._id,
        vehicle: booking.vehicle,
        destination: booking.dropoffLocation,
        startTime: booking.startDate,
        endTime: booking.endDate,
        distance: 50 + i * 20,
        duration: 2 + i * 0.5,
        revenue: booking.totalAmount * 0.8, // 80% of booking amount
        status: "completed",
        rating: 4 + Math.random(),
        comment: [
          "Great service!",
          "Very professional driver",
          "Smooth ride",
          "Excellent experience",
          "Would book again",
        ][i % 5],
        completedAt: booking.endDate,
        isDeleted: false,
      });
    }

    // Add an in-progress trip
    const inProgressBooking = createdBookings.find(
      (b) => b.status === "in_progress"
    );
    if (inProgressBooking) {
      trips.push({
        booking: inProgressBooking._id,
        customer: inProgressBooking.customer,
        driver: drivers[0]._id,
        vehicle: inProgressBooking.vehicle,
        destination: inProgressBooking.dropoffLocation,
        startTime: inProgressBooking.startDate,
        endTime: null,
        distance: 75,
        duration: 3.5,
        revenue: inProgressBooking.totalAmount * 0.8,
        status: "in_progress",
        isDeleted: false,
      });
    }

    // Add scheduled trips
    const confirmedBooking = createdBookings.find(
      (b) => b.status === "confirmed"
    );
    if (confirmedBooking) {
      trips.push({
        booking: confirmedBooking._id,
        customer: confirmedBooking.customer,
        driver: drivers[1]._id,
        vehicle: confirmedBooking.vehicle,
        destination: confirmedBooking.dropoffLocation,
        startTime: confirmedBooking.startDate,
        endTime: null,
        distance: 0,
        duration: 0,
        revenue: 0,
        status: "scheduled",
        isDeleted: false,
      });
    }

    const createdTrips = await Trip.insertMany(trips);
    console.log(`✅ Created ${createdTrips.length} trips`);

    console.log("\n✅ Dummy data populated successfully!\n");
    console.log("📊 Summary:");
    console.log(`   - ${customers.length} additional customers`);
    console.log(`   - ${drivers.length} additional drivers`);
    console.log(`   - ${vehicles.length} vehicles`);
    console.log(`   - ${createdBookings.length} bookings`);
    console.log(`   - ${createdTrips.length} trips\n`);

    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error populating dummy data:", error);
    process.exit(1);
  }
}

populateDummyData();
