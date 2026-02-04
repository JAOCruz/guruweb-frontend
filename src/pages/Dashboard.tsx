import React, { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import AdminDataTable from "../components/dashboard/AdminDataTable";
import EmployeeDataTable from "../components/dashboard/EmployeeDataTable";
import DataModificationForm from "../components/dashboard/DataModificationForm";
import DataCharts from "../components/dashboard/DataCharts";
import FlipbooksSection from "../components/dashboard/FlipbooksSection";
import { servicesAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { USER_COLUMNS, WorkerKey } from "../services/excelService";

const Dashboard: React.FC = () => {
  const { isAdmin, user } = useAuth();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const getTodayString = () => new Date().toISOString().split("T")[0];

  const [startDate, setStartDate] = useState(getTodayString());
  const [endDate, setEndDate] = useState(getTodayString());

  // Default value for employee share percentage
  const employeePercentage = 50;

  useEffect(() => {
    fetchData();
  }, [startDate, endDate]); // Re-fetch when dates change

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await servicesAPI.getServices(startDate, endDate);
      // console.log("Services data:", response.data);
      setServices(response.data);
    } catch (error) {
      console.error("Error fetching services:", error);
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
    return (
      <DashboardLayout>
        <div className="flex h-full items-center justify-center">
          <div className="text-center">
            <div className="mb-4 text-2xl text-white">Cargando...</div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Routes>
        <Route
          path="/"
          element={
            <div className="space-y-8">
              {/* Date Filter Section */}
              <div className="rounded-2xl border border-slate-700 bg-slate-800 p-4 shadow-xl">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <h3 className="text-lg font-bold text-white">
                    Filtrar por Fecha
                  </h3>
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs text-slate-400">Desde</label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs text-slate-400">Hasta</label>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                    {(startDate || endDate) && (
                      <div className="flex gap-2 self-end">
                        <button
                          onClick={() => {
                            setStartDate(getTodayString());
                            setEndDate(getTodayString());
                          }}
                          className="rounded-lg bg-blue-600/20 px-4 py-2 text-sm text-blue-300 transition-colors hover:bg-blue-600/30"
                        >
                          Hoy
                        </button>
                        <button
                          onClick={() => {
                            setStartDate("");
                            setEndDate("");
                          }}
                          className="rounded-lg bg-slate-700 px-4 py-2 text-sm text-slate-300 transition-colors hover:bg-slate-600"
                        >
                          Limpiar
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

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
      </Routes>
    </DashboardLayout>
  );
};

export default Dashboard;
