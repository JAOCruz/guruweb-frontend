import React, { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import AdminDataTable from "../components/dashboard/AdminDataTable";
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
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

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

  const transformToExcelFormat = () => {
    if (!services.length) return [];

    // Initialize groupedByUser with ALL USER_COLUMNS, even if they have no services
    const groupedByUser: Record<string, any[]> = {};
    USER_COLUMNS.forEach((user) => {
      groupedByUser[user] = [];
    });

    services.forEach((service: any) => {
      const user = service.data_column;
      if (groupedByUser[user]) {
        groupedByUser[user].push(service);
      }
    });

    const transformed: any[] = [];
    const maxServices = Math.max(
      ...Object.values(groupedByUser).map((arr: any[]) => arr.length),
      0, // Ensure at least 0
    );

    for (let i = 0; i < maxServices; i++) {
      const serviceRow: any = { DETALLE: "SERVICIO" };
      const clientRow: any = { DETALLE: "CLIENTE" };
      const timeRow: any = { DETALLE: "HORA" };
      const earningsRow: any = { DETALLE: "GANANCIA" };
      const commentRow: any = { DETALLE: "NOTA" };

      // IMPORTANT: Iterate over ALL USER_COLUMNS, not just those with data
      USER_COLUMNS.forEach((user) => {
        const userServices = groupedByUser[user] || [];
        const service = userServices[i];

        if (service) {
          serviceRow[user] = service.service_name;
          serviceRow[`${user}_id`] = service.id;
          serviceRow.id = service.id;

          clientRow[user] = service.client || "";
          timeRow[user] = service.time || "";
          earningsRow[user] = service.earnings;
          commentRow[user] = service.comment || "";
        } else {
          serviceRow[user] = "";
          clientRow[user] = "";
          timeRow[user] = "";
          earningsRow[user] = "";
          commentRow[user] = "";
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
                      <button
                        onClick={() => {
                          setStartDate("");
                          setEndDate("");
                        }}
                        className="self-end rounded-lg bg-slate-700 px-4 py-2 text-sm text-slate-300 transition-colors hover:bg-slate-600"
                      >
                        Limpiar
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {isAdmin && <DataModificationForm onServiceAdded={fetchData} />}

              {/* Using AdminDataTable for both, but with restricted view for Employees */}
              <AdminDataTable
                data={transformToExcelFormat()}
                onSort={() => {}}
                onServiceDeleted={fetchData}
                employeePercentage={employeePercentage}
                isEmployeeView={!isAdmin}
                currentEmployee={user?.dataColumn || undefined}
              />

              {/* Show Flipbooks for everyone */}
              {!isAdmin && <FlipbooksSection />}
            </div>
          }
        />
        <Route
          path="/data"
          element={
            <div className="space-y-8">
              <AdminDataTable
                data={transformToExcelFormat()}
                onSort={() => {}}
                onServiceDeleted={fetchData}
                employeePercentage={employeePercentage}
                isEmployeeView={!isAdmin}
                currentEmployee={user?.dataColumn || undefined}
              />
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
