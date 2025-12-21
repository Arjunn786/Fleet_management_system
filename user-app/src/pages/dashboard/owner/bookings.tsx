import Head from "next/head";
import { useEffect, useState } from "react";
import { FaCar, FaCalendar, FaMapMarkerAlt, FaUser } from "react-icons/fa";
import DashboardLayout from "@/components/DashboardLayout";
import { bookingsAPI } from "@/lib/api";
import { formatDate, formatCurrency, getStatusBadgeClass } from "@/lib/utils";
import toast from "react-hot-toast";

export default function OwnerBookings() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await bookingsAPI.getAll();
      setBookings(response.data.data);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      toast.error("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  const handleBookingApproval = async (
    bookingId: string,
    status: "confirmed" | "cancelled"
  ) => {
    try {
      await bookingsAPI.updateStatus(bookingId, status);
      toast.success(
        `Booking ${
          status === "confirmed" ? "approved" : "rejected"
        } successfully`
      );
      fetchBookings(); // Refresh the list
    } catch (error) {
      console.error("Error updating booking status:", error);
      toast.error("Failed to update booking status");
    }
  };

  const filteredBookings = bookings.filter((booking) => {
    if (filter === "all") return true;
    return booking.status === filter;
  });

  return (
    <>
      <Head>
        <title>Vehicle Bookings - FleetHub</title>
      </Head>

      <DashboardLayout role="owner">
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold mb-2">Vehicle Bookings</h1>
            <p className="text-gray-400">View all bookings for your vehicles</p>
          </div>

          {/* Filters */}
          <div className="card p-4">
            <div className="flex gap-2 flex-wrap">
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
                <div key={booking._id} className="card p-6">
                  <div className="grid md:grid-cols-[1fr,auto] gap-6">
                    {/* Booking Info */}
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-xl font-bold mb-1">
                            Booking #{booking._id.slice(-8)}
                          </h3>
                          <p className="text-sm text-gray-400">
                            {formatDate(booking.createdAt)}
                          </p>
                        </div>
                        <span className={getStatusBadgeClass(booking.status)}>
                          {booking.status.replace("_", " ")}
                        </span>
                      </div>

                      <div className="grid md:grid-cols-3 gap-4">
                        {/* Vehicle */}
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                            <FaCar className="text-purple-500" />
                          </div>
                          <div>
                            <div className="text-sm text-gray-400">Vehicle</div>
                            <div className="font-semibold">
                              {booking.vehicle?.make} {booking.vehicle?.model}
                            </div>
                            <div className="text-sm text-gray-400 mt-1">
                              {booking.vehicle?.registrationNumber}
                            </div>
                          </div>
                        </div>

                        {/* Customer */}
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                            <FaUser className="text-blue-500" />
                          </div>
                          <div>
                            <div className="text-sm text-gray-400">
                              Customer
                            </div>
                            <div className="font-semibold">
                              {booking.customer?.name}
                            </div>
                            <div className="text-sm text-gray-400 mt-1">
                              {booking.customer?.email}
                            </div>
                          </div>
                        </div>

                        {/* Dates */}
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                            <FaCalendar className="text-green-500" />
                          </div>
                          <div>
                            <div className="text-sm text-gray-400">
                              Duration
                            </div>
                            <div className="font-semibold">
                              {formatDate(booking.startDate)}
                            </div>
                            <div className="text-sm text-gray-400 mt-1">
                              to {formatDate(booking.endDate)}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Pickup Location */}
                      {booking.pickupLocation && (
                        <div className="flex items-start gap-3">
                          <FaMapMarkerAlt className="text-gray-400 mt-1" />
                          <div>
                            <div className="text-sm text-gray-400">
                              Pickup Location
                            </div>
                            <div className="text-sm">
                              {booking.pickupLocation.address}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Amount */}
                      <div className="pt-3 border-t border-dark-700">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400">Total Amount</span>
                          <span className="text-xl font-bold text-primary-500">
                            {formatCurrency(
                              booking.pricing?.totalPrice || booking.totalAmount
                            )}
                          </span>
                        </div>
                        {booking.paymentStatus && (
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-sm text-gray-400">
                              Payment Status
                            </span>
                            <span className="text-sm capitalize">
                              {booking.paymentStatus}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons for Pending Bookings */}
                    {booking.status === "pending" && (
                      <div className="flex flex-col gap-2 min-w-[140px]">
                        <button
                          onClick={() =>
                            handleBookingApproval(booking._id, "confirmed")
                          }
                          className="btn btn-primary text-sm py-2"
                        >
                          ✓ Approve
                        </button>
                        <button
                          onClick={() =>
                            handleBookingApproval(booking._id, "cancelled")
                          }
                          className="btn btn-danger text-sm py-2"
                        >
                          ✗ Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="card p-12 text-center">
              <FaCar className="text-6xl text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No bookings found</h3>
              <p className="text-gray-400">
                {filter === "all"
                  ? "No bookings have been made for your vehicles yet"
                  : `No ${filter} bookings`}
              </p>
            </div>
          )}
        </div>
      </DashboardLayout>
    </>
  );
}
