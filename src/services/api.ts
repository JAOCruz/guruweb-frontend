import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  // Send HttpOnly cookies to the backend for cross-origin auth
  withCredentials: true,
});

// Request interceptor to add token (fallback when cookie is not present)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
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
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export const authAPI = {
  login: (username: string, password: string, rememberMe = false) =>
    api.post("/auth/login", { username, password, rememberMe }),

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

export const casesAPI = {
  getCases: (params?: { case_type?: string; status?: string; client_id?: number }) =>
    api.get("/cases", { params }),

  getCase: (id: number) => api.get(`/cases/${id}`),

  createCase: (data: any) => api.post("/cases", data),

  updateCase: (id: number, data: any) => api.put(`/cases/${id}`, data),

  changeStatus: (id: number, status: string, notes?: string) =>
    api.post(`/cases/${id}/status`, { status, notes }),

  getStatusHistory: (id: number) => api.get(`/cases/${id}/status-history`),

  scheduleReminder: (id: number, reminderType: string, scheduledAt: string) =>
    api.post(`/cases/${id}/reminder`, { reminder_type: reminderType, scheduled_at: scheduledAt }),
};

export default api;
