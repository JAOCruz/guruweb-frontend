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
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [dateFilter, setDateFilter] = useState<"all" | "day">("day");

  useEffect(() => {
    fetchData();
  }, [selectedDate, dateFilter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      let startDate, endDate;

      if (dateFilter === "day") {
        startDate = selectedDate;
        endDate = selectedDate;
      }

      const response = await servicesAPI.getServices(startDate, endDate);
      console.log("Services data:", response.data);
      setServices(response.data);
    } catch (error) {
      console.error("Error fetching services:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filter services for current employee
  const getEmployeeServices = () => {
    if (isAdmin) return services;

    return services.filter(
      (service: any) => service.data_column === user?.dataColumn,
    );
  };

  const transformToExcelFormat = () => {
    if (!services.length) return [];

    // Group services by user
    const groupedByUser: Record<string, any[]> = {};

    services.forEach((service: any) => {
      // Get user name - normalize to uppercase to match USER_COLUMNS
      const userName = (
        service.data_column ||
        service.username ||
        "Unknown"
      ).toUpperCase();

      // Only include if it's a valid USER_COLUMN
      if (!USER_COLUMNS.includes(userName as WorkerKey)) {
        console.warn(`Skipping service for unknown user: ${userName}`);
        return;
      }

      if (!groupedByUser[userName]) {
        groupedByUser[userName] = [];
      }
      groupedByUser[userName].push(service);
    });

    const transformed: any[] = [];
    const maxServices = Math.max(
      ...Object.values(groupedByUser).map((arr: any[]) => arr.length),
      0,
    );

    // Create rows for each service
    for (let i = 0; i < maxServices; i++) {
      const serviceRow: any = { DETALLE: "SERVICIO" };
      const clientRow: any = { DETALLE: "CLIENTE" };
      const timeRow: any = { DETALLE: "HORA" };
      const earningsRow: any = { DETALLE: "GANANCIA" };
      const commentRow: any = { DETALLE: "NOTA" };

      Object.entries(groupedByUser).forEach(([userName, userServices]) => {
        const service = userServices[i];
        if (service) {
          serviceRow[userName] = service.service_name;
          serviceRow.id = service.id; // Attach ID to service row
          clientRow[userName] = service.client || "";
          timeRow[userName] = service.time || "";
          earningsRow[userName] = Number(service.earnings);
          commentRow[userName] = service.comment || "";
        }
      });

      transformed.push(serviceRow, clientRow, timeRow, earningsRow, commentRow);
    }

    console.log("Transformed data:", transformed);
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

  const handleDateChange = (days: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    setSelectedDate(newDate.toISOString().split("T")[0]);
  };

  const DateFilterComponent = () => (
    <div className="perspective-container rounded-lg border border-blue-700 bg-blue-900/20 p-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h3 className="metallic-3d-text text-xl font-semibold">
          Filtrar Servicios
        </h3>
        <div className="flex flex-wrap items-center gap-3">
          {/* Filter Toggle */}
          <div className="flex rounded-lg border border-gray-700 bg-gray-800/80 p-1">
            <button
              onClick={() => setDateFilter("day")}
              className={`rounded px-4 py-2 text-sm font-medium transition-colors ${
                dateFilter === "day"
                  ? "bg-blue-600 text-white"
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              Por Día
            </button>
            <button
              onClick={() => setDateFilter("all")}
              className={`rounded px-4 py-2 text-sm font-medium transition-colors ${
                dateFilter === "all"
                  ? "bg-blue-600 text-white"
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              Todos
            </button>
          </div>

          {dateFilter === "day" && (
            <>
              {/* Quick Navigation */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleDateChange(-1)}
                  className="rounded border border-gray-700 bg-gray-800/80 px-3 py-2 text-sm text-gray-200 hover:bg-gray-700"
                  title="Día anterior"
                >
                  ←
                </button>
                <button
                  onClick={() => setSelectedDate(new Date().toISOString().split("T")[0])}
                  className="rounded border border-gray-700 bg-gray-800/80 px-3 py-2 text-sm text-gray-200 hover:bg-gray-700"
                  title="Hoy"
                >
                  Hoy
                </button>
                <button
                  onClick={() => handleDateChange(1)}
                  className="rounded border border-gray-700 bg-gray-800/80 px-3 py-2 text-sm text-gray-200 hover:bg-gray-700"
                  title="Día siguiente"
                >
                  →
                </button>
              </div>

              {/* Date Picker */}
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="rounded border border-gray-700 bg-gray-800/80 px-3 py-2 text-sm text-gray-200 focus:border-blue-500 focus:outline-none"
              />
            </>
          )}
        </div>
      </div>
      {dateFilter === "day" && (
        <div className="mt-2 text-sm text-gray-400">
          Mostrando servicios del:{" "}
          <span className="font-semibold text-blue-300">
            {new Date(selectedDate + "T00:00:00").toLocaleDateString("es-ES", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
        </div>
      )}
    </div>
  );

  return (
    <DashboardLayout>
      <Routes>
        <Route
          path="/"
          element={
            <div className="space-y-8">
              {/* Date Filter */}
              <DateFilterComponent />

              {isAdmin && <DataModificationForm onServiceAdded={fetchData} />}
              {isAdmin ? (
                <AdminDataTable
                  data={transformToExcelFormat()}
                  onSort={() => {}}
                  onServiceDeleted={fetchData}
                />
              ) : (
                <>
                  {/* Tabla del empleado */}
                  <EmployeeDataTable services={getEmployeeServices()} />

                  {/* Sección de Flipbooks */}
                  <FlipbooksSection />
                </>
              )}
            </div>
          }
        />
        <Route
          path="/data"
          element={
            <div className="space-y-8">
              {/* Date Filter */}
              <DateFilterComponent />

              {isAdmin ? (
                <AdminDataTable
                  data={transformToExcelFormat()}
                  onSort={() => {}}
                  onServiceDeleted={fetchData}
                />
              ) : (
                <>
                  <EmployeeDataTable services={getEmployeeServices()} />
                  {/* Flipbooks también en la vista de datos */}
                  <FlipbooksSection />
                </>
              )}
            </div>
          }
        />
        <Route
          path="/charts"
          element={
            <DataCharts services={isAdmin ? services : getEmployeeServices()} />
          }
        />
      </Routes>
    </DashboardLayout>
  );
};

export default Dashboard;
