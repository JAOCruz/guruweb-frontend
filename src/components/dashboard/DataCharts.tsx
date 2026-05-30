import { useState, useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell,
  Area, AreaChart,
} from "recharts";
import { Calendar, TrendingUp, DollarSign, Activity, BarChart3, PieChart as PieIcon, Crown } from "lucide-react";

interface Service {
  id: number;
  service_name: string;
  earnings: number;
  date: string;
  data_column: string;
  username: string;
  client?: string;
  time?: string;
}

interface DataChartsProps {
  services: Service[];
  isAdmin: boolean;
  user?: { dataColumn?: string | null; username?: string | null; role?: string | null } | null;
}

/* ── Neo-Brutalist Colors ── */
const COLORS = ["#0000FF", "#00FFFF", "#3333FF", "#000080", "#1E90FF", "#4169E1", "#00BFFF", "#5F9EA0"];
const BG_DARK = "#02040a";
const GRID_COLOR = "#1e3a8a";
const TEXT_COLOR = "#94a3b8";

/* ── Date Helpers ── */
const formatRD = (n: number) =>
  `RD$ ${n.toLocaleString("es-DO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const getStartOfWeek = (d: Date) => {
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
};

const getStartOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1);

export default function DataCharts({ services, isAdmin, user }: DataChartsProps) {
  const [dateRange, setDateRange] = useState<"all" | "today" | "week" | "month" | "custom">("all");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

  /* ── Filter services by visibility (admin vs employee) ── */
  const userDataCol = (user?.dataColumn || "").toUpperCase();
  const visibleServices = useMemo(() => {
    let list = isAdmin ? services : services.filter((s) => (s.data_column || "").toUpperCase() === userDataCol);

    const now = new Date();
    if (dateRange === "today") {
      const todayStr = now.toISOString().split("T")[0];
      list = list.filter((s) => s.date.startsWith(todayStr));
    } else if (dateRange === "week") {
      const start = getStartOfWeek(new Date(now));
      list = list.filter((s) => new Date(s.date) >= start);
    } else if (dateRange === "month") {
      const start = getStartOfMonth(new Date(now));
      list = list.filter((s) => new Date(s.date) >= start);
    } else if (dateRange === "custom" && customStart && customEnd) {
      const s = new Date(customStart);
      const e = new Date(customEnd);
      e.setHours(23, 59, 59);
      list = list.filter((x) => {
        const d = new Date(x.date);
        return d >= s && d <= e;
      });
    }
    return list;
  }, [services, isAdmin, userDataCol, dateRange, customStart, customEnd]);

  /* ── KPIs ── */
  const kpis = useMemo(() => {
    const totalEarnings = visibleServices.reduce((sum, s) => sum + Number(s.earnings || 0), 0);
    const totalCount = visibleServices.length;
    const uniqueDates = new Set(visibleServices.map((s) => s.date.split("T")[0])).size;
    const avgPerDay = uniqueDates > 0 ? totalEarnings / uniqueDates : 0;

    // Best day
    const byDate: Record<string, number> = {};
    visibleServices.forEach((s) => {
      const d = s.date.split("T")[0];
      byDate[d] = (byDate[d] || 0) + Number(s.earnings || 0);
    });
    let bestDay = "";
    let bestAmount = 0;
    Object.entries(byDate).forEach(([d, amt]) => {
      if (amt > bestAmount) { bestAmount = amt; bestDay = d; }
    });

    return { totalEarnings, totalCount, avgPerDay, bestDay, bestAmount };
  }, [visibleServices]);

  /* ── Timeline Data ── */
  const timelineData = useMemo(() => {
    const grouped: Record<string, Record<string, number>> = {};
    visibleServices.forEach((s) => {
      const d = s.date.split("T")[0];
      const label = new Date(d).toLocaleDateString("es-DO", { month: "short", day: "numeric" });
      const emp = isAdmin ? (s.data_column || "Yo") : "Yo";
      if (!grouped[label]) grouped[label] = {};
      grouped[label][emp] = (grouped[label][emp] || 0) + Number(s.earnings || 0);
    });
    return Object.entries(grouped)
      .map(([name, vals]) => ({ name, ...vals }))
      .sort((a, b) => new Date(a.name).getTime() - new Date(b.name).getTime());
  }, [visibleServices, isAdmin]);

  /* ── Service Frequency (top 10) ── */
  const freqData = useMemo(() => {
    const freq: Record<string, number> = {};
    visibleServices.forEach((s) => {
      freq[s.service_name] = (freq[s.service_name] || 0) + 1;
    });
    return Object.entries(freq)
      .map(([name, count]) => ({ name: name.length > 35 ? name.slice(0, 35) + "…" : name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [visibleServices]);

  /* ── Employee Distribution (admin only) ── */
  const empDist = useMemo(() => {
    if (!isAdmin) return [];
    const dist: Record<string, number> = {};
    visibleServices.forEach((s) => {
      const emp = s.data_column || "Desconocido";
      dist[emp] = (dist[emp] || 0) + Number(s.earnings || 0);
    });
    return Object.entries(dist).map(([name, value]) => ({ name, value }));
  }, [visibleServices, isAdmin]);

  /* ── Daily trend area (smooth) ── */
  const areaData = useMemo(() => {
    const byDate: Record<string, number> = {};
    visibleServices.forEach((s) => {
      const d = s.date.split("T")[0];
      byDate[d] = (byDate[d] || 0) + Number(s.earnings || 0);
    });
    return Object.entries(byDate)
      .map(([date, total]) => ({
        label: new Date(date).toLocaleDateString("es-DO", { month: "short", day: "numeric" }),
        total,
      }))
      .sort((a, b) => new Date(a.label).getTime() - new Date(b.label).getTime());
  }, [visibleServices]);

  const dateButtons: { key: typeof dateRange; label: string; emoji: string }[] = [
    { key: "all", label: "Todo", emoji: "🗓️" },
    { key: "today", label: "Hoy", emoji: "📅" },
    { key: "week", label: "Semana", emoji: "📆" },
    { key: "month", label: "Mes", emoji: "🗂️" },
    { key: "custom", label: "Custom", emoji: "⚙️" },
  ];

  const hasData = visibleServices.length > 0;
  const timelineKeys = timelineData.length > 0 ? Object.keys(timelineData[0]).filter((k) => k !== "name") : [];

  return (
    <div className="custom-scroll flex h-full flex-col gap-6 overflow-y-auto bg-[#02040a] p-6 font-sans text-slate-200">
      {/* ── HEADER ── */}
      <div className="text-center">
        <div className="inline-flex items-center gap-3 rounded-xl border-2 border-[#000080] bg-[#0000FF] px-6 py-3 shadow-[6px_6px_0px_0px_rgba(0,0,128,1)]">
          <BarChart3 className="h-8 w-8 text-white" />
          <div className="text-left">
            <h1 className="text-2xl font-black uppercase tracking-wider text-white">
              {isAdmin ? "Análisis General" : "Mis Estadísticas"}
            </h1>
            <p className="text-xs font-bold text-white/70">
              {isAdmin ? "Data de todos los empleados" : `Data de ${user?.dataColumn || user?.username || "ti"}`}
            </p>
          </div>
        </div>
      </div>

      {/* ── DATE FILTERS ── */}
      <div className="flex flex-wrap items-center gap-2">
        {dateButtons.map((btn) => (
          <button
            key={btn.key}
            onClick={() => setDateRange(btn.key)}
            className={`rounded-lg border-2 px-4 py-2 text-xs font-black uppercase transition-all ${
              dateRange === btn.key
                ? "border-[#000080] bg-[#0000FF] text-white shadow-[3px_3px_0px_0px_rgba(0,0,128,1)]"
                : "border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-500 hover:text-slate-200"
            }`}
          >
            <span className="mr-1">{btn.emoji}</span> {btn.label}
          </button>
        ))}
        {dateRange === "custom" && (
          <div className="flex items-center gap-2">
            <input type="date" value={customStart} onChange={(e) => setCustomStart(e.target.value)} className="rounded-lg border-2 border-slate-700 bg-slate-800 px-3 py-2 text-xs text-white outline-none focus:border-[#0000FF]" />
            <span className="text-slate-500">→</span>
            <input type="date" value={customEnd} onChange={(e) => setCustomEnd(e.target.value)} className="rounded-lg border-2 border-slate-700 bg-slate-800 px-3 py-2 text-xs text-white outline-none focus:border-[#0000FF]" />
          </div>
        )}
      </div>

      {!hasData ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 rounded-2xl border-4 border-dashed border-[#000080] bg-[#0000FF]/10 p-12">
          <span className="text-6xl">📊</span>
          <p className="text-xl font-black text-[#0000FF]">Sin datos para este período</p>
          <p className="text-sm text-slate-500">Intenta otro rango de fechas</p>
        </div>
      ) : (
        <>
          {/* ── KPI CARDS ── */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Total */}
            <div className="flex flex-col items-center gap-2 rounded-xl border-4 border-[#000080] bg-[#0000FF] p-5 shadow-[6px_6px_0px_0px_rgba(0,0,128,1)]">
              <DollarSign className="h-8 w-8 text-white" />
              <span className="text-2xl font-black text-white">{formatRD(kpis.totalEarnings)}</span>
              <span className="text-xs font-black uppercase tracking-widest text-white/70">Total Ingresos</span>
            </div>
            {/* Count */}
            <div className="flex flex-col items-center gap-2 rounded-xl border-4 border-[#000080] bg-[#0000FF] p-5 shadow-[6px_6px_0px_0px_rgba(0,0,128,1)]">
              <Activity className="h-8 w-8 text-white" />
              <span className="text-2xl font-black text-white">{kpis.totalCount}</span>
              <span className="text-xs font-black uppercase tracking-widest text-white/70">Servicios</span>
            </div>
            {/* Avg */}
            <div className="flex flex-col items-center gap-2 rounded-xl border-4 border-[#000080] bg-[#0000FF] p-5 shadow-[6px_6px_0px_0px_rgba(0,0,128,1)]">
              <TrendingUp className="h-8 w-8 text-white" />
              <span className="text-2xl font-black text-white">{formatRD(kpis.avgPerDay)}</span>
              <span className="text-xs font-black uppercase tracking-widest text-white/70">Promedio/Día</span>
            </div>
            {/* Best day */}
            <div className="flex flex-col items-center gap-2 rounded-xl border-4 border-[#000080] bg-[#0000FF] p-5 shadow-[6px_6px_0px_0px_rgba(0,0,128,1)]">
              <Crown className="h-8 w-8 text-white" />
              <span className="text-2xl font-black text-white">{kpis.bestDay ? new Date(kpis.bestDay).toLocaleDateString("es-DO", { month: "short", day: "numeric" }) : "—"}</span>
              <span className="text-xs font-black uppercase tracking-widest text-white/70">
                Mejor Día {kpis.bestAmount > 0 ? `(${formatRD(kpis.bestAmount)})` : ""}
              </span>
            </div>
          </div>

          {/* ── AREA CHART (Trend) ── */}
          <div className="rounded-2xl border-4 border-[#000080] bg-[#0a0c14] p-5 shadow-[6px_6px_0px_0px_rgba(0,0,128,1)]">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-black uppercase tracking-wider text-blue-400">
              <Calendar size={20} /> Tendencia de Ingresos
            </h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={areaData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0000FF" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#0000FF" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
                  <XAxis dataKey="label" stroke={TEXT_COLOR} tick={{ fontSize: 11 }} />
                  <YAxis stroke={TEXT_COLOR} tick={{ fontSize: 11 }} tickFormatter={(v) => `RD$${v}`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: BG_DARK, border: "2px solid #000080", borderRadius: "12px", color: "#fff" }}
                    formatter={(v: any) => [formatRD(Number(v)), "Ingresos"]}
                  />
                  <Area type="monotone" dataKey="total" stroke="#0000FF" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* ── BOTTOM ROW: Bar + Pie ── */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Bar Chart */}
            <div className="lg:col-span-2 rounded-2xl border-4 border-[#000080] bg-[#0a0c14] p-5 shadow-[6px_6px_0px_0px_rgba(0,0,128,1)]">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-black uppercase tracking-wider text-blue-400">
                <BarChart3 size={20} /> Top Servicios
              </h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={freqData} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} horizontal={false} />
                    <XAxis type="number" stroke={TEXT_COLOR} tick={{ fontSize: 11 }} />
                    <YAxis type="category" dataKey="name" stroke={TEXT_COLOR} tick={{ fontSize: 10 }} width={180} />
                    <Tooltip
                      contentStyle={{ backgroundColor: BG_DARK, border: "2px solid #000080", borderRadius: "12px", color: "#fff" }}
                      formatter={(v: any) => [`${v} veces`, "Frecuencia"]}
                    />
                    <Bar dataKey="count" fill="#0000FF" radius={[0, 8, 8, 0]} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Pie Chart (admin only) */}
            {isAdmin && empDist.length > 0 ? (
              <div className="rounded-2xl border-4 border-[#000080] bg-[#0a0c14] p-5 shadow-[6px_6px_0px_0px_rgba(0,0,128,1)]">
                <h3 className="mb-4 flex items-center gap-2 text-lg font-black uppercase tracking-wider text-blue-400">
                  <PieIcon size={20} /> Por Empleado
                </h3>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={empDist}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={90}
                        paddingAngle={4}
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent }) => `${name}: ${typeof percent === "number" ? (percent * 100).toFixed(0) : "0"}%`}
                        labelLine={false}
                      >
                        {empDist.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="#000" strokeWidth={2} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ backgroundColor: BG_DARK, border: "2px solid #000080", borderRadius: "12px" }}
                        itemStyle={{ color: "#fff" }}
                        formatter={(value: any, name: any) => [formatRD(Number(value)), name]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border-4 border-[#000080] bg-[#0a0c14] p-5 shadow-[6px_6px_0px_0px_rgba(0,0,128,1)]">
                <PieIcon size={40} className="text-blue-500" />
                <p className="text-center text-sm font-bold text-slate-400">
                  {isAdmin ? "Sin datos de empleados" : "Distribución solo visible para admin"}
                </p>
              </div>
            )}
          </div>

          {/* ── TIMELINE LINE CHART (admin: multi-line, employee: single) ── */}
          <div className="rounded-2xl border-4 border-[#000080] bg-[#0a0c14] p-5 shadow-[6px_6px_0px_0px_rgba(0,0,128,1)]">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-black uppercase tracking-wider text-blue-400">
              <TrendingUp size={20} /> Evolución Diaria
            </h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timelineData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
                  <XAxis dataKey="name" stroke={TEXT_COLOR} tick={{ fontSize: 11 }} />
                  <YAxis stroke={TEXT_COLOR} tick={{ fontSize: 11 }} tickFormatter={(v) => `RD$${v}`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: BG_DARK, border: "2px solid #000080", borderRadius: "12px", color: "#fff" }}
                    formatter={(v: any, n: any) => [formatRD(Number(v)), n]}
                  />
                  {timelineKeys.map((key, i) => (
                    <Line
                      key={key}
                      type="monotone"
                      dataKey={key}
                      stroke={COLORS[i % COLORS.length]}
                      strokeWidth={3}
                      dot={{ r: 4, fill: COLORS[i % COLORS.length], stroke: "#000", strokeWidth: 2 }}
                      activeDot={{ r: 7, fill: "#fff" }}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
