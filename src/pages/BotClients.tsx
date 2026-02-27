import React, { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Users, Search, RefreshCw, Phone, MessageCircle, Calendar } from "lucide-react";
import { botAPI, BotClient } from "../services/botApi";

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

const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString("es-DO", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

// ─── Client Card ──────────────────────────────────────────────────────────────
const ClientCard: React.FC<{ client: BotClient; index: number }> = ({
  client,
  index,
}) => {
  const initials = getInitials(client.name, client.phone);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.04 }}
      className="flex items-center gap-4 rounded-xl border border-slate-700/40 bg-slate-800/40 p-4 transition-colors hover:border-slate-600/60 hover:bg-slate-800/60"
    >
      {/* Avatar */}
      <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-sm font-bold text-white shadow-md shadow-emerald-500/20">
        {initials}
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-white">
          {client.name || "Sin nombre"}
        </p>
        <div className="mt-0.5 flex flex-wrap items-center gap-x-4 gap-y-0.5">
          <span className="flex items-center gap-1 text-xs text-slate-400">
            <Phone size={11} />
            {client.phone}
          </span>
          <span className="flex items-center gap-1 text-xs text-slate-500">
            <Calendar size={11} />
            {formatDate(client.joinedAt)}
          </span>
        </div>
      </div>

      {/* Message count */}
      <div className="flex flex-shrink-0 flex-col items-end gap-1">
        <div className="flex items-center gap-1.5 rounded-lg border border-blue-500/20 bg-blue-500/10 px-3 py-1">
          <MessageCircle size={13} className="text-blue-400" />
          <span className="text-sm font-bold text-blue-400">
            {client.messageCount}
          </span>
        </div>
        <span className="text-[10px] text-slate-600">mensajes</span>
      </div>
    </motion.div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const BotClients: React.FC = () => {
  const [clients, setClients] = useState<BotClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const fetchClients = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const res = await botAPI.getClients();
      setClients(res.data);
    } catch {
      // silently ignore
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const filtered = clients.filter((c) => {
    const q = search.toLowerCase();
    return (
      (c.name || "").toLowerCase().includes(q) ||
      c.phone.includes(q)
    );
  });

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
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-lg shadow-emerald-500/30">
            <Users size={20} className="text-white" />
          </div>
          <div>
            <h2 className="font-display text-2xl font-bold text-white md:text-3xl">
              Clientes Bot
            </h2>
            <p className="text-sm text-slate-400">
              {clients.length} contacto{clients.length !== 1 ? "s" : ""} registrado
              {clients.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        <button
          onClick={() => fetchClients(true)}
          disabled={refreshing}
          className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-2 text-sm text-slate-400 transition-all hover:border-slate-600 hover:text-white disabled:opacity-50"
        >
          <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
          <span className="hidden sm:inline">Actualizar</span>
        </button>
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <div className="relative">
          <Search
            size={16}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
          />
          <input
            type="text"
            placeholder="Buscar por nombre o teléfono…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-slate-800/50 py-3 pl-11 pr-4 text-sm text-white placeholder-slate-500 backdrop-blur-sm transition-all focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
      </motion.div>

      {/* Client list */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-slate-500">
          <RefreshCw size={24} className="animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-700/50 bg-slate-900/30 py-16 text-center">
          <Users size={40} className="mx-auto mb-4 text-slate-600" />
          <p className="text-slate-400">
            {search
              ? "No se encontraron clientes con ese criterio."
              : "No hay clientes registrados aún."}
          </p>
          {search && (
            <button
              onClick={() => setSearch("")}
              className="mt-3 text-sm text-blue-400 underline hover:text-blue-300"
            >
              Limpiar búsqueda
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((client, i) => (
            <ClientCard key={client.id} client={client} index={i} />
          ))}
        </div>
      )}
    </div>
  );
};

export default BotClients;
