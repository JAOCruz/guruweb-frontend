import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Send,
  Bot,
  User,
  Trash2,
  RefreshCw,
  Paperclip,
  Mic,
  Square,
  X,
  FileText,
  Image as ImageIcon,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Plus,
  Save,
  History,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import api from "../services/api";

interface StoredMessage {
  id: number;
  role: "user" | "bot";
  text: string;
  media_type?: string;
  media_original_name?: string;
  media_analysis?: string;
  feedback?: string;
  rating?: number;
  created_at: string;
}

interface StoredConversation {
  id: number;
  session_id: string;
  title: string;
  notes?: string;
  status: "open" | "reviewed" | "needs_fix" | "archived";
  created_at: string;
  updated_at: string;
  message_count?: number;
  last_message_at?: string;
}

interface ChatMessage {
  id: string | number;
  role: "user" | "bot";
  text: string;
  timestamp: Date;
  media?: {
    id?: number | string;
    mediaType: string;
    originalName: string;
    analysis?: string;
  };
  feedback?: string;
  rating?: number;
  isLocal?: boolean;
}

interface UploadedMedia {
  file: File;
  previewUrl?: string;
  mediaType: string;
}

const statusColors: Record<string, string> = {
  open: "bg-blue-600",
  reviewed: "bg-emerald-600",
  needs_fix: "bg-amber-600",
  archived: "bg-slate-600",
};

const BotSimulator: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "bot",
      text: "🦉 ¡Hola! Soy El Gurú de Gurú Soluciones. Escribe un mensaje o adjunta una foto/documento/audio para probar cómo respondería el bot de WhatsApp.",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(() => `sim_${Date.now().toString(36).slice(-8)}`);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [title, setTitle] = useState("Chat de prueba");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<string>("open");
  const [savingMeta, setSavingMeta] = useState(false);
  const [attachedMedia, setAttachedMedia] = useState<UploadedMedia | null>(null);
  const [recording, setRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [conversations, setConversations] = useState<StoredConversation[]>([]);
  const [showSidebar, setShowSidebar] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const recordingChunksRef = useRef<Blob[]>([]);

  const loadConversation = useCallback(async (targetSessionId: string) => {
    setLoadingHistory(true);
    try {
      const res = await api.get(`/bot/simulate/conversation/${targetSessionId}`);
      const { conversation, messages: storedMessages } = res.data;

      if (conversation) {
        setConversationId(conversation.id);
        setTitle(conversation.title || "Chat de prueba");
        setNotes(conversation.notes || "");
        setStatus(conversation.status || "open");
      } else {
        setConversationId(null);
        setTitle("Chat de prueba");
        setNotes("");
        setStatus("open");
      }

      if (storedMessages && storedMessages.length > 0) {
        setMessages(
          storedMessages.map((m: StoredMessage) => ({
            id: m.id,
            role: m.role,
            text: m.text || "",
            timestamp: new Date(m.created_at),
            media: m.media_type
              ? {
                  mediaType: m.media_type,
                  originalName: m.media_original_name || "Archivo",
                  analysis: m.media_analysis,
                }
              : undefined,
            feedback: m.feedback,
            rating: m.rating,
          }))
        );
      } else {
        setMessages([
          {
            id: "welcome",
            role: "bot",
            text: "🦉 ¡Hola! Soy El Gurú de Gurú Soluciones. Escribe un mensaje o adjunta una foto/documento/audio para probar cómo respondería el bot de WhatsApp.",
            timestamp: new Date(),
          },
        ]);
      }
    } catch (err) {
      console.error("Failed to load conversation", err);
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  const loadConversations = useCallback(async () => {
    try {
      const res = await api.get("/admin/simulator/conversations?limit=50");
      setConversations(res.data.conversations || []);
    } catch (err) {
      console.error("Failed to load conversations", err);
    }
  }, []);

  useEffect(() => {
    loadConversation(sessionId);
    loadConversations();
  }, [sessionId, loadConversation, loadConversations]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    return () => {
      if (attachedMedia?.previewUrl) URL.revokeObjectURL(attachedMedia.previewUrl);
    };
  }, [attachedMedia]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    attachFile(file);
  };

  const attachFile = (file: File) => {
    const mediaType = file.type.startsWith("image/")
      ? "image"
      : file.type.startsWith("audio/")
        ? "audio"
        : "document";

    let previewUrl: string | undefined;
    if (mediaType === "image") previewUrl = URL.createObjectURL(file);

    setAttachedMedia({ file, previewUrl, mediaType });
  };

  const clearAttachment = () => {
    if (attachedMedia?.previewUrl) URL.revokeObjectURL(attachedMedia.previewUrl);
    setAttachedMedia(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : MediaRecorder.isTypeSupported("audio/mp4")
          ? "audio/mp4"
          : "";
      const mediaRecorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      mediaRecorderRef.current = mediaRecorder;
      recordingChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) recordingChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(recordingChunksRef.current, { type: mimeType || "audio/webm" });
        const file = new File([blob], `voice_note_${Date.now()}.webm`, { type: blob.type });
        attachFile(file);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setRecording(true);
      setRecordingTime(0);
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime((t) => t + 1);
      }, 1000);
    } catch (err) {
      alert("No se pudo acceder al micrófono. Verifica los permisos.");
      console.error(err);
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
    if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const saveMeta = async () => {
    if (!conversationId) return;
    setSavingMeta(true);
    try {
      await api.put(`/bot/simulate/conversation/${sessionId}`, {
        title,
        notes,
        status,
      });
      await loadConversations();
    } catch (err) {
      console.error("Failed to save meta", err);
    } finally {
      setSavingMeta(false);
    }
  };

  const sendFeedback = async (messageId: string | number, rating: number, feedback: string) => {
    try {
      await api.put(`/bot/simulate/feedback/${messageId}`, { rating, feedback });
      setMessages((prev) =>
        prev.map((m) => (m.id === messageId ? { ...m, rating, feedback } : m))
      );
      await loadConversations();
    } catch (err) {
      console.error("Failed to save feedback", err);
    }
  };

  const startNewChat = () => {
    const newSessionId = `sim_${Date.now().toString(36).slice(-8)}`;
    setSessionId(newSessionId);
    setMessages([
      {
        id: "welcome",
        role: "bot",
        text: "🦉 ¡Nuevo chat de prueba! Escribe un mensaje o adjunta un archivo.",
        timestamp: new Date(),
      },
    ]);
    setTitle("Chat de prueba");
    setNotes("");
    setStatus("open");
    setConversationId(null);
  };

  const sendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const text = input.trim();
    if (!text && !attachedMedia) return;

    const localUserMsg: ChatMessage = {
      id: `u_${Date.now()}`,
      role: "user",
      text: text || (attachedMedia ? `[${attachedMedia.mediaType === "audio" ? "Nota de voz" : "Archivo"}: ${attachedMedia.file.name}]` : ""),
      timestamp: new Date(),
      media: attachedMedia
        ? {
            mediaType: attachedMedia.mediaType,
            originalName: attachedMedia.file.name,
          }
        : undefined,
      isLocal: true,
    };

    setMessages((prev) => [...prev, localUserMsg]);
    setInput("");
    setLoading(true);

    try {
      let response;
      if (attachedMedia) {
        const formData = new FormData();
        formData.append("file", attachedMedia.file);
        if (text) formData.append("message", text);
        formData.append("sessionId", sessionId);
        response = await api.post("/bot/simulate", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        response = await api.post("/bot/simulate", {
          message: text,
          sessionId,
        });
      }

      const botMsg: ChatMessage = {
        id: response.data.botMessageId || `b_${Date.now()}`,
        role: "bot",
        text: response.data.response || "No se recibió respuesta.",
        timestamp: new Date(),
      };

      // Replace the local user message with server-persisted data by reloading
      setMessages((prev) => {
        const withoutLocal = prev.filter((m) => m.id !== localUserMsg.id);
        return [...withoutLocal, botMsg];
      });

      // Reload full conversation from server to get persisted IDs and metadata
      await loadConversation(sessionId);
      await loadConversations();
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `e_${Date.now()}`,
        role: "bot",
        text: `⚠️ Error: ${err.response?.data?.error || err.message || "No se pudo contactar el bot"}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
      clearAttachment();
    }
  };

  const clearChat = () => {
    startNewChat();
  };

  return (
    <div className="flex h-[calc(100vh-140px)] min-h-[500px] overflow-hidden rounded-2xl border border-slate-700/50 bg-[#0F172A]">
      {/* Sidebar */}
      <div
        className={`flex flex-col border-r border-slate-700/50 bg-[#151E32] transition-all duration-300 ${
          showSidebar ? "w-72" : "w-0 overflow-hidden"
        }`}
      >
        <div className="flex items-center justify-between border-b border-slate-700/50 p-4">
          <h3 className="flex items-center gap-2 font-display text-sm font-bold text-white">
            <History size={16} />
            Conversaciones
          </h3>
          <button
            onClick={startNewChat}
            className="flex items-center gap-1 rounded-lg bg-blue-600 px-2 py-1 text-xs font-bold text-white hover:bg-blue-500"
          >
            <Plus size={12} />
            Nuevo
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {conversations.map((conv) => (
            <button
              key={conv.session_id}
              onClick={() => setSessionId(conv.session_id)}
              className={`mb-2 w-full rounded-lg p-3 text-left text-xs transition-colors ${
                conv.session_id === sessionId
                  ? "bg-blue-600/30 text-blue-200"
                  : "bg-slate-800/50 text-slate-300 hover:bg-slate-700"
              }`}
            >
              <div className="mb-1 flex items-center justify-between">
                <span className="truncate font-semibold">{conv.title}</span>
                <span className={`h-2 w-2 rounded-full ${statusColors[conv.status] || "bg-slate-600"}`} />
              </div>
              <div className="flex items-center justify-between text-[10px] opacity-70">
                <span>{conv.message_count || 0} mensajes</span>
                <span>{conv.last_message_at ? new Date(conv.last_message_at).toLocaleDateString() : ""}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main chat area */}
      <div className="flex flex-1 flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-700/50 bg-[#151E32] px-5 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowSidebar((s) => !s)}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-700 hover:text-white"
            >
              {showSidebar ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
            </button>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-blue-600 text-white">
              <Bot size={20} />
            </div>
            <div>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={saveMeta}
                className="bg-transparent font-display text-base font-bold text-white focus:border-b focus:border-blue-500 focus:outline-none"
              />
              <p className="text-xs text-slate-400">{sessionId}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={startNewChat}
              className="flex items-center gap-2 rounded-lg border border-slate-600 bg-slate-800/50 px-3 py-2 text-xs font-bold text-slate-300 transition-colors hover:bg-slate-700 hover:text-white"
            >
              <Plus size={14} />
              Nuevo chat
            </button>
            <button
              onClick={clearChat}
              className="flex items-center gap-2 rounded-lg border border-slate-600 bg-slate-800/50 px-3 py-2 text-xs font-bold text-slate-300 transition-colors hover:bg-slate-700 hover:text-white"
            >
              <Trash2 size={14} />
              Reiniciar
            </button>
          </div>
        </div>

        {/* Notes / status bar */}
        <div className="border-b border-slate-700/50 bg-[#0B1221] px-5 py-3">
          <div className="flex flex-col gap-3 md:flex-row md:items-start">
            <div className="flex-1">
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Notas de Leandro
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Escribe aquí qué ajustes necesita el bot, ej: 'el saludo es muy formal'..."
                className="h-16 w-full resize-none rounded-lg border border-slate-600 bg-[#0F172A] px-3 py-2 text-xs text-white placeholder-slate-600 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Estado</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="rounded-lg border border-slate-600 bg-[#0F172A] px-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
              >
                <option value="open">Abierto</option>
                <option value="needs_fix">Necesita ajuste</option>
                <option value="reviewed">Revisado</option>
                <option value="archived">Archivado</option>
              </select>
              <button
                onClick={saveMeta}
                disabled={savingMeta || !conversationId}
                className="flex items-center justify-center gap-2 rounded-lg bg-purple-600 px-3 py-2 text-xs font-bold text-white hover:bg-purple-500 disabled:opacity-50"
              >
                <Save size={12} />
                {savingMeta ? "Guardando..." : "Guardar notas"}
              </button>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 space-y-4 overflow-y-auto p-4 md:p-6">
          {loadingHistory && (
            <div className="py-4 text-center text-xs text-slate-500">Cargando historial...</div>
          )}
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`flex max-w-[90%] gap-3 ${
                  msg.role === "user" ? "flex-row-reverse" : "flex-row"
                }`}
              >
                <div
                  className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${
                    msg.role === "user" ? "bg-blue-600" : "bg-gradient-to-br from-purple-600 to-blue-600"
                  }`}
                >
                  {msg.role === "user" ? <User size={14} /> : <Bot size={14} />}
                </div>
                <div className="min-w-0">
                  <div
                    className={`rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                      msg.role === "user"
                        ? "bg-blue-600 text-white"
                        : "border border-slate-700 bg-[#1E293B] text-slate-200"
                    }`}
                  >
                    {msg.text}
                    {msg.media && (
                      <div className="mt-2 rounded-lg border border-white/20 bg-white/10 p-2 text-xs">
                        {msg.media.mediaType === "image" && <ImageIcon size={14} className="mb-1" />}
                        {msg.media.mediaType === "document" && <FileText size={14} className="mb-1" />}
                        {msg.media.mediaType === "audio" && <Mic size={14} className="mb-1" />}
                        <span className="opacity-90">{msg.media.originalName}</span>
                        {msg.media.analysis && (
                          <p className="mt-1 text-[10px] opacity-70 line-clamp-3">
                            {msg.media.analysis}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Feedback for bot messages */}
                  {msg.role === "bot" && typeof msg.id === "number" && (
                    <div className="mt-2 rounded-lg border border-slate-700 bg-[#0B1221] p-2">
                      <div className="mb-2 flex items-center gap-2">
                        <button
                          onClick={() => sendFeedback(msg.id, 1, msg.feedback || "")}
                          className={`rounded p-1 ${msg.rating === 1 ? "bg-emerald-600 text-white" : "text-slate-400 hover:bg-slate-700"}`}
                          title="Buena respuesta"
                        >
                          <ThumbsUp size={12} />
                        </button>
                        <button
                          onClick={() => sendFeedback(msg.id, -1, msg.feedback || "")}
                          className={`rounded p-1 ${msg.rating === -1 ? "bg-red-600 text-white" : "text-slate-400 hover:bg-slate-700"}`}
                          title="Necesita corrección"
                        >
                          <ThumbsDown size={12} />
                        </button>
                        <span className="text-[10px] text-slate-500">¿Cómo mejoraría esta respuesta?</span>
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          defaultValue={msg.feedback || ""}
                          placeholder="Ej: suena muy formal, falta precio..."
                          className="flex-1 rounded border border-slate-700 bg-[#0F172A] px-2 py-1 text-[10px] text-white placeholder-slate-600 focus:border-blue-500 focus:outline-none"
                          onBlur={(e) => {
                            const rating = msg.rating ?? 0;
                            sendFeedback(msg.id, rating, e.target.value);
                          }}
                        />
                        <MessageSquare size={12} className="text-slate-500" />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="flex max-w-[85%] gap-3">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-blue-600">
                  <Bot size={14} />
                </div>
                <div className="flex items-center gap-2 rounded-2xl border border-slate-700 bg-[#1E293B] px-4 py-3 text-sm text-slate-400">
                  <RefreshCw size={14} className="animate-spin" />
                  El Gurú está analizando...
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Attachment preview */}
        {attachedMedia && (
          <div className="border-t border-slate-700/50 bg-[#151E32] px-4 py-3">
            <div className="flex items-center gap-3 rounded-xl border border-slate-600 bg-[#0B1120] p-2">
              {attachedMedia.mediaType === "image" && attachedMedia.previewUrl ? (
                <img
                  src={attachedMedia.previewUrl}
                  alt="preview"
                  className="h-16 w-16 rounded-lg object-cover"
                />
              ) : (
                <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-lg bg-slate-800 text-slate-400">
                  {attachedMedia.mediaType === "audio" ? <Mic size={24} /> : <FileText size={24} />}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-white">{attachedMedia.file.name}</p>
                <p className="text-xs text-slate-400">
                  {attachedMedia.mediaType === "audio" ? "Nota de voz" : attachedMedia.mediaType}
                </p>
              </div>
              <button
                onClick={clearAttachment}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>
          </div>
        )}

        {/* Input */}
        <form onSubmit={sendMessage} className="border-t border-slate-700/50 bg-[#151E32] p-4">
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,audio/*"
              onChange={handleFileSelect}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={loading || recording || !!attachedMedia}
              className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-slate-600 bg-[#0B1120] text-slate-300 transition-colors hover:bg-slate-700 hover:text-white disabled:opacity-50"
              title="Adjuntar archivo"
            >
              <Paperclip size={18} />
            </button>

            {recording ? (
              <button
                type="button"
                onClick={stopRecording}
                className="flex h-10 flex-shrink-0 items-center gap-2 rounded-xl bg-red-600 px-3 text-sm font-bold text-white transition-colors hover:bg-red-500"
              >
                <Square size={14} fill="currentColor" />
                {formatTime(recordingTime)}
              </button>
            ) : (
              <button
                type="button"
                onClick={startRecording}
                disabled={loading || !!attachedMedia}
                className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-slate-600 bg-[#0B1120] text-slate-300 transition-colors hover:bg-slate-700 hover:text-white disabled:opacity-50"
                title="Grabar nota de voz"
              >
                <Mic size={18} />
              </button>
            )}

            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escribe un mensaje de prueba..."
              className="flex-1 rounded-xl border border-slate-600 bg-[#0B1120] px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={loading || (!input.trim() && !attachedMedia)}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white transition-colors hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Send size={18} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BotSimulator;
