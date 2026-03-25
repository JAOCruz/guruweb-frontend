import axios from "axios";

const BOT_API_URL = "/api";

const botApi = axios.create({
  baseURL: BOT_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add bot token
botApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("guru_bot_token");
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
      localStorage.removeItem("guru_bot_token");
    }
    return Promise.reject(error);
  },
);

// ─── Types ─────────────────────────────────────────────────────────────────

export type BotMode = "all" | "selected";

export interface BotStatus {
  status: "disconnected" | "connecting" | "connected";
  paused?: boolean;
  mode?: BotMode;
  phone?: string;
}

export interface BotMessage {
  id: string;
  phone: string;
  name?: string;
  lastMessage: string;
  timestamp: string;
  botActive: boolean;
  enabled?: boolean; // for "selected" mode
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
  getStatus: () => botApi.get<BotStatus>("/bot/status"),

  /** Initiate WhatsApp connection (triggers QR generation) */
  connect: () => botApi.post("/bot/connect"),

  /** Get current QR code string */
  getQR: () => botApi.get<{ qr: string | null }>("/bot/qr"),

  /** Disconnect the WhatsApp session */
  disconnect: () => botApi.post("/bot/disconnect"),

  /** Toggle bot paused/active */
  toggleBot: () => botApi.post("/bot/toggle"),

  /** Set bot mode: 'all' responds to everyone, 'selected' only to enabled contacts */
  setBotMode: (mode: BotMode) => botApi.post("/bot/mode", { mode }),

  /** Get list of conversations with last message info */
  getMessages: () => botApi.get<BotMessage[]>("/bot/messages"),

  /** Get list of known clients */
  getClients: () => botApi.get<BotClient[]>("/bot/clients"),

  /** Toggle individual contact bot mode (bot vs manual) */
  toggleContactMode: (phone: string) =>
    botApi.post(`/bot/contacts/${phone}/toggle`),

  /** Enable a contact in "selected" mode */
  enableContact: (phone: string) =>
    botApi.post(`/bot/contacts/${phone}/enable`),

  /** Login to bot backend (if it has its own auth) */
  loginBot: (email: string, password: string) =>
    botApi.post<{ token: string }>("/auth/login", { email, password }),
};

export default botApi;
