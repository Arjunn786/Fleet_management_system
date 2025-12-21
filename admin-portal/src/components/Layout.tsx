import { memo, ReactNode, useCallback } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  FaHome,
  FaUsers,
  FaCar,
  FaBook,
  FaRoute,
  FaSignOutAlt,
} from "react-icons/fa";
import toast from "react-hot-toast";
import { authAPI } from "@/lib/api";

interface LayoutProps {
  children: ReactNode;
}

const navItems = [
  { to: "/", label: "Dashboard", icon: FaHome },
  { to: "/users", label: "Users", icon: FaUsers },
  { to: "/vehicles", label: "Vehicles", icon: FaCar },
  { to: "/bookings", label: "Bookings", icon: FaBook },
  { to: "/trips", label: "Trips", icon: FaRoute },
];

const Layout = memo(({ children }: LayoutProps) => {
  const navigate = useNavigate();

  const handleLogout = useCallback(async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.clear();
      navigate("/login");
      toast.success("Logged out successfully");
    }
  }, [navigate]);

  return (
    <div className="flex h-screen bg-dark-950">
      {/* Sidebar */}
      <aside className="w-64 bg-dark-900 border-r border-dark-800 flex flex-col">
        <div className="p-6 border-b border-dark-800">
          <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            FleetHub
          </h1>
          <p className="text-sm text-gray-400 mt-1">Admin Portal</p>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? "sidebar-link-active" : ""}`
              }
            >
              <item.icon />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-dark-800">
          <button
            onClick={handleLogout}
            className="sidebar-link w-full text-red-400 hover:text-red-300"
          >
            <FaSignOutAlt />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
});

Layout.displayName = "Layout";

export default Layout;
