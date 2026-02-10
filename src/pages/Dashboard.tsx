import React, { useEffect, useState } from "react";
import LoadingScreen from "../components/LoadingScreen";
import { Routes, Route } from "react-router-dom";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import AdminDataTable from "../components/dashboard/AdminDataTable";
import EmployeeDataTable from "../components/dashboard/EmployeeDataTable";
import DataModificationForm from "../components/dashboard/DataModificationForm";
import DataCharts from "../components/dashboard/DataCharts";
import FlipbooksSection from "../components/dashboard/FlipbooksSection";
import StatsCard from "../components/dashboard/StatsCard";
import Settings from "./Settings";
import { servicesAPI, settingsAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { Zap } from "lucide-react";
import { USER_COLUMNS } from "../services/excelService";
import { formatCurrency } from "../utils";

const Dashboard: React.FC = () => {
  const { isAdmin, user } = useAuth();
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const getTodayString = () => new Date().toISOString().split("T")[0];

  const [startDate, setStartDate] = useState(getTodayString());
  const [endDate, setEndDate] = useState(getTodayString());

  // Fetch employee percentage from settings
  const [employeePercentage, setEmployeePercentage] = useState(50);

  useEffect(() => {
    fetchData();
    fetchEmployeePercentage();
  }, [startDate, endDate]); // Re-fetch when dates change

  const fetchEmployeePercentage = async () => {
    try {
      const response = await settingsAPI.getCurrentPercentage();
      setEmployeePercentage(response.data.percentage);
    } catch (error) {
      console.error("Error fetching employee percentage:", error);
      // Keep default 50% if fetch fails
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await servicesAPI.getServices(startDate, endDate);
      // console.log("Services data:", response.data);
      setServices(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error fetching services:", error);
      setServices([]); // Set empty array on error
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
                    color="text-emerald-400"
                    delay={0.1}
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
                    color="text-yellow-400"
                    delay={0.15}
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
                    color="text-blue-400"
                    delay={0.2}
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
                    color="text-purple-400"
                    delay={0.3}
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
                    color="text-pink-400"
                    delay={0.4}
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
                    color="text-cyan-400"
                    delay={0.5}
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
                  <FlipbooksSection />
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
              {!isAdmin && <FlipbooksSection />}
            </div>
          }
        />
        <Route
          path="/charts"
          element={
            // Note: You might need to adjust DataCharts to handle new theme if needed,
            // but keeping it as is for now as requested
            <DataCharts services={services} />
          }
        />
        <Route path="/flipbooks" element={<FlipbooksSection />} />
        <Route
          path="/settings"
          element={isAdmin ? <Settings /> : <div className="text-center text-slate-400 py-8">No tienes acceso a esta página</div>}
        />
      </Routes>
    </DashboardLayout>
  );
};

export default Dashboard;
