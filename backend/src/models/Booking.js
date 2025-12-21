const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Customer is required"],
    },
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle",
      required: [true, "Vehicle is required"],
    },
    bookingType: {
      type: String,
      enum: ["hourly", "daily", "weekly", "monthly"],
      default: "daily",
    },
    startDate: {
      type: Date,
      required: [true, "Start date is required"],
    },
    endDate: {
      type: Date,
      required: [true, "End date is required"],
    },
    startTime: {
      type: String,
      match: [
        /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
        "Please provide valid time in HH:MM format",
      ],
    },
    endTime: {
      type: String,
      match: [
        /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
        "Please provide valid time in HH:MM format",
      ],
    },
    pickupLocation: {
      address: {
        type: String,
        required: [true, "Pickup address is required"],
      },
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
    dropoffLocation: {
      address: String,
      city: String,
      state: String,
      zipCode: String,
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
    duration: {
      days: {
        type: Number,
        default: 0,
      },
      hours: {
        type: Number,
        default: 0,
      },
    },
    pricing: {
      basePrice: {
        type: Number,
        required: true,
      },
      taxes: {
        type: Number,
        default: 0,
      },
      discount: {
        type: Number,
        default: 0,
      },
      totalPrice: {
        type: Number,
        required: true,
      },
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "completed", "in_progress"],
      default: "pending",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "refunded", "failed"],
      default: "pending",
    },
    paymentMethod: {
      type: String,
      enum: ["card", "cash", "upi", "net_banking"],
    },
    specialRequests: {
      type: String,
      maxlength: [500, "Special requests cannot exceed 500 characters"],
    },
    cancellationReason: {
      type: String,
      maxlength: [500, "Cancellation reason cannot exceed 500 characters"],
    },
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    cancelledAt: {
      type: Date,
    },
    confirmedAt: {
      type: Date,
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

// Virtual for trip
bookingSchema.virtual("trip", {
  ref: "Trip",
  localField: "_id",
  foreignField: "booking",
  justOne: true,
});

// Virtual for backward compatibility with frontend
bookingSchema.virtual("totalAmount").get(function () {
  return this.pricing?.totalPrice || 0;
});

bookingSchema.virtual("totalDays").get(function () {
  return this.duration?.days || 0;
});

bookingSchema.virtual("dailyRate").get(function () {
  return this.pricing?.basePrice / (this.duration?.days || 1) || 0;
});

// Indexes for better query performance
bookingSchema.index({ customer: 1 });
bookingSchema.index({ vehicle: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ startDate: 1, endDate: 1 });
bookingSchema.index({ isDeleted: 1 });

// Validate end date is after start date
bookingSchema.pre("save", function (next) {
  if (this.endDate <= this.startDate) {
    next(new Error("End date must be after start date"));
  }
  next();
});

// Exclude deleted bookings from queries by default
bookingSchema.pre(/^find/, function (next) {
  if (!this.getOptions().includeDeleted) {
    this.find({ isDeleted: { $ne: true } });
  }
  next();
});

module.exports = mongoose.model("Booking", bookingSchema);
