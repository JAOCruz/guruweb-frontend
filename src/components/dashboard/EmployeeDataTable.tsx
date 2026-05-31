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

const NEO_CARD =
  "rounded-xl border-4 border-[#000080] bg-[#0000FF] p-4 shadow-[6px_6px_0px_0px_rgba(0,0,128,1)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_rgba(0,0,128,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none sm:p-5";

const NEO_TABLE_WRAPPER =
  "overflow-hidden rounded-xl border-4 border-[#000080] bg-[#0000FF] shadow-[6px_6px_0px_0px_rgba(0,0,128,1)]";

const NEO_TABLE_HEADER =
  "border-b-4 border-[#000080] bg-[#0000FF] p-4 text-xs font-black uppercase tracking-[0.2em] text-white/80 sm:p-5";

const NEO_TH =
  "bg-[#000080] p-4 text-[10px] font-black uppercase tracking-wider text-white/70";

const NEO_TD = "p-4 text-sm text-white";

const NEO_ROW =
  "border-b-2 border-[#000080]/40 transition-colors hover:bg-[#000080]/20";

const NEO_FOOTER =
  "border-t-4 border-[#000080] bg-[#000080]/30";

const EmployeeDataTable: React.FC<EmployeeDataTableProps> = ({ services }) => {
  const { user } = useAuth();

  const displayName = user?.dataColumn || user?.username || "Usuario";

  const total = services.reduce(
    (acc, service) => acc + Number(service.earnings),
    0,
  );
  const userShare = total * 0.5;

  return (
    <div className="animate-in fade-in space-y-8 duration-500">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className={NEO_CARD}>
          <p className="mb-2 text-[10px] font-black uppercase tracking-[0.2em] text-white/70">
            Total Ganancias
          </p>
          <h3 className="font-display text-2xl font-black text-white sm:text-3xl">
            {formatCurrency(total)}
          </h3>
        </div>
        <div className={NEO_CARD}>
          <p className="mb-2 text-[10px] font-black uppercase tracking-[0.2em] text-white/70">
            Tu Participación (50%)
          </p>
          <h3 className="font-display text-2xl font-black text-white sm:text-3xl">
            {formatCurrency(userShare)}
          </h3>
        </div>
      </div>

      {/* Services Table */}
      <div className={NEO_TABLE_WRAPPER}>
        <div className={NEO_TABLE_HEADER}>
          <h3 className="flex items-center gap-2 text-sm font-black uppercase tracking-wider text-white">
            <span className="text-lg">📋</span> Servicios: {displayName}
          </h3>
        </div>

        {/* Desktop Table */}
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full text-left">
            <thead>
              <tr>
                <th className={NEO_TH}>Servicio</th>
                <th className={NEO_TH}>Cliente</th>
                <th className={NEO_TH}>Hora</th>
                <th className={NEO_TH}>Ganancia Total</th>
              </tr>
            </thead>
            <tbody className="font-sans">
              {services.length > 0 ? (
                services.map((service) => (
                  <tr key={service.id} className={NEO_ROW}>
                    <td className={NEO_TD}>
                      <div className="font-bold">{service.service_name}</div>
                    </td>
                    <td className={NEO_TD}>
                      <div className="text-xs text-white/70">
                        {service.client || "—"}
                      </div>
                    </td>
                    <td className={`${NEO_TD} font-mono text-xs text-white/60`}>
                      {service.time || "—"}
                    </td>
                    <td className={`${NEO_TD} font-mono font-bold text-white`}>
                      {formatCurrency(service.earnings)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={4}
                    className="p-8 text-center text-sm text-white/50 italic"
                  >
                    No hay servicios registrados hoy
                  </td>
                </tr>
              )}
            </tbody>
            {services.length > 0 && (
              <tfoot className={NEO_FOOTER}>
                <tr>
                  <td
                    colSpan={3}
                    className="p-4 text-right text-xs font-black uppercase tracking-widest text-white/70"
                  >
                    Total del Día
                  </td>
                  <td className="p-4 font-mono text-lg font-bold text-white">
                    {formatCurrency(total)}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="divide-y-2 divide-[#000080]/40 md:hidden">
          {services.length > 0 ? (
            <>
              {services.map((service) => (
                <div key={service.id} className="bg-[#0000FF] p-4">
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-base font-bold break-words leading-tight text-white">
                        {service.service_name}
                      </p>
                      <p className="mt-0.5 text-sm text-white/60">
                        {service.client || "Cliente General"}
                      </p>
                    </div>
                    <span className="text-lg font-bold whitespace-nowrap text-white">
                      {formatCurrency(service.earnings)}
                    </span>
                  </div>
                  <div className="font-mono text-xs text-white/50">
                    {service.time || "—"}
                  </div>
                </div>
              ))}
              <div className="flex items-center justify-between bg-[#000080]/30 p-4">
                <span className="text-xs font-black uppercase tracking-widest text-white/70">
                  Total del Día
                </span>
                <span className="font-mono text-lg font-bold text-white">
                  {formatCurrency(total)}
                </span>
              </div>
            </>
          ) : (
            <div className="p-8 text-center text-sm text-white/50 italic">
              No hay servicios registrados hoy
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeDataTable;
