import Head from "next/head";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  FaCar,
  FaRoute,
  FaDollarSign,
  FaStar,
  FaMapMarkerAlt,
} from "react-icons/fa";
import DashboardLayout from "@/components/DashboardLayout";
import { analyticsAPI, tripsAPI } from "@/lib/api";
import { formatCurrency, getStatusBadgeClass, formatDate } from "@/lib/utils";

export default function DriverDashboard() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [recentTrips, setRecentTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [analyticsRes, tripsRes] = await Promise.all([
        analyticsAPI.getDriverAnalytics(),
        tripsAPI.getAll({ page: 1, limit: 5 }),
      ]);

      setAnalytics(analyticsRes.data.data.overview);
      setRecentTrips(tripsRes.data.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout role="driver">
        <div className="flex items-center justify-center h-96">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  const stats = [
    {
      title: "Total Trips",
      value: analytics?.totalTrips || 0,
      icon: <FaCar className="text-3xl" />,
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      title: "Completed Trips",
      value: analytics?.completedTrips || 0,
      icon: <FaRoute className="text-3xl" />,
      gradient: "from-green-500 to-emerald-500",
    },
    {
      title: "Total Earnings",
      value: formatCurrency(analytics?.totalEarnings || 0),
      icon: <FaDollarSign className="text-3xl" />,
      gradient: "from-purple-500 to-pink-500",
    },
    {
      title: "Average Rating",
      value: analytics?.avgRating || "0.00",
      icon: <FaStar className="text-3xl" />,
      gradient: "from-yellow-500 to-orange-500",
    },
  ];

  return (
    <>
      <Head>
        <title>Driver Dashboard - FleetHub</title>
      </Head>

      <DashboardLayout role="driver">
        <div className="space-y-6">
          {/* Welcome Section */}
          <div>
            <h1 className="text-3xl font-bold mb-2">Driver Dashboard 🚗</h1>
            <p className="text-gray-400">
              Manage your trips and track your earnings.
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

          {/* Performance Summary */}
          {analytics?.totalDistance && (
            <div className="card p-6">
              <h2 className="text-xl font-bold mb-4">Performance Summary</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <FaMapMarkerAlt className="text-primary-500 text-xl" />
                    <span className="text-gray-400">Total Distance</span>
                  </div>
                  <div className="text-2xl font-bold">
                    {analytics.totalDistance} km
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <FaStar className="text-yellow-500 text-xl" />
                    <span className="text-gray-400">Rating</span>
                  </div>
                  <div className="text-2xl font-bold">
                    {analytics.avgRating} / 5.0
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <FaDollarSign className="text-green-500 text-xl" />
                    <span className="text-gray-400">Avg per Trip</span>
                  </div>
                  <div className="text-2xl font-bold">
                    {formatCurrency(
                      analytics.completedTrips > 0
                        ? analytics.totalEarnings / analytics.completedTrips
                        : 0
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="card p-6">
            <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link
                href="/dashboard/driver/vehicles"
                className="btn btn-primary"
              >
                Register for Vehicle
              </Link>
              <Link href="/dashboard/driver/trips" className="btn btn-outline">
                View My Trips
              </Link>
              <Link
                href="/dashboard/driver/assignments"
                className="btn btn-outline"
              >
                My Assignments
              </Link>
            </div>
          </div>

          {/* Recent Trips */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Recent Trips</h2>
              <Link
                href="/dashboard/driver/trips"
                className="text-primary-500 hover:text-primary-400"
              >
                View All
              </Link>
            </div>

            {recentTrips.length > 0 ? (
              <div className="space-y-4">
                {recentTrips.map((trip) => (
                  <div
                    key={trip._id}
                    className="flex items-center justify-between p-4 bg-dark-900 rounded-lg hover:bg-dark-800 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-dark-700 rounded-lg flex items-center justify-center">
                        <FaCar className="text-primary-500 text-2xl" />
                      </div>
                      <div>
                        <div className="font-semibold">
                          {trip.vehicle?.make} {trip.vehicle?.model}
                        </div>
                        <div className="text-sm text-gray-400">
                          Customer: {trip.customer?.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {trip.startedAt
                            ? formatDate(trip.startedAt)
                            : "Not started"}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold mb-1">
                        {formatCurrency(trip.revenue || 0)}
                      </div>
                      <span className={getStatusBadgeClass(trip.status)}>
                        {trip.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-400">
                <FaRoute className="text-5xl mx-auto mb-4 opacity-50" />
                <p>No trips assigned yet</p>
              </div>
            )}
          </div>
        </div>
      </DashboardLayout>
    </>
  );
}
