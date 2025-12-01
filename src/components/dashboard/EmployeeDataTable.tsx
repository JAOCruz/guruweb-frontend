import React from "react";
import { useAuth } from "../../context/AuthContext";

interface Service {
  id: number;
  service_name: string;
  client: string | null;
  time: string | null;
  earnings: number;
  date: string;
}

interface EmployeeDataTableProps {
  services: Service[];
}

const EmployeeDataTable: React.FC<EmployeeDataTableProps> = ({ services }) => {
  const { user } = useAuth();

  // Get display name from user context
  const displayName = user?.dataColumn || user?.username || "Usuario";

  // Calculate totals
  const total = services.reduce(
    (acc, service) => acc + Number(service.earnings),
    0,
  );
  const userShare = total * 0.5;

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <div className="perspective-container rounded-lg border border-blue-700 bg-blue-900/20 p-6">
        <h3 className="metallic-3d-text mb-4 text-2xl font-semibold">
          Resumen de {displayName}
        </h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-lg border border-gray-700 bg-gray-800/80 p-4">
            <p className="text-sm text-gray-400">Total Ganado</p>
            <p className="text-2xl font-bold text-white">{total.toFixed(2)}</p>
          </div>
          <div className="rounded-lg border border-green-700 bg-green-900/20 p-4">
            <p className="text-sm text-gray-400">Tu Parte (50%)</p>
            <p className="text-2xl font-bold text-green-400">
              {userShare.toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {/* Services Table */}
      <div className="rounded-2xl border border-blue-900/30 bg-gray-900/70 shadow-lg backdrop-blur-md">
        <div className="border-b border-blue-900/30 bg-gray-950/80 px-6 py-4">
          <h3 className="metallic-3d-text text-2xl font-semibold tracking-[0.25em] uppercase">
            {displayName}
          </h3>
        </div>
        <div>
          <table className="min-w-full table-fixed divide-y divide-gray-800 text-base">
            <thead className="bg-gray-950/70">
              <tr>
                <th className="w-[40%] px-6 py-4 text-left text-sm font-semibold tracking-[0.2em] text-blue-300 uppercase">
                  Servicio
                </th>
                <th className="w-[25%] px-6 py-4 text-left text-sm font-semibold tracking-[0.2em] text-blue-300 uppercase">
                  Cliente
                </th>
                <th className="w-[15%] px-6 py-4 text-left text-sm font-semibold tracking-[0.2em] text-blue-300 uppercase">
                  Hora
                </th>
                <th className="w-[20%] px-6 py-4 text-left text-sm font-semibold tracking-[0.2em] text-blue-300 uppercase">
                  Ganancia Total
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50 bg-gray-900/40">
              {services.length > 0 ? (
                services.map((service) => (
                  <tr key={service.id} className="hover:bg-blue-900/10">
                    <td
                      className="w-[40%] truncate px-6 py-4 text-base text-gray-200"
                      title={service.service_name}
                    >
                      {service.service_name}
                    </td>
                    <td
                      className="w-[25%] truncate px-6 py-4 text-base text-gray-200"
                      title={service.client || "—"}
                    >
                      {service.client || "—"}
                    </td>
                    <td className="w-[15%] px-6 py-4 text-base whitespace-nowrap text-gray-200">
                      {service.time || "—"}
                    </td>
                    <td className="w-[20%] px-6 py-4 text-base font-semibold whitespace-nowrap text-blue-200">
                      {Number(service.earnings).toFixed(2)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-4 text-center text-base text-gray-400"
                  >
                    No hay servicios registrados
                  </td>
                </tr>
              )}
              {/* Total row */}
              <tr className="bg-gray-900/80">
                <td
                  className="metallic-3d-text px-6 py-4 text-base font-bold tracking-[0.2em] whitespace-nowrap"
                  colSpan={3}
                >
                  TOTAL
                </td>
                <td className="metallic-3d-text px-6 py-4 text-base font-bold tracking-[0.2em] whitespace-nowrap text-blue-200">
                  {total.toFixed(2)}
                </td>
              </tr>

              <tr className="bg-gray-900/50">
                <td
                  className="px-6 py-4 text-base whitespace-nowrap text-gray-300"
                  colSpan={3}
                >
                  {displayName} (50%)
                </td>
                <td className="neon-text px-6 py-4 text-base font-semibold whitespace-nowrap text-yellow-400">
                  {userShare.toFixed(2)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDataTable;
