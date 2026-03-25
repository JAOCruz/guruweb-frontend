import { useAuth } from "../../context/AuthContext";
import { formatCurrency } from "../../utils";

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
        <div className="group relative overflow-hidden rounded-2xl border border-slate-700/50 bg-[#151E32] p-4 shadow-lg transition-all duration-300 hover:border-blue-500/30 sm:p-6">
          <p className="mb-2 text-xs font-bold tracking-widest text-slate-400 uppercase sm:mb-3">
            Total Ganancias
          </p>
          <h3 className="font-display font-mono text-2xl font-bold text-blue-400 drop-shadow-[0_0_8px_rgba(0,0,0,0.5)] sm:text-3xl">
            {formatCurrency(total)}
          </h3>
          <div className="absolute -right-10 -bottom-10 h-24 w-24 rounded-full bg-blue-500/10 blur-3xl" />
        </div>
        <div className="group relative overflow-hidden rounded-2xl border border-slate-700/50 bg-[#151E32] p-4 shadow-lg transition-all duration-300 hover:border-emerald-500/30 sm:p-6">
          <p className="mb-2 text-xs font-bold tracking-widest text-slate-400 uppercase sm:mb-3">
            Tu Participación (50%)
          </p>
          <h3 className="font-display font-mono text-2xl font-bold text-emerald-400 drop-shadow-[0_0_8px_rgba(0,0,0,0.5)] sm:text-3xl">
            {formatCurrency(userShare)}
          </h3>
          <div className="absolute -right-10 -bottom-10 h-24 w-24 rounded-full bg-emerald-500/10 blur-3xl" />
        </div>
      </div>

      {/* Services Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-700/50 bg-[#151E32] shadow-xl">
        <div className="border-b border-slate-700/50 bg-[#1A233A] p-4 sm:p-5">
          <h3 className="text-sm font-bold tracking-wide text-white uppercase sm:text-base">
            Servicios: {displayName}
          </h3>
        </div>

        {/* Desktop Table */}
        <div className="hidden overflow-x-auto md:block">
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
                      {formatCurrency(service.earnings)}
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
                    {formatCurrency(total)}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="divide-y divide-slate-800 md:hidden">
          {services.length > 0 ? (
            <>
              {services.map((service) => (
                <div key={service.id} className="bg-slate-900 p-4">
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-base leading-tight font-bold break-words text-white">
                        {service.service_name}
                      </p>
                      <p className="mt-0.5 text-sm text-slate-500">
                        {service.client || "Cliente General"}
                      </p>
                    </div>
                    <span className="text-lg font-bold whitespace-nowrap text-emerald-400">
                      {formatCurrency(service.earnings)}
                    </span>
                  </div>
                  <div className="font-mono text-xs text-slate-500">
                    {service.time || "—"}
                  </div>
                </div>
              ))}
              <div className="flex items-center justify-between bg-[#111827]/50 p-4">
                <span className="text-xs font-bold tracking-widest text-slate-400 uppercase">
                  Total del Día
                </span>
                <span className="font-mono text-lg font-bold text-white">
                  {formatCurrency(total)}
                </span>
              </div>
            </>
          ) : (
            <div className="p-8 text-center text-sm text-slate-500 italic">
              No hay servicios registrados hoy
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeDataTable;
