import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// -----------------------------
// Request interceptor
// -----------------------------
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("accessToken");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// -----------------------------
// Response interceptor (FIXED)
// -----------------------------
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    const isAuthRoute =
      originalRequest?.url?.includes("/auth/login") ||
      originalRequest?.url?.includes("/auth/register") ||
      originalRequest?.url?.includes("/auth/refresh");

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isAuthRoute
    ) {
      const refreshToken = localStorage.getItem("refreshToken");

      // If no refresh token → do NOT try refresh
      if (!refreshToken) {
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      try {
        const response = await axios.post(
          `${API_URL}/auth/refresh`,
          { refreshToken }
        );

        const { accessToken } = response.data.data;
        localStorage.setItem("accessToken", accessToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed → logout
        if (typeof window !== "undefined") {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;

// -----------------------------
// Auth API
// -----------------------------
export const authAPI = {
  login: (credentials: { email: string; password: string }) =>
    api.post("/auth/login", credentials),

  register: (userData: any) => api.post("/auth/register", userData),

  logout: () => api.post("/auth/logout"),

  getMe: () => api.get("/auth/me"),

  updateDetails: (data: any) => api.put("/auth/updatedetails", data),

  updatePassword: (data: {
    currentPassword: string;
    newPassword: string;
  }) => api.put("/auth/updatepassword", data),
};

// -----------------------------
// Vehicles API
// -----------------------------
export const vehiclesAPI = {
  getAll: (params?: any) => api.get("/vehicles", { params }),

  getById: (id: string) => api.get(`/vehicles/${id}`),

  create: (data: any) => api.post("/vehicles", data),

  update: (id: string, data: any) =>
    api.put(`/vehicles/${id}`, data),

  delete: (id: string) =>
    api.delete(`/vehicles/${id}`),

  getMyVehicles: () => api.get("/vehicles/my/vehicles"),

  updateAvailability: (id: string, availability: string) =>
    api.patch(`/vehicles/${id}/availability`, { availability }),
};

// -----------------------------
// Bookings API
// -----------------------------
export const bookingsAPI = {
  getAll: (params?: any) => api.get("/bookings", { params }),

  getById: (id: string) => api.get(`/bookings/${id}`),

  create: (data: any) => api.post("/bookings", data),

  updateStatus: (id: string, status: string) =>
    api.patch(`/bookings/${id}/status`, { status }),

  cancel: (id: string, reason?: string) =>
    api.post(`/bookings/${id}/cancel`, { reason }),

  getMyBookings: () => api.get("/bookings/my/history"),
};

// -----------------------------
// Trips API
// -----------------------------
export const tripsAPI = {
  getAll: (params?: any) => api.get("/trips", { params }),

  getById: (id: string) => api.get(`/trips/${id}`),

  updateStatus: (id: string, data: any) =>
    api.patch(`/trips/${id}/status`, data),

  assignDriver: (id: string, driverId: string) =>
    api.patch(`/trips/${id}/assign-driver`, { driverId }),

  addReview: (id: string, data: any) =>
    api.post(`/trips/${id}/review`, data),

  reportIssue: (id: string, description: string) =>
    api.post(`/trips/${id}/issues`, { description }),
};

// -----------------------------
// Drivers API
// -----------------------------
export const driversAPI = {
  getAvailableVehicles: () =>
    api.get("/drivers/available-vehicles"),

  register: (data: { vehicleId: string; notes?: string }) =>
    api.post("/drivers/register", data),

  getMyAssignments: () =>
    api.get("/drivers/my-assignments"),

  getAll: (params?: any) =>
    api.get("/drivers", { params }),

  getAllAssignments: (params?: any) =>
    api.get("/drivers/assignments", { params }),

  reviewAssignment: (
    id: string,
    status: "approved" | "rejected"
  ) =>
    api.patch(`/drivers/assignments/${id}/review`, { status }),

  updateAssignmentStatus: (
    id: string,
    status: "active" | "inactive"
  ) =>
    api.patch(`/drivers/assignments/${id}/status`, { status }),
};

// -----------------------------
// Analytics API
// -----------------------------
export const analyticsAPI = {
  getOwnerAnalytics: () => api.get("/analytics/owner"),

  getDriverAnalytics: () => api.get("/analytics/driver"),

  getCustomerAnalytics: () =>
    api.get("/analytics/customer"),
};

// -----------------------------
// Admin API
// -----------------------------
export const adminAPI = {
  getDashboard: () => api.get("/admin/dashboard"),

  getUsers: (params?: any) =>
    api.get("/admin/users", { params }),

  deleteUser: (id: string) =>
    api.delete(`/admin/users/${id}`),

  updateUserRole: (id: string, role: string) =>
    api.patch(`/admin/users/${id}/role`, { role }),

  getVehicles: (params?: any) =>
    api.get("/admin/vehicles", { params }),

  deleteVehicle: (id: string) =>
    api.delete(`/admin/vehicles/${id}`),

  getTrips: (params?: any) =>
    api.get("/admin/trips", { params }),

  deleteTrip: (id: string) =>
    api.delete(`/admin/trips/${id}`),
};
