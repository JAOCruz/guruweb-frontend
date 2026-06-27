import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  Bot,
  User,
  Clock,
  AlertCircle,
  RefreshCw,
  TrendingUp,
  MessageSquare,
  ArrowLeftRight,
  Zap,
} from "lucide-react";
import StatsCard from "../components/dashboard/StatsCard";
import { botAPI, DashboardStats, AnalyticsData, IntentData } from "../services/botApi";

// ─── Types ───────────────────────────────────────────────────────────────────

interface NormalizedStats {
  totalConversations: number;
  aiHandled: number;
  humanHandled: number;
  humanTakeovers: number;
  avgResponseTimeAI: number;
  avgResponseTimeHuman: number;
  totalMessages: number;
  activeConversations: number;
}

interface NormalizedAnalytics {
  topIntents: IntentData[];
  dailyStats: { date: string; ai: number; human: number }[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function normalizeStats(raw: DashboardStats): NormalizedStats {
  return {
    totalConversations: Number(raw.totalConversations ?? raw.total_conversations ?? 0),
    aiHandled: Number(raw.aiHandled ?? raw.ai_handled ?? 0),
    humanHandled: Number(raw.humanHandled ?? raw.human_handled ?? 0),
    humanTakeovers: Number(raw.humanTakeovers ?? raw.human_takeovers ?? 0),
    avgResponseTimeAI: Number(raw.avgResponseTimeAI ?? raw.avg_response_time_ai ?? 0),
    avgResponseTimeHuman: Number(raw.avgResponseTimeHuman ?? raw.avg_response_time_human ?? 0),
    totalMessages: Number(raw.totalMessages ?? raw.total_messages ?? 0),
    activeConversations: Number(raw.activeConversations ?? raw.active_conversations ?? 0),
  };
}

function normalizeAnalytics(raw: AnalyticsData): NormalizedAnalytics {
  const intents: IntentData[] = Array.isArray(raw.topIntents ?? raw.top_intents)
    ? (raw.topIntents ?? raw.top_intents) as IntentData[]
    : [];

  const daily = Array.isArray(raw.dailyStats ?? raw.daily_stats)
    ? (raw.dailyStats ?? raw.daily_stats) as { date: string; ai: number; human: number }[]
    : [];

  return { topIntents: intents, dailyStats: daily };
}

function formatSeconds(s: number): string {
  if (!s || s < 60) return `${s ?? 0}s`;
  const m = Math.floor(s / 60);
  const rem = s % 60;
  return rem > 0 ? `${m}m ${rem}s` : `${m}m`;
}

function pct(part: number, total: number): string {
  if (!total) return "0%";
  return `${Math.round((part / total) * 100)}%`;
}

// ─── Custom tooltip for charts ────────────────────────────────────────────────
const DarkTooltip: React.FC<{
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
}> = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-slate-700 bg-[#1E293B] px-3 py-2 shadow-xl">
      {label && <p className="mb-1 text-xs font-bold text-slate-300">{label}</p>}
      {payload.map((p, i) => (
        <p key={i} className="text-xs" style={{ color: p.color }}>
          {p.name}: <span className="font-bold">{p.value}</span>
        </p>
      ))}
    </div>
  );
};

const PIE_COLORS = ["#3b82f6", "#10b981", "#a855f7", "#f59e0b", "#ef4444", "#64748b"];

// ─── IntentRow ────────────────────────────────────────────────────────────────
const IntentRow: React.FC<{ intent: IntentData; rank: number; delay: number }> = ({
  intent,
  rank,
  delay,
}) => (
  <motion.div
    initial={{ opacity: 0, x: -10 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay }}
    className="flex items-center gap-3 rounded-xl border border-slate-700/40 bg-[#151E32] px-4 py-3 hover:border-blue-500/20 transition-colors"
  >
    <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-600/20 text-xs font-bold text-blue-400">
      {rank}
    </span>
    <span className="flex-1 text-sm text-slate-200">{intent.intent}</span>
    <div className="flex items-center gap-3">
      <div className="hidden w-24 sm:block">
        <div className="h-1.5 rounded-full bg-slate-700">
          <div
            className="h-1.5 rounded-full bg-blue-500"
            style={{ width: `${intent.percentage}%` }}
          />
        </div>
      </div>
      <span className="text-xs font-bold text-slate-300">{intent.count}</span>
      <span className="w-10 text-right text-xs text-slate-500">
        {intent.percentage}%
      </span>
    </div>
  </motion.div>
);

// ─── Main component ───────────────────────────────────────────────────────────
const AIInsights: React.FC = () => {
  const [stats, setStats] = useState<NormalizedStats | null>(null);
  const [analytics, setAnalytics] = useState<NormalizedAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsRes, analyticsRes] = await Promise.all([
        botAPI.getDashboardStats(),
        botAPI.getAnalytics(),
      ]);
      setStats(normalizeStats(statsRes.data));
      setAnalytics(normalizeAnalytics(analyticsRes.data));
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } }; message?: string };
      setError(
        e?.response?.data?.message ||
          e?.message ||
          "Error cargando datos de analytics",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-24 text-slate-500">
        <RefreshCw size={24} className="animate-spin" />
        <span className="text-sm">Cargando analytics...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24">
        <AlertCircle size={32} className="text-red-400" />
        <p className="text-sm text-slate-400">{error}</p>
        <button
          onClick={fetchData}
          className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-500"
        >
          Reintentar
        </button>
      </div>
    );
  }

  const s = stats!;
  const a = analytics!;

  // Pie data for AI vs Human
  const pieData = [
    { name: "IA", value: s.aiHandled },
    { name: "Humano", value: s.humanHandled },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display mb-1 text-2xl font-bold text-white md:text-3xl">
            IA Analytics
          </h2>
          <p className="text-sm text-slate-400">
            Rendimiento del bot y métricas de conversaciones
          </p>
        </div>
        <button
          onClick={fetchData}
          className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-300 transition-all hover:bg-slate-700 hover:text-white"
        >
          <RefreshCw size={14} />
          Actualizar
        </button>
      </div>

      {/* ── KPI Stats ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatsCard
          label="Total Conversaciones"
          value={String(s.totalConversations)}
          subValue={`${s.activeConversations} activas`}
          variant="main"
          delay={0.05}
        />
        <StatsCard
          label="Manejadas por IA"
          value={String(s.aiHandled)}
          subValue={pct(s.aiHandled, s.totalConversations)}
          variant="success"
          delay={0.1}
        />
        <StatsCard
          label="Manejadas por Humano"
          value={String(s.humanHandled)}
          subValue={pct(s.humanHandled, s.totalConversations)}
          variant="main"
          delay={0.15}
        />
        <StatsCard
          label="Intervenciones Humanas"
          value={String(s.humanTakeovers)}
          subValue={`${pct(s.humanTakeovers, s.totalConversations)} escalados`}
          variant="warning"
          delay={0.2}
        />
      </div>

      {/* ── Response time cards ──────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="group relative overflow-hidden rounded-2xl border border-slate-700/50 bg-[#151E32] p-5 hover:border-blue-500/30 transition-all"
        >
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10">
              <Zap size={16} className="text-emerald-400" />
            </div>
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
              Tiempo respuesta IA
            </span>
          </div>
          <p className="font-display text-3xl font-bold text-emerald-400">
            {formatSeconds(s.avgResponseTimeAI)}
          </p>
          <p className="mt-1 text-xs text-slate-500">promedio por mensaje</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="group relative overflow-hidden rounded-2xl border border-slate-700/50 bg-[#151E32] p-5 hover:border-purple-500/30 transition-all"
        >
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-500/10">
              <Clock size={16} className="text-purple-400" />
            </div>
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
              Tiempo respuesta Humano
            </span>
          </div>
          <p className="font-display text-3xl font-bold text-purple-400">
            {formatSeconds(s.avgResponseTimeHuman)}
          </p>
          <p className="mt-1 text-xs text-slate-500">promedio por mensaje</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="group relative overflow-hidden rounded-2xl border border-slate-700/50 bg-[#151E32] p-5 hover:border-blue-500/30 transition-all sm:col-span-2 lg:col-span-1"
        >
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-500/10">
              <MessageSquare size={16} className="text-blue-400" />
            </div>
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
              Total Mensajes
            </span>
          </div>
          <p className="font-display text-3xl font-bold text-blue-400">
            {s.totalMessages.toLocaleString()}
          </p>
          <p className="mt-1 text-xs text-slate-500">mensajes procesados</p>
        </motion.div>
      </div>

      {/* ── Charts row ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">

        {/* Daily activity bar chart — takes 3 cols */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-3 rounded-2xl border border-slate-700/50 bg-[#151E32] p-5"
        >
          <div className="mb-4 flex items-center gap-2">
            <TrendingUp size={16} className="text-blue-400" />
            <h3 className="text-sm font-bold text-slate-200">
              Actividad diaria — IA vs Humano
            </h3>
          </div>
          {a.dailyStats.length === 0 ? (
            <div className="flex items-center justify-center py-16 text-slate-600">
              <span className="text-sm">Sin datos disponibles</span>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={a.dailyStats}
                margin={{ top: 5, right: 5, left: -20, bottom: 5 }}
              >
                <XAxis
                  dataKey="date"
                  tick={{ fill: "#64748b", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "#64748b", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<DarkTooltip />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
                <Bar
                  dataKey="ai"
                  name="IA"
                  fill="#3b82f6"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={28}
                />
                <Bar
                  dataKey="human"
                  name="Humano"
                  fill="#a855f7"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={28}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        {/* Pie chart — takes 2 cols */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="lg:col-span-2 rounded-2xl border border-slate-700/50 bg-[#151E32] p-5"
        >
          <div className="mb-4 flex items-center gap-2">
            <ArrowLeftRight size={16} className="text-emerald-400" />
            <h3 className="text-sm font-bold text-slate-200">
              IA vs Humano
            </h3>
          </div>
          {s.totalConversations === 0 ? (
            <div className="flex items-center justify-center py-16 text-slate-600">
              <span className="text-sm">Sin datos</span>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="45%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((_, i) => (
                    <Cell
                      key={i}
                      fill={PIE_COLORS[i]}
                      stroke="transparent"
                    />
                  ))}
                </Pie>
                <Legend
                  iconType="circle"
                  iconSize={8}
                  formatter={(value) => (
                    <span style={{ color: "#94a3b8", fontSize: 12 }}>{value}</span>
                  )}
                />
                <Tooltip content={<DarkTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          )}
          {/* Center pct label */}
          <div className="mt-2 flex justify-center gap-6">
            <div className="text-center">
              <p className="text-lg font-bold text-blue-400">
                {pct(s.aiHandled, s.totalConversations)}
              </p>
              <p className="flex items-center gap-1 text-xs text-slate-500">
                <Bot size={10} /> IA
              </p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-purple-400">
                {pct(s.humanHandled, s.totalConversations)}
              </p>
              <p className="flex items-center gap-1 text-xs text-slate-500">
                <User size={10} /> Humano
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── Top Intents ──────────────────────────────────────────────────── */}
      {a.topIntents.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="rounded-2xl border border-slate-700/50 bg-[#151E32] p-5"
        >
          <div className="mb-4 flex items-center gap-2">
            <Bot size={16} className="text-blue-400" />
            <h3 className="text-sm font-bold text-slate-200">
              Intenciones más comunes
            </h3>
          </div>
          <div className="space-y-2">
            {a.topIntents.map((intent, i) => (
              <IntentRow
                key={intent.intent}
                intent={intent}
                rank={i + 1}
                delay={0.55 + i * 0.04}
              />
            ))}
          </div>
        </motion.div>
      )}

      {/* ── Human takeovers callout ───────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.65 }}
        className="flex items-start gap-4 rounded-2xl border border-amber-700/30 bg-amber-900/10 p-5"
      >
        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-amber-500/10">
          <AlertCircle size={18} className="text-amber-400" />
        </div>
        <div>
          <h4 className="mb-1 text-sm font-bold text-amber-300">
            Conversaciones que requirieron intervención humana
          </h4>
          <p className="text-sm text-amber-200/70">
            {s.humanTakeovers} conversaciones ({pct(s.humanTakeovers, s.totalConversations)}) fueron
            escaladas a un agente humano. Revisar estos casos ayuda a mejorar el entrenamiento de la IA.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default AIInsights;
