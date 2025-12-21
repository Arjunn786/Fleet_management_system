import { useState, useEffect, useMemo, memo } from "react";
import {
  FaUsers,
  FaCar,
  FaBook,
  FaRoute,
  FaChartLine,
  FaDollarSign,
} from "react-icons/fa";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import Layout from "@/components/Layout";
import { adminAPI } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import toast from "react-hot-toast";

interface DashboardData {
  overview: {
    totalVehicles: number;
    totalDrivers: number;
    totalCustomers: number;
    totalTrips: number;
    completedTrips: number;
    cancelledTrips: number;
    activeBookings: number;
    totalRevenue: number;
  };
  monthlyRevenue: any[];
  vehicleTypeStats: any[];
  recentBookings: any[];
}

// Memoized stat card component
const StatCard = memo(({ icon: Icon, label, value, color, trend }: any) => (
  <div className="card p-6">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-gray-400 text-sm mb-1">{label}</p>
        <p className="text-3xl font-bold">{value}</p>
        {trend && (
          <div
            className={`flex items-center gap-1 mt-2 text-sm ${
              trend > 0 ? "text-green-500" : "text-red-500"
            }`}
          >
            <FaChartLine className={trend < 0 ? "rotate-180" : ""} />
            <span>{Math.abs(trend)}% from last month</span>
          </div>
        )}
      </div>
      <div
        className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center`}
      >
        <Icon className="text-white text-xl" />
      </div>
    </div>
  </div>
));

StatCard.displayName = "StatCard";

const COLORS = ["#667eea", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await adminAPI.getDashboard();
      console.log("Dashboard response:", response.data);
      setData(response.data.data);
    } catch (error: any) {
      console.error("Dashboard error:", error);
      toast.error(
        error.response?.data?.message || "Failed to load dashboard data"
      );
    } finally {
      setLoading(false);
    }
  };

  const stats = useMemo(() => {
    if (!data || !data.overview) return [];

    return [
      {
        icon: FaUsers,
        label: "Total Users",
        value:
          (data.overview.totalCustomers || 0) +
          (data.overview.totalDrivers || 0),
        color: "bg-blue-500",
        trend: 12,
      },
      {
        icon: FaCar,
        label: "Total Vehicles",
        value: data.overview.totalVehicles || 0,
        color: "bg-green-500",
        trend: 8,
      },
      {
        icon: FaBook,
        label: "Total Bookings",
        value: data.overview.activeBookings || 0,
        color: "bg-purple-500",
        trend: 15,
      },
      {
        icon: FaRoute,
        label: "Total Trips",
        value: data.overview.totalTrips || 0,
        color: "bg-indigo-500",
        trend: 10,
      },
      {
        icon: FaDollarSign,
        label: "Total Revenue",
        value: formatCurrency(data.overview.totalRevenue || 0),
        color: "bg-primary-500",
        trend: 20,
      },
      {
        icon: FaBook,
        label: "Active Bookings",
        value: data.overview.activeBookings || 0,
        color: "bg-orange-500",
      },
    ];
  }, [data]);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-96">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-gray-400">
            Overview of your fleet management system
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stats.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Revenue Chart */}
          {data?.monthlyRevenue && data.monthlyRevenue.length > 0 && (
            <div className="card p-6">
              <h3 className="text-xl font-bold mb-4">Revenue Overview</h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={data.monthlyRevenue}>
                  <defs>
                    <linearGradient
                      id="colorRevenue"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#667eea" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#667eea" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="month" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1e293b",
                      border: "1px solid #334155",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#667eea"
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* User Distribution */}
          {data?.overview && (
            <div className="card p-6">
              <h3 className="text-xl font-bold mb-4">User Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={[
                      {
                        name: "Customers",
                        value: data.overview.totalCustomers || 0,
                      },
                      {
                        name: "Drivers",
                        value: data.overview.totalDrivers || 0,
                      },
                    ]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {[
                      {
                        name: "Customers",
                        value: data.overview.totalCustomers || 0,
                      },
                      {
                        name: "Drivers",
                        value: data.overview.totalDrivers || 0,
                      },
                    ].map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1e293b",
                      border: "1px solid #334155",
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Vehicle Types */}
          {data?.vehicleTypeStats && data.vehicleTypeStats.length > 0 && (
            <div className="card p-6">
              <h3 className="text-xl font-bold mb-4">Vehicle Types</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={data.vehicleTypeStats.map((v: any) => ({
                    type: v._id,
                    count: v.count,
                  }))}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="status" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1e293b",
                      border: "1px solid #334155",
                    }}
                  />
                  <Bar dataKey="count" fill="#667eea" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Recent Activity */}
          <div className="card p-6">
            <h3 className="text-xl font-bold mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {data?.overview ? (
                data.recentBookings && data.recentBookings.length > 0 ? (
                  data.recentBookings.slice(0, 5).map((booking: any) => (
                    <div
                      key={booking._id}
                      className="flex items-center justify-between p-3 bg-dark-800 rounded-lg"
                    >
                      <div>
                        <p className="font-semibold">
                          {booking.customer?.name}
                        </p>
                        <p className="text-sm text-gray-400">
                          {booking.vehicle?.make} {booking.vehicle?.model}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-primary-500">
                          {formatCurrency(booking.totalAmount)}
                        </p>
                        <span
                          className={`badge ${
                            booking.status === "confirmed"
                              ? "bg-green-500"
                              : "bg-yellow-500"
                          }`}
                        >
                          {booking.status}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 text-center py-8">
                    No recent bookings
                  </p>
                )
              ) : (
                <p className="text-gray-400 text-center py-8">
                  No recent bookings
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
