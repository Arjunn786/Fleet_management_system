const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide a name"],
      trim: true,
      maxlength: [50, "Name cannot be more than 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Please provide an email"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email",
      ],
    },
    password: {
      type: String,
      required: [true, "Please provide a password"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
    },
    role: {
      type: String,
      enum: ["customer", "driver", "owner", "admin"],
      default: "customer",
    },
    phone: {
      type: String,
      trim: true,
      match: [/^[0-9]{10}$/, "Please provide a valid 10-digit phone number"],
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
    },
    profileImage: {
      type: String,
      default: null,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    // For drivers
    licenseNumber: {
      type: String,
      sparse: true,
      unique: true,
    },
    licenseExpiry: {
      type: Date,
    },
    experience: {
      type: Number,
      default: 0,
    },
    // For owners
    businessName: {
      type: String,
      trim: true,
    },
    businessAddress: {
      type: String,
      trim: true,
    },
    businessLicense: {
      type: String,
      trim: true,
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
    refreshToken: {
      type: String,
      select: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for owned vehicles (for owners)
userSchema.virtual("ownedVehicles", {
  ref: "Vehicle",
  localField: "_id",
  foreignField: "owner",
  justOne: false,
});

// Virtual for driver assignments
userSchema.virtual("driverAssignments", {
  ref: "DriverAssignment",
  localField: "_id",
  foreignField: "driver",
  justOne: false,
});

// Virtual for bookings
userSchema.virtual("bookings", {
  ref: "Booking",
  localField: "_id",
  foreignField: "customer",
  justOne: false,
});

// Index for better query performance (email already indexed by unique constraint)
userSchema.index({ role: 1 });
userSchema.index({ isDeleted: 1 });

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Exclude deleted users from queries by default
userSchema.pre(/^find/, function (next) {
  if (!this.getOptions().includeDeleted) {
    this.find({ isDeleted: { $ne: true } });
  }
  next();
});

module.exports = mongoose.model("User", userSchema);
