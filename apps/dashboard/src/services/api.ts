import axios from "axios";

export const getAPIUrl = () => {
  if (typeof window === "undefined") return "http://localhost:3000";
  const host = window.location.hostname;
  // Production domains → Railway backend
  if (host === "gurusolucionesrd.com" || host === "www.gurusolucionesrd.com" || host.includes("netlify.app")) {
    return "https://guruweb-backend-production.up.railway.app";
  }
  // Tailscale / remote LAN access
  if (host === "100.87.41.106") {
    return "http://100.87.41.106:3000";
  }
  // Local
  return "http://localhost:3000";
};

const API_URL = import.meta.env.VITE_API_URL || (getAPIUrl() + "/api");

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Send HttpOnly cookies cross-origin
});

// Request interceptor: prefer HttpOnly cookie, fallback to localStorage token
api.interceptors.request.use(
  (config) => {
    // The browser sends the HttpOnly cookie automatically (withCredentials: true).
    // We keep the localStorage fallback for backward-compat during transition.
    const token = localStorage.getItem("token");
    if (token) {
      // Axios 1.x uses AxiosHeaders — use .set() to be safe
      config.headers.set("Authorization", `Bearer ${token}`);
    }
    // DEBUG: remove after auth is stable
    if (import.meta.env.DEV && config.url?.includes("/auth/me")) {
      const authHeader = config.headers.get("Authorization");
      console.log("[api] /auth/me — token present:", !!token, "header:", typeof authHeader === "string" ? authHeader.slice(0, 30) + "..." : "none");
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      // Don't hard-redirect here — that breaks public pages like /.
      // ProtectedRoute already handles redirecting for protected routes.
    }
    return Promise.reject(error);
  },
);

export const authAPI = {
  login: (email: string, password: string) =>
    api.post("/auth/login", { email, password }),

  logout: () => api.post("/auth/logout"),

  getCurrentUser: () => api.get("/auth/me"),
};
export const servicesAPI = {
  getServices: (startDate?: string, endDate?: string) =>
    api.get("/services", { params: { startDate, endDate } }),

  createService: (data: {
    username: string;
    serviceName: string;
    client?: string;
    earnings: number;
    date?: string;
  }) => api.post("/services", data), // Removed 'time' from interface

  getUserStats: (userId?: number) =>
    api.get(`/services/stats/user/${userId || ""}`),

  getAdminStats: () => api.get("/services/stats/admin"),

  deleteService: (id: number) => api.delete(`/services/${id}`),

  updateComment: (id: number, comment: string) =>
    api.put(`/services/${id}/comment`, { comment }),
};

export const serviceCatalogAPI = {
  getAll: () => api.get("/services"),
  getCategories: () => api.get("/services/categories/list"),
  create: (data: any) => api.post("/services", data),
  update: (id: number, data: any) => api.put(`/services/${id}`, data),
  delete: (id: number) => api.delete(`/services/${id}`),
  calculate: (data: { serviceId: number; assetValue?: number; quantity?: number }) =>
    api.post("/services/calculate", data),
};

export const settingsAPI = {
  getCurrentPercentage: () => api.get("/settings/current"),

  getPercentageForDate: (date?: string) =>
    api.get("/settings/percentage", { params: { date } }),

  getHistory: () => api.get("/settings/history"),

  updateEmployeePercentage: (percentage: number, effectiveDate: string) =>
    api.post("/settings/percentage", { percentage, effectiveDate }),

  deleteSetting: (id: number) => api.delete(`/settings/${id}`),
};

export default api;
