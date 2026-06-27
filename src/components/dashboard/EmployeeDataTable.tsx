import { useAuth } from "../../context/AuthContext";
import { formatCurrency } from "../../utils";
import { NeoCard } from "../ui/neo/NeoCard";

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

  const displayName = user?.dataColumn || user?.username || "Usuario";

  const total = services.reduce(
    (acc, service) => acc + Number(service.earnings),
    0,
  );
  const userShare = total * 0.5;

  return (
    <div className="animate-in fade-in space-y-8 duration-500">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <NeoCard variant="main">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-white/80">
            Total Ganancias
          </p>
          <h3 className="font-heading text-3xl font-black text-white md:text-4xl">
            {formatCurrency(total)}
          </h3>
        </NeoCard>
        <NeoCard variant="neutral">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-foreground/70">
            Tu Participación (50%)
          </p>
          <h3 className="font-heading text-3xl font-black text-foreground md:text-4xl">
            {formatCurrency(userShare)}
          </h3>
        </NeoCard>
      </div>

      {/* Services Table */}
      <div className="overflow-hidden rounded-base border-2 border-border bg-background shadow-shadow">
        <div className="flex items-center gap-3 border-b-2 border-border bg-main p-5">
          <span className="text-2xl">📋</span>
          <h3 className="font-heading text-lg font-black uppercase tracking-wider text-white md:text-xl">
            Servicios: {displayName}
          </h3>
        </div>

        {/* Desktop Table */}
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b-2 border-border bg-secondary-background">
                <th className="p-5 text-xs font-black uppercase tracking-wider text-foreground/70">
                  Servicio
                </th>
                <th className="p-5 text-xs font-black uppercase tracking-wider text-foreground/70">
                  Cliente
                </th>
                <th className="p-5 text-xs font-black uppercase tracking-wider text-foreground/70">
                  Hora
                </th>
                <th className="p-5 text-xs font-black uppercase tracking-wider text-foreground/70">
                  Ganancia Total
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {services.length > 0 ? (
                services.map((service) => (
                  <tr
                    key={service.id}
                    className="transition-colors hover:bg-secondary-background"
                  >
                    <td className="p-5 text-base font-bold text-foreground">
                      {service.service_name}
                    </td>
                    <td className="p-5 text-base text-foreground/70">
                      {service.client || "—"}
                    </td>
                    <td className="p-5 font-mono text-base text-foreground/60">
                      {service.time || "—"}
                    </td>
                    <td className="p-5 font-mono text-lg font-bold text-foreground">
                      {formatCurrency(service.earnings)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={4}
                    className="p-8 text-center text-base text-foreground/60 italic"
                  >
                    No hay servicios registrados hoy
                  </td>
                </tr>
              )}
            </tbody>
            {services.length > 0 && (
              <tfoot className="border-t-2 border-border bg-secondary-background">
                <tr>
                  <td
                    colSpan={3}
                    className="p-5 text-right text-xs font-black uppercase tracking-widest text-foreground/70"
                  >
                    Total del Día
                  </td>
                  <td className="p-5 font-mono text-xl font-black text-foreground">
                    {formatCurrency(total)}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="divide-y divide-border md:hidden">
          {services.length > 0 ? (
            <>
              {services.map((service) => (
                <div key={service.id} className="bg-background p-5">
                  <div className="mb-2 flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-lg font-bold break-words leading-tight text-foreground">
                        {service.service_name}
                      </p>
                      <p className="mt-1 text-base text-foreground/60">
                        {service.client || "Cliente General"}
                      </p>
                    </div>
                    <span className="text-lg font-bold whitespace-nowrap text-foreground">
                      {formatCurrency(service.earnings)}
                    </span>
                  </div>
                  <div className="font-mono text-sm text-foreground/50">
                    {service.time || "—"}
                  </div>
                </div>
              ))}
              <div className="flex items-center justify-between bg-secondary-background p-5">
                <span className="text-xs font-black uppercase tracking-widest text-foreground/70">
                  Total del Día
                </span>
                <span className="font-mono text-xl font-black text-foreground">
                  {formatCurrency(total)}
                </span>
              </div>
            </>
          ) : (
            <div className="p-8 text-center text-base text-foreground/60 italic">
              No hay servicios registrados hoy
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeDataTable;
