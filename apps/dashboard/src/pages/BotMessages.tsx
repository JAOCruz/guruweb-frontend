import React, { useEffect, useState, useCallback, useRef } from "react";
import { botAPI, getBotApiBaseURL } from "../services/botApi";
import { getAuthToken } from "../utils";
import { useAuth } from "../context/AuthContext";
import { NeoCard, NeoButton, NeoInput, NeoBadge } from "@guru/ui";
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
  UserCheck,
  Download,
  Maximize2,
  X,
  Info,
  FileText,
  Briefcase,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Package,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ConvRow {
  phone: string;
  client_name: string | null;
  client_id?: number | null;
  client_assigned_to?: number | null;
  profile_pic_url?: string | null;
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

interface ClientDetail {
  client: {
    id: number;
    name?: string;
    phone: string;
    email?: string;
    address?: string;
    notes?: string;
    assigned_to?: number | null;
    created_at: string;
  };
  services: Array<{
    id: number;
    name: string;
    abbreviation: string;
    color: string;
    category_type: string;
    status: 'active' | 'completed' | 'cancelled';
    started_at: string;
  }>;
  cases: Array<{
    id: number;
    case_number: string;
    title: string;
    description?: string;
    status: string;
    case_type?: string;
    court?: string;
    next_hearing?: string;
    created_at: string;
    tags: Array<{ tag_type: string; tag_value: string }>;
  }>;
  documents: Array<{
    id: number;
    doc_type: string;
    file_name?: string;
    status: string;
    created_at: string;
  }>;
  appointments: Array<{
    id: number;
    date: string;
    time: string;
    type: string;
    status: string;
  }>;
  stats: {
    totalServices: number;
    totalCases: number;
    totalMessages: number;
    totalDocuments: number;
  };
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

interface AvatarProps {
  url?: string | null;
  name?: string | null;
  phone?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const Avatar: React.FC<AvatarProps> = ({ url, name, phone, size = "md", className = "" }) => {
  const [failed, setFailed] = useState(false);

  const sizeClasses = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-12 w-12 text-base",
  };

  if (url && !failed) {
    return (
      <img
        src={url}
        alt={name || phone || "avatar"}
        onError={() => setFailed(true)}
        className={`rounded-full border-2 border-border object-cover shadow-button ${sizeClasses[size]} ${className}`}
      />
    );
  }

  return (
    <div
      className={`flex flex-shrink-0 items-center justify-center rounded-full border-2 border-border bg-main font-black text-main-foreground shadow-button ${sizeClasses[size]} ${className}`}
    >
      {getInitials(name, phone)}
    </div>
  );
};

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
  const name = conv.client_name || formatPhone(conv.phone);
  const preview = (conv.last_message || "—").slice(0, 40);
  const time = formatRelTime(conv.last_message_at);

  return (
    <div
      onClick={onSelect}
      className={`flex cursor-pointer items-start gap-3 border-b-2 border-border px-4 py-4 transition-all md:py-3 ${
        isSelected
          ? "bg-main text-main-foreground"
          : "bg-background text-foreground hover:bg-secondary-background"
      }`}
    >
      {/* Avatar */}
      <Avatar
        url={conv.profile_pic_url}
        name={conv.client_name}
        phone={conv.phone}
        size="md"
        className="h-11 w-11 md:h-10 md:w-10"
      />

      {/* Name + preview */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate font-base text-base font-semibold">{name}</p>
          <span className={`flex-shrink-0 font-base text-xs ${isSelected ? "text-main-foreground/70" : "text-foreground/50"}`}>
            {time}
          </span>
        </div>
        <p className={`mt-0.5 line-clamp-2 font-base text-xs leading-snug ${isSelected ? "text-main-foreground/80" : "text-foreground/60"}`}>
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
        className="mt-1 h-10 w-10 flex-shrink-0 md:h-8 md:w-8"
      >
        {conv.botActive ? <Bot size={16} /> : <User size={16} />}
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
    const token = getAuthToken();
    const base = getBotApiBaseURL();
    // media_url is stored as /api/media/... while baseURL already ends in /api
    const cleanBase = apiPath.startsWith("/api/") && base.endsWith("/api")
      ? base.slice(0, -4)
      : base;
    const url = apiPath.startsWith("http") ? apiPath : `${cleanBase}${apiPath}`;
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
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

// ─── PDF preview with fullscreen modal ────────────────────────────────────────

const PdfPreview: React.FC<{ blobUrl: string; apiPath: string }> = ({ blobUrl, apiPath }) => {
  const [open, setOpen] = useState(false);

  const fileName = apiPath.split("/").pop() || "documento.pdf";

  return (
    <div className="mb-1.5">
      <div className="relative">
        <iframe
          src={blobUrl}
          title="Vista previa PDF"
          className="h-64 w-full rounded-base border-2 border-border bg-white shadow-button"
        />
        <button
          onClick={() => setOpen(true)}
          className="absolute right-2 top-2 rounded-base border-2 border-border bg-secondary-background p-1.5 text-foreground shadow-button hover:bg-main hover:text-main-foreground"
          title="Ver en pantalla completa"
        >
          <Maximize2 size={14} />
        </button>
      </div>
      <div className="mt-1 grid grid-cols-2 gap-2">
        <a
          href={blobUrl}
          download={fileName}
          className="flex items-center justify-center gap-1 rounded-base border-2 border-border bg-secondary-background px-2 py-1 font-base text-[10px] font-black uppercase tracking-wide text-foreground hover:bg-main hover:text-main-foreground"
        >
          <Download size={12} />
          Descargar PDF
        </a>
        <button
          onClick={() => setOpen(true)}
          className="flex items-center justify-center gap-1 rounded-base border-2 border-border bg-secondary-background px-2 py-1 font-base text-[10px] font-black uppercase tracking-wide text-foreground hover:bg-main hover:text-main-foreground"
        >
          <Maximize2 size={12} />
          Ampliar
        </button>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-50 flex flex-col bg-black/90 p-4"
          onClick={() => setOpen(false)}
        >
          <div className="flex items-center justify-between pb-2">
            <span className="font-base text-sm font-semibold text-white">{fileName}</span>
            <button
              onClick={() => setOpen(false)}
              className="rounded-base border-2 border-white/30 bg-white/10 p-2 text-white hover:bg-white/20"
            >
              <X size={18} />
            </button>
          </div>
          <iframe
            src={blobUrl}
            title="Vista previa PDF pantalla completa"
            className="flex-1 w-full rounded-base bg-white"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
};

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

  const DownloadLink = ({ label = "Descargar" }: { label?: string }) => (
    <a
      href={blobUrl}
      download
      className="mt-1 flex items-center justify-center gap-1 rounded-base border-2 border-border bg-secondary-background px-2 py-1 font-base text-[10px] font-black uppercase tracking-wide text-foreground hover:bg-main hover:text-main-foreground"
    >
      <Download size={12} />
      {label}
    </a>
  );

  if (mimeType.startsWith("image/")) {
    return (
      <div className="mb-1.5">
        <img
          src={blobUrl}
          alt="imagen"
          className="w-full max-h-52 cursor-pointer rounded-base border-2 border-border object-cover shadow-button"
          onClick={() => window.open(blobUrl, "_blank")}
        />
        <DownloadLink />
      </div>
    );
  }

  if (mimeType.startsWith("audio/")) {
    return (
      <div className="mb-1.5">
        <audio controls preload="metadata" className="w-full min-w-[250px]">
          <source src={blobUrl} type={mimeType || "audio/ogg"} />
          Tu navegador no soporta audio.
        </audio>
        <DownloadLink />
      </div>
    );
  }

  if (mimeType.startsWith("video/")) {
    return (
      <div className="mb-1.5">
        <video controls src={blobUrl} className="max-h-52 w-full rounded-base border-2 border-border object-cover shadow-button">
          Tu navegador no soporta video.
        </video>
        <DownloadLink />
      </div>
    );
  }

  // PDFs: inline preview + fullscreen + download
  if (mimeType === "application/pdf" || apiPath.toLowerCase().endsWith(".pdf")) {
    return (
      <PdfPreview blobUrl={blobUrl} apiPath={apiPath} />
    );
  }

  // Generic document download
  return (
    <div className="mb-1.5">
      <div className="flex items-center gap-2 rounded-base border-2 border-border bg-secondary-background px-3 py-2 shadow-button">
        <Download size={18} />
        <span className="font-base text-sm font-semibold">Documento</span>
      </div>
      <DownloadLink />
    </div>
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
    <span className="rounded-base border-2 border-border bg-secondary-background px-3 py-1.5 font-base text-xs font-black uppercase tracking-wider text-foreground/70">
      {label}
    </span>
    <div className="flex-1 border-t-2 border-border" />
  </div>
);

// ─── Main Page ────────────────────────────────────────────────────────────────

const BotMessages: React.FC = () => {
  const { isAdmin } = useAuth();
  // Conversation list
  const [conversations, setConversations] = useState<ConvRow[]>([]);
  const [convLoading, setConvLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "ai" | "manual">("all");

  // Selected conversation
  const [selectedPhone, setSelectedPhone] = useState<string | null>(null);
  const [showRightPanel, setShowRightPanel] = useState(false); // mobile toggle
  const [assignableUsers, setAssignableUsers] = useState<Array<{ id: number; name: string; role: string; username: string }>>([]);
  const [assigning, setAssigning] = useState(false);
  const [assignMsg, setAssignMsg] = useState<string | null>(null);

  // Chat
  const [messages, setMessages] = useState<MsgRow[]>([]);
  const [msgLoading, setMsgLoading] = useState(false);
  const [inputText, setInputText] = useState("");
  const [sending, setSending] = useState(false);
  const [highlightMessageId, setHighlightMessageId] = useState<string | number | null>(null);
  const [globalBotActive, setGlobalBotActive] = useState<boolean | null>(null);

  // Message search
  const [showMsgSearch, setShowMsgSearch] = useState(false);
  const [msgSearch, setMsgSearch] = useState("");
  const [messageSearchMatches, setMessageSearchMatches] = useState<(string | number)[]>([]);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);

  // Client detail panel
  const [showClientPanel, setShowClientPanel] = useState(false);
  const [clientDetail, setClientDetail] = useState<ClientDetail | null>(null);
  const [clientDetailLoading, setClientDetailLoading] = useState(false);

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

  const fetchGlobalStatus = useCallback(async () => {
    try {
      const res = await botAPI.getStatus();
      setGlobalBotActive(!(res.data.paused ?? false));
    } catch {
      setGlobalBotActive(null);
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
    fetchGlobalStatus();
    const iv = setInterval(() => {
      fetchConversations(true);
      fetchGlobalStatus();
    }, 8000);
    return () => clearInterval(iv);
  }, [fetchConversations, fetchGlobalStatus]);

  // ── Fetch client detail for info panel ────────────────────────────────────

  const fetchClientDetail = useCallback(async (clientId: number | string) => {
    setClientDetailLoading(true);
    try {
      const res = await botAPI.getClientDetail(clientId);
      setClientDetail(res.data as ClientDetail);
    } catch {
      setClientDetail(null);
    } finally {
      setClientDetailLoading(false);
    }
  }, []);

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

  // ── Assignment (admin only) ───────────────────────────────────────────────
  useEffect(() => {
    if (!isAdmin) return;
    (async () => {
      try {
        const res = await botAPI.getAdminUsers();
        const data = res.data as { users?: Array<{ id: number; name: string; role: string; username: string }> } | undefined;
        setAssignableUsers((data?.users || [])
          .filter((u) => u.role === "digitador" && u.username !== "administracion")
          .map((u) => ({ id: u.id, name: u.name || u.username, role: u.role, username: u.username })));
      } catch {
        setAssignableUsers([]);
      }
    })();
  }, [isAdmin]);

  const handleAssign = async (userId: string) => {
    if (!selectedConv?.client_id || userId === "") return;
    setAssigning(true);
    setAssignMsg(null);
    try {
      await botAPI.assignClient(selectedConv.client_id, userId);
      setAssignMsg("Asignado correctamente");
      fetchConversations(true);
    } catch (err: any) {
      setAssignMsg(err?.response?.data?.error || "Error al asignar");
    } finally {
      setAssigning(false);
      setTimeout(() => setAssignMsg(null), 3000);
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

  // Load client detail when the side panel opens
  useEffect(() => {
    if (showClientPanel && selectedConv?.client_id) {
      fetchClientDetail(selectedConv.client_id);
    } else if (!showClientPanel) {
      setClientDetail(null);
    }
  }, [showClientPanel, selectedConv?.client_id, fetchClientDetail]);

  // Fetch WhatsApp profile picture on demand if missing
  useEffect(() => {
    if (!selectedPhone || !selectedConv || selectedConv.profile_pic_url) return;

    let cancelled = false;
    botAPI.getProfilePic(selectedPhone)
      .then((res) => {
        const url = (res.data as { url?: string | null }).url;
        if (url && !cancelled) {
          setConversations((prev) =>
            prev.map((c) =>
              c.phone === selectedPhone ? { ...c, profile_pic_url: url } : c
            )
          );
        }
      })
      .catch(() => {});

    return () => { cancelled = true; };
  }, [selectedPhone, selectedConv]);

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
          <div className="mb-3 flex min-w-0 items-center gap-2">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-base border-2 border-border bg-main text-main-foreground shadow-button">
              <MessageSquare size={18} />
            </div>
            <h2 className="min-w-0 flex-1 truncate font-heading text-2xl font-black text-foreground md:text-3xl">
              Conversaciones
            </h2>
            <NeoBadge variant="neutral" className="flex-shrink-0 px-3 py-1.5 text-xs">
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
              <Avatar
                url={selectedConv?.profile_pic_url}
                name={selectedConv?.client_name}
                phone={selectedPhone}
                size="md"
              />

              {/* Name + phone */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setShowClientPanel(true)}
                    className="truncate font-base text-base font-semibold text-foreground hover:text-main hover:underline"
                    title="Ver información del cliente"
                  >
                    {selectedConv?.client_name || formatPhone(selectedPhone)}
                  </button>
                  <NeoButton
                    size="icon"
                    variant="neutral"
                    className="h-7 w-7 flex-shrink-0"
                    onClick={() => setShowClientPanel(true)}
                    title="Ver información del cliente"
                  >
                    <Info size={14} />
                  </NeoButton>
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
                {globalBotActive === false && (
                  <NeoBadge
                    variant="outline"
                    className="hidden px-2 py-0.5 text-[10px] text-red-600 border-red-600 sm:inline"
                  >
                    Bot pausado
                  </NeoBadge>
                )}
                {selectedConv?.botActive && (
                  <NeoBadge variant="main" className="hidden px-2 py-0.5 text-[10px] sm:inline">
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

              {/* Assignment (admin only) */}
              {isAdmin && (
                <div className="flex items-center gap-2">
                  <div className="relative flex items-center gap-1.5">
                    <UserCheck size={16} className="text-foreground/70" />
                    <select
                      disabled={assigning || !selectedConv?.client_id}
                      value={selectedConv?.client_assigned_to ?? ""}
                      onChange={(e) => handleAssign(e.target.value)}
                      className="h-9 max-w-[90px] truncate rounded-base border-2 border-border bg-background px-2 py-1 text-xs font-semibold text-foreground shadow-none focus:outline-none disabled:opacity-50 md:max-w-[140px]"
                      title="Asignar chat a digitador"
                    >
                      <option value="">Sin asignar</option>
                      {assignableUsers.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name || u.username}
                        </option>
                      ))}
                    </select>
                    {assignMsg && (
                      <span className="absolute -bottom-5 right-0 whitespace-nowrap text-[10px] font-semibold text-main">
                        {assignMsg}
                      </span>
                    )}
                  </div>
                </div>
              )}

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
            <div className="flex flex-shrink-0 items-center gap-2 border-t-2 border-border bg-secondary-background px-4 py-3 md:py-2">
              <NeoInput
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Escribe un mensaje..."
                className="flex-1 text-base md:text-sm"
              />
              <NeoButton
                onClick={handleSend}
                disabled={!inputText.trim() || sending}
                size="icon"
                className="h-11 w-11 md:h-9 md:w-9"
              >
                {sending ? (
                  <RefreshCw size={18} className="animate-spin md:size-4" />
                ) : (
                  <Send size={18} />
                )}
              </NeoButton>
            </div>
          </>
        )}
      </div>

      {/* ════════════════════════════════════════════════════════════
          CLIENT DETAIL PANEL — slide-over from the right
      ════════════════════════════════════════════════════════════ */}
      {showClientPanel && selectedPhone && (
        <div className="absolute inset-y-0 right-0 z-20 flex w-full flex-col border-l-2 border-border bg-background shadow-xl md:w-96">
          {/* Header */}
          <div className="flex flex-shrink-0 items-center justify-between border-b-2 border-border bg-secondary-background px-4 py-3">
            <div className="flex items-center gap-2">
              <Avatar
                url={selectedConv?.profile_pic_url}
                name={selectedConv?.client_name}
                phone={selectedPhone}
                size="md"
              />
              <div className="min-w-0">
                <p className="truncate font-base text-base font-semibold text-foreground">
                  {selectedConv?.client_name || formatPhone(selectedPhone)}
                </p>
                <p className="truncate font-base text-xs text-foreground/60">
                  {formatPhone(selectedPhone)}
                </p>
              </div>
            </div>
            <NeoButton
              size="icon"
              variant="neutral"
              onClick={() => setShowClientPanel(false)}
            >
              <X size={18} />
            </NeoButton>
          </div>

          {/* Content */}
          <div className="custom-scroll flex-1 overflow-y-auto px-4 py-4">
            {!selectedConv?.client_id ? (
              <div className="py-12 text-center text-foreground/50">
                <User size={40} className="mx-auto mb-3 opacity-40" />
                <p className="font-base text-base">Cliente no registrado</p>
                <p className="mt-1 font-base text-sm">
                  Este chat aún no tiene ficha de cliente en el sistema.
                </p>
              </div>
            ) : clientDetailLoading ? (
              <div className="flex items-center justify-center py-16 text-foreground/50">
                <RefreshCw size={24} className="animate-spin" />
              </div>
            ) : !clientDetail ? (
              <div className="py-12 text-center text-foreground/50">
                <p className="font-base text-base">No se pudo cargar la información</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* General info */}
                <NeoCard variant="neutral" className="p-3">
                  <h3 className="mb-2 font-base text-sm font-black uppercase tracking-wide text-foreground/70">
                    Información general
                  </h3>
                  <div className="space-y-2">
                    {clientDetail.client.name && (
                      <div className="flex items-start gap-2">
                        <User size={14} className="mt-0.5 text-foreground/50" />
                        <span className="font-base text-sm">{clientDetail.client.name}</span>
                      </div>
                    )}
                    <div className="flex items-start gap-2">
                      <Phone size={14} className="mt-0.5 text-foreground/50" />
                      <span className="font-base text-sm">{formatPhone(clientDetail.client.phone)}</span>
                    </div>
                    {clientDetail.client.email && (
                      <div className="flex items-start gap-2">
                        <Mail size={14} className="mt-0.5 text-foreground/50" />
                        <span className="font-base text-sm">{clientDetail.client.email}</span>
                      </div>
                    )}
                    {clientDetail.client.address && (
                      <div className="flex items-start gap-2">
                        <MapPin size={14} className="mt-0.5 text-foreground/50" />
                        <span className="font-base text-sm">{clientDetail.client.address}</span>
                      </div>
                    )}
                    {clientDetail.client.notes && (
                      <div className="mt-2 rounded-base border-2 border-border bg-background p-2">
                        <p className="font-base text-xs font-semibold text-foreground/70">Notas</p>
                        <p className="font-base text-sm">{clientDetail.client.notes}</p>
                      </div>
                    )}
                  </div>
                </NeoCard>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-2">
                  <NeoCard variant="neutral" className="p-2.5">
                    <div className="flex items-center gap-1.5 font-base text-xs text-foreground/70">
                      <Briefcase size={12} />
                      Casos
                    </div>
                    <p className="mt-1 font-heading text-xl font-bold">{clientDetail.stats.totalCases}</p>
                  </NeoCard>
                  <NeoCard variant="neutral" className="p-2.5">
                    <div className="flex items-center gap-1.5 font-base text-xs text-foreground/70">
                      <Package size={12} />
                      Servicios
                    </div>
                    <p className="mt-1 font-heading text-xl font-bold">{clientDetail.stats.totalServices}</p>
                  </NeoCard>
                  <NeoCard variant="neutral" className="p-2.5">
                    <div className="flex items-center gap-1.5 font-base text-xs text-foreground/70">
                      <FileText size={12} />
                      Documentos
                    </div>
                    <p className="mt-1 font-heading text-xl font-bold">{clientDetail.stats.totalDocuments}</p>
                  </NeoCard>
                  <NeoCard variant="neutral" className="p-2.5">
                    <div className="flex items-center gap-1.5 font-base text-xs text-foreground/70">
                      <MessageCircle size={12} />
                      Mensajes
                    </div>
                    <p className="mt-1 font-heading text-xl font-bold">{clientDetail.stats.totalMessages}</p>
                  </NeoCard>
                </div>

                {/* Cases */}
                {clientDetail.cases.length > 0 && (
                  <NeoCard variant="neutral" className="p-3">
                    <h3 className="mb-2 font-base text-sm font-black uppercase tracking-wide text-foreground/70">
                      Casos activos
                    </h3>
                    <div className="space-y-2">
                      {clientDetail.cases.map((c) => (
                        <div key={c.id} className="rounded-base border-2 border-border bg-background p-2">
                          <p className="font-base text-sm font-semibold">{c.case_number || `#${c.id}`}</p>
                          <p className="font-base text-xs text-foreground/70">{c.title}</p>
                          <p className="mt-1 font-base text-xs uppercase text-main">{c.status}</p>
                        </div>
                      ))}
                    </div>
                  </NeoCard>
                )}

                {/* Services */}
                {clientDetail.services.length > 0 && (
                  <NeoCard variant="neutral" className="p-3">
                    <h3 className="mb-2 font-base text-sm font-black uppercase tracking-wide text-foreground/70">
                      Servicios
                    </h3>
                    <div className="space-y-2">
                      {clientDetail.services.map((s) => (
                        <div key={s.id} className="rounded-base border-2 border-border bg-background p-2">
                          <p className="font-base text-sm font-semibold">{s.name}</p>
                          <p className="font-base text-xs text-foreground/70">{s.abbreviation} · {s.category_type}</p>
                          <p className="mt-1 font-base text-xs uppercase" style={{ color: s.color }}>{s.status}</p>
                        </div>
                      ))}
                    </div>
                  </NeoCard>
                )}

                {/* Documents */}
                {clientDetail.documents.length > 0 && (
                  <NeoCard variant="neutral" className="p-3">
                    <h3 className="mb-2 font-base text-sm font-black uppercase tracking-wide text-foreground/70">
                      Documentos
                    </h3>
                    <div className="space-y-2">
                      {clientDetail.documents.map((d) => (
                        <div key={d.id} className="rounded-base border-2 border-border bg-background p-2">
                          <p className="font-base text-sm font-semibold">{d.doc_type}</p>
                          {d.file_name && <p className="font-base text-xs text-foreground/70">{d.file_name}</p>}
                          <p className="mt-1 font-base text-xs uppercase text-foreground/60">{d.status}</p>
                        </div>
                      ))}
                    </div>
                  </NeoCard>
                )}

                {/* Appointments */}
                {clientDetail.appointments.length > 0 && (
                  <NeoCard variant="neutral" className="p-3">
                    <h3 className="mb-2 font-base text-sm font-black uppercase tracking-wide text-foreground/70">
                      Citas
                    </h3>
                    <div className="space-y-2">
                      {clientDetail.appointments.map((a) => (
                        <div key={a.id} className="flex items-center gap-2 rounded-base border-2 border-border bg-background p-2">
                          <Calendar size={14} className="text-foreground/50" />
                          <div>
                            <p className="font-base text-sm font-semibold">{a.type}</p>
                            <p className="font-base text-xs text-foreground/70">{a.date} · {a.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </NeoCard>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BotMessages;
