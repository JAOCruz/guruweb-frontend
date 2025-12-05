import React, { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import type { PieLabelRenderProps } from "recharts";
import { useAuth } from "../../context/AuthContext";

interface Service {
  id: number;
  service_name: string;
  earnings: number;
  date: string;
  data_column: string;
  username: string;
}

interface DataChartsProps {
  services: Service[];
}

const NEON_COLORS = ["#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6"];
const USER_COLORS: Record<string, string> = {
  HENGI: "#3b82f6",    // Blue
  MARLENI: "#ef4444",   // Red
  ISRAEL: "#10b981",    // Green
  THAICAR: "#f59e0b",   // Orange
};

const ALL_SERVICES = [
  "SERVICIO REDACCION CONTRATO LEGAL",
  "SERVICIO REDACCION CONTRATO NOTARIAL",
  "SERVICIO REDACCION INSTANCIA",
  "SERVICIO REDACCION INSTANCIA EXTENSA",
  "SERVICIO REDACCION ESCRITO AMPLIO",
  "SERVICIO REDACCION COLETILLA",
  "SERVICIO REDACCION TRADUCCION JUDICIAL",
  "SERVICIO REDACCION NOTIFICACION",
  "SERVICIO REDACCION TRADUCCION JUDICIAL EXTENSA",
  "SERVICIO DE REDACCION OTROS",
  "SERVICIO FORMATO E IMPRESION",
  "SERVICIO DE IMPRESION",
  "SERVICIO DE IMPRESION DOCUMENTO LEGAL",
  "SERVICIO DE IMPRESION DOCUMENTO NORMAL",
  "SERVICIO DE IMPRESION FOTO 2x2",
  "SERVICIO DE COPIA BLANCO Y NEGRO",
  "SERVICIO DE COPIA A COLOR",
  "SERVICIO DE ESCANER DOCUMENTO DIGITAL",
  "SERVICIO SOLICITUD CERTIFICACION APOSTILLE",
  "SERVICIO SOLICITUD CERTIFICACION VIAJE DE MENOR",
  "SERVICIO SOLICITUD CERTIFICACION ESTATUS JURIDICO DE INMUEBLE",
  "SERVICIO SOLICITUD INSCRIPCION DE INMUEBLE",
  "SERVICIO SOLICITUD CERTIFICACION CAMARA DE COMERCIO",
  "SERVICIO SOLICITUD DE CERTIFICACION PROCURADURIA GENERAL",
  "SERVICIO SOLICITUD DE CERTIFICACION ANTECEDENTES NO PENALES",
  "SERVICIO SOLICITUD DE CERTIFICACION OTROS",
  "SERVICIO MENSAJERIA",
  "SERVICIO MENSAJERIA COMPRA IMPUESTOS",
  "SERVICIO MENSAJERIA DEPOSITO DOCUMENTOS",
  "SERVICIO COMPRA IMPUESTOS",
];

const DataCharts: React.FC<DataChartsProps> = ({ services }) => {
  const { isAdmin } = useAuth();
  const [showAllServices, setShowAllServices] = useState(false);
  const [dateFilter, setDateFilter] = useState<"all" | "specific" | "range">(
    "all",
  );
  const [specificDate, setSpecificDate] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Filter services by date
  const getFilteredServices = () => {
    if (dateFilter === "all") return services;

    return services.filter((service) => {
      const serviceDate = new Date(service.date);

      if (dateFilter === "specific" && specificDate) {
        const targetDate = new Date(specificDate);
        return serviceDate.toDateString() === targetDate.toDateString();
      }

      if (dateFilter === "range") {
        const start = startDate ? new Date(startDate) : null;
        const end = endDate ? new Date(endDate) : null;

        if (start && end) {
          return serviceDate >= start && serviceDate <= end;
        } else if (start) {
          return serviceDate >= start;
        } else if (end) {
          return serviceDate <= end;
        }
      }

      return true;
    });
  };

  const filteredServices = getFilteredServices();

  // Group services by date with earnings split by user
  const groupByDateAndUser = () => {
    const grouped: Record<
      string,
      Record<string, { employee: number; admin: number }>
    > = {};

    filteredServices.forEach((service) => {
      const date = new Date(service.date).toLocaleDateString("es-DO", {
        month: "short",
        day: "numeric",
      });
      const user = service.data_column;
      const earnings = Number(service.earnings);

      if (!grouped[date]) {
        grouped[date] = {};
      }

      if (!grouped[date][user]) {
        grouped[date][user] = { employee: 0, admin: 0 };
      }

      grouped[date][user].employee += earnings * 0.5;
      grouped[date][user].admin += earnings * 0.5;
    });

    return Object.entries(grouped)
      .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
      .map(([date, users]) => {
        const entry: any = { name: date };

        Object.entries(users).forEach(([user, split]) => {
          entry[`${user} (Empleado)`] = Number(split.employee.toFixed(2));
          entry[`${user} (Admin)`] = Number(split.admin.toFixed(2));
        });

        return entry;
      });
  };

  // Count service frequency
  const getServiceFrequency = () => {
    const frequency: Record<string, number> = {};

    // Initialize with 0 if showing all services
    if (showAllServices) {
      ALL_SERVICES.forEach((service) => {
        frequency[service] = 0;
      });
    }

    // Count actual services
    filteredServices.forEach((service) => {
      frequency[service.service_name] =
        (frequency[service.service_name] || 0) + 1;
    });

    return Object.entries(frequency)
      .filter(([_, count]) => showAllServices || count > 0)
      .map(([name, count]) => {
        // Create shorter display name
        let shortName = name;
        if (name.startsWith("SERVICIO ")) {
          shortName = name.substring(9); // Remove "SERVICIO " prefix
        }
        if (shortName.length > 15) {
          shortName = shortName.substring(0, 15) + "...";
        }
        return {
          name: shortName,
          fullName: name,
          Veces: count,
        };
      });
  };

  // Distribution by user with employee/admin split
  const getDistributionByUser = () => {
    const userTotals: Record<
      string,
      { total: number; employee: number; admin: number }
    > = {};

    filteredServices.forEach((service) => {
      const user = service.data_column;
      const earnings = Number(service.earnings);

      if (!userTotals[user]) {
        userTotals[user] = { total: 0, employee: 0, admin: 0 };
      }

      userTotals[user].total += earnings;
      userTotals[user].employee += earnings * 0.5;
      userTotals[user].admin += earnings * 0.5;
    });

    const pieData = Object.entries(userTotals).map(([name, totals]) => ({
      name,
      value: Number(totals.total.toFixed(2)),
      employee: Number(totals.employee.toFixed(2)),
      admin: Number(totals.admin.toFixed(2)),
    }));

    // Calculate admin total
    const adminTotal = pieData.reduce((sum, item) => sum + item.admin, 0);

    return { pieData, adminTotal };
  };

  const lineData = groupByDateAndUser();
  const barData = getServiceFrequency();
  const { pieData, adminTotal } = getDistributionByUser();

  // Get all unique users for line chart
  const allUsers = Array.from(
    new Set(filteredServices.map((s) => s.data_column)),
  );

  return (
    <div className="perspective-container space-y-8">
      {/* Date Filter Controls */}
      <div className="rounded-lg border border-blue-900/30 bg-gray-900/80 p-6 backdrop-blur-sm">
        <h3 className="bevel-text mb-4 text-xl font-semibold">Filtros</h3>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Date Filter Type */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-300">
              Período
            </label>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as any)}
              className="w-full rounded-lg border border-blue-900/30 bg-gray-900/80 p-2.5 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">Todos los tiempos</option>
              <option value="specific">Fecha específica</option>
              <option value="range">Rango de fechas</option>
            </select>
          </div>

          {/* Specific Date */}
          {dateFilter === "specific" && (
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">
                Fecha
              </label>
              <input
                type="date"
                value={specificDate}
                onChange={(e) => setSpecificDate(e.target.value)}
                className="w-full rounded-lg border border-blue-900/30 bg-gray-900/80 p-2.5 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
          )}

          {/* Date Range */}
          {dateFilter === "range" && (
            <>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-300">
                  Fecha inicial
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full rounded-lg border border-blue-900/30 bg-gray-900/80 p-2.5 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-300">
                  Fecha final
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full rounded-lg border border-blue-900/30 bg-gray-900/80 p-2.5 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Bar Chart - Service Frequency */}
      <div className="rounded-lg border border-blue-900/30 bg-gray-900/80 p-6 backdrop-blur-sm">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="bevel-text text-xl font-semibold">
            Frecuencia de Servicios
          </h3>
          <button
            onClick={() => setShowAllServices(!showAllServices)}
            className="rounded-lg border border-blue-900/30 bg-blue-600/20 px-4 py-2 text-sm text-blue-300 hover:bg-blue-600/30"
          >
            {showAllServices
              ? "Solo servicios solicitados"
              : "Mostrar todos los servicios"}
          </button>
        </div>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={barData}
              margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis
                dataKey="name"
                stroke="#999"
                angle={0}
                textAnchor="middle"
                height={60}
                interval={0}
                tick={{ fontSize: 10 }}
              />
              <YAxis stroke="#999" />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-lg border border-blue-900/30 bg-gray-900/95 p-3 max-w-xs">
                        <p className="text-sm text-gray-300 break-words">
                          {payload[0].payload.fullName}
                        </p>
                        <p className="text-lg font-bold text-blue-400">
                          {payload[0].value} veces
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend />
              <Bar
                dataKey="Veces"
                fill={NEON_COLORS[0]}
                animationDuration={500}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Line Chart - Earnings by Date with Employee/Admin Split */}
      <div className="rounded-lg border border-blue-900/30 bg-gray-900/80 p-6 backdrop-blur-sm">
        <h3 className="bevel-text mb-4 text-xl font-semibold">
          Ganancias por Fecha (Empleado 50% / Admin 50%)
        </h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={lineData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(59, 130, 246, 0.2)"
              />
              <XAxis dataKey="name" stroke="#999" />
              <YAxis stroke="#999" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(30, 41, 59, 0.9)",
                  border: "1px solid rgba(59, 130, 246, 0.5)",
                  borderRadius: "8px",
                  color: "#fff",
                  boxShadow: "0 0 15px rgba(59, 130, 246, 0.3)",
                }}
              />
              <Legend />
              {allUsers.flatMap((user, userIndex) => [
                <Line
                  key={`${user}-employee`}
                  type="monotone"
                  dataKey={`${user} (Empleado)`}
                  stroke={
                    USER_COLORS[user] ||
                    NEON_COLORS[userIndex % NEON_COLORS.length]
                  }
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  animationDuration={500}
                  dot={{ fill: USER_COLORS[user], r: 4 }}
                />,
                <Line
                  key={`${user}-admin`}
                  type="monotone"
                  dataKey={`${user} (Admin)`}
                  stroke={
                    USER_COLORS[user] ||
                    NEON_COLORS[userIndex % NEON_COLORS.length]
                  }
                  strokeWidth={2}
                  animationDuration={500}
                  dot={{ fill: USER_COLORS[user], r: 4 }}
                />,
              ])}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Pie Chart - Distribution by User */}
      <div className="rounded-lg border border-blue-900/30 bg-gray-900/80 p-6 backdrop-blur-sm">
        <h3 className="bevel-text mb-4 text-xl font-semibold">
          Distribución Total por Usuario
        </h3>

        {/* Summary Cards */}
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {pieData.map((item, index) => (
            <div
              key={item.name}
              className="rounded-lg border border-gray-700 bg-gray-800/80 p-4"
              style={{
                borderColor:
                  USER_COLORS[item.name] ||
                  NEON_COLORS[index % NEON_COLORS.length],
              }}
            >
              <h4
                className="mb-2 text-lg font-semibold"
                style={{
                  color:
                    USER_COLORS[item.name] ||
                    NEON_COLORS[index % NEON_COLORS.length],
                }}
              >
                {item.name}
              </h4>
              <p className="text-sm text-gray-300">
                Total:{" "}
                <span className="font-bold text-white">${item.value}</span>
              </p>
              <p className="text-sm text-gray-300">
                Ganancias (50%):{" "}
                <span className="font-bold text-yellow-400">
                  ${item.employee}
                </span>
              </p>
            </div>
          ))}
        </div>

        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={(props: PieLabelRenderProps) => {
                  const { name, percent } = props;
                  const percentageValue =
                    typeof percent === "number"
                      ? (percent * 100).toFixed(0)
                      : "0";
                  return `${name ?? "Usuario"}: ${percentageValue}%`;
                }}
                animationDuration={500}
              >
                {pieData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      USER_COLORS[entry.name] ||
                      NEON_COLORS[index % NEON_COLORS.length]
                    }
                  />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="rounded-lg border border-blue-900/30 bg-gray-900/95 p-3">
                        <p className="text-lg font-bold text-white">
                          {data.name}
                        </p>
                        <p className="text-sm text-gray-300">
                          Total: ${data.value}
                        </p>
                        <p className="text-sm text-yellow-400">
                          Empleado: ${data.employee}
                        </p>
                        <p className="text-sm text-green-400">
                          Admin: ${data.admin}
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default DataCharts;
