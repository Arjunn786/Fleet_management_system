import Head from "next/head";
import Link from "next/link";
import { useEffect, useState } from "react";
import { FaCar, FaHistory, FaDollarSign, FaBan, FaStar } from "react-icons/fa";
import DashboardLayout from "@/components/DashboardLayout";
import { analyticsAPI, bookingsAPI } from "@/lib/api";
import { formatCurrency, getStatusBadgeClass, formatDate } from "@/lib/utils";

export default function CustomerDashboard() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [analyticsRes, bookingsRes] = await Promise.all([
        analyticsAPI.getCustomerAnalytics(),
        bookingsAPI.getMyBookings(),
      ]);

      setAnalytics(analyticsRes.data.data.overview);
      setRecentBookings(bookingsRes.data.data.slice(0, 5));
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
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

  const stats = [
    {
      title: "Total Bookings",
      value: analytics?.totalBookings || 0,
      icon: <FaCar className="text-3xl" />,
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      title: "Completed Trips",
      value: analytics?.completedBookings || 0,
      icon: <FaHistory className="text-3xl" />,
      gradient: "from-green-500 to-emerald-500",
    },
    {
      title: "Total Spent",
      value: formatCurrency(analytics?.totalSpent || 0),
      icon: <FaDollarSign className="text-3xl" />,
      gradient: "from-purple-500 to-pink-500",
    },
    {
      title: "Cancelled",
      value: analytics?.cancelledBookings || 0,
      icon: <FaBan className="text-3xl" />,
      gradient: "from-red-500 to-orange-500",
    },
  ];

  return (
    <>
      <Head>
        <title>Customer Dashboard - FleetHub</title>
      </Head>

      <DashboardLayout role="customer">
        <div className="space-y-6">
          {/* Welcome Section */}
          <div>
            <h1 className="text-3xl font-bold mb-2">Welcome Back! 👋</h1>
            <p className="text-gray-400">
              Here's what's happening with your bookings today.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div key={index} className="card-hover p-6">
                <div
                  className={`w-14 h-14 rounded-lg bg-gradient-to-br ${stat.gradient} flex items-center justify-center text-white mb-4`}
                >
                  {stat.icon}
                </div>
                <div className="text-2xl font-bold mb-1">{stat.value}</div>
                <div className="text-gray-400 text-sm">{stat.title}</div>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="card p-6">
            <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link
                href="/dashboard/customer/vehicles"
                className="btn btn-primary flex items-center justify-center gap-2"
              >
                <FaCar />
                Browse Vehicles
              </Link>
              <Link
                href="/dashboard/customer/bookings"
                className="btn btn-outline flex items-center justify-center gap-2"
              >
                <FaHistory />
                View Booking History
              </Link>
            </div>
          </div>

          {/* Favorite Vehicle Type */}
          {analytics?.favoriteVehicleType && (
            <div className="card p-6">
              <h2 className="text-xl font-bold mb-4">Your Preferences</h2>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center">
                  <FaStar className="text-white text-xl" />
                </div>
                <div>
                  <div className="text-sm text-gray-400">
                    Favorite Vehicle Type
                  </div>
                  <div className="text-lg font-semibold capitalize">
                    {analytics.favoriteVehicleType}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Recent Bookings */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Recent Bookings</h2>
              <Link
                href="/dashboard/customer/bookings"
                className="text-primary-500 hover:text-primary-400"
              >
                View All
              </Link>
            </div>

            {recentBookings.length > 0 ? (
              <div className="space-y-4">
                {recentBookings.map((booking) => (
                  <div
                    key={booking._id}
                    className="flex items-center justify-between p-4 bg-dark-900 rounded-lg hover:bg-dark-800 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-dark-700 rounded-lg flex items-center justify-center">
                        <FaCar className="text-primary-500 text-2xl" />
                      </div>
                      <div>
                        <div className="font-semibold">
                          {booking.vehicle?.make} {booking.vehicle?.model}
                        </div>
                        <div className="text-sm text-gray-400">
                          {formatDate(booking.startDate)} -{" "}
                          {formatDate(booking.endDate)}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold mb-1">
                        {formatCurrency(booking.pricing.totalPrice)}
                      </div>
                      <span className={getStatusBadgeClass(booking.status)}>
                        {booking.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-400">
                <FaHistory className="text-5xl mx-auto mb-4 opacity-50" />
                <p>No bookings yet</p>
                <Link
                  href="/dashboard/customer/vehicles"
                  className="btn btn-primary mt-4 inline-block"
                >
                  Browse Vehicles
                </Link>
              </div>
            )}
          </div>
        </div>
      </DashboardLayout>
    </>
  );
}
