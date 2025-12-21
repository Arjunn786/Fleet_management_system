import Head from "next/head";
import { useRouter } from "next/router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import {
  FaCar,
  FaMoneyBillWave,
  FaMapMarkerAlt,
  FaArrowLeft,
} from "react-icons/fa";
import DashboardLayout from "@/components/DashboardLayout";
import { vehiclesAPI } from "@/lib/api";
import { vehicleSchema, VehicleFormData } from "@/lib/validations";

export default function NewVehicle() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VehicleFormData>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: {
      capacity: {
        passengers: 4,
        luggage: 2,
      },
    },
  });

  const onSubmit = async (data: VehicleFormData) => {
    setSubmitting(true);
    try {
      await vehiclesAPI.create(data);
      toast.success("Vehicle added successfully!");
      router.push("/dashboard/owner/vehicles");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to add vehicle");
    } finally {
      setSubmitting(false);
    }
  };

  const vehicleTypes = [
    "sedan",
    "suv",
    "van",
    "truck",
    "luxury",
    "electric",
    "hybrid",
  ];
  const fuelTypes = ["petrol", "diesel", "electric", "hybrid", "cng"];
  const features = [
    "air_conditioning",
    "gps",
    "bluetooth",
    "backup_camera",
    "parking_sensors",
    "sunroof",
    "leather_seats",
    "heated_seats",
    "cruise_control",
    "usb_charging",
  ];

  return (
    <>
      <Head>
        <title>Add Vehicle - FleetHub</title>
      </Head>

      <DashboardLayout role="owner">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Back Button */}
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <FaArrowLeft />
            Back to Vehicles
          </button>

          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold mb-2">Add New Vehicle</h1>
            <p className="text-gray-400">
              Fill in the details to add a vehicle to your fleet
            </p>
          </div>

          {/* Form */}
          <div className="card p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Basic Info */}
              <div>
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <FaCar className="text-primary-500" />
                  Basic Information
                </h2>

                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label className="label">Make *</label>
                    <input
                      {...register("make")}
                      className="input"
                      placeholder="Toyota, Honda, etc."
                    />
                    {errors.make && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.make.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="label">Model *</label>
                    <input
                      {...register("model")}
                      className="input"
                      placeholder="Camry, Civic, etc."
                    />
                    {errors.model && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.model.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="label">Year *</label>
                    <input
                      {...register("year", { valueAsNumber: true })}
                      type="number"
                      className="input"
                      placeholder="2023"
                    />
                    {errors.year && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.year.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="label">Registration Number *</label>
                    <input
                      {...register("registrationNumber")}
                      className="input"
                      placeholder="ABC-1234"
                    />
                    {errors.registrationNumber && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.registrationNumber.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="label">Vehicle Type *</label>
                    <select {...register("vehicleType")} className="input">
                      <option value="">Select type</option>
                      {vehicleTypes.map((type) => (
                        <option key={type} value={type}>
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </option>
                      ))}
                    </select>
                    {errors.vehicleType && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.vehicleType.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="label">Fuel Type *</label>
                    <select {...register("fuelType")} className="input">
                      <option value="">Select fuel type</option>
                      {fuelTypes.map((type) => (
                        <option key={type} value={type}>
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </option>
                      ))}
                    </select>
                    {errors.fuelType && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.fuelType.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Capacity */}
              <div>
                <h2 className="text-xl font-bold mb-4">Capacity</h2>
                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label className="label">Passengers *</label>
                    <input
                      {...register("capacity.passengers", {
                        valueAsNumber: true,
                      })}
                      type="number"
                      className="input"
                      placeholder="4"
                    />
                    {errors.capacity?.passengers && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.capacity.passengers.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="label">Luggage *</label>
                    <input
                      {...register("capacity.luggage", { valueAsNumber: true })}
                      type="number"
                      className="input"
                      placeholder="2"
                    />
                    {errors.capacity?.luggage && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.capacity.luggage.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Pricing */}
              <div>
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <FaMoneyBillWave className="text-green-500" />
                  Pricing
                </h2>
                <div>
                  <label className="label">Price Per Day ($) *</label>
                  <input
                    {...register("pricePerDay", { valueAsNumber: true })}
                    type="number"
                    step="0.01"
                    className="input"
                    placeholder="50.00"
                  />
                  {errors.pricePerDay && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.pricePerDay.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Location */}
              <div>
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <FaMapMarkerAlt className="text-blue-500" />
                  Location
                </h2>
                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label className="label">City</label>
                    <input
                      {...register("location.city")}
                      className="input"
                      placeholder="New York"
                    />
                    {errors.location?.city && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.location.city.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="label">State</label>
                    <input
                      {...register("location.state")}
                      className="input"
                      placeholder="NY"
                    />
                    {errors.location?.state && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.location.state.message}
                      </p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="label">Address</label>
                    <textarea
                      {...register("location.address")}
                      className="input"
                      rows={2}
                      placeholder="Street address"
                    />
                    {errors.location?.address && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.location.address.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Features */}
              <div>
                <h2 className="text-xl font-bold mb-4">Features (Optional)</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {features.map((feature) => (
                    <label
                      key={feature}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        {...register("features")}
                        type="checkbox"
                        value={feature}
                        className="w-4 h-4 text-primary-500 bg-dark-800 border-dark-600 rounded focus:ring-primary-500"
                      />
                      <span className="text-sm capitalize">
                        {feature.replace("_", " ")}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Submit */}
              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-primary"
                >
                  {submitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Adding Vehicle...
                    </>
                  ) : (
                    "Add Vehicle"
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </DashboardLayout>
    </>
  );
}
