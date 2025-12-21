import axios, { AxiosInstance } from "axios";

const API_URL =
  (import.meta as any).env?.VITE_API_URL || "http://localhost:5000/api";

const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");
        const response = await axios.post(`${API_URL}/auth/refresh-token`, {
          refreshToken,
        });

        const { accessToken } = response.data.data;
        localStorage.setItem("accessToken", accessToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch {
        localStorage.clear();
        window.location.href = "/login";
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

// API functions
export const authAPI = {
  login: (data: { email: string; password: string }) =>
    api.post("/auth/login", data),

  logout: () => api.post("/auth/logout"),

  getProfile: () => api.get("/auth/profile"),
};

export const adminAPI = {
  getDashboard: () => api.get("/admin/dashboard"),

  // Users
  getAllUsers: (params?: any) => api.get("/admin/users", { params }),
  createUser: (data: any) => api.post("/admin/users", data),
  updateUser: (id: string, data: any) => api.put(`/admin/users/${id}`, data),
  deleteUser: (id: string) => api.delete(`/admin/users/${id}`),

  // Vehicles
  getAllVehicles: (params?: any) => api.get("/admin/vehicles", { params }),
  createVehicle: (data: any) => api.post("/admin/vehicles", data),
  updateVehicle: (id: string, data: any) =>
    api.put(`/admin/vehicles/${id}`, data),
  deleteVehicle: (id: string) => api.delete(`/admin/vehicles/${id}`),

  // Bookings
  getAllBookings: (params?: any) => api.get("/admin/bookings", { params }),
  updateBooking: (id: string, data: any) =>
    api.put(`/admin/bookings/${id}`, data),
  deleteBooking: (id: string) => api.delete(`/admin/bookings/${id}`),

  // Trips
  getAllTrips: (params?: any) => api.get("/admin/trips", { params }),
  updateTrip: (id: string, data: any) => api.put(`/admin/trips/${id}`, data),
  deleteTrip: (id: string) => api.delete(`/admin/trips/${id}`),
};

export default api;
