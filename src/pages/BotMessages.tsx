import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  MessageSquare,
  Search,
  Send,
  Bot,
  User,
  RefreshCw,
  ChevronLeft,
  Circle,
  Users,
  MessageCircle,
} from "lucide-react";
import { botAPI } from "../services/botApi";
import { NeoCard, NeoButton, NeoInput, NeoBadge } from "../components/ui/neo";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ConvRow {
  phone: string;
  client_name: string | null;
  last_message: string;
  last_message_at: string;
  message_count: string;
  botActive: boolean;
  firstMatchId?: string | number | null;
}

interface MsgRow {
  id: string | number;
  phone: string;
  direction: "inbound" | "outbound";
  content: string;        // real field from API
  message?: string;       // fallback alias
  media_url?: string | null;
  status?: string;
  created_at: string;
  ai_generated?: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(name?: string | null, phone?: string): string {
  if (name && name.trim()) {
    const parts = name.trim().split(" ");
    return parts.length >= 2
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : parts[0].slice(0, 2).toUpperCase();
  }
  return phone ? phone.slice(-4) : "??";
}

function formatRelTime(ts: string): string {
  const date = new Date(ts);
  if (isNaN(date.getTime())) return "";
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "ahora";
  if (diffMins < 60) return `hace ${diffMins} min`;
  const diffHrs = Math.floor(diffMins / 60);
  if (diffHrs < 24) {
    return date.toLocaleTimeString("es-DO", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "America/Santo_Domingo",
    });
  }
  const fmt = (d: Date) => d.toLocaleDateString("es-DO", { timeZone: "America/Santo_Domingo" });
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (fmt(date) === fmt(yesterday)) return "Ayer";
  return date.toLocaleDateString("es-DO", {
    day: "numeric",
    month: "short",
    timeZone: "America/Santo_Domingo",
  });
}

function formatPhone(phone: string): string {
  const d = phone.replace(/\D/g, "");
  if (d.length === 11 && d.startsWith("1"))
    return `(${d.slice(1, 4)}) ${d.slice(4, 7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
  // WhatsApp @lid privacy ID — real number hidden by WA
  if (d.length > 12) return `WA:···${d.slice(-4)}`;
  return phone;
}

function getDateLabel(ts: string): string {
  const date = new Date(ts);
  const now = new Date();
  const fmt = (d: Date) => d.toLocaleDateString("es-DO", { timeZone: "America/Santo_Domingo" });
  if (fmt(date) === fmt(now)) return "Hoy";
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (fmt(date) === fmt(yesterday)) return "Ayer";
  return date.toLocaleDateString("es-DO", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "America/Santo_Domingo",
  });
}

// ─── Conversation Item ────────────────────────────────────────────────────────

interface ConvItemProps {
  conv: ConvRow;
  isSelected: boolean;
  onSelect: () => void;
  onToggleAI: (phone: string, e: React.MouseEvent) => void;
}

const ConvItem: React.FC<ConvItemProps> = ({
  conv,
  isSelected,
  onSelect,
  onToggleAI,
}) => {
  const initials = getInitials(conv.client_name, conv.phone);
  const name = conv.client_name || formatPhone(conv.phone);
  const preview = (conv.last_message || "—").slice(0, 40);
  const time = formatRelTime(conv.last_message_at);

  return (
    <div
      onClick={onSelect}
      className={`flex cursor-pointer items-start gap-3 border-b-2 border-border px-4 py-3 transition-all ${
        isSelected
          ? "bg-main text-main-foreground"
          : "bg-background text-foreground hover:bg-secondary-background"
      }`}
    >
      {/* Avatar */}
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-2 border-border bg-main text-sm font-black text-main-foreground shadow-button">
        {initials}
      </div>

      {/* Name + preview */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate font-base text-base font-semibold">{name}</p>
          <span className={`flex-shrink-0 font-base text-xs ${isSelected ? "text-main-foreground/70" : "text-foreground/50"}`}>
            {time}
          </span>
        </div>
        <p className={`mt-0.5 truncate font-base text-sm ${isSelected ? "text-main-foreground/80" : "text-foreground/60"}`}>
          {preview}
        </p>
      </div>

      {/* IA toggle button */}
      <NeoButton
        onClick={(e) => onToggleAI(conv.phone, e)}
        title={
          conv.botActive
            ? "IA activa — click para desactivar"
            : "Manual — click para activar IA"
        }
        variant={conv.botActive ? "default" : "neutral"}
        size="icon"
        className="mt-1 h-8 w-8 flex-shrink-0"
      >
        {conv.botActive ? <Bot size={14} /> : <User size={14} />}
      </NeoButton>
    </div>
  );
};

// ─── Authenticated media loader (Blob URL) ───────────────────────────────────

function useMediaBlob(apiPath: string | null | undefined) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>("");

  useEffect(() => {
    if (!apiPath) return;
    let revoked = false;
    const token = localStorage.getItem("guru_bot_token") || localStorage.getItem("token") || "";
    fetch(apiPath, { headers: { Authorization: `Bearer ${token}` } })
      .then(async (res) => {
        if (!res.ok) return;
        const ct = res.headers.get("content-type") ?? "";
        const blob = await res.blob();
        if (!revoked) {
          setMimeType(ct);
          setBlobUrl(URL.createObjectURL(blob));
        }
      })
      .catch(() => {});
    return () => {
      revoked = true;
      setBlobUrl((prev) => { if (prev) URL.revokeObjectURL(prev); return null; });
    };
  }, [apiPath]);

  return { blobUrl, mimeType };
}

// ─── Media bubble component ───────────────────────────────────────────────────

const MediaAttachment: React.FC<{ apiPath: string; isOut: boolean }> = ({ apiPath, isOut }) => {
  const { blobUrl, mimeType } = useMediaBlob(apiPath);

  if (!blobUrl) {
    return (
      <div className={`mb-1.5 font-base text-xs italic ${isOut ? "text-main-foreground/60" : "text-foreground/50"}`}>
        Cargando media…
      </div>
    );
  }

  if (mimeType.startsWith("image/")) {
    return (
      <img
        src={blobUrl}
        alt="imagen"
        className="mb-1.5 w-full max-h-52 cursor-pointer rounded-base border-2 border-border object-cover shadow-button"
        onClick={() => window.open(blobUrl, "_blank")}
      />
    );
  }

  if (mimeType.startsWith("audio/")) {
    return (
      <audio controls preload="metadata" className="mb-1.5 w-full min-w-[250px]">
        <source src={blobUrl} type={mimeType || "audio/ogg"} />
        Tu navegador no soporta audio.
      </audio>
    );
  }

  if (mimeType.startsWith("video/")) {
    return (
      <video controls src={blobUrl} className="mb-1.5 max-h-52 w-full rounded-base border-2 border-border object-cover shadow-button">
        Tu navegador no soporta video.
      </video>
    );
  }

  // Generic download link
  return (
    <a
      href={blobUrl}
      download
      className={`mb-1.5 flex items-center gap-1.5 font-base text-sm underline underline-offset-2 ${isOut ? "text-main-foreground" : "text-main"}`}
    >
      📎 Descargar archivo
    </a>
  );
};

// ─── Message Bubble ───────────────────────────────────────────────────────────

const MessageBubble: React.FC<{ msg: MsgRow; isHighlighted?: boolean }> = ({ msg, isHighlighted }) => {
  const isOut = msg.direction === "outbound";
  // Real field is "content"; fallback to "message" for safety
  const text = msg.content ?? msg.message ?? "";
  const time = (() => {
    try {
      return new Date(msg.created_at).toLocaleTimeString("es-DO", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "America/Santo_Domingo",
      });
    } catch {
      return "";
    }
  })();

  const media = msg.media_url;

  return (
    <div
      className={`mb-1.5 flex ${isOut ? "justify-end" : "justify-start"} transition-all duration-300`}
      id={`msg-${msg.id}`}
    >
      <div
        className={`max-w-[75%] px-4 py-2.5 font-base text-base shadow-button transition-all duration-300 ${
          isHighlighted
            ? "scale-[1.02] ring-2 ring-main ring-offset-2 ring-offset-background"
            : ""
        } ${
          isOut
            ? "rounded-bl-base rounded-tl-base rounded-tr-base border-2 border-border bg-main text-main-foreground"
            : "rounded-br-base rounded-tl-base rounded-tr-base border-2 border-border bg-secondary-background text-foreground"
        }`}
      >
        {/* Authenticated media */}
        {media && <MediaAttachment apiPath={media} isOut={isOut} />}
        {/* Text content */}
        {text && !text.startsWith("[📎") && !text.startsWith("[🎤") && (
          <p className="break-words leading-relaxed">{text}</p>
        )}
        {/* Timestamp */}
        <p
          className={`mt-1 font-base text-xs ${
            isOut ? "text-right text-main-foreground/60" : "text-foreground/50"
          }`}
        >
          {time}
          {msg.ai_generated && (
            <span className="ml-1.5 text-main-foreground/50">· IA</span>
          )}
        </p>
      </div>
    </div>
  );
};

// ─── Date Separator ───────────────────────────────────────────────────────────

const DateSeparator: React.FC<{ label: string }> = ({ label }) => (
  <div className="my-4 flex items-center gap-3">
    <div className="flex-1 border-t-2 border-border" />
    <span className="rounded-base border-2 border-border bg-secondary-background px-3 py-0.5 font-base text-xs font-black uppercase tracking-wider text-foreground/70">
      {label}
    </span>
    <div className="flex-1 border-t-2 border-border" />
  </div>
);

// ─── Main Page ────────────────────────────────────────────────────────────────

const BotMessages: React.FC = () => {
  // Conversation list
  const [conversations, setConversations] = useState<ConvRow[]>([]);
  const [convLoading, setConvLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "ai" | "manual">("all");

  // Selected conversation
  const [selectedPhone, setSelectedPhone] = useState<string | null>(null);
  const [showRightPanel, setShowRightPanel] = useState(false); // mobile toggle

  // Chat
  const [messages, setMessages] = useState<MsgRow[]>([]);
  const [msgLoading, setMsgLoading] = useState(false);
  const [inputText, setInputText] = useState("");
  const [sending, setSending] = useState(false);
  const [highlightMessageId, setHighlightMessageId] = useState<string | number | null>(null);

  // Message search
  const [showMsgSearch, setShowMsgSearch] = useState(false);
  const [msgSearch, setMsgSearch] = useState("");
  const [messageSearchMatches, setMessageSearchMatches] = useState<(string | number)[]>([]);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const userScrolledRef = useRef(false);
  const prevMessageCount = useRef(0);

  // ── Fetch conversation list ─────────────────────────────────────────────────

  const fetchConversations = useCallback(async (silent = false) => {
    if (!silent) setConvLoading(true);
    try {
      const res = await botAPI.getMessages();
      const raw = res.data as {
        conversations?: Array<{
          phone: string;
          client_name: string | null;
          last_message: string;
          last_message_at: string;
          message_count: string;
          botActive?: boolean;
        }>;
      };
      const convs = raw.conversations ?? [];
      setConversations((prev) => {
        const prevMap = new Map(prev.map((c) => [c.phone, c.botActive]));
        return convs.map((c) => ({
          ...c,
          botActive: c.botActive ?? prevMap.get(c.phone) ?? true,
        }));
      });
    } catch {
      // silent
    } finally {
      setConvLoading(false);
    }
  }, []);

  // Auto-open chat from BotClients
  useEffect(() => {
    const phoneToOpen = localStorage.getItem('openChatPhone');
    if (phoneToOpen) {
      localStorage.removeItem('openChatPhone');
      setSelectedPhone(phoneToOpen);
      setShowRightPanel(true);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
    const iv = setInterval(() => fetchConversations(true), 8000);
    return () => clearInterval(iv);
  }, [fetchConversations]);

  // ── Fetch messages for selected phone ──────────────────────────────────────

  const fetchMessages = useCallback(async (phone: string, silent = false) => {
    if (!silent) setMsgLoading(true);
    try {
      const res = await botAPI.getPhoneMessages(phone);
      const data = res.data as unknown;
      const raw = Array.isArray(data) ? data : ((data as any).messages ?? []);
      setMessages([...raw].reverse()); // API returns DESC, we need ASC for chat display
    } catch {
      if (!silent) setMessages([]);
    } finally {
      if (!silent) setMsgLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedPhone) fetchMessages(selectedPhone);
  }, [selectedPhone, fetchMessages]);

  // Auto-refresh selected chat (silent — no loading spinner, no scroll reset)
  useEffect(() => {
    if (!selectedPhone) return;
    const iv = setInterval(() => fetchMessages(selectedPhone, true), 8000);
    return () => clearInterval(iv);
  }, [selectedPhone, fetchMessages]);

  // Scroll to bottom ONLY on first load or conversation switch
  const lastSelectedPhone = useRef<string | null>(null);
  useEffect(() => {
    if (!messages.length) return;
    const isNewConversation = selectedPhone !== lastSelectedPhone.current;
    const isFirstLoad = prevMessageCount.current === 0;
    const hasNewMessages = messages.length > prevMessageCount.current;
    prevMessageCount.current = messages.length;

    if (isNewConversation || isFirstLoad) {
      lastSelectedPhone.current = selectedPhone;
      // Instant jump to bottom on conversation switch
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "instant" });
      }, 50);
    } else if (hasNewMessages && !userScrolledRef.current) {
      // New message arrived and user is at bottom — smooth scroll
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
    // If user scrolled up: NEVER move scroll
  }, [messages, selectedPhone]);

  // Track if user scrolled up manually
  const handleScrollContainer = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const distFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
    userScrolledRef.current = distFromBottom > 80;
  }, []);

  // Scroll to highlighted message (search result) — wait for messages to load
  useEffect(() => {
    if (!highlightMessageId || messages.length === 0) return;
    // Wait for DOM to render the message
    const timer = setTimeout(() => {
      // Try both formats: msg-{id} and msg-{stringId}
      let element = document.getElementById(`msg-${highlightMessageId}`);
      if (!element) {
        // Try with string conversion
        element = document.getElementById(`msg-${String(highlightMessageId)}`);
      }
      console.log(`[Search] Looking for msg-${highlightMessageId}, found:`, !!element);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
        console.log(`[Search] Scrolled to message ${highlightMessageId}`);
      } else {
        console.log(`[Search] Message ${highlightMessageId} not found in DOM`);
        console.log(`[Search] Available message IDs:`, messages.slice(0, 5).map(m => m.id));
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [highlightMessageId, messages]);

  // ── Handlers ───────────────────────────────────────────────────────────────

  const selectConversation = (phone: string, firstMatchId?: string | number | null) => {
    setSelectedPhone(phone);
    setShowRightPanel(true);
    setInputText("");
    setHighlightMessageId(firstMatchId || null);
  };

  const handleToggleAI = async (phone: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setConversations((prev) =>
      prev.map((c) => (c.phone === phone ? { ...c, botActive: !c.botActive } : c))
    );
    try {
      await botAPI.toggleChatAI(phone);
    } catch {
      // revert on failure
      setConversations((prev) =>
        prev.map((c) => (c.phone === phone ? { ...c, botActive: !c.botActive } : c))
      );
    }
  };

  const handleSend = async () => {
    const text = inputText.trim();
    if (!text || !selectedPhone || sending) return;
    setInputText("");
    setSending(true);
    // Optimistic message
    const optimistic: MsgRow = {
      id: `opt-${Date.now()}`,
      phone: selectedPhone,
      direction: "outbound",
      content: text,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);
    try {
      await botAPI.sendMessage(selectedPhone, text);
      await fetchMessages(selectedPhone);
    } catch {
      // keep optimistic on screen
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ── Message search ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!msgSearch.trim()) {
      setMessageSearchMatches([]);
      setHighlightMessageId(null);
      return;
    }

    const q = msgSearch.toLowerCase();
    const matches = messages
      .filter((m) => m.content.toLowerCase().includes(q))
      .map((m) => m.id);
    setMessageSearchMatches(matches);
    setCurrentMatchIndex(0);

    if (matches.length > 0) {
      setHighlightMessageId(matches[0]);
      setTimeout(() => {
        const el = document.getElementById(`msg-${matches[0]}`);
        el?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 100);
    }
  }, [msgSearch, messages]);

  // ── Filtering ──────────────────────────────────────────────────────────────

  const filtered = conversations.filter((c) => {
    const q = search.toLowerCase();
    const matchSearch =
      !search ||
      (c.client_name || "").toLowerCase().includes(q) ||
      c.phone.includes(q);
    const matchFilter =
      filter === "all" ||
      (filter === "ai" && c.botActive) ||
      (filter === "manual" && !c.botActive);
    return matchSearch && matchFilter;
  });

  const selectedConv = conversations.find((c) => c.phone === selectedPhone);

  // ── Group messages by date ─────────────────────────────────────────────────

  const messageGroups: { date: string; msgs: MsgRow[] }[] = [];
  messages.forEach((m) => {
    const label = getDateLabel(m.created_at);
    const last = messageGroups[messageGroups.length - 1];
    if (!last || last.date !== label) {
      messageGroups.push({ date: label, msgs: [m] });
    } else {
      last.msgs.push(m);
    }
  });

  // Calculate stats
  const totalConversations = conversations.length;
  // Sum message_count from all conversations
  const totalMessages = conversations.reduce((sum, conv) => {
    const count = parseInt(conv.message_count || "0", 10);
    return sum + count;
  }, 0);

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    /*
     * Escape DashboardLayout's padding (p-3 md:p-8) so the 2-panel layout
     * can fill the full available height below the top bar (h-16 / h-20).
     */
    <div
      className="-m-3 md:-m-8 flex overflow-hidden"
      style={{ height: "calc(100vh - 4rem)" }}
    >
      {/* ════════════════════════════════════════════════════════════
          LEFT PANEL — Conversation List (320 px on desktop)
      ════════════════════════════════════════════════════════════ */}
      <div
        className={`flex flex-col border-r-2 border-border bg-background ${
          showRightPanel ? "hidden md:flex" : "flex"
        } w-full flex-shrink-0 md:w-80`}
      >
        {/* Stats bar */}
        <div className="flex-shrink-0 border-b-2 border-border bg-secondary-background px-4 py-3">
          <div className="grid grid-cols-2 gap-3">
            <NeoCard variant="neutral" className="p-2.5">
              <div className="flex items-center gap-2 font-base text-sm text-foreground/70">
                <Users size={14} />
                <span>Conversaciones</span>
              </div>
              <div className="mt-1 font-heading text-xl font-bold text-foreground md:text-2xl">
                {totalConversations}
              </div>
            </NeoCard>
            <NeoCard variant="neutral" className="p-2.5">
              <div className="flex items-center gap-2 font-base text-sm text-foreground/70">
                <MessageCircle size={14} />
                <span>Mensajes</span>
              </div>
              <div className="mt-1 font-heading text-xl font-bold text-foreground md:text-2xl">
                {totalMessages}
              </div>
            </NeoCard>
          </div>
        </div>

        {/* Header */}
        <div className="flex-shrink-0 border-b-2 border-border p-4">
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-base border-2 border-border bg-main text-main-foreground shadow-button">
              <MessageSquare size={16} />
            </div>
            <h2 className="font-heading text-xl font-bold text-foreground md:text-2xl">
              Conversaciones
            </h2>
            <NeoBadge variant="neutral" className="ml-auto">
              {conversations.length}
            </NeoBadge>
          </div>

          {/* Search */}
          <div className="relative mb-3">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/50"
            />
            <NeoInput
              type="text"
              placeholder={search.trim().length >= 2 ? "Buscando en mensajes..." : "Buscar por nombre, número o palabra..."}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-3 text-base"
            />
            {search.trim().length >= 2 && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 font-base text-xs font-black text-main">
                EN MENSAJES
              </span>
            )}
          </div>

          {/* Filter tabs */}
          <div className="flex gap-1">
            {(
              [
                ["all", "Todos"],
                ["ai", "IA Activa"],
                ["manual", "Manual"],
              ] as const
            ).map(([val, label]) => (
              <NeoButton
                key={val}
                onClick={() => setFilter(val)}
                variant={filter === val ? "default" : "neutral"}
                size="sm"
                className="flex-1"
              >
                {label}
              </NeoButton>
            ))}
          </div>
        </div>

        {/* Conversation list */}
        <div className="custom-scroll flex-1 overflow-y-auto">
          {convLoading ? (
            <div className="flex items-center justify-center py-16 text-foreground/50">
              <RefreshCw size={20} className="animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-14 text-center text-foreground/50">
              <MessageSquare
                size={32}
                className="mx-auto mb-2 opacity-40"
              />
              <p className="font-base text-base">Sin conversaciones</p>
            </div>
          ) : (
            filtered.map((conv) => (
              <ConvItem
                key={conv.phone}
                conv={conv}
                isSelected={selectedPhone === conv.phone}
                onSelect={() => selectConversation(conv.phone, conv.firstMatchId)}
                onToggleAI={handleToggleAI}
              />
            ))
          )}
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════
          RIGHT PANEL — Chat Area
      ════════════════════════════════════════════════════════════ */}
      <div
        className={`flex flex-1 flex-col overflow-hidden bg-secondary-background ${
          !showRightPanel ? "hidden md:flex" : "flex"
        }`}
      >
        {/* ── Empty state ── */}
        {!selectedPhone ? (
          <div className="flex flex-1 flex-col items-center justify-center text-foreground/50">
            <MessageSquare size={52} className="mb-4 opacity-40" />
            <p className="font-heading text-xl font-semibold text-foreground/70 md:text-2xl">
              Selecciona una conversación
            </p>
            <p className="mt-1 font-base text-base">
              Los mensajes aparecerán aquí
            </p>
          </div>
        ) : (
          <>
            {/* ── Top bar ── */}
            <div className="flex flex-shrink-0 items-center gap-3 border-b-2 border-border bg-secondary-background px-4 py-3">
              {/* Back (mobile only) */}
              <NeoButton
                size="icon"
                variant="neutral"
                className="md:hidden"
                onClick={() => {
                  setShowRightPanel(false);
                  setSelectedPhone(null);
                }}
              >
                <ChevronLeft size={20} />
              </NeoButton>

              {/* Avatar */}
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-2 border-border bg-main text-sm font-black text-main-foreground shadow-button">
                {getInitials(selectedConv?.client_name, selectedConv?.phone)}
              </div>

              {/* Name + phone */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <p className="truncate font-base text-base font-semibold text-foreground">
                    {selectedConv?.client_name ||
                      formatPhone(selectedPhone)}
                  </p>
                  <Circle
                    size={7}
                    className="flex-shrink-0 fill-main text-main"
                  />
                </div>
                <p className="truncate font-base text-sm text-foreground/60">
                  {selectedPhone}
                </p>
              </div>

              {/* IA badge + toggle */}
              <div className="flex items-center gap-2">
                {selectedConv?.botActive && (
                  <NeoBadge variant="main" className="hidden sm:inline">
                    IA activada
                  </NeoBadge>
                )}
                <NeoButton
                  onClick={(e) => handleToggleAI(selectedPhone, e)}
                  variant={selectedConv?.botActive ? "default" : "neutral"}
                  size="sm"
                >
                  {selectedConv?.botActive ? (
                    <Bot size={14} />
                  ) : (
                    <User size={14} />
                  )}
                  <span className="hidden sm:inline">
                    {selectedConv?.botActive ? "Bot" : "Manual"}
                  </span>
                </NeoButton>
              </div>

              {/* Message search button */}
              <NeoButton
                onClick={() => {
                  setShowMsgSearch(!showMsgSearch);
                  if (showMsgSearch) {
                    setMsgSearch("");
                    setMessageSearchMatches([]);
                    setHighlightMessageId(null);
                  }
                }}
                variant={showMsgSearch ? "default" : "neutral"}
                size="icon"
                title="Buscar en mensajes"
              >
                <Search size={18} />
              </NeoButton>
            </div>

            {/* Message search bar */}
            {showMsgSearch && (
              <div className="flex flex-shrink-0 items-center gap-2 border-b-2 border-border bg-secondary-background px-4 py-2">
                <Search size={16} className="flex-shrink-0 text-foreground/50" />
                <NeoInput
                  type="text"
                  value={msgSearch}
                  onChange={(e) => setMsgSearch(e.target.value)}
                  placeholder="Buscar en mensajes..."
                  autoFocus
                  className="flex-1"
                />
                {messageSearchMatches.length > 0 && (
                  <span className="flex-shrink-0 font-base text-xs text-foreground/60">
                    {currentMatchIndex + 1}/{messageSearchMatches.length}
                  </span>
                )}
                <NeoButton
                  onClick={() => {
                    setShowMsgSearch(false);
                    setMsgSearch("");
                    setMessageSearchMatches([]);
                    setHighlightMessageId(null);
                  }}
                  variant="ghost"
                  size="icon"
                >
                  ✕
                </NeoButton>
              </div>
            )}

            {/* ── Messages area ── */}
            <div
              ref={scrollContainerRef}
              onScroll={handleScrollContainer}
              className="custom-scroll flex-1 overflow-y-auto px-4 py-4"
            >
              {msgLoading ? (
                <div className="flex items-center justify-center py-16 text-foreground/50">
                  <RefreshCw size={20} className="animate-spin" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex items-center justify-center py-16">
                  <p className="font-base text-base text-foreground/50">Sin mensajes aún</p>
                </div>
              ) : (
                messageGroups.map((group) => (
                  <div key={group.date}>
                    <DateSeparator label={group.date} />
                    {group.msgs.map((msg) => (
                      <MessageBubble key={msg.id} msg={msg} isHighlighted={msg.id === highlightMessageId} />
                    ))}
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* ── Input bar ── */}
            <div className="flex flex-shrink-0 items-center gap-2 border-t-2 border-border bg-secondary-background px-4 py-3">
              <NeoInput
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Escribe un mensaje..."
                className="flex-1"
              />
              <NeoButton
                onClick={handleSend}
                disabled={!inputText.trim() || sending}
                size="icon"
              >
                {sending ? (
                  <RefreshCw size={16} className="animate-spin" />
                ) : (
                  <Send size={16} />
                )}
              </NeoButton>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default BotMessages;
