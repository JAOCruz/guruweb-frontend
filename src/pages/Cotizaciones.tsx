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
import { NeoCard, NeoButton, NeoBadge } from "../components/ui/neo";

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

  const statusBadgeVariant = {
    draft: "neutral" as const,
    approved: "main" as const,
    sent: "outline" as const,
  };

  const statusLabel: Record<string, string> = {
    draft: "Pendiente",
    approved: "Aprobada",
    sent: "Enviada",
  };

  return (
    <div
      className="-m-3 md:-m-8 flex overflow-hidden bg-background text-foreground"
      style={{ height: "calc(100vh - 4rem)" }}
    >
      {/* ═══════ LEFT PANEL — Quotations List ═══════ */}
      <div
        className={`${
          showRightPanel ? "hidden md:flex" : "flex"
        } w-full md:w-80 flex-shrink-0 flex-col overflow-hidden border-r-2 border-border bg-secondary-background`}
      >
        <div className="border-b-2 border-border bg-secondary-background p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-base border-2 border-border bg-main text-main-foreground shadow-button">
              <FileText size={20} />
            </div>
            <h2 className="font-heading text-4xl md:text-5xl font-black">Cotizaciones</h2>
          </div>
          <p className="mt-2 text-base text-foreground/70">
            {quotations.length} total
            {quotations.filter((q) => q.status === "draft").length > 0 &&
              ` · ${quotations.filter((q) => q.status === "draft").length} pendientes`}
          </p>
        </div>

        {loading ? (
          <div className="flex flex-1 items-center justify-center text-foreground/50">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-main" />
          </div>
        ) : error ? (
          <div className="flex flex-1 items-center justify-center p-4 text-center text-foreground">
            <NeoBadge variant="outline" className="text-base">{error}</NeoBadge>
          </div>
        ) : quotations.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center p-4 text-center text-foreground/50">
            <FileText size={40} className="mb-3 opacity-40" />
            <p className="text-base font-medium">No hay cotizaciones</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto custom-scroll p-3 space-y-2">
            {quotations.map((quote) => (
              <button
                key={quote.id}
                onClick={() => handleSelectQuotation(quote)}
                className={`w-full text-left rounded-base border-2 p-4 transition-all ${
                  selectedQuotation?.id === quote.id
                    ? "border-border bg-secondary-background shadow-shadow"
                    : "border-transparent hover:border-border hover:bg-secondary-background"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-base font-semibold">
                      {quote.doc_number}
                    </p>
                    <p className="truncate text-base text-foreground/70">
                      {quote.client_name}
                    </p>
                  </div>
                  <NeoBadge variant={statusBadgeVariant[quote.status]} className="shrink-0 text-xs">
                    {statusLabel[quote.status]}
                  </NeoBadge>
                </div>
                <div className="mt-2 flex items-center justify-between text-base">
                  <p className="font-medium text-foreground/90">
                    RD$ {quote.total.toLocaleString("es-DO")}
                  </p>
                  <p className="text-foreground/50">
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
          } flex-1 flex-col overflow-hidden bg-background`}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b-2 border-border bg-secondary-background px-4 py-3">
            <div className="flex items-center gap-3 min-w-0">
              <NeoButton
                variant="ghost"
                size="icon"
                onClick={() => setShowRightPanel(false)}
                className="md:hidden"
              >
                <ChevronLeft size={20} />
              </NeoButton>
              <div className="min-w-0">
                <h3 className="truncate font-heading text-lg">
                  {selectedQuotation.doc_number}
                </h3>
                <p className="truncate text-base text-foreground/70">
                  {selectedQuotation.client_name}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Toggle Details (mobile / small screens) */}
              <NeoButton
                variant="outline"
                size="icon"
                onClick={() => setShowDetails((v) => !v)}
                className="lg:hidden"
                title={showDetails ? "Ocultar detalles" : "Ver detalles"}
              >
                {showDetails ? <EyeOff size={16} /> : <Eye size={16} />}
              </NeoButton>

              {/* Download */}
              {pdfUrl && (
                <NeoButton
                  variant="neutral"
                  size="sm"
                  onClick={() => {
                    const a = document.createElement("a");
                    a.href = pdfUrl;
                    a.download = "";
                    a.click();
                  }}
                >
                  <Download size={14} />
                  <span className="hidden sm:inline">Descargar</span>
                </NeoButton>
              )}

              {/* Print */}
              {pdfUrl && (
                <NeoButton
                  variant="neutral"
                  size="sm"
                  onClick={() => window.open(pdfUrl, "_blank")}
                >
                  <Printer size={14} />
                  <span className="hidden sm:inline">Imprimir</span>
                </NeoButton>
              )}

              <NeoBadge
                variant={statusBadgeVariant[selectedQuotation.status]}
                className="hidden sm:inline-flex text-xs"
              >
                {statusLabel[selectedQuotation.status]}
              </NeoBadge>
            </div>
          </div>

          {/* Content — Split View */}
          <div className="flex flex-1 overflow-hidden">
            {/* Details Sidebar */}
            <div
              className={`${
                showDetails ? "flex" : "hidden"
              } w-full flex-col overflow-y-auto border-r-2 border-border bg-secondary-background p-4 custom-scroll lg:flex lg:w-80`}
            >
              {/* Client Card */}
              <NeoCard className="mb-4 p-4">
                <p className="mb-2 text-base font-black uppercase tracking-widest text-foreground/60">
                  Cliente
                </p>
                <div className="flex items-center gap-2 text-base font-semibold">
                  <User size={16} className="text-main" />
                  {selectedQuotation.client_name}
                </div>
                {selectedQuotation.client_phone && (
                  <div className="mt-1.5 flex items-center gap-2 text-base text-foreground/70">
                    <Phone size={16} />
                    {selectedQuotation.client_phone}
                  </div>
                )}
                <div className="mt-2 flex items-center gap-2 text-base text-foreground/60">
                  <Calendar size={16} />
                  {new Date(selectedQuotation.created_at).toLocaleDateString("es-DO", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
                </div>
              </NeoCard>

              {/* Items */}
              <div className="mb-4">
                <p className="mb-2 text-base font-black uppercase tracking-widest text-foreground/60">
                  Artículos ({selectedQuotation.items?.length || 0})
                </p>
                <div className="space-y-2">
                  {selectedQuotation.items?.map((item, i) => (
                    <NeoCard key={i} className="p-3">
                      <p className="text-base font-medium">
                        {item.desc || item.name || `Artículo ${i + 1}`}
                      </p>
                      <div className="mt-1 flex items-center justify-between text-base text-foreground/70">
                        <span>
                          {item.cantidad || item.quantity || 1} x RD${" "}
                          {(item.precio || item.unitPrice || 0).toLocaleString("es-DO")}
                        </span>
                        <span className="font-semibold text-foreground">
                          RD${" "}
                          {(
                            (item.cantidad || item.quantity || 1) *
                            (item.precio || item.unitPrice || 0)
                          ).toLocaleString("es-DO")}
                        </span>
                      </div>
                    </NeoCard>
                  ))}
                </div>
              </div>

              {/* Totals */}
              <NeoCard variant="main" className="mb-4 p-4">
                {selectedQuotation.subtotal !== undefined && (
                  <div className="mb-1 flex items-center justify-between text-base text-main-foreground/80">
                    <span>Subtotal</span>
                    <span>RD$ {selectedQuotation.subtotal.toLocaleString("es-DO")}</span>
                  </div>
                )}
                {selectedQuotation.itbis ? (
                  <div className="mb-2 flex items-center justify-between text-base text-main-foreground/80">
                    <span>ITBIS (18%)</span>
                    <span>RD$ {selectedQuotation.itbis.toLocaleString("es-DO")}</span>
                  </div>
                ) : (
                  <div className="mb-2 flex items-center justify-between text-base text-main-foreground/70 italic">
                    <span>ITBIS no aplicado</span>
                  </div>
                )}
                <div className="flex items-center justify-between border-t-2 border-main-foreground/30 pt-2">
                  <span className="text-base font-black uppercase tracking-wider text-main-foreground/80">
                    Total
                  </span>
                  <span className="font-heading text-xl md:text-2xl font-bold text-main-foreground">
                    RD$ {selectedQuotation.total.toLocaleString("es-DO")}
                  </span>
                </div>
              </NeoCard>

              {/* Notes */}
              {selectedQuotation.notes && (
                <NeoCard variant="outline" className="mb-4 p-4">
                  <p className="mb-1 text-base font-black uppercase tracking-wider text-foreground/80">
                    Notas
                  </p>
                  <p className="whitespace-pre-wrap text-base leading-relaxed text-foreground/80">
                    {selectedQuotation.notes}
                  </p>
                </NeoCard>
              )}

              {/* Actions */}
              {selectedQuotation.status === "draft" && (
                <div className="mt-auto flex gap-2 pt-4">
                  <NeoButton
                    onClick={handleApprove}
                    className="flex-1"
                  >
                    <CheckCircle size={16} />
                    Aprobar
                  </NeoButton>
                  <NeoButton variant="outline" className="flex-1">
                    <XCircle size={16} />
                    Rechazar
                  </NeoButton>
                </div>
              )}
            </div>

            {/* PDF Viewer */}
            <div className="relative flex flex-1 flex-col bg-secondary-background">
              {pdfUrl ? (
                <iframe
                  src={pdfUrl}
                  className="h-full w-full"
                  title={`Vista previa ${selectedQuotation.doc_number}`}
                  sandbox="allow-same-origin allow-scripts"
                />
              ) : (
                <div className="flex flex-1 flex-col items-center justify-center text-foreground/50">
                  <FileText size={48} className="mb-3 opacity-40" />
                  <p className="text-base font-medium text-foreground">
                    PDF no disponible
                  </p>
                  <p className="mt-1 text-base text-foreground/70">
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
