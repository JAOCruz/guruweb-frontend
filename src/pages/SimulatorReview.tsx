import React, { useState, useEffect, useCallback } from "react";
import api from "../services/api";
import { Bot, User } from "lucide-react";

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

const statusLabels: Record<string, string> = {
  open: "Abierto",
  reviewed: "Revisado",
  needs_fix: "Necesita ajuste",
  archived: "Archivado",
};

const statusColors: Record<string, string> = {
  open: "bg-blue-600",
  reviewed: "bg-emerald-600",
  needs_fix: "bg-amber-600",
  archived: "bg-slate-600",
};

const SimulatorReview: React.FC = () => {
  const [conversations, setConversations] = useState<StoredConversation[]>([]);
  const [selected, setSelected] = useState<StoredConversation | null>(null);
  const [messages, setMessages] = useState<StoredMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<string>("");

  const loadConversations = useCallback(async () => {
    try {
      const res = await api.get(`/admin/simulator/conversations?limit=200&status=${filter}`);
      setConversations(res.data.conversations || []);
    } catch (err) {
      console.error("Failed to load conversations", err);
    }
  }, [filter]);

  const loadMessages = async (sessionId: string) => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/simulator/conversations/${sessionId}`);
      setSelected(res.data.conversation);
      setMessages(res.data.messages || []);
    } catch (err) {
      console.error("Failed to load messages", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  const updateStatus = async (newStatus: string) => {
    if (!selected) return;
    try {
      await api.put(`/admin/simulator/conversations/${selected.session_id}`, {
        status: newStatus,
      });
      setSelected({ ...selected, status: newStatus as StoredConversation["status"] });
      await loadConversations();
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  const exportConversation = () => {
    if (!selected) return;
    const data = { conversation: selected, messages };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `simulator-${selected.session_id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex h-[calc(100vh-140px)] min-h-[500px] overflow-hidden rounded-2xl border border-slate-700/50 bg-[#0F172A]">
      {/* List */}
      <div className="hidden w-80 flex-col border-r border-slate-700/50 bg-[#151E32] md:flex">
        <div className="border-b border-slate-700/50 p-4">
          <h2 className="mb-3 font-display text-lg font-bold text-white">Revisiones del Simulador</h2>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full rounded-lg border border-slate-600 bg-[#0B1120] px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
          >
            <option value="">Todos los estados</option>
            <option value="open">Abiertos</option>
            <option value="needs_fix">Necesita ajuste</option>
            <option value="reviewed">Revisados</option>
            <option value="archived">Archivados</option>
          </select>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {conversations.map((conv) => (
            <button
              key={conv.session_id}
              onClick={() => loadMessages(conv.session_id)}
              className={`mb-2 w-full rounded-lg p-3 text-left text-xs transition-colors ${
                selected?.session_id === conv.session_id
                  ? "bg-blue-600/30 text-blue-200"
                  : "bg-slate-800/50 text-slate-300 hover:bg-slate-700"
              }`}
            >
              <div className="mb-1 flex items-center justify-between">
                <span className="truncate font-semibold">{conv.title}</span>
                <span
                  className={`rounded px-1.5 py-0.5 text-[10px] font-bold text-white ${
                    statusColors[conv.status] || "bg-slate-600"
                  }`}
                >
                  {statusLabels[conv.status] || conv.status}
                </span>
              </div>
              <p className="mb-1 line-clamp-2 text-[10px] text-slate-400">{conv.notes || "Sin notas"}</p>
              <div className="flex items-center justify-between text-[10px] opacity-70">
                <span>{conv.message_count || 0} mensajes</span>
                <span>{conv.last_message_at ? new Date(conv.last_message_at).toLocaleString() : ""}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Detail */}
      <div className="flex flex-1 flex-col">
        {selected ? (
          <>
            <div className="border-b border-slate-700/50 bg-[#151E32] p-4">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="font-display text-lg font-bold text-white">{selected.title}</h3>
                <div className="flex items-center gap-2">
                  <select
                    value={selected.status}
                    onChange={(e) => updateStatus(e.target.value)}
                    className="rounded-lg border border-slate-600 bg-[#0B1120] px-2 py-1 text-xs text-white"
                  >
                    <option value="open">Abierto</option>
                    <option value="needs_fix">Necesita ajuste</option>
                    <option value="reviewed">Revisado</option>
                    <option value="archived">Archivado</option>
                  </select>
                  <button
                    onClick={exportConversation}
                    className="rounded-lg border border-slate-600 bg-slate-800 px-3 py-1 text-xs text-white hover:bg-slate-700"
                  >
                    Exportar JSON
                  </button>
                </div>
              </div>
              {selected.notes && (
                <div className="rounded-lg border border-amber-500/30 bg-amber-900/10 p-3 text-sm text-amber-200">
                  <strong>Notas:</strong> {selected.notes}
                </div>
              )}
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto p-4 md:p-6">
              {loading ? (
                <div className="py-8 text-center text-slate-500">Cargando mensajes...</div>
              ) : (
                messages.map((msg) => (
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
                      <div
                        className={`rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                          msg.role === "user"
                            ? "bg-blue-600 text-white"
                            : "border border-slate-700 bg-[#1E293B] text-slate-200"
                        }`}
                      >
                        {msg.text}
                        {msg.media_type && (
                          <div className="mt-2 rounded-lg border border-white/20 bg-white/10 p-2 text-xs">
                            <span className="font-semibold">{msg.media_original_name}</span>
                            <span className="ml-2 opacity-70">({msg.media_type})</span>
                            {msg.media_analysis && (
                              <p className="mt-1 text-[10px] opacity-80">{msg.media_analysis}</p>
                            )}
                          </div>
                        )}
                        {msg.role === "bot" && (msg.feedback || msg.rating !== undefined) && (
                          <div className="mt-2 rounded border border-slate-600 bg-slate-800/50 p-2 text-[10px] text-slate-300">
                            {msg.rating === 1 && <span className="text-emerald-400">👍 Buena respuesta</span>}
                            {msg.rating === -1 && <span className="text-red-400">👍 Necesita corrección</span>}
                            {msg.feedback && <p className="mt-1">{msg.feedback}</p>}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center text-slate-500">
            Selecciona una conversación para revisar
          </div>
        )}
      </div>
    </div>
  );
};

export default SimulatorReview;
