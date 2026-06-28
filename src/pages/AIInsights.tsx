import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
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
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

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

function useThemeColors() {
  return useMemo(() => {
    const root = typeof window !== "undefined" ? getComputedStyle(document.documentElement) : null;
    const get = (name: string, fallback: string) =>
      root?.getPropertyValue(name).trim() || fallback;
    return {
      main: get("--main", "#0000FF"),
      chart1: get("--chart-1", "#0000FF"),
      chart2: get("--chart-2", "#000080"),
      chart3: get("--chart-3", "#FFD700"),
      chart4: get("--chart-4", "#FF0000"),
      chart5: get("--chart-5", "#00FF00"),
      border: get("--border", "#000000"),
      background: get("--background", "#ffffff"),
      foreground: get("--foreground", "#000000"),
      secondaryBg: get("--secondary-background", "#ffffff"),
    };
  }, []);
}

const dailyConfig = {
  ai: { label: "IA", color: "var(--main)" },
  human: { label: "Humano", color: "var(--chart-2)" },
} satisfies Record<string, { label: string; color: string }>;

const pieConfig = {
  ia: { label: "IA", color: "var(--main)" },
  humano: { label: "Humano", color: "var(--chart-2)" },
} satisfies Record<string, { label: string; color: string }>;

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
  >
    <Card className="flex flex-row items-center gap-3 px-4 py-3 shadow-shadow hover:shadow-none">
      <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-main text-xs font-black text-main-foreground">
        {rank}
      </span>
      <span className="flex-1 text-base font-base text-foreground">{intent.intent}</span>
      <div className="flex items-center gap-3">
        <div className="hidden w-24 sm:block">
          <div className="h-2 overflow-hidden rounded-base border-2 border-border bg-secondary-background">
            <div
              className="h-full bg-main"
              style={{ width: `${intent.percentage}%` }}
            />
          </div>
        </div>
        <Badge variant="neutral" className="uppercase tracking-wider font-black">{intent.count}</Badge>
        <span className="w-10 text-right text-sm font-bold text-foreground/70">
          {intent.percentage}%
        </span>
      </div>
    </Card>
  </motion.div>
);

// ─── Main component ───────────────────────────────────────────────────────────
const AIInsights: React.FC = () => {
  const [stats, setStats] = useState<NormalizedStats | null>(null);
  const [analytics, setAnalytics] = useState<NormalizedAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const colors = useThemeColors();

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
      <div className="flex flex-col items-center justify-center gap-3 py-24 text-foreground/70">
        <RefreshCw size={24} className="animate-spin" />
        <span className="text-base">Cargando analytics...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24">
        <AlertCircle size={32} className="text-main" />
        <p className="text-base text-foreground/70">{error}</p>
        <Button onClick={fetchData}>
          <RefreshCw size={16} /> Reintentar
        </Button>
      </div>
    );
  }

  const s = stats!;
  const a = analytics!;

  // Pie data for AI vs Human
  const pieData = [
    { name: "ia", value: s.aiHandled, fill: colors.main },
    { name: "humano", value: s.humanHandled, fill: colors.chart2 },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-heading text-4xl font-black text-foreground md:text-5xl">
            IA Analytics
          </h2>
          <p className="text-base text-foreground/70">
            Rendimiento del bot y métricas de conversaciones
          </p>
        </div>
        <Button onClick={fetchData} variant="neutral">
          <RefreshCw size={16} />
          Actualizar
        </Button>
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
        >
          <Card className="gap-2 py-6">
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-base border-2 border-border bg-secondary-background">
                <Zap size={16} className="text-main" />
              </div>
              <span className="text-xs font-black uppercase tracking-widest text-foreground/70">
                Tiempo respuesta IA
              </span>
            </div>
            <p className="font-heading text-3xl font-black text-main">
              {formatSeconds(s.avgResponseTimeAI)}
            </p>
            <p className="mt-1 text-sm text-foreground/60">promedio por mensaje</p>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="gap-2 py-6">
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-base border-2 border-border bg-secondary-background">
                <Clock size={16} className="text-main" />
              </div>
              <span className="text-xs font-black uppercase tracking-widest text-foreground/70">
                Tiempo respuesta Humano
              </span>
            </div>
            <p className="font-heading text-3xl font-black text-main">
              {formatSeconds(s.avgResponseTimeHuman)}
            </p>
            <p className="mt-1 text-sm text-foreground/60">promedio por mensaje</p>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="sm:col-span-2 lg:col-span-1"
        >
          <Card className="gap-2 py-6">
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-base border-2 border-border bg-secondary-background">
                <MessageSquare size={16} className="text-main" />
              </div>
              <span className="text-xs font-black uppercase tracking-widest text-foreground/70">
                Total Mensajes
              </span>
            </div>
            <p className="font-heading text-3xl font-black text-main">
              {s.totalMessages.toLocaleString()}
            </p>
            <p className="mt-1 text-sm text-foreground/60">mensajes procesados</p>
          </Card>
        </motion.div>
      </div>

      {/* ── Charts row ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">

        {/* Daily activity bar chart — takes 3 cols */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-3"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-heading text-2xl">
                <TrendingUp size={20} className="text-main" />
                Actividad diaria — IA vs Humano
              </CardTitle>
            </CardHeader>
            <CardContent>
              {a.dailyStats.length === 0 ? (
                <div className="flex items-center justify-center py-16 text-foreground/60">
                  <span className="text-base">Sin datos disponibles</span>
                </div>
              ) : (
                <ChartContainer config={dailyConfig} className="h-56 w-full">
                  <BarChart
                    data={a.dailyStats}
                    margin={{ top: 5, right: 5, left: -20, bottom: 5 }}
                  >
                    <XAxis
                      dataKey="date"
                      tick={{ fill: colors.foreground, fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: colors.foreground, fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} cursor={{ fill: colors.main, opacity: 0.08 }} />
                    <Bar
                      dataKey="ai"
                      fill="var(--color-ai)"
                      radius={[4, 4, 0, 0]}
                      maxBarSize={28}
                    />
                    <Bar
                      dataKey="human"
                      fill="var(--color-human)"
                      radius={[4, 4, 0, 0]}
                      maxBarSize={28}
                    />
                  </BarChart>
                </ChartContainer>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Pie chart — takes 2 cols */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="lg:col-span-2"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-heading text-2xl">
                <ArrowLeftRight size={20} className="text-main" />
                IA vs Humano
              </CardTitle>
            </CardHeader>
            <CardContent>
              {s.totalConversations === 0 ? (
                <div className="flex items-center justify-center py-16 text-foreground/60">
                  <span className="text-base">Sin datos</span>
                </div>
              ) : (
                <ChartContainer config={pieConfig} className="h-56 w-full">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="45%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={3}
                      dataKey="value"
                      nameKey="name"
                    >
                      {pieData.map((entry, i) => (
                        <Cell
                          key={i}
                          fill={entry.fill}
                          stroke={colors.border}
                          strokeWidth={2}
                        />
                      ))}
                    </Pie>
                    <Legend
                      iconType="circle"
                      iconSize={8}
                      formatter={(value) => (
                        <span style={{ color: colors.foreground, fontSize: 12 }}>{value === "ia" ? "IA" : "Humano"}</span>
                      )}
                    />
                    <Tooltip content={<PieTooltip />} />
                  </PieChart>
                </ChartContainer>
              )}
              {/* Center pct label */}
              <div className="mt-2 flex justify-center gap-6">
                <div className="text-center">
                  <p className="text-lg font-black text-main">
                    {pct(s.aiHandled, s.totalConversations)}
                  </p>
                  <p className="flex items-center justify-center gap-1 text-sm text-foreground/70">
                    <Bot size={12} /> IA
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-black text-chart-2">
                    {pct(s.humanHandled, s.totalConversations)}
                  </p>
                  <p className="flex items-center justify-center gap-1 text-sm text-foreground/70">
                    <User size={12} /> Humano
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* ── Top Intents ──────────────────────────────────────────────────── */}
      {a.topIntents.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-heading text-2xl">
                <Bot size={20} className="text-main" />
                Intenciones más comunes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {a.topIntents.map((intent, i) => (
                <IntentRow
                  key={intent.intent}
                  intent={intent}
                  rank={i + 1}
                  delay={0.55 + i * 0.04}
                />
              ))}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* ── Human takeovers callout ───────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.65 }}
      >
        <Card className="flex flex-row items-start gap-4 bg-main py-6 text-main-foreground">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-base border-2 border-border bg-main">
            <AlertCircle size={18} className="text-main-foreground" />
          </div>
          <div>
            <h4 className="mb-1 text-base font-black text-main-foreground">
              Conversaciones que requirieron intervención humana
            </h4>
            <p className="text-base text-main-foreground/90">
              {s.humanTakeovers} conversaciones ({pct(s.humanTakeovers, s.totalConversations)}) fueron
              escaladas a un agente humano. Revisar estos casos ayuda a mejorar el entrenamiento de la IA.
            </p>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

const PieTooltip: React.FC<{
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
}> = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const p = payload[0];
  return (
    <Card className="gap-1 border-border bg-background p-3 text-foreground shadow-shadow">
      <p className="text-sm font-base" style={{ color: p.color }}>
        {p.name === "ia" ? "IA" : "Humano"}: <span className="font-bold">{p.value}</span>
      </p>
    </Card>
  );
};

export default AIInsights;
