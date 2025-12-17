import React, { useEffect, useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import AdminDataTable from "../components/dashboard/AdminDataTable";
import EmployeeDataTable from "../components/dashboard/EmployeeDataTable";
import DataModificationForm from "../components/dashboard/DataModificationForm";
import DataCharts from "../components/dashboard/DataCharts";
import FlipbooksSection from "../components/dashboard/FlipbooksSection";
import Settings from "../components/dashboard/Settings";
import { servicesAPI, settingsAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { USER_COLUMNS, WorkerKey } from "../services/excelService";

const Dashboard: React.FC = () => {
  const { isAdmin, user } = useAuth();
  const location = useLocation();
  const [services, setServices] = useState([]);
  const [allServices, setAllServices] = useState([]); // For charts - unfiltered
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [dateFilter, setDateFilter] = useState<"all" | "day">("day");
  const [currentPage, setCurrentPage] = useState(1);
  const [employeePercentage, setEmployeePercentage] = useState<number>(50); // Default 50%
  const itemsPerPage = 15;

  // Fetch employee percentage setting - refetch when route changes
  useEffect(() => {
    const fetchEmployeePercentage = async () => {
      try {
        const response = await settingsAPI.getEmployeePercentage();
        setEmployeePercentage(response.data.percentage);
      } catch (error) {
        console.error("Error fetching employee percentage:", error);
        // Keep default 50% if fetch fails
      }
    };
    fetchEmployeePercentage();
  }, [location.pathname]); // Refetch when navigating between routes

  // Fetch all services for charts (unfiltered)
  useEffect(() => {
    const fetchAllServices = async () => {
      try {
        const response = await servicesAPI.getServices(); // No date filter
        setAllServices(response.data);
      } catch (error) {
        console.error("Error fetching all services:", error);
      }
    };
    fetchAllServices();
  }, []);

  useEffect(() => {
    fetchData();
  }, [selectedDate, dateFilter]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
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

      // Also refresh all services for charts
      const allResponse = await servicesAPI.getServices();
      setAllServices(allResponse.data);
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

  // Filter all services for current employee (for charts)
  const getAllEmployeeServices = () => {
    if (isAdmin) return allServices;

    return allServices.filter(
      (service: any) => service.data_column === user?.dataColumn,
    );
  };

  // Pagination logic
  const getPaginatedServices = (servicesList: any[]) => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return servicesList.slice(startIndex, endIndex);
  };

  const getTotalPages = (servicesList: any[]) => {
    return Math.ceil(servicesList.length / itemsPerPage);
  };

  const transformToExcelFormat = () => {
    // Don't paginate admin view - show all services for accurate totals
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
          serviceRow[`${userName}_id`] = service.id; // Attach ID per user
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

  const PaginationComponent = ({ totalItems }: { totalItems: number }) => {
    const totalPages = getTotalPages(services);

    if (totalPages <= 1) return null;

    return (
      <div className="flex items-center justify-center gap-2 py-4">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="rounded border border-gray-700 bg-gray-800/80 px-4 py-2 text-sm text-gray-200 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ← Anterior
        </button>

        <div className="flex gap-1">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`rounded px-3 py-2 text-sm ${
                currentPage === page
                  ? "bg-blue-600 text-white"
                  : "border border-gray-700 bg-gray-800/80 text-gray-200 hover:bg-gray-700"
              }`}
            >
              {page}
            </button>
          ))}
        </div>

        <button
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="rounded border border-gray-700 bg-gray-800/80 px-4 py-2 text-sm text-gray-200 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Siguiente →
        </button>

        <span className="ml-4 text-sm text-gray-400">
          Mostrando {(currentPage - 1) * itemsPerPage + 1}-
          {Math.min(currentPage * itemsPerPage, totalItems)} de {totalItems}
        </span>
      </div>
    );
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
                  employeePercentage={employeePercentage}
                />
              ) : (
                <>
                  {/* Pagination for employees */}
                  <PaginationComponent totalItems={getEmployeeServices().length} />

                  {/* Tabla del empleado */}
                  <EmployeeDataTable
                    services={getPaginatedServices(getEmployeeServices())}
                    employeePercentage={employeePercentage}
                  />

                  {/* Sección de Flipbooks */}
                  <FlipbooksSection />

                  {/* Pagination for employees */}
                  <PaginationComponent totalItems={getEmployeeServices().length} />
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
                  employeePercentage={employeePercentage}
                />
              ) : (
                <>
                  {/* Pagination for employees */}
                  <PaginationComponent totalItems={getEmployeeServices().length} />

                  <EmployeeDataTable
                    services={getPaginatedServices(getEmployeeServices())}
                    employeePercentage={employeePercentage}
                  />

                  {/* Flipbooks también en la vista de datos */}
                  <FlipbooksSection />

                  {/* Pagination for employees */}
                  <PaginationComponent totalItems={getEmployeeServices().length} />
                </>
              )}
            </div>
          }
        />
        <Route
          path="/charts"
          element={
            <DataCharts
              services={getAllEmployeeServices()}
              employeePercentage={employeePercentage}
            />
          }
        />
        <Route
          path="/settings"
          element={
            isAdmin ? (
              <Settings />
            ) : (
              <div className="text-center text-white p-8">
                <p className="text-xl">Acceso denegado. Solo administradores pueden ver esta página.</p>
              </div>
            )
          }
        />
      </Routes>
    </DashboardLayout>
  );
};

export default Dashboard;
