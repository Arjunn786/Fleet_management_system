import { Navigate } from "react-router-dom";
import { memo, ReactNode } from "react";

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = memo(({ children }: ProtectedRouteProps) => {
  const token = localStorage.getItem("accessToken");
  const user = localStorage.getItem("user");

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  try {
    const userData = JSON.parse(user);
    if (userData.role !== "admin") {
      return <Navigate to="/login" replace />;
    }
  } catch {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
});

ProtectedRoute.displayName = "ProtectedRoute";

export default ProtectedRoute;
