import axios from "axios";

const BOT_API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

const botApi = axios.create({
  baseURL: BOT_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add dashboard auth token
botApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor — clear token on 401
botApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

// ─── Types ─────────────────────────────────────────────────────────────────

export type BotMode = "all" | "selected";
export type AssignmentMode = "manual" | "automatic";

export interface BotStatus {
  sessionId: string;
  connected: boolean;
  botActive: boolean;
  botMode: BotMode;
  assignmentMode: AssignmentMode;
}

export interface BotMessage {
  id: string;
  phone: string;
  name?: string;
  client_name?: string;
  lastMessage: string;
  timestamp: string;
  botActive: boolean;
  enabled?: boolean; // for "selected" mode
  profile_pic_url?: string | null;
}

export interface BotClient {
  id: string;
  name?: string;
  phone: string;
  joinedAt: string;
  messageCount: number;
}

// ─── API Methods ────────────────────────────────────────────────────────────

export const botAPI = {
  /** Get current WhatsApp bot status */
  getStatus: () => botApi.get<BotStatus>("/whatsapp/status"),

  /** Initiate WhatsApp connection (triggers QR generation) */
  connect: () => botApi.post("/whatsapp/connect"),

  /** Get current QR code string */
  getQR: () => botApi.get<{ qr: string | null; status?: string; message?: string }>("/whatsapp/qr"),

  /** Disconnect the WhatsApp session */
  disconnect: () => botApi.post("/whatsapp/disconnect"),

  /** Toggle bot paused/active */
  toggleBot: () => botApi.post("/whatsapp/bot-toggle"),

  /** Set bot mode: 'all' responds to everyone, 'selected' only to enabled contacts */
  setBotMode: (mode: BotMode) => botApi.post("/whatsapp/bot-mode", { mode }),

  /** Set assignment mode: 'manual' or 'automatic' */
  setAssignmentMode: (mode: AssignmentMode) =>
    botApi.post("/whatsapp/assignment-mode", { mode }),

  /** Get list of conversations with last message info */
  getMessages: () => botApi.get<{ conversations: BotMessage[] }>("/messages/conversations"),

  /** Search conversations by content */
  searchMessages: (q: string) =>
    botApi.get<{ conversations: BotMessage[] }>("/messages/search", { params: { q } }),

  /** Get list of known clients */
  getClients: () => botApi.get<{ clients: BotClient[] }>("/clients"),

  /** Toggle individual contact bot mode (bot vs manual) */
  toggleContactMode: (phone: string) =>
    botApi.post(`/messages/manual-toggle/${encodeURIComponent(phone)}`),

  /** Enable a contact in "selected" mode */
  enableContact: (phone: string) =>
    botApi.post(`/messages/chat-toggle/${encodeURIComponent(phone)}`),

  /** Get full status for a phone number */
  getPhoneStatus: (phone: string) =>
    botApi.get(`/messages/phone-status/${encodeURIComponent(phone)}`),

  /** Get profile picture URL for a phone */
  getProfilePic: (phone: string) =>
    botApi.get<{ url: string | null }>(`/whatsapp/profile-pic/${encodeURIComponent(phone)}`),
};

export default botApi;
