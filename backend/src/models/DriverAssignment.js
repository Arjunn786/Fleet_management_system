const mongoose = require("mongoose");

const driverAssignmentSchema = new mongoose.Schema(
  {
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Driver is required"],
    },
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle",
      required: [true, "Vehicle is required"],
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "active", "inactive"],
      default: "pending",
    },
    assignedDate: {
      type: Date,
      default: Date.now,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    approvedDate: {
      type: Date,
    },
    notes: {
      type: String,
      maxlength: [500, "Notes cannot exceed 500 characters"],
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

// Compound index to ensure a driver can't be assigned to the same vehicle twice (active assignments)
driverAssignmentSchema.index({ driver: 1, vehicle: 1, status: 1 });
driverAssignmentSchema.index({ vehicle: 1 });
driverAssignmentSchema.index({ driver: 1 });
driverAssignmentSchema.index({ isDeleted: 1 });

// Exclude deleted assignments from queries by default
driverAssignmentSchema.pre(/^find/, function (next) {
  if (!this.getOptions().includeDeleted) {
    this.find({ isDeleted: { $ne: true } });
  }
  next();
});

module.exports = mongoose.model("DriverAssignment", driverAssignmentSchema);
