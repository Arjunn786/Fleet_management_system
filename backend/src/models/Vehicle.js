const mongoose = require("mongoose");

const vehicleSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Vehicle must have an owner"],
    },
    make: {
      type: String,
      required: [true, "Please provide vehicle make"],
      trim: true,
    },
    model: {
      type: String,
      required: [true, "Please provide vehicle model"],
      trim: true,
    },
    year: {
      type: Number,
      required: [true, "Please provide vehicle year"],
      min: [1900, "Year must be after 1900"],
      max: [new Date().getFullYear() + 1, "Year cannot be in the future"],
    },
    registrationNumber: {
      type: String,
      required: [true, "Please provide registration number"],
      unique: true,
      uppercase: true,
      trim: true,
    },
    vehicleType: {
      type: String,
      enum: ["sedan", "suv", "van", "truck", "luxury", "electric", "hybrid"],
      required: [true, "Please specify vehicle type"],
    },
    capacity: {
      passengers: {
        type: Number,
        required: [true, "Please specify passenger capacity"],
        min: 1,
      },
      luggage: {
        type: Number,
        default: 2,
      },
    },
    features: [
      {
        type: String,
        enum: [
          "gps",
          "bluetooth",
          "wifi",
          "ac",
          "air_conditioning",
          "camera",
          "backup_camera",
          "parking_camera",
          "sensors",
          "parking_sensors",
          "sunroof",
          "seats",
          "heated_seats",
          "leather_seats",
          "audio",
          "usb",
          "usb_charging",
          "cruise_control",
          "entertainment_system",
          "navigation",
          "keyless_entry",
        ],
      },
    ],
    fuelType: {
      type: String,
      enum: ["petrol", "diesel", "electric", "hybrid", "cng"],
      required: [true, "Please specify fuel type"],
    },
    mileage: {
      type: Number,
      default: 0,
    },
    color: {
      type: String,
      trim: true,
    },
    images: [
      {
        type: String,
      },
    ],
    pricePerDay: {
      type: Number,
      required: [true, "Please provide price per day"],
      min: [0, "Price cannot be negative"],
    },
    pricePerHour: {
      type: Number,
      min: [0, "Price cannot be negative"],
    },
    availability: {
      type: String,
      enum: ["available", "booked", "maintenance", "unavailable"],
      default: "available",
    },
    location: {
      address: String,
      city: String,
      state: String,
      zipCode: String,
      coordinates: {
        type: {
          type: String,
          enum: ["Point"],
          default: "Point",
        },
        coordinates: {
          type: [Number], // [longitude, latitude]
          default: [0, 0],
        },
      },
    },
    insurance: {
      provider: String,
      policyNumber: String,
      expiryDate: Date,
    },
    lastServiceDate: {
      type: Date,
    },
    nextServiceDue: {
      type: Date,
    },
    rating: {
      average: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
      },
      count: {
        type: Number,
        default: 0,
      },
    },
    // Soft delete
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for bookings
vehicleSchema.virtual("bookings", {
  ref: "Booking",
  localField: "_id",
  foreignField: "vehicle",
  justOne: false,
});

// Virtual for driver assignments
vehicleSchema.virtual("assignedDrivers", {
  ref: "DriverAssignment",
  localField: "_id",
  foreignField: "vehicle",
  justOne: false,
});

// Indexes for better query performance (registrationNumber already indexed by unique constraint)
vehicleSchema.index({ owner: 1 });
vehicleSchema.index({ vehicleType: 1 });
vehicleSchema.index({ availability: 1 });
vehicleSchema.index({ pricePerDay: 1 });
vehicleSchema.index({ "location.coordinates": "2dsphere" });
vehicleSchema.index({ isDeleted: 1 });

// Exclude deleted vehicles from queries by default
vehicleSchema.pre(/^find/, function (next) {
  if (!this.getOptions().includeDeleted) {
    this.find({ isDeleted: { $ne: true } });
  }
  next();
});

module.exports = mongoose.model("Vehicle", vehicleSchema);
