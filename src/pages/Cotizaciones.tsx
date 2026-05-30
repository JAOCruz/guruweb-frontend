import { useState, useEffect, useMemo } from "react";
import {
  ChevronLeft,
  Download,
  CheckCircle,
  XCircle,
  Eye,
  EyeOff,
  FileText,
  Calendar,
  User,
  Phone,
  Printer,
} from "lucide-react";
import api, { getAPIUrl } from "../services/api";

interface QuotationItem {
  desc?: string;
  name?: string;
  cantidad?: number;
  quantity?: number;
  precio?: number;
  unitPrice?: number;
  itbis?: boolean;
}

interface Quotation {
  id: number;
  doc_number: string;
  client_name: string;
  client_phone: string;
  type: string;
  items: QuotationItem[];
  total: number;
  subtotal?: number;
  itbis?: number;
  status: "draft" | "approved" | "sent";
  pdf_path: string;
  created_at: string;
  created_by_name?: string;
  notes?: string;
}

export default function Cotizaciones() {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(null);
  const [showRightPanel, setShowRightPanel] = useState(false);
  const [showDetails, setShowDetails] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchQuotations();
  }, []);

  const fetchQuotations = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${getAPIUrl()}/api/invoices/quotations`);
      if (!response.ok) throw new Error("Failed to fetch quotations");
      const data = await response.json();
      setQuotations(data.quotations || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error loading quotations");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectQuotation = (quote: Quotation) => {
    setSelectedQuotation(quote);
    setShowRightPanel(true);
  };

  const handleApprove = async () => {
    if (!selectedQuotation) return;
    try {
      await api.post(`/invoices/${selectedQuotation.id}/approve`);
      await fetchQuotations();
      // Refresh selected quotation data
      const refreshed = quotations.find((q) => q.id === selectedQuotation.id);
      if (refreshed) setSelectedQuotation(refreshed);
    } catch (err) {
      console.error(err);
    }
  };

  const pdfUrl = useMemo(() => {
    if (!selectedQuotation?.pdf_path) return null;
    const filename = selectedQuotation.pdf_path.split("/").pop();
    return `${getAPIUrl()}/api/invoices/pdf/${filename}`;
  }, [selectedQuotation]);

  const statusStyles = {
    draft: {
      badge: "bg-yellow-500/15 text-yellow-300 border-yellow-500/30",
      dot: "bg-yellow-400",
    },
    approved: {
      badge: "bg-blue-500/15 text-blue-300 border-blue-500/30",
      dot: "bg-blue-400",
    },
    sent: {
      badge: "bg-green-500/15 text-green-300 border-green-500/30",
      dot: "bg-green-400",
    },
  };

  const statusLabel: Record<string, string> = {
    draft: "Pendiente",
    approved: "Aprobada",
    sent: "Enviada",
  };

  return (
    <div
      className="-m-3 md:-m-8 flex overflow-hidden bg-slate-950"
      style={{ height: "calc(100vh - 4rem)" }}
    >
      {/* ═══════ LEFT PANEL — Quotations List ═══════ */}
      <div
        className={`${
          showRightPanel ? "hidden md:flex" : "flex"
        } w-full md:w-80 flex-shrink-0 flex-col overflow-hidden border-r border-slate-700 bg-[#0F172A]`}
      >
        <div className="border-b border-slate-700 bg-[#151E32] p-4">
          <div className="flex items-center gap-2">
            <FileText size={20} className="text-blue-400" />
            <h2 className="text-lg font-bold text-white">Cotizaciones</h2>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            {quotations.length} total
            {quotations.filter((q) => q.status === "draft").length > 0 &&
              ` · ${quotations.filter((q) => q.status === "draft").length} pendientes`}
          </p>
        </div>

        {loading ? (
          <div className="flex flex-1 items-center justify-center text-slate-400">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-600 border-t-blue-500" />
          </div>
        ) : error ? (
          <div className="flex flex-1 items-center justify-center p-4 text-center text-red-400">
            {error}
          </div>
        ) : quotations.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center p-4 text-center text-slate-400">
            <FileText size={40} className="mb-3 text-slate-600" />
            <p className="text-sm font-medium">No hay cotizaciones</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto custom-scroll">
            {quotations.map((quote) => (
              <button
                key={quote.id}
                onClick={() => handleSelectQuotation(quote)}
                className={`w-full border-b border-slate-700/50 p-4 text-left transition-all ${
                  selectedQuotation?.id === quote.id
                    ? "bg-blue-600/10 border-l-4 border-l-blue-500"
                    : "hover:bg-slate-800/50 border-l-4 border-l-transparent"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-base font-semibold text-white">
                      {quote.doc_number}
                    </p>
                    <p className="truncate text-sm text-slate-400">
                      {quote.client_name}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full border px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase ${statusStyles[quote.status].badge}`}
                  >
                    {statusLabel[quote.status]}
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <p className="text-xs font-medium text-slate-300">
                    RD$ {quote.total.toLocaleString("es-DO")}
                  </p>
                  <p className="text-[10px] text-slate-500">
                    {new Date(quote.created_at).toLocaleDateString("es-DO")}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ═══════ RIGHT PANEL — PDF Showcase ═══════ */}
      {selectedQuotation && (
        <div
          className={`${
            !showRightPanel ? "hidden" : "flex"
          } flex-1 flex-col overflow-hidden bg-slate-950`}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-700 bg-[#151E32] px-4 py-3">
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={() => setShowRightPanel(false)}
                className="shrink-0 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white md:hidden"
              >
                <ChevronLeft size={20} />
              </button>
              <div className="min-w-0">
                <h3 className="truncate text-base font-bold text-white">
                  {selectedQuotation.doc_number}
                </h3>
                <p className="truncate text-xs text-slate-400">
                  {selectedQuotation.client_name}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Toggle Details (mobile / small screens) */}
              <button
                onClick={() => setShowDetails((v) => !v)}
                className="rounded-lg border border-slate-700 bg-slate-800/50 p-2 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white lg:hidden"
                title={showDetails ? "Ocultar detalles" : "Ver detalles"}
              >
                {showDetails ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>

              {/* Download */}
              {pdfUrl && (
                <a
                  href={pdfUrl}
                  download
                  className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/50 px-3 py-2 text-xs font-semibold text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
                >
                  <Download size={14} />
                  <span className="hidden sm:inline">Descargar</span>
                </a>
              )}

              {/* Print */}
              {pdfUrl && (
                <button
                  onClick={() => window.open(pdfUrl, "_blank")}
                  className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/50 px-3 py-2 text-xs font-semibold text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
                >
                  <Printer size={14} />
                  <span className="hidden sm:inline">Imprimir</span>
                </button>
              )}

              <span
                className={`hidden sm:inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold tracking-wider uppercase ${statusStyles[selectedQuotation.status].badge}`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${statusStyles[selectedQuotation.status].dot}`} />
                {statusLabel[selectedQuotation.status]}
              </span>
            </div>
          </div>

          {/* Content — Split View */}
          <div className="flex flex-1 overflow-hidden">
            {/* Details Sidebar */}
            <div
              className={`${
                showDetails ? "flex" : "hidden"
              } w-full flex-col overflow-y-auto border-r border-slate-700 bg-[#0F172A] p-4 custom-scroll lg:flex lg:w-80`}
            >
              {/* Client Card */}
              <div className="mb-4 rounded-xl border border-slate-700/50 bg-[#151E32] p-4">
                <p className="mb-2 text-[10px] font-bold tracking-widest text-slate-500 uppercase">
                  Cliente
                </p>
                <div className="flex items-center gap-2 text-sm font-semibold text-white">
                  <User size={14} className="text-blue-400" />
                  {selectedQuotation.client_name}
                </div>
                {selectedQuotation.client_phone && (
                  <div className="mt-1.5 flex items-center gap-2 text-xs text-slate-400">
                    <Phone size={12} className="text-slate-500" />
                    {selectedQuotation.client_phone}
                  </div>
                )}
                <div className="mt-2 flex items-center gap-2 text-[10px] text-slate-500">
                  <Calendar size={12} />
                  {new Date(selectedQuotation.created_at).toLocaleDateString("es-DO", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
                </div>
              </div>

              {/* Items */}
              <div className="mb-4">
                <p className="mb-2 text-[10px] font-bold tracking-widest text-slate-500 uppercase">
                  Artículos ({selectedQuotation.items?.length || 0})
                </p>
                <div className="space-y-2">
                  {selectedQuotation.items?.map((item, i) => (
                    <div
                      key={i}
                      className="rounded-lg border border-slate-700/50 bg-[#151E32]/60 p-3"
                    >
                      <p className="text-sm font-medium text-white">
                        {item.desc || item.name || `Artículo ${i + 1}`}
                      </p>
                      <div className="mt-1 flex items-center justify-between text-xs text-slate-400">
                        <span>
                          {item.cantidad || item.quantity || 1} x RD${" "}
                          {(item.precio || item.unitPrice || 0).toLocaleString("es-DO")}
                        </span>
                        <span className="font-semibold text-slate-300">
                          RD${" "}
                          {(
                            (item.cantidad || item.quantity || 1) *
                            (item.precio || item.unitPrice || 0)
                          ).toLocaleString("es-DO")}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals */}
              <div className="mb-4 rounded-xl border border-blue-500/20 bg-blue-500/5 p-4">
                {selectedQuotation.subtotal !== undefined && (
                  <div className="mb-1 flex items-center justify-between text-xs text-slate-400">
                    <span>Subtotal</span>
                    <span>RD$ {selectedQuotation.subtotal.toLocaleString("es-DO")}</span>
                  </div>
                )}
                {selectedQuotation.itbis ? (
                  <div className="mb-2 flex items-center justify-between text-xs text-slate-400">
                    <span>ITBIS (18%)</span>
                    <span>RD$ {selectedQuotation.itbis.toLocaleString("es-DO")}</span>
                  </div>
                ) : (
                  <div className="mb-2 flex items-center justify-between text-[10px] text-slate-500 italic">
                    <span>ITBIS no aplicado</span>
                  </div>
                )}
                <div className="flex items-center justify-between border-t border-slate-700/50 pt-2">
                  <span className="text-xs font-bold tracking-wider text-slate-400 uppercase">
                    Total
                  </span>
                  <span className="font-display text-lg font-bold text-white">
                    RD$ {selectedQuotation.total.toLocaleString("es-DO")}
                  </span>
                </div>
              </div>

              {/* Notes */}
              {selectedQuotation.notes && (
                <div className="mb-4 rounded-lg border border-amber-500/10 bg-amber-500/5 p-3">
                  <p className="mb-1 text-[10px] font-bold tracking-wider text-amber-400/80 uppercase">
                    Notas
                  </p>
                  <p className="whitespace-pre-wrap text-xs leading-relaxed text-amber-100/70">
                    {selectedQuotation.notes}
                  </p>
                </div>
              )}

              {/* Actions */}
              {selectedQuotation.status === "draft" && (
                <div className="mt-auto flex gap-2 pt-4">
                  <button
                    onClick={handleApprove}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-2.5 text-sm font-bold text-white transition-all hover:bg-green-500 active:scale-95"
                  >
                    <CheckCircle size={16} />
                    Aprobar
                  </button>
                  <button className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm font-semibold text-red-400 transition-all hover:bg-red-500/20 active:scale-95">
                    <XCircle size={16} />
                    Rechazar
                  </button>
                </div>
              )}
            </div>

            {/* PDF Viewer */}
            <div className="relative flex flex-1 flex-col bg-slate-900">
              {pdfUrl ? (
                <iframe
                  src={pdfUrl}
                  className="h-full w-full"
                  title={`Vista previa ${selectedQuotation.doc_number}`}
                  sandbox="allow-same-origin allow-scripts"
                />
              ) : (
                <div className="flex flex-1 flex-col items-center justify-center text-slate-400">
                  <FileText size={48} className="mb-3 text-slate-600" />
                  <p className="text-sm font-medium text-slate-300">
                    PDF no disponible
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Esta cotización aún no tiene un PDF generado.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
