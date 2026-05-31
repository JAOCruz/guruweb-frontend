import React, { useEffect, useState } from "react";
import LoadingScreen from "../components/LoadingScreen";
import { Routes, Route, useLocation } from "react-router-dom";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import AdminDataTable from "../components/dashboard/AdminDataTable";
import EmployeeDataTable from "../components/dashboard/EmployeeDataTable";
import DataModificationForm from "../components/dashboard/DataModificationForm";
import DataCharts from "../components/dashboard/DataCharts";
import ManualOperativo from "./ManualOperativo";
import StatsCard from "../components/dashboard/StatsCard";
import Settings from "./Settings";
import WhatsAppBot from "./WhatsAppBot";
import BotMessages from "./BotMessages";
import BotClients from "./BotClients";
import Cases from "./Cases";
import Cotizaciones from "./Cotizaciones";
import AIInsights from "./AIInsights";
import DocumentManagement from "./DocumentManagement";
import Laws from "./Laws";
import ServicesCatalog from "./ServicesCatalog";
import MotherBrain from "./MotherBrain";
import { servicesAPI, settingsAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { Zap, Eye, EyeOff } from "lucide-react";
import { USER_COLUMNS } from "../services/excelService";
import { formatCurrency } from "../utils";

const Dashboard: React.FC = () => {
  const { isAdmin, user } = useAuth();
  const location = useLocation();
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const getTodayString = () => new Date().toISOString().split("T")[0];

  const [startDate, setStartDate] = useState(getTodayString());
  const [endDate, setEndDate] = useState(getTodayString());

  // Fetch employee percentage from settings
  const [employeePercentage, setEmployeePercentage] = useState(50);
  const [showEarnings, setShowEarnings] = useState(false);

  useEffect(() => {
    // Check if on a bot-related route (skip service fetching for these)
    const isBotRoute = /\/(whatsapp|bot-|cases|cotizaciones|ai-insights|documents|flipbooks|laws)/.test(location.pathname);
    const isAnalyticsRoute = /\/(charts|data)/.test(location.pathname);

    if (isBotRoute) {
      // Skip service fetching on bot routes
      setLoading(false);
    } else if (isAnalyticsRoute) {
      // Charts/Data need all historical data, not just today's
      fetchData(true);
      fetchEmployeePercentage();
    } else {
      // Fetch services on main dashboard and settings routes only
      fetchData();
      fetchEmployeePercentage();
    }
  }, [startDate, endDate, location.pathname]);

  const fetchEmployeePercentage = async () => {
    try {
      const response = await settingsAPI.getCurrentPercentage();
      setEmployeePercentage(response.data.percentage);
    } catch (error) {
      console.error("Error fetching employee percentage:", error);
      // Keep default 50% if fetch fails
    }
  };

  const fetchData = async (allTime = false) => {
    try {
      setLoading(true);
      const response = allTime
        ? await servicesAPI.getServices()
        : await servicesAPI.getServices(startDate, endDate);
      setServices(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error fetching services:", error);
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  const getEmployeeServices = () => {
    if (isAdmin) return services;
    const dataCol = (user?.dataColumn || "").toUpperCase();
    return services.filter(
      (s: any) => (s.data_column || "").toUpperCase() === dataCol,
    );
  };

  const transformToExcelFormat = () => {
    if (!services.length) return [];

    // Initialize groupedByUser with ALL USER_COLUMNS (UPPERCASE)
    const groupedByUser: Record<string, any[]> = {};
    USER_COLUMNS.forEach((u) => {
      groupedByUser[u] = [];
    });

    services.forEach((service: any) => {
      // Handle case-insensitive mapping
      const dataCol = (service.data_column || "").toUpperCase();
      const match = USER_COLUMNS.find((u) => u === dataCol);
      if (match) {
        groupedByUser[match].push(service);
      }
    });

    const transformed: any[] = [];
    const maxServices = Math.max(
      ...Object.values(groupedByUser).map((arr: any[]) => arr.length),
      0,
    );

    for (let i = 0; i < maxServices; i++) {
      const serviceRow: any = { DETALLE: "SERVICIO" };
      const clientRow: any = { DETALLE: "CLIENTE" };
      const timeRow: any = { DETALLE: "HORA" };
      const earningsRow: any = { DETALLE: "GANANCIA" };
      const commentRow: any = { DETALLE: "NOTA" };

      USER_COLUMNS.forEach((u) => {
        const userServices = groupedByUser[u] || [];
        const service = userServices[i];

        if (service) {
          serviceRow[u] = service.service_name;
          serviceRow[`${u}_id`] = service.id;
          serviceRow.id = service.id;

          clientRow[u] = service.client || "";
          timeRow[u] = service.time || "";
          earningsRow[u] = service.earnings;
          commentRow[u] = service.comment || "";
        } else {
          serviceRow[u] = "";
          clientRow[u] = "";
          timeRow[u] = "";
          earningsRow[u] = "";
          commentRow[u] = "";
        }
      });

      transformed.push(serviceRow, clientRow, timeRow, earningsRow, commentRow);
    }

    return transformed;
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <DashboardLayout>
      <Routes>
        <Route
          path="/"
          element={
            <div className="space-y-8">
              {/* Header / Top Bar for Page */}
              <div className="mb-10 flex flex-col items-start justify-between gap-6 xl:flex-row xl:items-center">
                <div>
                  <h2 className="font-display mb-2 text-2xl font-bold text-white md:text-3xl">
                    Resumen Operativo
                  </h2>
                  <p className="text-sm text-slate-400">
                    Gestiona y visualiza el rendimiento en tiempo real.
                  </p>
                </div>
                <div className="flex w-full flex-col gap-3 xl:w-auto">
                  {/* Privacy toggle */}
                  <button
                    onClick={() => setShowEarnings((v) => !v)}
                    className="flex items-center justify-center gap-2 rounded-xl border-4 border-[#000080] bg-[#0000FF] px-4 py-2 text-xs font-black uppercase tracking-widest text-white shadow-[4px_4px_0px_0px_rgba(0,0,128,1)] transition-all hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_rgba(0,0,128,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none"
                    title={showEarnings ? "Ocultar ganancias" : "Mostrar ganancias"}
                  >
                    {showEarnings ? <EyeOff size={14} /> : <Eye size={14} />}
                    {showEarnings ? "Ocultar" : "Mostrar"} Ganancias
                  </button>
                  {/* Date Filter Integrated into Header style */}
                  <div className="flex w-full flex-col gap-1.5 rounded-2xl border border-slate-700/50 bg-[#151E32]/50 p-1.5 backdrop-blur-sm sm:flex-row sm:flex-wrap sm:items-center sm:gap-2 sm:p-2">
                    <div className="flex min-w-0 items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/50 px-2 py-1.5 sm:gap-2 sm:px-3">
                      <span className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">
                        Desde
                      </span>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="min-w-0 flex-1 cursor-pointer border-none bg-transparent p-0 text-xs text-white focus:outline-none sm:text-sm"
                      />
                    </div>
                    <div className="flex min-w-0 items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/50 px-2 py-1.5 sm:gap-2 sm:px-3">
                      <span className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">
                        Hasta
                      </span>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="min-w-0 flex-1 cursor-pointer border-none bg-transparent p-0 text-xs text-white focus:outline-none sm:text-sm"
                      />
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => {
                          setStartDate(getTodayString());
                          setEndDate(getTodayString());
                        }}
                        className="rounded-xl border border-blue-500/20 bg-blue-600/20 px-3 py-1.5 text-[10px] font-bold tracking-widest text-blue-400 uppercase transition-all hover:bg-blue-600 hover:text-white"
                      >
                        Hoy
                      </button>
                      <button
                        onClick={() => {
                          setStartDate("");
                          setEndDate("");
                        }}
                        className="rounded-xl border border-slate-600 bg-slate-700/50 px-3 py-1.5 text-[10px] font-bold tracking-widest text-slate-400 uppercase transition-all hover:bg-slate-700 hover:text-white"
                      >
                        Limpiar
                      </button>
                    </div>
                  </div>
                  <button className="flex w-full items-center justify-center gap-2 rounded-2xl bg-purple-600 px-5 py-2.5 text-sm font-bold text-white shadow-[0_0_15px_rgba(147,51,234,0.5)] transition-all duration-300 hover:bg-purple-500 sm:w-auto">
                    <Zap size={16} />
                    Insights IA
                  </button>
                </div>
              </div>

              {/* STATS SECTION */}
              {isAdmin && (
                <div className="mb-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
                  <StatsCard
                    label="Total Admin"
                    value={formatCurrency(
                      services.reduce(
                        (acc, s: any) => acc + (Number(s.earnings) || 0) * (1 - employeePercentage / 100),
                        0,
                      ),
                    )}
                    subValue={`${services.length} serv.`}
                    color="text-white"
                    delay={0.1}
                    sensitive
                    visible={showEarnings}
                  />

                  {/* Total Users (Sum of their earnings/shares) - 50% split */}
                  <StatsCard
                    label="Total Users"
                    value={formatCurrency(
                      services
                        .filter((s: any) =>
                          ["HENGI", "MARLENI", "ISRAEL", "THAICAR"].includes(
                            (s.data_column || "").toUpperCase(),
                          ),
                        )
                        .reduce(
                          (acc, s: any) => acc + (Number(s.earnings) || 0) * (employeePercentage / 100),
                          0,
                        ),
                    )}
                    subValue={`${
                      services.filter((s: any) =>
                        ["HENGI", "MARLENI", "ISRAEL", "THAICAR"].includes(
                          (s.data_column || "").toUpperCase(),
                        ),
                      ).length
                    } serv.`}
                    color="text-white"
                    delay={0.15}
                    sensitive
                    visible={showEarnings}
                  />

                  {/* Dynamic stats for workers - showing their 50% share */}
                  <StatsCard
                    label="Hengi"
                    value={formatCurrency(
                      services
                        .filter(
                          (s: any) =>
                            (s.data_column || "").toUpperCase() === "HENGI",
                        )
                        .reduce(
                          (acc, s: any) => acc + (Number(s.earnings) || 0) * (employeePercentage / 100),
                          0,
                        ),
                    )}
                    subValue={`${services.filter((s: any) => (s.data_column || "").toUpperCase() === "HENGI").length} serv.`}
                    color="text-white"
                    delay={0.2}
                    sensitive
                    visible={showEarnings}
                  />
                  <StatsCard
                    label="Marleni"
                    value={formatCurrency(
                      services
                        .filter(
                          (s: any) =>
                            (s.data_column || "").toUpperCase() === "MARLENI",
                        )
                        .reduce(
                          (acc, s: any) => acc + (Number(s.earnings) || 0) * (employeePercentage / 100),
                          0,
                        ),
                    )}
                    subValue={`${services.filter((s: any) => (s.data_column || "").toUpperCase() === "MARLENI").length} serv.`}
                    color="text-white"
                    delay={0.3}
                    sensitive
                    visible={showEarnings}
                  />
                  <StatsCard
                    label="Israel"
                    value={formatCurrency(
                      services
                        .filter(
                          (s: any) =>
                            (s.data_column || "").toUpperCase() === "ISRAEL",
                        )
                        .reduce(
                          (acc, s: any) => acc + (Number(s.earnings) || 0) * (employeePercentage / 100),
                          0,
                        ),
                    )}
                    subValue={`${services.filter((s: any) => (s.data_column || "").toUpperCase() === "ISRAEL").length} serv.`}
                    color="text-white"
                    delay={0.4}
                    sensitive
                    visible={showEarnings}
                  />
                  <StatsCard
                    label="Thaicar"
                    value={formatCurrency(
                      services
                        .filter(
                          (s: any) =>
                            (s.data_column || "").toUpperCase() === "THAICAR",
                        )
                        .reduce(
                          (acc, s: any) => acc + (Number(s.earnings) || 0) * (employeePercentage / 100),
                          0,
                        ),
                    )}
                    subValue={`${services.filter((s: any) => (s.data_column || "").toUpperCase() === "THAICAR").length} serv.`}
                    color="text-white"
                    delay={0.5}
                    sensitive
                    visible={showEarnings}
                  />
                </div>
              )}

              {isAdmin && (
                <div className="mb-6">
                  <DataModificationForm onServiceAdded={fetchData} />
                </div>
              )}

              {isAdmin ? (
                <AdminDataTable
                  data={transformToExcelFormat()}
                  onSort={() => {}}
                  onServiceDeleted={fetchData}
                  employeePercentage={employeePercentage}
                  isEmployeeView={false}
                />
              ) : (
                <div className="space-y-8">
                  <EmployeeDataTable services={getEmployeeServices()} />
                  <ManualOperativo />
                </div>
              )}
            </div>
          }
        />
        <Route
          path="/data"
          element={
            <div className="space-y-8">
              {isAdmin ? (
                <AdminDataTable
                  data={transformToExcelFormat()}
                  onSort={() => {}}
                  onServiceDeleted={fetchData}
                  employeePercentage={employeePercentage}
                />
              ) : (
                <EmployeeDataTable services={getEmployeeServices()} />
              )}
              {!isAdmin && <ManualOperativo />}
            </div>
          }
        />
        <Route
          path="/charts"
          element={
            // Note: You might need to adjust DataCharts to handle new theme if needed,
            // but keeping it as is for now as requested
            <DataCharts services={services} isAdmin={isAdmin} user={user} />
          }
        />
        <Route path="/flipbooks" element={<ManualOperativo />} />
        <Route
          path="/settings"
          element={isAdmin ? <Settings /> : <div className="text-center text-slate-400 py-8">No tienes acceso a esta página</div>}
        />
        <Route path="/whatsapp" element={<WhatsAppBot />} />
        <Route path="/bot-messages" element={<BotMessages />} />
        <Route path="/bot-clients" element={<BotClients />} />
        <Route path="/cotizaciones" element={<Cotizaciones />} />
        <Route path="/cases" element={<Cases />} />
        <Route path="/ai-insights" element={<AIInsights />} />
        <Route path="/documents" element={<DocumentManagement />} />
        <Route path="/laws" element={<Laws />} />
        <Route path="/motherbrain" element={<MotherBrain />} />
        <Route
          path="/services-catalog"
          element={
            isAdmin ? (
              <ServicesCatalog />
            ) : (
              <div className="py-8 text-center text-slate-400">
                No tienes acceso a esta página
              </div>
            )
          }
        />
      </Routes>
    </DashboardLayout>
  );
};

export default Dashboard;
