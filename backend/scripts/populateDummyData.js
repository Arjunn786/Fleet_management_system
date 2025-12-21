// Populate dummy data for testing UI with Indian names and locations
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

// Import actual models
const User = require("../src/models/User");
const Vehicle = require("../src/models/Vehicle");
const Booking = require("../src/models/Booking");
const Trip = require("../src/models/Trip");
const DriverAssignment = require("../src/models/DriverAssignment");

// Connect to MongoDB
mongoose.connect(
  process.env.MONGODB_URI || "mongodb://localhost:27017/fleetdb",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

async function populateDummyData() {
  try {
    console.log(
      "🔄 Populating dummy data with Indian names and locations...\n"
    );

    // NOTE: Don't hash password here - the User model's pre-save hook will hash it
    // But for insertMany, we need to hash it ourselves since it bypasses middleware
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("password123", salt);

    // Clear existing data
    await User.deleteMany({});
    await Vehicle.deleteMany({});
    await Booking.deleteMany({});
    await Trip.deleteMany({});
    await DriverAssignment.deleteMany({});
    console.log("✅ Existing data cleared");

    // Create Admin using create() - it will hash the plain password via pre-save hook
    const admin = await User.create({
      name: "Rajesh Kumar",
      email: "admin@fleet.com",
      password: "password123", // Plain text - will be hashed by pre-save hook
      role: "admin",
      phone: "9876543210",
      address: {
        street: "MG Road",
        city: "Mumbai",
        state: "Maharashtra",
        zipCode: "400001",
        country: "India",
      },
      isActive: true,
    });
    console.log("✅ Created admin user");

    // Create Owners
    const owners = await User.insertMany([
      {
        name: "Priya Sharma",
        email: "owner1@fleet.com",
        password: hashedPassword,
        role: "owner",
        phone: "9876543211",
        address: {
          street: "Koramangala",
          city: "Bangalore",
          state: "Karnataka",
          zipCode: "560034",
          country: "India",
        },
        isActive: true,
      },
      {
        name: "Amit Patel",
        email: "owner2@fleet.com",
        password: hashedPassword,
        role: "owner",
        phone: "9876543212",
        address: {
          street: "Satellite Road",
          city: "Ahmedabad",
          state: "Gujarat",
          zipCode: "380015",
          country: "India",
        },
        isActive: true,
      },
    ]);
    console.log(`✅ Created ${owners.length} owner users`);

    // Create Drivers
    const drivers = await User.insertMany([
      {
        name: "Ramesh Singh",
        email: "driver1@fleet.com",
        password: hashedPassword,
        role: "driver",
        phone: "9876543213",
        address: {
          street: "Andheri West",
          city: "Mumbai",
          state: "Maharashtra",
          zipCode: "400053",
          country: "India",
        },
        licenseNumber: "MH0120230001",
        licenseExpiry: new Date("2027-12-31"),
        isActive: true,
      },
      {
        name: "Suresh Reddy",
        email: "driver2@fleet.com",
        password: hashedPassword,
        role: "driver",
        phone: "9876543214",
        address: {
          street: "Banjara Hills",
          city: "Hyderabad",
          state: "Telangana",
          zipCode: "500034",
          country: "India",
        },
        licenseNumber: "TS0920230002",
        licenseExpiry: new Date("2028-06-30"),
        isActive: true,
      },
      {
        name: "Vijay Kumar",
        email: "driver3@fleet.com",
        password: hashedPassword,
        role: "driver",
        phone: "9876543215",
        address: {
          street: "Indiranagar",
          city: "Bangalore",
          state: "Karnataka",
          zipCode: "560038",
          country: "India",
        },
        licenseNumber: "KA0520230003",
        licenseExpiry: new Date("2029-03-15"),
        isActive: true,
      },
      {
        name: "Mahesh Joshi",
        email: "driver4@fleet.com",
        password: hashedPassword,
        role: "driver",
        phone: "9876543216",
        address: {
          street: "Vaishali Nagar",
          city: "Jaipur",
          state: "Rajasthan",
          zipCode: "302021",
          country: "India",
        },
        licenseNumber: "RJ1420230004",
        licenseExpiry: new Date("2027-09-20"),
        isActive: true,
      },
    ]);
    console.log(`✅ Created ${drivers.length} driver users`);

    // Create Customers
    const customers = await User.insertMany([
      {
        name: "Aditya Verma",
        email: "customer1@fleet.com",
        password: hashedPassword,
        role: "customer",
        phone: "9876543217",
        address: {
          street: "Connaught Place",
          city: "New Delhi",
          state: "Delhi",
          zipCode: "110001",
          country: "India",
        },
        isActive: true,
      },
      {
        name: "Sneha Desai",
        email: "customer2@fleet.com",
        password: hashedPassword,
        role: "customer",
        phone: "9876543218",
        address: {
          street: "Nariman Point",
          city: "Mumbai",
          state: "Maharashtra",
          zipCode: "400021",
          country: "India",
        },
        isActive: true,
      },
      {
        name: "Rohan Mehta",
        email: "customer3@fleet.com",
        password: hashedPassword,
        role: "customer",
        phone: "9876543219",
        address: {
          street: "Salt Lake",
          city: "Kolkata",
          state: "West Bengal",
          zipCode: "700064",
          country: "India",
        },
        isActive: true,
      },
      {
        name: "Anjali Iyer",
        email: "customer4@fleet.com",
        password: hashedPassword,
        role: "customer",
        phone: "9876543220",
        address: {
          street: "T Nagar",
          city: "Chennai",
          state: "Tamil Nadu",
          zipCode: "600017",
          country: "India",
        },
        isActive: true,
      },
      {
        name: "Karthik Krishnan",
        email: "customer5@fleet.com",
        password: hashedPassword,
        role: "customer",
        phone: "9876543221",
        address: {
          street: "Whitefield",
          city: "Bangalore",
          state: "Karnataka",
          zipCode: "560066",
          country: "India",
        },
        isActive: true,
      },
      {
        name: "Neha Gupta",
        email: "customer6@fleet.com",
        password: hashedPassword,
        role: "customer",
        phone: "9876543222",
        address: {
          street: "Sector 18",
          city: "Noida",
          state: "Uttar Pradesh",
          zipCode: "201301",
          country: "India",
        },
        isActive: true,
      },
    ]);
    console.log(`✅ Created ${customers.length} customer users`);

    // Create vehicles with Indian registration numbers
    const vehicles = await Vehicle.insertMany([
      {
        owner: owners[0]._id,
        make: "Maruti Suzuki",
        model: "Swift Dzire",
        year: 2023,
        registrationNumber: "MH02AB1234",
        vehicleType: "sedan",
        capacity: { passengers: 5, luggage: 2 },
        features: ["ac", "gps", "bluetooth", "audio"],
        fuelType: "petrol",
        mileage: 12000,
        pricePerDay: 2500,
        pricePerHour: 200,
        images: [],
        location: {
          address: "Mumbai, Maharashtra",
          city: "Mumbai",
          state: "Maharashtra",
        },
        availability: "available",
        status: "active",
      },
      {
        owner: owners[0]._id,
        make: "Hyundai",
        model: "Creta",
        year: 2024,
        registrationNumber: "KA05CD5678",
        vehicleType: "suv",
        capacity: { passengers: 7, luggage: 4 },
        features: ["ac", "gps", "bluetooth", "sunroof", "parking_camera"],
        fuelType: "diesel",
        mileage: 8000,
        pricePerDay: 4500,
        pricePerHour: 350,
        images: [],
        location: {
          address: "Bangalore, Karnataka",
          city: "Bangalore",
          state: "Karnataka",
        },
        availability: "available",
        status: "active",
      },
      {
        owner: owners[1]._id,
        make: "Toyota",
        model: "Innova Crysta",
        year: 2023,
        registrationNumber: "DL03EF9012",
        vehicleType: "suv",
        capacity: { passengers: 7, luggage: 5 },
        features: ["ac", "gps", "bluetooth", "cruise_control"],
        fuelType: "diesel",
        mileage: 25000,
        pricePerDay: 5000,
        pricePerHour: 400,
        images: [],
        location: {
          address: "New Delhi, Delhi",
          city: "New Delhi",
          state: "Delhi",
        },
        availability: "available",
        status: "active",
      },
      {
        owner: owners[1]._id,
        make: "Mahindra",
        model: "Scorpio N",
        year: 2024,
        registrationNumber: "GJ01GH3456",
        vehicleType: "suv",
        capacity: { passengers: 7, luggage: 4 },
        features: ["ac", "gps", "bluetooth", "sunroof", "leather_seats"],
        fuelType: "diesel",
        mileage: 5000,
        pricePerDay: 4000,
        pricePerHour: 320,
        images: [],
        location: {
          address: "Ahmedabad, Gujarat",
          city: "Ahmedabad",
          state: "Gujarat",
        },
        availability: "available",
        status: "active",
      },
      {
        owner: owners[0]._id,
        make: "Honda",
        model: "City",
        year: 2023,
        registrationNumber: "TN09IJ7890",
        vehicleType: "sedan",
        capacity: { passengers: 5, luggage: 2 },
        features: ["ac", "gps", "bluetooth", "sunroof"],
        fuelType: "petrol",
        mileage: 15000,
        pricePerDay: 3000,
        pricePerHour: 250,
        images: [],
        location: {
          address: "Chennai, Tamil Nadu",
          city: "Chennai",
          state: "Tamil Nadu",
        },
        availability: "available",
        status: "active",
      },
      {
        owner: owners[1]._id,
        make: "Tata",
        model: "Nexon EV",
        year: 2024,
        registrationNumber: "KA03KL4567",
        vehicleType: "electric",
        capacity: { passengers: 5, luggage: 2 },
        features: ["ac", "gps", "bluetooth", "sunroof", "parking_camera"],
        fuelType: "electric",
        mileage: 3000,
        pricePerDay: 3500,
        pricePerHour: 280,
        images: [],
        location: {
          address: "Bangalore, Karnataka",
          city: "Bangalore",
          state: "Karnataka",
        },
        availability: "available",
        status: "active",
      },
      {
        owner: owners[0]._id,
        make: "Mercedes-Benz",
        model: "E-Class",
        year: 2023,
        registrationNumber: "MH01MN2345",
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
        mileage: 10000,
        pricePerDay: 12000,
        pricePerHour: 1000,
        images: [],
        location: {
          address: "Mumbai, Maharashtra",
          city: "Mumbai",
          state: "Maharashtra",
        },
        availability: "available",
        status: "active",
      },
      {
        owner: owners[1]._id,
        make: "Force",
        model: "Traveller",
        year: 2022,
        registrationNumber: "RJ14OP6789",
        vehicleType: "van",
        capacity: { passengers: 12, luggage: 8 },
        features: ["ac", "gps", "audio"],
        fuelType: "diesel",
        mileage: 45000,
        pricePerDay: 6000,
        pricePerHour: 500,
        images: [],
        location: {
          address: "Jaipur, Rajasthan",
          city: "Jaipur",
          state: "Rajasthan",
        },
        availability: "unavailable",
        status: "maintenance",
      },
    ]);

    console.log(`✅ Created ${vehicles.length} vehicles`);

    // Create driver assignments
    const driverAssignments = await DriverAssignment.insertMany([
      {
        driver: drivers[0]._id,
        vehicle: vehicles[0]._id,
        status: "active",
        assignedDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        approvedBy: owners[0]._id,
        approvedDate: new Date(Date.now() - 29 * 24 * 60 * 60 * 1000),
        notes: "Experienced driver for sedan vehicles",
      },
      {
        driver: drivers[1]._id,
        vehicle: vehicles[1]._id,
        status: "active",
        assignedDate: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
        approvedBy: owners[0]._id,
        approvedDate: new Date(Date.now() - 24 * 24 * 60 * 60 * 1000),
        notes: "Reliable driver for SUV trips",
      },
      {
        driver: drivers[2]._id,
        vehicle: vehicles[2]._id,
        status: "active",
        assignedDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
        approvedBy: owners[1]._id,
        approvedDate: new Date(Date.now() - 19 * 24 * 60 * 60 * 1000),
        notes: "Experienced with Innova vehicles",
      },
      {
        driver: drivers[3]._id,
        vehicle: vehicles[7]._id,
        status: "pending",
        assignedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        notes: "New assignment pending approval",
      },
    ]);

    console.log(`✅ Created ${driverAssignments.length} driver assignments`);

    // Create bookings with Indian locations
    const now = new Date();
    const bookings = [];

    // Pending bookings
    bookings.push({
      customer: customers[0]._id,
      vehicle: vehicles[0]._id,
      bookingType: "daily",
      startDate: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
      endDate: new Date(now.getTime() + 6 * 24 * 60 * 60 * 1000),
      pickupLocation: {
        address: "Chhatrapati Shivaji International Airport, Mumbai",
        city: "Mumbai",
        state: "Maharashtra",
        zipCode: "400099",
      },
      dropoffLocation: {
        address: "Gateway of India, Mumbai",
        city: "Mumbai",
        state: "Maharashtra",
        zipCode: "400001",
      },
      pricing: {
        basePrice: 7000,
        taxes: 500,
        discount: 0,
        totalPrice: 7500,
      },
      paymentStatus: "pending",
      status: "pending",
    });

    bookings.push({
      customer: customers[1]._id,
      vehicle: vehicles[4]._id,
      bookingType: "daily",
      startDate: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
      endDate: new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000),
      pickupLocation: {
        address: "Chennai International Airport",
        city: "Chennai",
        state: "Tamil Nadu",
        zipCode: "600027",
      },
      dropoffLocation: {
        address: "Marina Beach, Chennai",
        city: "Chennai",
        state: "Tamil Nadu",
        zipCode: "600004",
      },
      pricing: {
        basePrice: 5600,
        taxes: 400,
        discount: 0,
        totalPrice: 6000,
      },
      paymentStatus: "pending",
      status: "pending",
    });

    // Confirmed bookings
    bookings.push({
      customer: customers[2]._id,
      vehicle: vehicles[1]._id,
      bookingType: "daily",
      startDate: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000),
      endDate: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
      pickupLocation: {
        address: "Kempegowda International Airport, Bangalore",
        city: "Bangalore",
        state: "Karnataka",
        zipCode: "560300",
      },
      dropoffLocation: {
        address: "Mysore Palace, Mysore",
        city: "Mysore",
        state: "Karnataka",
        zipCode: "570001",
      },
      pricing: {
        basePrice: 16500,
        taxes: 1500,
        discount: 0,
        totalPrice: 18000,
      },
      paymentStatus: "paid",
      status: "confirmed",
    });

    bookings.push({
      customer: customers[3]._id,
      vehicle: vehicles[2]._id,
      bookingType: "daily",
      startDate: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
      endDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
      pickupLocation: {
        address: "Indira Gandhi International Airport, Delhi",
        city: "New Delhi",
        state: "Delhi",
        zipCode: "110037",
      },
      dropoffLocation: {
        address: "Taj Mahal, Agra",
        city: "Agra",
        state: "Uttar Pradesh",
        zipCode: "282001",
      },
      pricing: {
        basePrice: 23000,
        taxes: 2000,
        discount: 0,
        totalPrice: 25000,
      },
      paymentStatus: "paid",
      status: "confirmed",
    });

    // In progress bookings
    bookings.push({
      customer: customers[4]._id,
      vehicle: vehicles[3]._id,
      bookingType: "daily",
      startDate: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
      endDate: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
      pickupLocation: {
        address: "Ahmedabad Railway Station",
        city: "Ahmedabad",
        state: "Gujarat",
        zipCode: "380002",
      },
      dropoffLocation: {
        address: "Sabarmati Ashram, Ahmedabad",
        city: "Ahmedabad",
        state: "Gujarat",
        zipCode: "380027",
      },
      pricing: {
        basePrice: 11000,
        taxes: 1000,
        discount: 0,
        totalPrice: 12000,
      },
      paymentStatus: "paid",
      status: "in_progress",
    });

    // Completed bookings
    const completedBookingsData = [
      {
        customer: customers[0]._id,
        vehicle: vehicles[0]._id,
        daysAgo: 10,
        duration: 3,
        pickup: "Mumbai Domestic Airport",
        dropoff: "Lonavala, Maharashtra",
        amount: 7500,
        rating: 5,
      },
      {
        customer: customers[1]._id,
        vehicle: vehicles[1]._id,
        daysAgo: 15,
        duration: 4,
        pickup: "Electronic City, Bangalore",
        dropoff: "Coorg, Karnataka",
        amount: 18000,
        rating: 4,
      },
      {
        customer: customers[2]._id,
        vehicle: vehicles[2]._id,
        daysAgo: 20,
        duration: 5,
        pickup: "Connaught Place, Delhi",
        dropoff: "Jaipur, Rajasthan",
        amount: 25000,
        rating: 5,
      },
      {
        customer: customers[3]._id,
        vehicle: vehicles[4]._id,
        daysAgo: 25,
        duration: 2,
        pickup: "T Nagar, Chennai",
        dropoff: "Mahabalipuram, Tamil Nadu",
        amount: 6000,
        rating: 4,
      },
      {
        customer: customers[4]._id,
        vehicle: vehicles[5]._id,
        daysAgo: 30,
        duration: 3,
        pickup: "Whitefield, Bangalore",
        dropoff: "Ooty, Tamil Nadu",
        amount: 10500,
        rating: 5,
      },
      {
        customer: customers[5]._id,
        vehicle: vehicles[6]._id,
        daysAgo: 35,
        duration: 1,
        pickup: "Bandra, Mumbai",
        dropoff: "Pune, Maharashtra",
        amount: 12000,
        rating: 5,
      },
      {
        customer: customers[0]._id,
        vehicle: vehicles[3]._id,
        daysAgo: 40,
        duration: 4,
        pickup: "Ahmedabad Airport",
        dropoff: "Udaipur, Rajasthan",
        amount: 16000,
        rating: 4,
      },
      {
        customer: customers[2]._id,
        vehicle: vehicles[1]._id,
        daysAgo: 45,
        duration: 2,
        pickup: "Salt Lake, Kolkata",
        dropoff: "Digha, West Bengal",
        amount: 9000,
        rating: 4,
      },
    ];

    for (const data of completedBookingsData) {
      bookings.push({
        customer: data.customer,
        vehicle: data.vehicle,
        bookingType: "daily",
        startDate: new Date(now.getTime() - data.daysAgo * 24 * 60 * 60 * 1000),
        endDate: new Date(
          now.getTime() - (data.daysAgo - data.duration) * 24 * 60 * 60 * 1000
        ),
        pickupLocation: {
          address: data.pickup,
          city: data.pickup.split(",")[0],
          state: "India",
        },
        dropoffLocation: {
          address: data.dropoff,
          city: data.dropoff.split(",")[0],
          state: "India",
        },
        pricing: {
          basePrice: Math.floor(data.amount * 0.92),
          taxes: Math.floor(data.amount * 0.08),
          discount: 0,
          totalPrice: data.amount,
        },
        paymentStatus: "paid",
        status: "completed",
      });
    }

    // Cancelled bookings
    bookings.push({
      customer: customers[1]._id,
      vehicle: vehicles[6]._id,
      bookingType: "daily",
      startDate: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
      endDate: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
      pickupLocation: {
        address: "Juhu Beach, Mumbai",
        city: "Mumbai",
        state: "Maharashtra",
        zipCode: "400049",
      },
      dropoffLocation: {
        address: "Lonavala, Maharashtra",
        city: "Lonavala",
        state: "Maharashtra",
        zipCode: "410401",
      },
      pricing: {
        basePrice: 33000,
        taxes: 3000,
        discount: 0,
        totalPrice: 36000,
      },
      paymentStatus: "refunded",
      status: "cancelled",
      cancellationReason: "Change in travel plans",
    });

    const createdBookings = await Booking.insertMany(bookings);
    console.log(`✅ Created ${createdBookings.length} bookings`);

    // Create trips for completed and in-progress bookings
    const trips = [];

    // Completed trips
    const completedBookings = createdBookings.filter(
      (b) => b.status === "completed"
    );

    const tripComments = [
      "Excellent service! Very professional driver.",
      "Smooth ride and comfortable journey.",
      "Driver was very helpful and courteous.",
      "Great experience, will book again!",
      "Vehicle was clean and well-maintained.",
      "Punctual pickup and safe driving.",
      "Very satisfied with the service.",
      "Comfortable trip with good music system.",
    ];

    for (let i = 0; i < completedBookings.length; i++) {
      const booking = completedBookings[i];
      const driver = drivers[i % drivers.length];
      const rating = completedBookingsData[i]?.rating || 4;

      trips.push({
        booking: booking._id,
        customer: booking.customer,
        driver: driver._id,
        vehicle: booking.vehicle,
        status: "completed",
        startedAt: booking.startDate,
        completedAt: booking.endDate,
        distance: {
          planned: 150 + i * 50,
          actual: 160 + i * 50,
        },
        odometerStart: 10000 + i * 1000,
        odometerEnd: 10160 + i * 1000 + i * 50,
        fuelLevel: {
          start: 100,
          end: 25 + ((i * 10) % 50),
        },
        revenue: booking.totalAmount * 0.85,
        expenses: {
          fuel: 500 + i * 200,
          tolls: 200 + i * 100,
          parking: 100,
          other: 0,
        },
        rating: {
          customer: rating,
          driver: rating === 5 ? 5 : 4,
        },
        feedback: {
          customer: tripComments[i % tripComments.length],
        },
      });
    }

    // In-progress trip
    const inProgressBooking = createdBookings.find(
      (b) => b.status === "in_progress"
    );
    if (inProgressBooking) {
      trips.push({
        booking: inProgressBooking._id,
        customer: inProgressBooking.customer,
        driver: drivers[0]._id,
        vehicle: inProgressBooking.vehicle,
        status: "in_progress",
        startedAt: inProgressBooking.startDate,
        distance: {
          planned: 180,
          actual: 95,
        },
        odometerStart: 25000,
        odometerEnd: 25095,
        fuelLevel: {
          start: 100,
          end: 65,
        },
        revenue: 0,
        expenses: {
          fuel: 0,
          tolls: 0,
          parking: 0,
          other: 0,
        },
      });
    }

    // Scheduled trips for confirmed bookings
    const confirmedBookings = createdBookings.filter(
      (b) => b.status === "confirmed"
    );
    for (let i = 0; i < confirmedBookings.length; i++) {
      const booking = confirmedBookings[i];
      const driver = drivers[(i + 1) % drivers.length];

      trips.push({
        booking: booking._id,
        customer: booking.customer,
        driver: driver._id,
        vehicle: booking.vehicle,
        status: "scheduled",
        distance: {
          planned: 200 + i * 50,
          actual: 0,
        },
        revenue: 0,
        expenses: {
          fuel: 0,
          tolls: 0,
          parking: 0,
          other: 0,
        },
      });
    }

    const createdTrips = await Trip.insertMany(trips);
    console.log(`✅ Created ${createdTrips.length} trips`);

    console.log("\n✅ Dummy data populated successfully with Indian names!\n");
    console.log("📊 Summary:");
    console.log(`   - 1 admin user`);
    console.log(`   - ${owners.length} vehicle owners`);
    console.log(`   - ${drivers.length} drivers`);
    console.log(`   - ${customers.length} customers`);
    console.log(`   - ${vehicles.length} vehicles`);
    console.log(`   - ${driverAssignments.length} driver assignments`);
    console.log(`   - ${createdBookings.length} bookings`);
    console.log(`   - ${createdTrips.length} trips\n`);
    console.log("🔐 Login credentials:");
    console.log("   Admin: admin@fleet.com / password123");
    console.log("   Owner: owner1@fleet.com / password123");
    console.log("   Driver: driver1@fleet.com / password123");
    console.log("   Customer: customer1@fleet.com / password123\n");

    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error populating dummy data:", error);
    console.error(error.stack);
    mongoose.connection.close();
    process.exit(1);
  }
}

populateDummyData();
