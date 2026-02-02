import React, { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import AdminDataTable from "../components/dashboard/AdminDataTable";
import DataModificationForm from "../components/dashboard/DataModificationForm";
import DataCharts from "../components/dashboard/DataCharts";
import FlipbooksSection from "../components/dashboard/FlipbooksSection";
import { servicesAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";

const Dashboard: React.FC = () => {
  const { isAdmin, user } = useAuth();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  // Default value for employee share percentage
  const employeePercentage = 50;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await servicesAPI.getServices();
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

    const groupedByUser: Record<string, any[]> = {};

    services.forEach((service: any) => {
      const user = service.data_column;
      if (!groupedByUser[user]) {
        groupedByUser[user] = [];
      }
      groupedByUser[user].push(service);
    });

    const transformed: any[] = [];
    const maxServices = Math.max(
      ...Object.values(groupedByUser).map((arr: any[]) => arr.length),
    );

    // If maxServices is -Infinity (empty array), use 0
    const count = maxServices === -Infinity ? 0 : maxServices;

    for (let i = 0; i < count; i++) {
      const serviceRow: any = { DETALLE: "SERVICIO" };
      const clientRow: any = { DETALLE: "CLIENTE" };
      const timeRow: any = { DETALLE: "HORA" };
      const earningsRow: any = { DETALLE: "GANANCIA" };
      const commentRow: any = { DETALLE: "NOTA" }; // Added to support comments

      Object.entries(groupedByUser).forEach(([user, userServices]) => {
        const service = userServices[i];
        if (service) {
          serviceRow[user] = service.service_name;
          // IMPORTANT: Store the ID so AdminDataTable can find it
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
      </Routes>
    </DashboardLayout>
  );
};

export default Dashboard;
