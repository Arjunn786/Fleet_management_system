import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import {
  FaCar,
  FaUsers,
  FaGasPump,
  FaCalendar,
  FaMapMarkerAlt,
  FaArrowLeft,
} from "react-icons/fa";
import DashboardLayout from "@/components/DashboardLayout";
import { vehiclesAPI, bookingsAPI } from "@/lib/api";
import { bookingSchema, BookingFormData } from "@/lib/validations";
import { formatCurrency, calculateDays } from "@/lib/utils";

export default function VehicleDetails() {
  const router = useRouter();
  const { id } = router.query;
  const [vehicle, setVehicle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      vehicleId: id as string,
      bookingType: "daily",
    },
  });

  const startDate = watch("startDate");
  const endDate = watch("endDate");

  useEffect(() => {
    if (id) {
      fetchVehicle();
    }
  }, [id]);

  const fetchVehicle = async () => {
    try {
      const response = await vehiclesAPI.getById(id as string);
      setVehicle(response.data.data);
    } catch (error) {
      console.error("Error fetching vehicle:", error);
      toast.error("Failed to load vehicle details");
    } finally {
      setLoading(false);
    }
  };

  const calculatePrice = () => {
    if (!vehicle || !startDate || !endDate) return 0;

    const days = calculateDays(startDate, endDate);
    const basePrice = vehicle.pricePerDay * days;
    const taxes = basePrice * 0.18;
    return basePrice + taxes;
  };

  const onSubmit = async (data: BookingFormData) => {
    setSubmitting(true);
    try {
      await bookingsAPI.create(data);
      toast.success("Booking created successfully!");
      router.push("/dashboard/customer/bookings");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create booking");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout role="customer">
        <div className="flex items-center justify-center h-96">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  if (!vehicle) {
    return (
      <DashboardLayout role="customer">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Vehicle not found</h2>
          <button onClick={() => router.back()} className="btn btn-primary">
            Go Back
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <>
      <Head>
        <title>
          {vehicle.make} {vehicle.model} - FleetHub
        </title>
      </Head>

      <DashboardLayout role="customer">
        <div className="space-y-6">
          {/* Back Button */}
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <FaArrowLeft />
            Back to Vehicles
          </button>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Vehicle Details */}
            <div className="space-y-6">
              {/* Vehicle Image */}
              <div className="card overflow-hidden">
                <div className="aspect-video bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center">
                  <FaCar className="text-white text-8xl opacity-50" />
                </div>
              </div>

              {/* Info Card */}
              <div className="card p-6">
                <h1 className="text-3xl font-bold mb-2">
                  {vehicle.make} {vehicle.model}
                </h1>
                <p className="text-gray-400 mb-6">
                  {vehicle.year} • {vehicle.registrationNumber}
                </p>

                {/* Specs */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-500/20 rounded-lg flex items-center justify-center">
                      <FaUsers className="text-primary-500" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">Capacity</div>
                      <div className="font-semibold">
                        {vehicle.capacity.passengers} Passengers
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                      <FaGasPump className="text-green-500" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">Fuel</div>
                      <div className="font-semibold capitalize">
                        {vehicle.fuelType}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                      <FaCar className="text-purple-500" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">Type</div>
                      <div className="font-semibold capitalize">
                        {vehicle.vehicleType}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <FaMapMarkerAlt className="text-blue-500" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">Location</div>
                      <div className="font-semibold">
                        {vehicle.location?.city || "N/A"}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Features */}
                {vehicle.features && vehicle.features.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-3">Features</h3>
                    <div className="flex flex-wrap gap-2">
                      {vehicle.features.map(
                        (feature: string, index: number) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-dark-800 rounded-full text-sm"
                          >
                            {feature.replace("_", " ")}
                          </span>
                        )
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Owner Info */}
              <div className="card p-6">
                <h3 className="font-semibold mb-3">Owner Information</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Name:</span>
                    <span>{vehicle.owner?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Email:</span>
                    <span>{vehicle.owner?.email}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Booking Form */}
            <div className="card p-6 sticky top-6 h-fit">
              <div className="text-3xl font-bold text-primary-500 mb-6">
                {formatCurrency(vehicle.pricePerDay)}
                <span className="text-lg text-gray-400 font-normal">/day</span>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <input
                  type="hidden"
                  {...register("vehicleId")}
                  value={id as string}
                />

                {/* Booking Type */}
                <div>
                  <label className="label">Booking Type</label>
                  <select {...register("bookingType")} className="input">
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>

                {/* Date Range */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Start Date</label>
                    <div className="relative">
                      <FaCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        {...register("startDate")}
                        type="date"
                        className="input pl-10"
                        min={new Date().toISOString().split("T")[0]}
                      />
                    </div>
                    {errors.startDate && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.startDate.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="label">End Date</label>
                    <div className="relative">
                      <FaCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        {...register("endDate")}
                        type="date"
                        className="input pl-10"
                        min={
                          startDate || new Date().toISOString().split("T")[0]
                        }
                      />
                    </div>
                    {errors.endDate && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.endDate.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Pickup Location */}
                <div>
                  <label className="label">Pickup Address</label>
                  <div className="relative">
                    <FaMapMarkerAlt className="absolute left-3 top-3 text-gray-400" />
                    <textarea
                      {...register("pickupLocation.address")}
                      className="input pl-10"
                      rows={2}
                      placeholder="Enter pickup address"
                    />
                  </div>
                  {errors.pickupLocation?.address && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.pickupLocation.address.message}
                    </p>
                  )}
                </div>

                {/* Special Requests */}
                <div>
                  <label className="label">Special Requests (Optional)</label>
                  <textarea
                    {...register("specialRequests")}
                    className="input"
                    rows={3}
                    placeholder="Any special requirements..."
                  />
                </div>

                {/* Price Breakdown */}
                {startDate && endDate && (
                  <div className="bg-dark-800 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Days:</span>
                      <span>{calculateDays(startDate, endDate)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Base Price:</span>
                      <span>
                        {formatCurrency(
                          vehicle.pricePerDay *
                            calculateDays(startDate, endDate)
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Taxes (18%):</span>
                      <span>
                        {formatCurrency(
                          vehicle.pricePerDay *
                            calculateDays(startDate, endDate) *
                            0.18
                        )}
                      </span>
                    </div>
                    <div className="border-t border-dark-700 pt-2 flex justify-between font-bold">
                      <span>Total:</span>
                      <span className="text-primary-500">
                        {formatCurrency(calculatePrice())}
                      </span>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={submitting || vehicle.availability !== "available"}
                  className="btn btn-primary w-full"
                >
                  {submitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Confirm Booking"
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </>
  );
}
