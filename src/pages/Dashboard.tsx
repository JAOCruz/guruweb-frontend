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

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await servicesAPI.getServices();
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

  return (
    <DashboardLayout>
      <Routes>
        <Route
          path="/"
          element={
            <div className="space-y-8">
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
            isAdmin ? (
              <AdminDataTable
                data={transformToExcelFormat()}
                onSort={() => {}}
                onServiceDeleted={fetchData}
              />
            ) : (
              <div className="space-y-8">
                <EmployeeDataTable services={getEmployeeServices()} />
                {/* Flipbooks también en la vista de datos */}
                <FlipbooksSection />
              </div>
            )
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
