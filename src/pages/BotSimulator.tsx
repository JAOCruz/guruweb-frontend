import React, { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Trash2, RefreshCw, Paperclip, Mic, Square, X, FileText, Image as ImageIcon } from "lucide-react";
import api from "../services/api";

interface ChatMessage {
  id: string;
  role: "user" | "bot";
  text: string;
  timestamp: Date;
  media?: {
    id?: number | string;
    mediaType: string;
    originalName: string;
    analysis?: string;
  };
}

interface UploadedMedia {
  file: File;
  previewUrl?: string;
  mediaType: string;
}

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
  const [sessionId] = useState(() => `sim_${Date.now().toString(36).slice(-8)}`);
  const [attachedMedia, setAttachedMedia] = useState<UploadedMedia | null>(null);
  const [recording, setRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const recordingChunksRef = useRef<Blob[]>([]);

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

  const sendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const text = input.trim();
    if (!text && !attachedMedia) return;

    const userMsg: ChatMessage = {
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
    };

    setMessages((prev) => [...prev, userMsg]);
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
        id: `b_${Date.now()}`,
        role: "bot",
        text: response.data.response || "No se recibió respuesta.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMsg]);
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
    setMessages([
      {
        id: "welcome",
        role: "bot",
        text: "🦉 Chat reiniciado. Escribe un mensaje o adjunta una foto/documento/audio para probar el bot.",
        timestamp: new Date(),
      },
    ]);
    clearAttachment();
  };

  return (
    <div className="flex h-[calc(100vh-140px)] min-h-[500px] flex-col overflow-hidden rounded-2xl border border-slate-700/50 bg-[#0F172A]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-700/50 bg-[#151E32] px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-blue-600 text-white">
            <Bot size={20} />
          </div>
          <div>
            <h2 className="font-display text-lg font-bold text-white">Simulador de Bot</h2>
            <p className="text-xs text-slate-400">Prueba mensajes, fotos, documentos y notas de voz</p>
          </div>
        </div>
        <button
          onClick={clearChat}
          className="flex items-center gap-2 rounded-lg border border-slate-600 bg-slate-800/50 px-3 py-2 text-xs font-bold text-slate-300 transition-colors hover:bg-slate-700 hover:text-white"
        >
          <Trash2 size={14} />
          Reiniciar
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 space-y-4 overflow-y-auto p-4 md:p-6">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`flex max-w-[85%] gap-3 ${
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
              <p className="truncate text-sm font-medium text-white">
                {attachedMedia.file.name}
              </p>
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
      <form
        onSubmit={sendMessage}
        className="border-t border-slate-700/50 bg-[#151E32] p-4"
      >
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
        <p className="mt-2 text-center text-[10px] text-slate-500">
          Este simulador usa la misma IA y flujos que el bot de WhatsApp real.
        </p>
      </form>
    </div>
  );
};

export default BotSimulator;
