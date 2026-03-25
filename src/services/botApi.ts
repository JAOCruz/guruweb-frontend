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
    const token = localStorage.getItem("guru_bot_token") || localStorage.getItem("token");
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
  enabled?: boolean;
}

export interface BotClient {
  id: string;
  name?: string;
  phone: string;
  joinedAt: string;
  messageCount: number;
}

// ─── Chat / Conversation types ──────────────────────────────────────────────

export type MessageDirection = "inbound" | "outbound";
export type HandledBy = "ai" | "human";

export interface ChatMessage {
  id: string;
  phone: string;
  message: string;
  direction: MessageDirection;
  timestamp: string;
  handledBy?: HandledBy;
  fromMe?: boolean;
  read?: boolean;
}

export interface Conversation {
  id: string;
  phone: string;
  name?: string;
  lastMessage: string;
  lastMessageTime: string;
  timestamp: string;
  unreadCount?: number;
  botActive?: boolean;
  aiActive?: boolean;
  handledBy?: HandledBy;
  status?: "active" | "inactive";
}

export interface PhoneStatus {
  phone: string;
  aiActive: boolean;
  mode: "ai" | "human";
}

// ─── Analytics types ────────────────────────────────────────────────────────

export interface IntentData {
  intent: string;
  count: number;
  percentage: number;
}

export interface DashboardStats {
  totalConversations?: number;
  aiHandled?: number;
  humanHandled?: number;
  humanTakeovers?: number;
  avgResponseTimeAI?: number;
  avgResponseTimeHuman?: number;
  totalMessages?: number;
  activeConversations?: number;
  [key: string]: unknown;
}

export interface AnalyticsData {
  topIntents?: IntentData[];
  dailyStats?: { date: string; ai: number; human: number }[];
  [key: string]: unknown;
}

// ─── API Methods ────────────────────────────────────────────────────────────

export const botAPI = {
  // ── Bot connection ──────────────────────────────────────────────────────
  getStatus: () => botApi.get<BotStatus>("/bot/status"),
  connect: () => botApi.post("/bot/connect"),
  getQR: () => botApi.get<{ qr: string | null }>("/bot/qr"),
  disconnect: () => botApi.post("/bot/disconnect"),
  toggleBot: () => botApi.post("/bot/toggle"),
  setBotMode: (mode: BotMode) => botApi.post("/bot/mode", { mode }),

  // ── Legacy message/client endpoints ────────────────────────────────────
  getMessages: () => botApi.get<BotMessage[]>("/bot/messages"),
  getClients: () => botApi.get<BotClient[]>("/bot/clients"),
  toggleContactMode: (phone: string) =>
    botApi.post(`/bot/contacts/${phone}/toggle`),
  enableContact: (phone: string) =>
    botApi.post(`/bot/contacts/${phone}/enable`),
  loginBot: (email: string, password: string) =>
    botApi.post<{ token: string }>("/auth/login", { email, password }),

  // ── Conversations ───────────────────────────────────────────────────────
  /** GET /api/messages/conversations — list all conversations */
  getConversations: () =>
    botApi.get<Conversation[]>("/messages/conversations"),

  /** GET /api/messages/phone/:phone — full message history */
  getPhoneMessages: (phone: string) =>
    botApi.get<ChatMessage[]>(`/messages/phone/${encodeURIComponent(phone)}`),

  /** POST /api/messages/send — send a message */
  sendMessage: (phone: string, message: string) =>
    botApi.post("/messages/send", { phone, message }),

  /** POST /api/messages/chat-toggle/:phone — toggle AI on/off */
  toggleChatAI: (phone: string) =>
    botApi.post(`/messages/chat-toggle/${encodeURIComponent(phone)}`),

  /** GET /api/messages/phone-status/:phone — get AI/manual status */
  getPhoneStatus: (phone: string) =>
    botApi.get<PhoneStatus>(`/messages/phone-status/${encodeURIComponent(phone)}`),

  // ── Dashboard & Analytics ───────────────────────────────────────────────
  /** GET /api/dashboard/stats */
  getDashboardStats: () => botApi.get<DashboardStats>("/dashboard/stats"),

  /** GET /api/dashboard/analytics */
  getAnalytics: () => botApi.get<AnalyticsData>("/dashboard/analytics"),

  /** GET /api/clients */
  getAllClients: () => botApi.get<BotClient[]>("/clients"),
};

export default botApi;
