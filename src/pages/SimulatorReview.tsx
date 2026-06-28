import React, { useState, useEffect, useCallback } from "react";
import api from "../services/api";
import { Bot, User, FileText } from "lucide-react";
import { NeoCard } from "../components/ui/neo/NeoCard";
import { NeoButton } from "../components/ui/neo/NeoButton";
import { NeoSelect } from "../components/ui/neo/NeoSelect";
import { NeoBadge } from "../components/ui/neo/NeoBadge";

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

const statusBadges: Record<string, "main" | "neutral" | "outline"> = {
  open: "main",
  reviewed: "neutral",
  needs_fix: "outline",
  archived: "neutral",
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
    <div className="flex h-[calc(100vh-140px)] min-h-[500px] overflow-hidden rounded-base border-2 border-border bg-background shadow-shadow">
      {/* List */}
      <div className="hidden w-80 flex-col border-r-2 border-border bg-secondary-background md:flex">
        <div className="border-b-2 border-border p-4">
          <h2 className="mb-3 font-heading text-4xl font-black md:text-5xl">
            Revisiones del Simulador
          </h2>
          <NeoSelect
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="h-10 text-sm"
          >
            <option value="">Todos los estados</option>
            <option value="open">Abiertos</option>
            <option value="needs_fix">Necesita ajuste</option>
            <option value="reviewed">Revisados</option>
            <option value="archived">Archivados</option>
          </NeoSelect>
        </div>
        <div className="flex-1 overflow-y-auto p-2 custom-scroll">
          {conversations.map((conv) => (
            <button
              key={conv.session_id}
              onClick={() => loadMessages(conv.session_id)}
              className={`mb-2 w-full rounded-base border-2 p-3 text-left text-sm font-base transition-all ${
                selected?.session_id === conv.session_id
                  ? "border-border bg-main text-main-foreground shadow-shadow"
                  : "border-border bg-background text-foreground hover:bg-secondary-background"
              }`}
            >
              <div className="mb-1 flex items-center justify-between gap-2">
                <span className="truncate font-semibold">{conv.title}</span>
                <NeoBadge variant={statusBadges[conv.status] || "neutral"}>
                  {statusLabels[conv.status] || conv.status}
                </NeoBadge>
              </div>
              <p className="mb-1 line-clamp-2 text-xs text-foreground/60">
                {conv.notes || "Sin notas"}
              </p>
              <div className="flex items-center justify-between text-xs opacity-70">
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
            <div className="border-b-2 border-border bg-secondary-background p-4">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="font-heading text-lg font-bold md:text-xl">{selected.title}</h3>
                <div className="flex items-center gap-2">
                  <NeoSelect
                    value={selected.status}
                    onChange={(e) => updateStatus(e.target.value)}
                    className="h-9 w-auto text-xs"
                  >
                    <option value="open">Abierto</option>
                    <option value="needs_fix">Necesita ajuste</option>
                    <option value="reviewed">Revisado</option>
                    <option value="archived">Archivado</option>
                  </NeoSelect>
                  <NeoButton variant="neutral" size="sm" onClick={exportConversation}>
                    <FileText size={14} className="mr-1" />
                    Exportar JSON
                  </NeoButton>
                </div>
              </div>
              {selected.notes && (
                <NeoCard variant="outline" className="p-3">
                  <strong className="font-base font-bold">Notas:</strong>{" "}
                  <span className="font-base text-foreground/80">{selected.notes}</span>
                </NeoCard>
              )}
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto bg-background p-4 md:p-6 custom-scroll">
              {loading ? (
                <div className="py-8 text-center font-base text-foreground/50">
                  Cargando mensajes...
                </div>
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
                        className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border-2 ${
                          msg.role === "user"
                            ? "border-border bg-main text-main-foreground"
                            : "border-border bg-secondary-background text-foreground"
                        }`}
                      >
                        {msg.role === "user" ? <User size={14} /> : <Bot size={14} />}
                      </div>
                      <div
                        className={`rounded-base border-2 px-4 py-3 text-base font-base leading-relaxed whitespace-pre-wrap shadow-shadow ${
                          msg.role === "user"
                            ? "border-border bg-main text-main-foreground"
                            : "border-border bg-secondary-background text-foreground"
                        }`}
                      >
                        {msg.text}
                        {msg.media_type && (
                          <div className="mt-2 rounded-base border-2 border-border bg-background/50 p-2 text-sm">
                            <span className="font-semibold">{msg.media_original_name}</span>
                            <span className="ml-2 opacity-70">({msg.media_type})</span>
                            {msg.media_analysis && (
                              <p className="mt-1 text-xs opacity-80">{msg.media_analysis}</p>
                            )}
                          </div>
                        )}
                        {msg.role === "bot" && (msg.feedback || msg.rating !== undefined) && (
                          <NeoCard
                            variant={msg.rating === -1 ? "main" : "neutral"}
                            className="mt-2 gap-1 p-2 text-xs"
                          >
                            {msg.rating === 1 && <span>👍 Buena respuesta</span>}
                            {msg.rating === -1 && <span>👎 Necesita corrección</span>}
                            {msg.feedback && <p>{msg.feedback}</p>}
                          </NeoCard>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center font-base text-foreground/50">
            Selecciona una conversación para revisar
          </div>
        )}
      </div>
    </div>
  );
};

export default SimulatorReview;
