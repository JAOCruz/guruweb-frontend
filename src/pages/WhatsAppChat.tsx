import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Send,
  Bot,
  User,
  RefreshCw,
  AlertCircle,
  MessageSquare,
  Phone,
  Circle,
  ToggleLeft,
  ToggleRight,
  ChevronLeft,
} from "lucide-react";
import { botAPI, Conversation, ChatMessage } from "../services/botApi";

// ─── Helpers ────────────────────────────────────────────────────────────────

function getInitials(name?: string, phone?: string): string {
  if (name && name.trim()) {
    const parts = name.trim().split(" ");
    return parts.length >= 2
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : parts[0].slice(0, 2).toUpperCase();
  }
  return phone ? phone.slice(-2) : "??";
}

function formatTime(iso: string): string {
  if (!iso) return "";
  try {
    const date = new Date(iso);
    const now = new Date();
    const diffDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24),
    );
    if (diffDays === 0) {
      return date.toLocaleTimeString("es-DO", { hour: "2-digit", minute: "2-digit" });
    }
    if (diffDays === 1) return "Ayer";
    if (diffDays < 7) {
      return date.toLocaleDateString("es-DO", { weekday: "short" });
    }
    return date.toLocaleDateString("es-DO", { day: "2-digit", month: "2-digit" });
  } catch {
    return "";
  }
}

function formatFullTime(iso: string): string {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleTimeString("es-DO", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

function isSameDay(a: string, b: string): boolean {
  try {
    return new Date(a).toDateString() === new Date(b).toDateString();
  } catch {
    return false;
  }
}

function formatDateSeparator(iso: string): string {
  try {
    const date = new Date(iso);
    const now = new Date();
    const diffDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24),
    );
    if (diffDays === 0) return "Hoy";
    if (diffDays === 1) return "Ayer";
    return date.toLocaleDateString("es-DO", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
  } catch {
    return iso;
  }
}

type FilterTab = "all" | "active" | "ai" | "human";

// ─── Conversation item ───────────────────────────────────────────────────────
const ConvItem: React.FC<{
  conv: Conversation;
  active: boolean;
  onClick: () => void;
}> = ({ conv, active, onClick }) => {
  const initials = getInitials(conv.name, conv.phone);
  const isAI = conv.aiActive ?? conv.botActive ?? false;
  const unread = conv.unreadCount ?? 0;

  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-3 px-4 py-3 transition-all duration-150 text-left border-b border-slate-800/50 ${
        active
          ? "bg-blue-600/20 border-l-2 border-l-blue-500"
          : "hover:bg-slate-800/60"
      }`}
    >
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white ${
            active
              ? "bg-gradient-to-br from-blue-500 to-purple-600"
              : "bg-gradient-to-br from-slate-600 to-slate-700"
          }`}
        >
          {initials}
        </div>
        {isAI && (
          <div className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 ring-2 ring-[#0F172A]">
            <Bot size={9} className="text-white" />
          </div>
        )}
      </div>

      {/* Text */}
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-1">
          <span className={`truncate text-sm font-semibold ${active ? "text-white" : "text-slate-200"}`}>
            {conv.name || conv.phone}
          </span>
          <span className="flex-shrink-0 text-[10px] text-slate-500">
            {formatTime(conv.lastMessageTime || conv.timestamp)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-1 mt-0.5">
          <span className="truncate text-xs text-slate-400">
            {conv.lastMessage || "Sin mensajes"}
          </span>
          {unread > 0 && (
            <span className="flex-shrink-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-emerald-500 px-1 text-[10px] font-bold text-white">
              {unread}
            </span>
          )}
        </div>
      </div>
    </button>
  );
};

// ─── Message bubble ──────────────────────────────────────────────────────────
const MsgBubble: React.FC<{ msg: ChatMessage }> = ({ msg }) => {
  const isOut = msg.fromMe || msg.direction === "outbound";
  const isAI = msg.handledBy === "ai";

  return (
    <div className={`flex ${isOut ? "justify-end" : "justify-start"} mb-1`}>
      <div
        className={`relative max-w-[75%] rounded-2xl px-3.5 py-2 shadow-sm ${
          isOut
            ? "bg-emerald-800 text-white rounded-br-sm"
            : "bg-slate-700 text-slate-100 rounded-bl-sm"
        }`}
      >
        {isOut && isAI && (
          <div className="mb-1 flex items-center gap-1">
            <Bot size={10} className="text-emerald-300" />
            <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-300">
              IA
            </span>
          </div>
        )}
        <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
          {msg.message}
        </p>
        <span
          className={`mt-1 block text-right text-[10px] ${
            isOut ? "text-emerald-300/70" : "text-slate-400"
          }`}
        >
          {formatFullTime(msg.timestamp)}
        </span>
      </div>
    </div>
  );
};

// ─── Main component ──────────────────────────────────────────────────────────
const WhatsAppChat: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [selected, setSelected] = useState<Conversation | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterTab>("all");
  const [inputText, setInputText] = useState("");
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [sendingMsg, setSendingMsg] = useState(false);
  const [togglingAI, setTogglingAI] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showMobileChat, setShowMobileChat] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Fetch conversations ───────────────────────────────────────────────────
  const fetchConversations = useCallback(async (silent = false) => {
    if (!silent) setLoadingConvs(true);
    setError(null);
    try {
      const res = await botAPI.getConversations();
      const data = Array.isArray(res.data) ? res.data : [];
      setConversations(data);
      // keep selected in sync
      if (selected) {
        const updated = data.find((c) => c.phone === selected.phone);
        if (updated) setSelected(updated);
      }
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } }; message?: string };
      setError(e?.response?.data?.message || e?.message || "Error cargando conversaciones");
    } finally {
      if (!silent) setLoadingConvs(false);
    }
  }, [selected]);

  useEffect(() => {
    fetchConversations();
  }, []);

  // Poll conversations every 8s
  useEffect(() => {
    pollRef.current = setInterval(() => fetchConversations(true), 8000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [fetchConversations]);

  // ── Fetch messages for selected conversation ──────────────────────────────
  const fetchMessages = useCallback(async (phone: string) => {
    setLoadingMsgs(true);
    try {
      const res = await botAPI.getPhoneMessages(phone);
      setMessages(Array.isArray(res.data) ? res.data : []);
    } catch {
      setMessages([]);
    } finally {
      setLoadingMsgs(false);
    }
  }, []);

  useEffect(() => {
    if (selected) {
      fetchMessages(selected.phone);
      // Poll messages every 4s when a conversation is open
      const t = setInterval(() => fetchMessages(selected.phone), 4000);
      return () => clearInterval(t);
    }
  }, [selected?.phone, fetchMessages]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Select conversation ───────────────────────────────────────────────────
  const handleSelectConv = (conv: Conversation) => {
    setSelected(conv);
    setShowMobileChat(true);
    setMessages([]);
  };

  // ── Send message ──────────────────────────────────────────────────────────
  const handleSend = async () => {
    if (!inputText.trim() || !selected || sendingMsg) return;
    const text = inputText.trim();
    setInputText("");
    setSendingMsg(true);
    try {
      await botAPI.sendMessage(selected.phone, text);
      await fetchMessages(selected.phone);
    } catch {
      setInputText(text); // restore on failure
    } finally {
      setSendingMsg(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ── Toggle AI ─────────────────────────────────────────────────────────────
  const handleToggleAI = async () => {
    if (!selected || togglingAI) return;
    setTogglingAI(true);
    try {
      await botAPI.toggleChatAI(selected.phone);
      await fetchConversations(true);
    } finally {
      setTogglingAI(false);
    }
  };

  // ── Filter conversations ──────────────────────────────────────────────────
  const filtered = conversations.filter((c) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      (c.name || "").toLowerCase().includes(q) ||
      c.phone.includes(q) ||
      (c.lastMessage || "").toLowerCase().includes(q);

    if (!matchesSearch) return false;

    const isAI = c.aiActive ?? c.botActive ?? false;
    const isActive = c.status === "active" || c.botActive === true;

    if (filter === "active") return isActive;
    if (filter === "ai") return isAI;
    if (filter === "human") return !isAI;
    return true;
  });

  const tabs: { id: FilterTab; label: string }[] = [
    { id: "all", label: "Todos" },
    { id: "active", label: "Activos" },
    { id: "ai", label: "IA" },
    { id: "human", label: "Humano" },
  ];

  const selectedIsAI = selected
    ? (selected.aiActive ?? selected.botActive ?? false)
    : false;

  // ── Date separators logic ─────────────────────────────────────────────────
  const msgsWithSeparators: (ChatMessage | { type: "separator"; date: string })[] =
    [];
  messages.forEach((msg, i) => {
    if (i === 0 || !isSameDay(messages[i - 1].timestamp, msg.timestamp)) {
      msgsWithSeparators.push({ type: "separator", date: msg.timestamp });
    }
    msgsWithSeparators.push(msg);
  });

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="flex h-[calc(100vh-5rem)] overflow-hidden rounded-2xl border border-slate-800 bg-[#0B1120]">

      {/* ── LEFT PANEL ─────────────────────────────────────────────────── */}
      <div
        className={`flex w-80 flex-shrink-0 flex-col border-r border-slate-800 bg-[#0F172A] ${
          showMobileChat ? "hidden md:flex" : "flex"
        }`}
      >
        {/* Header */}
        <div className="border-b border-slate-800 px-4 py-3">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-base font-bold text-white">
              Conversaciones
            </h2>
            <button
              onClick={() => fetchConversations()}
              disabled={loadingConvs}
              className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white disabled:opacity-40"
            >
              <RefreshCw size={14} className={loadingConvs ? "animate-spin" : ""} />
            </button>
          </div>

          {/* Search */}
          <div className="relative mb-3">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
            />
            <input
              type="text"
              placeholder="Buscar conversación..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-800/50 py-2 pl-8 pr-3 text-sm text-white placeholder-slate-500 outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20"
            />
          </div>

          {/* Filter tabs */}
          <div className="flex gap-1">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setFilter(t.id)}
                className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition-all ${
                  filter === t.id
                    ? "bg-blue-600 text-white"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto">
          {loadingConvs ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-slate-500">
              <RefreshCw size={20} className="animate-spin" />
              <span className="text-xs">Cargando...</span>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center gap-3 px-4 py-12 text-center">
              <AlertCircle size={24} className="text-red-400" />
              <p className="text-xs text-slate-400">{error}</p>
              <button
                onClick={() => fetchConversations()}
                className="rounded-lg bg-slate-800 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-700"
              >
                Reintentar
              </button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-16 text-slate-500">
              <MessageSquare size={24} />
              <span className="text-xs">
                {search || filter !== "all" ? "Sin resultados" : "Sin conversaciones"}
              </span>
            </div>
          ) : (
            filtered.map((conv) => (
              <ConvItem
                key={conv.id || conv.phone}
                conv={conv}
                active={selected?.phone === conv.phone}
                onClick={() => handleSelectConv(conv)}
              />
            ))
          )}
        </div>

        {/* Count footer */}
        {!loadingConvs && !error && (
          <div className="border-t border-slate-800 px-4 py-2">
            <span className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">
              {filtered.length} de {conversations.length} conversaciones
            </span>
          </div>
        )}
      </div>

      {/* ── RIGHT PANEL ────────────────────────────────────────────────── */}
      <div
        className={`flex min-w-0 flex-1 flex-col ${
          !showMobileChat ? "hidden md:flex" : "flex"
        }`}
      >
        {!selected ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 text-slate-600">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-800/50">
              <MessageSquare size={36} className="text-slate-600" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-slate-400">
                Selecciona una conversación
              </p>
              <p className="mt-1 text-xs text-slate-600">
                para ver los mensajes
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Top bar */}
            <div className="flex items-center justify-between border-b border-slate-800 bg-[#0F172A] px-4 py-3">
              <div className="flex items-center gap-3">
                {/* Mobile back button */}
                <button
                  onClick={() => setShowMobileChat(false)}
                  className="md:hidden mr-1 rounded-lg p-1 text-slate-400 hover:bg-slate-800"
                >
                  <ChevronLeft size={20} />
                </button>

                {/* Avatar */}
                <div className="relative">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-xs font-bold text-white">
                    {getInitials(selected.name, selected.phone)}
                  </div>
                  <Circle
                    size={8}
                    className="absolute -bottom-0 -right-0 fill-emerald-400 text-emerald-400"
                  />
                </div>

                {/* Name + phone */}
                <div>
                  <p className="text-sm font-semibold text-white">
                    {selected.name || selected.phone}
                  </p>
                  <div className="flex items-center gap-1.5">
                    <Phone size={10} className="text-slate-500" />
                    <span className="text-[11px] text-slate-400">
                      {selected.phone}
                    </span>
                    {selected.name && (
                      <span className="text-[11px] text-emerald-400">
                        · en línea
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* AI toggle */}
              <div className="flex items-center gap-2">
                <Bot
                  size={14}
                  className={selectedIsAI ? "text-emerald-400" : "text-slate-500"}
                />
                <span className="hidden text-xs font-medium text-slate-400 sm:block">
                  {selectedIsAI ? "IA activada" : "IA desactivada"}
                </span>
                <button
                  onClick={handleToggleAI}
                  disabled={togglingAI}
                  className="transition-opacity disabled:opacity-40"
                  title={selectedIsAI ? "Desactivar IA" : "Activar IA"}
                >
                  {togglingAI ? (
                    <RefreshCw size={20} className="animate-spin text-slate-400" />
                  ) : selectedIsAI ? (
                    <ToggleRight size={24} className="text-emerald-400" />
                  ) : (
                    <ToggleLeft size={24} className="text-slate-500" />
                  )}
                </button>
              </div>
            </div>

            {/* Messages area */}
            <div
              className="flex-1 overflow-y-auto px-4 py-4"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 20% 50%, rgba(37,99,235,0.03) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(147,51,234,0.03) 0%, transparent 50%)",
              }}
            >
              {loadingMsgs ? (
                <div className="flex items-center justify-center py-12">
                  <RefreshCw size={18} className="animate-spin text-slate-500" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-2 py-12 text-slate-600">
                  <MessageSquare size={24} />
                  <span className="text-xs">Sin mensajes aún</span>
                </div>
              ) : (
                <AnimatePresence initial={false}>
                  {msgsWithSeparators.map((item, idx) => {
                    if ("type" in item && item.type === "separator") {
                      return (
                        <div key={`sep-${idx}`} className="my-4 flex items-center gap-3">
                          <div className="flex-1 border-t border-slate-800" />
                          <span className="rounded-full bg-slate-800 px-3 py-0.5 text-[10px] font-medium text-slate-500">
                            {formatDateSeparator(item.date)}
                          </span>
                          <div className="flex-1 border-t border-slate-800" />
                        </div>
                      );
                    }
                    const msg = item as ChatMessage;
                    return (
                      <motion.div
                        key={msg.id || idx}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.15 }}
                      >
                        <MsgBubble msg={msg} />
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input bar */}
            <div className="border-t border-slate-800 bg-[#0F172A] px-4 py-3">
              {selectedIsAI && (
                <div className="mb-2 flex items-center gap-1.5 rounded-lg bg-emerald-900/20 px-3 py-1.5 border border-emerald-800/30">
                  <Bot size={12} className="text-emerald-400" />
                  <span className="text-xs text-emerald-400">
                    IA respondiendo automáticamente
                  </span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <div className="flex flex-1 items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/50 px-3 py-2 focus-within:border-blue-500/50 focus-within:ring-1 focus-within:ring-blue-500/20">
                  <User size={14} className="flex-shrink-0 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Escribe un mensaje..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={sendingMsg}
                    className="flex-1 bg-transparent text-sm text-white placeholder-slate-500 outline-none disabled:opacity-50"
                  />
                </div>
                <button
                  onClick={handleSend}
                  disabled={!inputText.trim() || sendingMsg}
                  className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-[0_0_12px_rgba(37,99,235,0.4)] transition-all hover:bg-blue-500 disabled:opacity-40 disabled:shadow-none"
                >
                  {sendingMsg ? (
                    <RefreshCw size={14} className="animate-spin" />
                  ) : (
                    <Send size={14} />
                  )}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default WhatsAppChat;
