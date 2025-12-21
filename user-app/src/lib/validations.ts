import { z } from "zod";

// Login Schema
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// Signup Schema
export const signupSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
    role: z.enum(["customer", "driver", "owner"], {
      required_error: "Please select a role",
    }),
    phone: z
      .string()
      .regex(/^[0-9]{10}$/, "Phone number must be 10 digits")
      .optional()
      .or(z.literal("")),
    licenseNumber: z.string().optional(),
    licenseExpiry: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  })
  .refine(
    (data) => {
      if (data.role === "driver" && !data.licenseNumber) {
        return false;
      }
      return true;
    },
    {
      message: "License number is required for drivers",
      path: ["licenseNumber"],
    }
  );

export type SignupFormData = z.infer<typeof signupSchema>;

// Vehicle Schema
export const vehicleSchema = z.object({
  make: z.string().min(2, "Make is required"),
  model: z.string().min(2, "Model is required"),
  year: z
    .number()
    .min(1900)
    .max(new Date().getFullYear() + 1),
  registrationNumber: z.string().min(3, "Registration number is required"),
  vehicleType: z.enum([
    "sedan",
    "suv",
    "van",
    "truck",
    "luxury",
    "electric",
    "hybrid",
  ]),
  capacity: z.object({
    passengers: z.number().min(1, "Passenger capacity must be at least 1"),
    luggage: z.number().optional(),
  }),
  features: z.array(z.string()).optional(),
  fuelType: z.enum(["petrol", "diesel", "electric", "hybrid", "cng"]),
  color: z.string().optional(),
  pricePerDay: z.number().min(0, "Price must be a positive number"),
  pricePerHour: z.number().min(0).optional(),
  location: z.object({
    address: z.string().min(5, "Address is required"),
    city: z.string().min(2, "City is required"),
    state: z.string().optional(),
    zipCode: z.string().optional(),
  }),
});

export type VehicleFormData = z.infer<typeof vehicleSchema>;

// Booking Schema
export const bookingSchema = z.object({
  vehicleId: z.string().min(1, "Vehicle is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  startTime: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format")
    .optional(),
  endTime: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format")
    .optional(),
  pickupLocation: z.object({
    address: z.string().min(5, "Pickup address is required"),
    city: z.string().optional(),
    state: z.string().optional(),
    zipCode: z.string().optional(),
  }),
  dropoffLocation: z
    .object({
      address: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      zipCode: z.string().optional(),
    })
    .optional(),
  bookingType: z
    .enum(["hourly", "daily", "weekly", "monthly"])
    .default("daily"),
  specialRequests: z.string().max(500).optional(),
});

export type BookingFormData = z.infer<typeof bookingSchema>;

// Update Profile Schema
export const updateProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z
    .string()
    .regex(/^[0-9]{10}$/, "Phone number must be 10 digits")
    .optional()
    .or(z.literal("")),
  address: z
    .object({
      street: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      zipCode: z.string().optional(),
    })
    .optional(),
  licenseNumber: z.string().optional(),
  licenseExpiry: z.string().optional(),
});

export type UpdateProfileFormData = z.infer<typeof updateProfileSchema>;

// Change Password Schema
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(6, "Current password is required"),
    newPassword: z
      .string()
      .min(6, "New password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

// Trip Review Schema
export const tripReviewSchema = z.object({
  customerRating: z.number().min(1).max(5).optional(),
  customerReview: z.string().max(500).optional(),
  driverRating: z.number().min(1).max(5).optional(),
  driverReview: z.string().max(500).optional(),
});

export type TripReviewFormData = z.infer<typeof tripReviewSchema>;
