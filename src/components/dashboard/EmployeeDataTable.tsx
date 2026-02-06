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
    <div className="animate-in fade-in space-y-8 duration-500">
      {/* Summary Section / Stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="group relative overflow-hidden rounded-2xl border border-slate-700/50 bg-[#151E32] p-6 shadow-lg transition-all duration-300 hover:border-blue-500/30">
          <p className="mb-3 text-xs font-bold tracking-widest text-slate-400 uppercase">
            Total Ganancias
          </p>
          <h3 className="font-display text-3xl font-bold text-blue-400 drop-shadow-[0_0_8px_rgba(0,0,0,0.5)]">
            ${total.toFixed(2)}
          </h3>
          <div className="absolute -right-10 -bottom-10 h-24 w-24 rounded-full bg-blue-500/10 blur-3xl" />
        </div>
        <div className="group relative overflow-hidden rounded-2xl border border-slate-700/50 bg-[#151E32] p-6 shadow-lg transition-all duration-300 hover:border-emerald-500/30">
          <p className="mb-3 text-xs font-bold tracking-widest text-slate-400 uppercase">
            Tu Participación (50%)
          </p>
          <h3 className="font-display text-3xl font-bold text-emerald-400 drop-shadow-[0_0_8px_rgba(0,0,0,0.5)]">
            ${userShare.toFixed(2)}
          </h3>
          <div className="absolute -right-10 -bottom-10 h-24 w-24 rounded-full bg-emerald-500/10 blur-3xl" />
        </div>
      </div>

      {/* Services Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-700/50 bg-[#151E32] shadow-xl">
        <div className="border-b border-slate-700/50 bg-[#1A233A] p-5">
          <h3 className="font-bold tracking-wide text-white uppercase">
            Servicios: {displayName}
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#111827] text-[10px] font-bold tracking-wider text-slate-400 uppercase">
              <tr>
                <th className="p-5">Servicio</th>
                <th className="p-5">Cliente</th>
                <th className="p-5">Hora</th>
                <th className="p-5">Ganancia Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50 font-sans">
              {services.length > 0 ? (
                services.map((service) => (
                  <tr
                    key={service.id}
                    className="transition-colors hover:bg-slate-800/50"
                  >
                    <td className="p-5">
                      <div className="text-sm font-bold text-slate-200">
                        {service.service_name}
                      </div>
                    </td>
                    <td className="p-5">
                      <div className="text-xs text-blue-400">
                        {service.client || "—"}
                      </div>
                    </td>
                    <td className="p-5 font-mono text-xs text-slate-400">
                      {service.time || "—"}
                    </td>
                    <td className="p-5 font-mono font-bold text-emerald-400">
                      ${Number(service.earnings).toFixed(2)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={4}
                    className="p-8 text-center text-sm text-slate-500 italic"
                  >
                    No hay servicios registrados hoy
                  </td>
                </tr>
              )}
            </tbody>
            {/* Table Footer / Summary Row */}
            {services.length > 0 && (
              <tfoot className="border-t border-slate-700/50 bg-[#111827]/50">
                <tr>
                  <td
                    colSpan={3}
                    className="p-5 text-right text-xs font-bold tracking-widest text-slate-400 uppercase"
                  >
                    Total del Día
                  </td>
                  <td className="p-5 font-mono text-lg font-bold text-white">
                    ${total.toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDataTable;
