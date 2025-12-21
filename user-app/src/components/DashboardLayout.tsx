import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  FaHome,
  FaCar,
  FaHistory,
  FaUser,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaChartLine,
} from "react-icons/fa";
import toast from "react-hot-toast";

interface DashboardLayoutProps {
  children: ReactNode;
  role?: "customer" | "driver" | "owner";
}

export default function DashboardLayout({
  children,
  role,
}: DashboardLayoutProps) {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem("accessToken");
    const userData = localStorage.getItem("user");

    if (!token || !userData) {
      router.push("/login");
      return;
    }

    try {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);

      // If role is specified and doesn't match user role, redirect
      if (role && parsedUser.role !== role) {
        toast.error("Unauthorized access");
        router.push(`/dashboard/${parsedUser.role}`);
      }
    } catch (error) {
      console.error("Error parsing user data:", error);
      router.push("/login");
    }
  }, [role, router]);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    toast.success("Logged out successfully");
    router.push("/login");
  };

  const getNavItems = () => {
    const userRole = role || user?.role;
    const baseItems = [
      { href: `/dashboard/${userRole}`, icon: <FaHome />, label: "Dashboard" },
    ];

    if (userRole === "customer") {
      return [
        ...baseItems,
        {
          href: `/dashboard/customer/vehicles`,
          icon: <FaCar />,
          label: "Browse Vehicles",
        },
        {
          href: `/dashboard/customer/bookings`,
          icon: <FaHistory />,
          label: "My Bookings",
        },
        {
          href: `/dashboard/customer/profile`,
          icon: <FaUser />,
          label: "Profile",
        },
      ];
    }

    if (userRole === "driver") {
      return [
        ...baseItems,
        {
          href: `/dashboard/driver/vehicles`,
          icon: <FaCar />,
          label: "Assigned Vehicles",
        },
        {
          href: `/dashboard/driver/trips`,
          icon: <FaHistory />,
          label: "My Trips",
        },
        {
          href: `/dashboard/driver/assignments`,
          icon: <FaChartLine />,
          label: "Assignments",
        },
        {
          href: `/dashboard/driver/profile`,
          icon: <FaUser />,
          label: "Profile",
        },
      ];
    }

    if (userRole === "owner") {
      return [
        ...baseItems,
        {
          href: `/dashboard/owner/vehicles`,
          icon: <FaCar />,
          label: "My Vehicles",
        },
        {
          href: `/dashboard/owner/bookings`,
          icon: <FaHistory />,
          label: "Bookings",
        },
        { href: `/dashboard/owner/trips`, icon: <FaHistory />, label: "Trips" },
        {
          href: `/dashboard/owner/driver-assignments`,
          icon: <FaChartLine />,
          label: "Driver Assignments",
        },
        {
          href: `/dashboard/owner/profile`,
          icon: <FaUser />,
          label: "Profile",
        },
      ];
    }

    return baseItems;
  };

  const navItems = getNavItems();

  if (!user) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-950">
      {/* Top Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-dark-900/80 backdrop-blur-lg border-b border-dark-800">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden text-gray-400 hover:text-white"
              >
                {sidebarOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
              </button>
              <Link href="/" className="text-2xl font-bold gradient-text">
                FleetHub
              </Link>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden md:block text-right">
                <div className="text-sm font-medium text-white">
                  {user.name}
                </div>
                <div className="text-xs text-gray-400 capitalize">
                  {user.role}
                </div>
              </div>
              <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center text-white font-bold">
                {user.name.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex pt-16">
        {/* Sidebar */}
        <aside
          className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-dark-900 border-r border-dark-800 transform transition-transform duration-300 ease-in-out ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          } mt-16 lg:mt-0`}
        >
          <div className="flex flex-col h-[calc(100vh-4rem)]">
            <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
              {navItems.map((item) => {
                const isActive = router.pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                      isActive
                        ? "bg-gradient-primary text-white shadow-lg"
                        : "text-gray-400 hover:bg-dark-800 hover:text-white"
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="p-4 border-t border-dark-800">
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-3 w-full text-gray-400 hover:bg-dark-800 hover:text-white rounded-lg transition-all"
              >
                <FaSignOutAlt />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-x-hidden">
          <div className="p-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {children}
            </motion.div>
          </div>
        </main>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
