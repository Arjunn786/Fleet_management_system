const mongoose = require("mongoose");

const tripSchema = new mongoose.Schema(
  {
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: [true, "Booking is required"],
    },
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle",
      required: [true, "Vehicle is required"],
    },
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Customer is required"],
    },
    status: {
      type: String,
      enum: ["scheduled", "in_progress", "completed", "cancelled"],
      default: "scheduled",
    },
    startedAt: {
      type: Date,
    },
    completedAt: {
      type: Date,
    },
    actualStartLocation: {
      address: String,
      coordinates: {
        type: {
          type: String,
          enum: ["Point"],
        },
        coordinates: {
          type: [Number], // [longitude, latitude]
        },
      },
    },
    actualEndLocation: {
      address: String,
      coordinates: {
        type: {
          type: String,
          enum: ["Point"],
        },
        coordinates: {
          type: [Number], // [longitude, latitude]
        },
      },
    },
    distance: {
      planned: {
        type: Number, // in kilometers
        default: 0,
      },
      actual: {
        type: Number, // in kilometers
        default: 0,
      },
    },
    odometerStart: {
      type: Number,
    },
    odometerEnd: {
      type: Number,
    },
    fuelLevel: {
      start: {
        type: Number, // percentage
        min: 0,
        max: 100,
      },
      end: {
        type: Number, // percentage
        min: 0,
        max: 100,
      },
    },
    revenue: {
      type: Number,
      default: 0,
    },
    expenses: {
      fuel: {
        type: Number,
        default: 0,
      },
      tolls: {
        type: Number,
        default: 0,
      },
      parking: {
        type: Number,
        default: 0,
      },
      maintenance: {
        type: Number,
        default: 0,
      },
      other: {
        type: Number,
        default: 0,
      },
    },
    rating: {
      customerRating: {
        type: Number,
        min: 1,
        max: 5,
      },
      customerReview: String,
      driverRating: {
        type: Number,
        min: 1,
        max: 5,
      },
      driverReview: String,
    },
    issues: [
      {
        description: String,
        reportedAt: {
          type: Date,
          default: Date.now,
        },
        resolvedAt: Date,
        status: {
          type: String,
          enum: ["open", "resolved", "closed"],
          default: "open",
        },
      },
    ],
    notes: {
      type: String,
      maxlength: [1000, "Notes cannot exceed 1000 characters"],
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
  }
);

// Indexes for better query performance
tripSchema.index({ booking: 1 });
tripSchema.index({ vehicle: 1 });
tripSchema.index({ driver: 1 });
tripSchema.index({ customer: 1 });
tripSchema.index({ status: 1 });
tripSchema.index({ startedAt: 1 });
tripSchema.index({ completedAt: 1 });
tripSchema.index({ isDeleted: 1 });

// Calculate revenue before saving
tripSchema.pre("save", function (next) {
  if (this.isModified("status") && this.status === "completed") {
    // Get the booking to calculate revenue
    this.populate("booking").then(() => {
      if (this.booking && this.booking.pricing) {
        this.revenue = this.booking.pricing.totalPrice;
      }
      next();
    });
  } else {
    next();
  }
});

// Exclude deleted trips from queries by default
tripSchema.pre(/^find/, function (next) {
  if (!this.getOptions().includeDeleted) {
    this.find({ isDeleted: { $ne: true } });
  }
  next();
});

module.exports = mongoose.model("Trip", tripSchema);
