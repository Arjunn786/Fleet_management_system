import Head from "next/head";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  FaCalendar,
  FaCar,
  FaMapMarkerAlt,
  FaCheck,
  FaTimes,
  FaClock,
} from "react-icons/fa";
import DashboardLayout from "@/components/DashboardLayout";
import { bookingsAPI } from "@/lib/api";
import { formatCurrency, formatDate, getStatusBadgeClass } from "@/lib/utils";
import toast from "react-hot-toast";

export default function CustomerBookings() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await bookingsAPI.getMyBookings();
      setBookings(response.data.data);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      toast.error("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (bookingId: string) => {
    if (!confirm("Are you sure you want to cancel this booking?")) return;

    try {
      await bookingsAPI.cancel(bookingId);
      toast.success("Booking cancelled successfully");
      fetchBookings();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to cancel booking");
    }
  };

  const filteredBookings = bookings.filter((booking) => {
    if (filter === "all") return true;
    return booking.status === filter;
  });

  return (
    <>
      <Head>
        <title>My Bookings - FleetHub</title>
      </Head>

      <DashboardLayout role="customer">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">My Bookings</h1>
              <p className="text-gray-400">
                View and manage your vehicle bookings
              </p>
            </div>
            <Link
              href="/dashboard/customer/vehicles"
              className="btn btn-primary"
            >
              Book a Vehicle
            </Link>
          </div>

          {/* Filters */}
          <div className="card p-4">
            <div className="flex gap-2">
              {[
                { value: "all", label: "All" },
                { value: "pending", label: "Pending" },
                { value: "confirmed", label: "Confirmed" },
                { value: "in_progress", label: "In Progress" },
                { value: "completed", label: "Completed" },
                { value: "cancelled", label: "Cancelled" },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setFilter(option.value)}
                  className={`px-4 py-2 rounded-lg transition-all ${
                    filter === option.value
                      ? "bg-primary-500 text-white"
                      : "bg-dark-800 hover:bg-dark-700"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Bookings List */}
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredBookings.length > 0 ? (
            <div className="space-y-4">
              {filteredBookings.map((booking) => (
                <div key={booking._id} className="card-hover">
                  <div className="grid md:grid-cols-[1fr,auto] gap-6 p-6">
                    {/* Booking Info */}
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-xl font-bold mb-1">
                            {booking.vehicle?.make} {booking.vehicle?.model}
                          </h3>
                          <p className="text-sm text-gray-400">
                            Booking ID: {booking._id.slice(-8)}
                          </p>
                        </div>
                        <span className={getStatusBadgeClass(booking.status)}>
                          {booking.status.replace("_", " ")}
                        </span>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        {/* Dates */}
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                            <FaCalendar className="text-blue-500" />
                          </div>
                          <div>
                            <div className="text-sm text-gray-400">
                              Duration
                            </div>
                            <div className="font-semibold">
                              {formatDate(booking.startDate)} -{" "}
                              {formatDate(booking.endDate)}
                            </div>
                            <div className="text-sm text-gray-400 mt-1">
                              {booking.bookingType} rental
                            </div>
                          </div>
                        </div>

                        {/* Pickup */}
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                            <FaMapMarkerAlt className="text-green-500" />
                          </div>
                          <div>
                            <div className="text-sm text-gray-400">
                              Pickup Location
                            </div>
                            <div className="font-semibold">
                              {booking.pickupLocation?.address || "N/A"}
                            </div>
                          </div>
                        </div>

                        {/* Vehicle Info */}
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                            <FaCar className="text-purple-500" />
                          </div>
                          <div>
                            <div className="text-sm text-gray-400">
                              Vehicle Details
                            </div>
                            <div className="font-semibold">
                              {booking.vehicle?.registrationNumber}
                            </div>
                            <div className="text-sm text-gray-400 mt-1 capitalize">
                              {booking.vehicle?.vehicleType} •{" "}
                              {booking.vehicle?.fuelType}
                            </div>
                          </div>
                        </div>

                        {/* Price */}
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-primary-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                            <FaCheck className="text-primary-500" />
                          </div>
                          <div>
                            <div className="text-sm text-gray-400">
                              Total Amount
                            </div>
                            <div className="text-xl font-bold text-primary-500">
                              {formatCurrency(booking.totalAmount)}
                            </div>
                            {booking.paymentStatus && (
                              <div className="text-sm text-gray-400 mt-1 capitalize">
                                {booking.paymentStatus}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Special Requests */}
                      {booking.specialRequests && (
                        <div className="bg-dark-800 rounded-lg p-3">
                          <div className="text-sm text-gray-400 mb-1">
                            Special Requests
                          </div>
                          <div className="text-sm">
                            {booking.specialRequests}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-3 md:w-48">
                      {booking.status === "pending" && (
                        <button
                          onClick={() => handleCancel(booking._id)}
                          className="btn btn-danger flex items-center gap-2 justify-center"
                        >
                          <FaTimes />
                          Cancel Booking
                        </button>
                      )}

                      {booking.status === "confirmed" && (
                        <div className="bg-green-500/20 text-green-500 px-4 py-2 rounded-lg text-sm flex items-center gap-2">
                          <FaCheck />
                          Confirmed
                        </div>
                      )}

                      {booking.status === "in_progress" && (
                        <div className="bg-blue-500/20 text-blue-500 px-4 py-2 rounded-lg text-sm flex items-center gap-2">
                          <FaClock />
                          In Progress
                        </div>
                      )}

                      <Link
                        href={`/dashboard/customer/bookings/${booking._id}`}
                        className="btn btn-secondary"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="card p-12 text-center">
              <FaCar className="text-6xl text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No bookings found</h3>
              <p className="text-gray-400 mb-6">
                {filter === "all"
                  ? "You haven't made any bookings yet"
                  : `No ${filter} bookings`}
              </p>
              <Link
                href="/dashboard/customer/vehicles"
                className="btn btn-primary inline-flex"
              >
                Browse Vehicles
              </Link>
            </div>
          )}
        </div>
      </DashboardLayout>
    </>
  );
}
