import Head from "next/head";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  FaCar,
  FaDollarSign,
  FaHistory,
  FaBan,
  FaChartLine,
  FaPlus,
} from "react-icons/fa";
import DashboardLayout from "@/components/DashboardLayout";
import { analyticsAPI, vehiclesAPI } from "@/lib/api";
import { formatCurrency, getStatusBadgeClass } from "@/lib/utils";

export default function OwnerDashboard() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [analyticsRes, vehiclesRes] = await Promise.all([
        analyticsAPI.getOwnerAnalytics(),
        vehiclesAPI.getMyVehicles(),
      ]);

      setAnalytics(analyticsRes.data.data.overview);
      setVehicles(vehiclesRes.data.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout role="owner">
        <div className="flex items-center justify-center h-96">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  const stats = [
    {
      title: "Total Vehicles",
      value: analytics?.totalVehicles || 0,
      icon: <FaCar className="text-3xl" />,
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      title: "Total Revenue",
      value: formatCurrency(analytics?.totalRevenue || 0),
      icon: <FaDollarSign className="text-3xl" />,
      gradient: "from-green-500 to-emerald-500",
    },
    {
      title: "Total Bookings",
      value: analytics?.totalBookings || 0,
      icon: <FaHistory className="text-3xl" />,
      gradient: "from-purple-500 to-pink-500",
    },
    {
      title: "Completed Trips",
      value: analytics?.completedTrips || 0,
      icon: <FaChartLine className="text-3xl" />,
      gradient: "from-indigo-500 to-purple-500",
    },
  ];

  return (
    <>
      <Head>
        <title>Owner Dashboard - FleetHub</title>
      </Head>

      <DashboardLayout role="owner">
        <div className="space-y-6">
          {/* Welcome Section */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Fleet Overview 💼</h1>
              <p className="text-gray-400">
                Manage your vehicles and track your business performance.
              </p>
            </div>
            <Link
              href="/dashboard/owner/vehicles/create"
              className="btn btn-primary flex items-center gap-2"
            >
              <FaPlus />
              Add Vehicle
            </Link>
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

          {/* Additional Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card p-6">
              <h3 className="text-lg font-semibold mb-4">Cancellations</h3>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center">
                  <FaBan className="text-red-500 text-xl" />
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {analytics?.totalCancellations || 0}
                  </div>
                  <div className="text-sm text-gray-400">
                    Total Cancellations
                  </div>
                </div>
              </div>
            </div>

            <div className="card p-6">
              <h3 className="text-lg font-semibold mb-4">Average Revenue</h3>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <FaDollarSign className="text-green-500 text-xl" />
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {formatCurrency(
                      analytics?.completedTrips > 0
                        ? analytics.totalRevenue / analytics.completedTrips
                        : 0
                    )}
                  </div>
                  <div className="text-sm text-gray-400">Per Trip</div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card p-6">
            <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link
                href="/dashboard/owner/vehicles/create"
                className="btn btn-primary"
              >
                Add New Vehicle
              </Link>
              <Link href="/dashboard/owner/trips" className="btn btn-outline">
                View Trip History
              </Link>
              <Link
                href="/dashboard/owner/analytics"
                className="btn btn-outline"
              >
                Detailed Analytics
              </Link>
            </div>
          </div>

          {/* My Vehicles */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">My Vehicles</h2>
              <Link
                href="/dashboard/owner/vehicles"
                className="text-primary-500 hover:text-primary-400"
              >
                View All
              </Link>
            </div>

            {vehicles.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {vehicles.slice(0, 6).map((vehicle) => (
                  <Link
                    key={vehicle._id}
                    href={`/dashboard/owner/vehicles/${vehicle._id}`}
                    className="card-hover p-4"
                  >
                    <div className="aspect-video bg-dark-700 rounded-lg mb-3 flex items-center justify-center">
                      <FaCar className="text-primary-500 text-4xl" />
                    </div>
                    <div className="font-semibold mb-1">
                      {vehicle.make} {vehicle.model}
                    </div>
                    <div className="text-sm text-gray-400 mb-2">
                      {vehicle.registrationNumber}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-primary-500">
                        {formatCurrency(vehicle.pricePerDay)}/day
                      </span>
                      <span
                        className={getStatusBadgeClass(vehicle.availability)}
                      >
                        {vehicle.availability}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-400">
                <FaCar className="text-5xl mx-auto mb-4 opacity-50" />
                <p className="mb-4">No vehicles added yet</p>
                <Link
                  href="/dashboard/owner/vehicles/create"
                  className="btn btn-primary inline-block"
                >
                  Add Your First Vehicle
                </Link>
              </div>
            )}
          </div>
        </div>
      </DashboardLayout>
    </>
  );
}
