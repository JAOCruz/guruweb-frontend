import React, { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Trash2, RefreshCw } from "lucide-react";
import api from "../services/api";

interface ChatMessage {
  id: string;
  role: "user" | "bot";
  text: string;
  timestamp: Date;
}

const BotSimulator: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "bot",
      text: "🦉 ¡Hola! Soy El Gurú de Gurú Soluciones. Escribe un mensaje para probar cómo respondería el bot de WhatsApp.",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId] = useState(() => `sim_${Date.now().toString(36).slice(-8)}`);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: ChatMessage = {
      id: `u_${Date.now()}`,
      role: "user",
      text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const response = await api.post("/bot/simulate", {
        message: text,
        sessionId,
      });

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
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: "welcome",
        role: "bot",
        text: "🦉 Chat reiniciado. Escribe un mensaje para probar el bot.",
        timestamp: new Date(),
      },
    ]);
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
            <p className="text-xs text-slate-400">Prueba las respuestas del Gurú sin WhatsApp</p>
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
                El Gurú está escribiendo...
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={sendMessage}
        className="border-t border-slate-700/50 bg-[#151E32] p-4"
      >
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Escribe un mensaje de prueba..."
            className="flex-1 rounded-xl border border-slate-600 bg-[#0B1120] px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white transition-colors hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
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
