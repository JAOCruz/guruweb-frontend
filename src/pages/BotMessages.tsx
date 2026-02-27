import React, { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { MessageSquare, RefreshCw, Bot, User } from "lucide-react";
import { botAPI, BotMessage } from "../services/botApi";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getInitials = (name?: string, phone?: string): string => {
  if (name && name.trim()) {
    const parts = name.trim().split(" ");
    return parts.length >= 2
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : parts[0].slice(0, 2).toUpperCase();
  }
  if (phone) return phone.slice(-2);
  return "??";
};

const formatTimestamp = (ts: string): string => {
  const date = new Date(ts);
  if (isNaN(date.getTime())) return ts;
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "ahora";
  if (diffMins < 60) return `${diffMins}m`;
  const diffHrs = Math.floor(diffMins / 60);
  if (diffHrs < 24) return `${diffHrs}h`;
  return date.toLocaleDateString("es-DO", { day: "numeric", month: "short" });
};

// ─── Stat chip ────────────────────────────────────────────────────────────────
const StatChip: React.FC<{
  label: string;
  value: number;
  color: string;
}> = ({ label, value, color }) => (
  <div className="flex flex-col items-center rounded-xl border border-slate-700/50 bg-slate-800/50 px-5 py-3">
    <span className={`text-2xl font-bold ${color}`}>{value}</span>
    <span className="text-xs text-slate-500">{label}</span>
  </div>
);

// ─── Conversation Card ────────────────────────────────────────────────────────
const ConversationCard: React.FC<{
  msg: BotMessage;
  botMode: "all" | "selected";
  onToggle: (phone: string) => void;
  onEnable: (phone: string) => void;
}> = ({ msg, botMode, onToggle, onEnable }) => {
  const initials = getInitials(msg.name, msg.phone);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-start gap-4 rounded-xl border border-slate-700/40 bg-slate-800/40 p-4 transition-colors hover:border-slate-600/60 hover:bg-slate-800/60"
    >
      {/* Avatar */}
      <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-blue-500 text-sm font-bold text-white shadow-md shadow-purple-500/20">
        {initials}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate font-semibold text-white">
            {msg.name || msg.phone}
          </p>
          <span className="flex-shrink-0 text-xs text-slate-500">
            {formatTimestamp(msg.timestamp)}
          </span>
        </div>
        <p className="mt-0.5 truncate text-sm text-slate-400">
          {msg.lastMessage || "—"}
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-shrink-0 flex-col items-end gap-2">
        {/* Bot / Manual toggle */}
        <button
          onClick={() => onToggle(msg.phone)}
          className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-bold transition-all ${
            msg.botActive
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
              : "border-yellow-500/30 bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20"
          }`}
        >
          {msg.botActive ? (
            <>
              <Bot size={12} /> Bot
            </>
          ) : (
            <>
              <User size={12} /> Manual
            </>
          )}
        </button>

        {/* Habilitar button — only in "selected" mode */}
        {botMode === "selected" && (
          <button
            onClick={() => onEnable(msg.phone)}
            className={`rounded-lg border px-3 py-1.5 text-xs font-bold transition-all ${
              msg.enabled
                ? "border-blue-500/30 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20"
                : "border-slate-600 bg-slate-700/50 text-slate-400 hover:border-slate-500 hover:text-white"
            }`}
          >
            {msg.enabled ? "Habilitado" : "Habilitar"}
          </button>
        )}
      </div>
    </motion.div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const BotMessages: React.FC = () => {
  const [messages, setMessages] = useState<BotMessage[]>([]);
  const [botMode, setBotMode] = useState<"all" | "selected">("all");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const fetchMessages = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const [msgRes, statusRes] = await Promise.all([
        botAPI.getMessages(),
        botAPI.getStatus(),
      ]);
      setMessages(msgRes.data);
      setBotMode(statusRes.data.mode ?? "all");
      setLastRefresh(new Date());
    } catch {
      // silently ignore
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(() => fetchMessages(true), 8000);
    return () => clearInterval(interval);
  }, [fetchMessages]);

  const handleToggle = async (phone: string) => {
    try {
      await botAPI.toggleContactMode(phone);
      setMessages((prev) =>
        prev.map((m) =>
          m.phone === phone ? { ...m, botActive: !m.botActive } : m,
        ),
      );
    } catch {
      // silently ignore
    }
  };

  const handleEnable = async (phone: string) => {
    try {
      await botAPI.enableContact(phone);
      setMessages((prev) =>
        prev.map((m) =>
          m.phone === phone ? { ...m, enabled: !m.enabled } : m,
        ),
      );
    } catch {
      // silently ignore
    }
  };

  const botActiveCount = messages.filter((m) => m.botActive).length;
  const manualCount = messages.filter((m) => !m.botActive).length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg shadow-blue-500/30">
            <MessageSquare size={20} className="text-white" />
          </div>
          <div>
            <h2 className="font-display text-2xl font-bold text-white md:text-3xl">
              Mensajes Bot
            </h2>
            <p className="text-sm text-slate-400">
              Conversaciones en tiempo real
            </p>
          </div>
        </div>

        <button
          onClick={() => fetchMessages(true)}
          disabled={refreshing}
          className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-2 text-sm text-slate-400 transition-all hover:border-slate-600 hover:text-white disabled:opacity-50"
        >
          <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
          <span className="hidden sm:inline">
            {lastRefresh
              ? `Actualizado ${formatTimestamp(lastRefresh.toISOString())}`
              : "Actualizar"}
          </span>
        </button>
      </motion.div>

      {/* Stats bar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="grid grid-cols-3 gap-3"
      >
        <StatChip
          label="Conversaciones"
          value={messages.length}
          color="text-white"
        />
        <StatChip
          label="Bot Activo"
          value={botActiveCount}
          color="text-emerald-400"
        />
        <StatChip label="Manual" value={manualCount} color="text-yellow-400" />
      </motion.div>

      {/* Conversation list */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.15 }}
      >
        {loading ? (
          <div className="flex items-center justify-center py-20 text-slate-500">
            <RefreshCw size={24} className="animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-700/50 bg-slate-900/30 py-16 text-center">
            <MessageSquare
              size={40}
              className="mx-auto mb-4 text-slate-600"
            />
            <p className="text-slate-400">
              No hay conversaciones aún.
            </p>
            <p className="mt-1 text-sm text-slate-600">
              Envía un mensaje al número conectado.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((msg) => (
              <ConversationCard
                key={msg.id}
                msg={msg}
                botMode={botMode}
                onToggle={handleToggle}
                onEnable={handleEnable}
              />
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default BotMessages;
