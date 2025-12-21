import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { NextPage } from "next";
import Link from "next/link";
import Head from "next/head";
import DashboardLayout from "../../../../components/DashboardLayout";

interface BookingDetails {
  _id: string;
  customer: {
    _id: string;
    name: string;
    email: string;
    phone: string;
  };
  vehicle: {
    _id: string;
    make: string;
    model: string;
    year: number;
    licensePlate: string;
    type: string;
    dailyRate: number;
    features: string[];
    images: string[];
  };
  owner: {
    _id: string;
    name: string;
    email: string;
    phone: string;
  };
  startDate: string;
  endDate: string;
  totalDays: number;
  dailyRate: number;
  totalAmount: number;
  status: string;
  pickupLocation: string;
  dropoffLocation: string;
  bookingType: string;
  specialRequests?: string;
  paymentStatus: string;
  createdAt: string;
  updatedAt: string;
}

const BookingDetail: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchBookingDetails();
    }
  }, [id]);

  const fetchBookingDetails = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(`/api/bookings/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setBooking(data.booking);
      } else {
        console.error("Booking not found");
        router.push("/dashboard/customer/bookings");
      }
    } catch (error) {
      console.error("Error fetching booking details:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!confirm("Are you sure you want to cancel this booking?")) {
      return;
    }

    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(`/api/bookings/${id}/cancel`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        alert("Booking cancelled successfully!");
        fetchBookingDetails(); // Refresh the booking data
      } else {
        const errorData = await response.json();
        alert(
          `Error cancelling booking: ${errorData.message || "Unknown error"}`
        );
      }
    } catch (error) {
      console.error("Error cancelling booking:", error);
      alert("Error cancelling booking");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-gray-100 text-gray-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatCurrency = (amount: number) => {
    return `$${(amount || 0).toFixed(2)}`;
  };

  if (loading) {
    return (
      <>
        <Head>
          <title>Booking Details - FleetHub</title>
        </Head>
        <DashboardLayout>
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </DashboardLayout>
      </>
    );
  }

  if (!booking) {
    return (
      <>
        <Head>
          <title>Booking Not Found - FleetHub</title>
        </Head>
        <DashboardLayout>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-red-500">Booking not found</p>
            <Link
              href="/dashboard/customer/bookings"
              className="text-blue-600 hover:underline"
            >
              Back to Bookings
            </Link>
          </div>
        </DashboardLayout>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>{`${booking.vehicle.make} ${booking.vehicle.model} - Booking Details`}</title>
      </Head>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href="/dashboard/customer/bookings"
                className="text-blue-600 hover:underline"
              >
                ← Back to My Bookings
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">
                {booking.vehicle.make} {booking.vehicle.model}
              </h1>
            </div>
            {booking.status === "pending" && (
              <button
                onClick={handleCancelBooking}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Cancel Booking
              </button>
            )}
          </div>

          {/* Booking Status */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Booking Status
                </h2>
                <p className="text-sm text-gray-500">
                  Booking ID: {booking._id}
                </p>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                  booking.status
                )}`}
              >
                {booking.status.replace("_", " ")}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Vehicle Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Vehicle Details
              </h3>

              {booking.vehicle.images && booking.vehicle.images.length > 0 && (
                <div className="mb-4">
                  <img
                    src={booking.vehicle.images[0]}
                    alt={`${booking.vehicle.make} ${booking.vehicle.model}`}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                </div>
              )}

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700">
                    Make & Model:
                  </span>
                  <span className="text-gray-900">
                    {booking.vehicle.make} {booking.vehicle.model}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700">Year:</span>
                  <span className="text-gray-900">{booking.vehicle.year}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700">
                    License Plate:
                  </span>
                  <span className="text-gray-900">
                    {booking.vehicle.licensePlate}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700">Type:</span>
                  <span className="text-gray-900 capitalize">
                    {booking.vehicle.type}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700">Daily Rate:</span>
                  <span className="text-gray-900">
                    {formatCurrency(booking.vehicle.dailyRate)}
                  </span>
                </div>
              </div>

              {booking.vehicle.features &&
                booking.vehicle.features.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-medium text-gray-700 mb-2">
                      Features:
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {booking.vehicle.features.map((feature, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm"
                        >
                          {feature.replace(/_/g, " ")}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
            </div>

            {/* Booking Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Booking Information
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700">Start Date:</span>
                  <span className="text-gray-900">
                    {new Date(booking.startDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700">End Date:</span>
                  <span className="text-gray-900">
                    {new Date(booking.endDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700">Total Days:</span>
                  <span className="text-gray-900">
                    {booking.totalDays || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700">
                    Booking Type:
                  </span>
                  <span className="text-gray-900 capitalize">
                    {booking.bookingType || "daily rental"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700">
                    Pickup Location:
                  </span>
                  <span className="text-gray-900">
                    {booking.pickupLocation || "N/A"}
                  </span>
                </div>
                {booking.dropoffLocation && (
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">
                      Dropoff Location:
                    </span>
                    <span className="text-gray-900">
                      {booking.dropoffLocation}
                    </span>
                  </div>
                )}
              </div>

              {booking.specialRequests && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-700 mb-2">
                    Special Requests:
                  </h4>
                  <p className="text-gray-900 text-sm">
                    {booking.specialRequests}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Payment Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Payment Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-sm text-gray-500">Daily Rate</div>
                <div className="text-xl font-semibold text-gray-900">
                  {formatCurrency(
                    booking.dailyRate || booking.vehicle.dailyRate
                  )}
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-500">Total Days</div>
                <div className="text-xl font-semibold text-gray-900">
                  {booking.totalDays || "N/A"}
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-500">Total Amount</div>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(booking.totalAmount)}
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t">
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-700">
                  Payment Status:
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    booking.paymentStatus === "paid"
                      ? "bg-green-100 text-green-800"
                      : booking.paymentStatus === "pending"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {booking.paymentStatus || "Pending"}
                </span>
              </div>
            </div>
          </div>

          {/* Owner Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Vehicle Owner
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <div className="text-sm text-gray-500">Name</div>
                <div className="font-medium text-gray-900">
                  {booking.owner?.name}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Email</div>
                <div className="font-medium text-gray-900">
                  {booking.owner?.email}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Phone</div>
                <div className="font-medium text-gray-900">
                  {booking.owner?.phone || "N/A"}
                </div>
              </div>
            </div>
          </div>

          {/* Booking Timeline */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Booking Timeline
            </h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                <span className="text-sm text-gray-600">
                  Booking Created:{" "}
                  {new Date(booking.createdAt).toLocaleString()}
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                <span className="text-sm text-gray-600">
                  Last Updated: {new Date(booking.updatedAt).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </>
  );
};

export default BookingDetail;
