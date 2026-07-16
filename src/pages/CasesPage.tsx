import React, { useEffect, useState } from "react";
import { casesAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { ClipboardList, Loader2, AlertCircle } from "lucide-react";

interface CaseRecord {
  id: number;
  case_number: string;
  title: string;
  description?: string;
  status: string;
  case_type: string;
  case_subtype?: string;
  client_name?: string;
  client_phone?: string;
  institution?: string;
  expected_completion_date?: string;
  created_at: string;
  updated_at: string;
}

const STATUS_LABELS: Record<string, string> = {
  new: "Nuevo",
  in_progress: "En trámite",
  pending_payment: "Pendiente de pago",
  awaiting_institution: "En espera de institución",
  rejected: "Rechazado / Corregir",
  completed: "Completado",
  delivered: "Entregado",
  closed: "Cerrado",
  cancelled: "Cancelado",
  escalated: "Escalado",
  open: "Abierto",
  paid: "Pagado",
  resolved: "Resuelto",
};

const STATUS_COLORS: Record<string, string> = {
  new: "bg-slate-600",
  in_progress: "bg-blue-600",
  pending_payment: "bg-amber-600",
  awaiting_institution: "bg-purple-600",
  rejected: "bg-red-600",
  completed: "bg-emerald-600",
  delivered: "bg-teal-600",
  closed: "bg-gray-600",
  cancelled: "bg-gray-500",
  escalated: "bg-rose-600",
  open: "bg-cyan-600",
  paid: "bg-green-600",
  resolved: "bg-indigo-600",
};

const CasesPage: React.FC = () => {
  const { isAdmin } = useAuth();
  const [cases, setCases] = useState<CaseRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "certificacion">("certificacion");
  const [statusFilter, setStatusFilter] = useState<string>("");

  useEffect(() => {
    fetchCases();
  }, [filter, statusFilter]);

  const fetchCases = async () => {
    try {
      setLoading(true);
      setError(null);
      const params: Record<string, string> = {};
      if (filter === "certificacion") params.case_type = "certificacion";
      if (statusFilter) params.status = statusFilter;

      const response = await casesAPI.getCases(params);
      setCases(response.data.cases || []);
    } catch (err: any) {
      console.error("Error fetching cases:", err);
      setError(err.response?.data?.error || "Error al cargar los casos");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (value?: string) => {
    if (!value) return "—";
    return new Date(value).toLocaleDateString("es-DO", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <ClipboardList className="h-7 w-7 text-blue-400" />
          <h1 className="text-2xl font-bold text-white">Casos</h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
          >
            <option value="certificacion">Certificaciones</option>
            <option value="all">Todos los casos</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
          >
            <option value="">Todos los estados</option>
            {Object.entries(STATUS_LABELS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
        </div>
      )}

      {error && !loading && (
        <div className="flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-red-200">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && cases.length === 0 && (
        <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-8 text-center text-slate-300">
          No hay casos que coincidan con los filtros seleccionados.
        </div>
      )}

      {!loading && !error && cases.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-slate-700 bg-slate-800/50">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-800 text-xs uppercase text-slate-400">
                <tr>
                  <th className="px-4 py-3">Expediente</th>
                  <th className="px-4 py-3">Cliente</th>
                  <th className="px-4 py-3">Asunto</th>
                  <th className="px-4 py-3">Institución</th>
                  <th className="px-4 py-3">Subtipo</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3">Fecha estimada</th>
                  {isAdmin && <th className="px-4 py-3">Teléfono</th>}
                  <th className="px-4 py-3">Actualizado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {cases.map((c) => (
                  <tr
                    key={c.id}
                    className="transition-colors hover:bg-slate-800/70"
                  >
                    <td className="px-4 py-3 font-medium text-white">
                      {c.case_number}
                    </td>
                    <td className="px-4 py-3">{c.client_name || "—"}</td>
                    <td className="px-4 py-3">{c.title}</td>
                    <td className="px-4 py-3">{c.institution || "—"}</td>
                    <td className="px-4 py-3">
                      {c.case_subtype
                        ? c.case_subtype.replace(/_/g, " ")
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium text-white ${
                          STATUS_COLORS[c.status] || "bg-slate-600"
                        }`}
                      >
                        {STATUS_LABELS[c.status] || c.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {formatDate(c.expected_completion_date)}
                    </td>
                    {isAdmin && (
                      <td className="px-4 py-3">{c.client_phone || "—"}</td>
                    )}
                    <td className="px-4 py-3">{formatDate(c.updated_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default CasesPage;
