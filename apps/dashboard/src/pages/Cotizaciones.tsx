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
  RefreshCw,
  Maximize2,
  X,
  Plus,
  Trash2,
} from "lucide-react";
import api, { getAPIUrl } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { NeoCard, NeoButton, NeoBadge } from "@guru/ui";
import { fetchAuthenticatedFile } from "../utils";

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
  status: "draft" | "approved" | "sent" | "paid";
  pdf_path: string;
  created_at: string;
  created_by_name?: string;
  notes?: string;
}

export default function Cotizaciones() {
  const { isAdmin } = useAuth();
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(null);
  const [showRightPanel, setShowRightPanel] = useState(false);
  const [showDetails, setShowDetails] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmingPayment, setConfirmingPayment] = useState(false);
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfFullscreen, setPdfFullscreen] = useState(false);

  // Create invoice/quotation modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createType, setCreateType] = useState<"COTIZACIÓN" | "FACTURA">("COTIZACIÓN");
  const [createClientName, setCreateClientName] = useState("");
  const [createClientPhone, setCreateClientPhone] = useState("");
  const [createNotes, setCreateNotes] = useState("");
  const [createItems, setCreateItems] = useState<QuotationItem[]>([
    { desc: "", cantidad: 1, precio: 0, itbis: false },
  ]);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  useEffect(() => {
    fetchQuotations();
  }, []);

  const fetchQuotations = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/invoices/quotations");
      setQuotations(data.quotations || []);
      setError(null);
    } catch (err: any) {
      setError(err?.response?.data?.error || err.message || "Error loading quotations");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const resetCreateForm = () => {
    setCreateType("COTIZACIÓN");
    setCreateClientName("");
    setCreateClientPhone("");
    setCreateNotes("");
    setCreateItems([{ desc: "", cantidad: 1, precio: 0, itbis: false }]);
    setCreateError(null);
  };

  const addCreateItem = () => {
    setCreateItems((prev) => [...prev, { desc: "", cantidad: 1, precio: 0, itbis: false }]);
  };

  const removeCreateItem = (idx: number) => {
    setCreateItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateCreateItem = (idx: number, field: keyof QuotationItem, value: any) => {
    setCreateItems((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, [field]: value } : item))
    );
  };

  const createTotals = useMemo(() => {
    const subtotal = createItems.reduce(
      (sum, item) => sum + (Number(item.cantidad) || 0) * (Number(item.precio) || 0),
      0
    );
    const itbis = createItems.some((item) => item.itbis)
      ? createItems.reduce(
          (sum, item) =>
            item.itbis
              ? sum + (Number(item.cantidad) || 0) * (Number(item.precio) || 0) * 0.18
              : sum,
          0
        )
      : 0;
    return { subtotal, itbis, total: subtotal + itbis };
  }, [createItems]);

  const handleCreate = async () => {
    if (!createClientName.trim()) {
      setCreateError("El nombre del cliente es obligatorio");
      return;
    }
    const validItems = createItems.filter(
      (item) => item.desc?.trim() && (Number(item.precio) || 0) > 0
    );
    if (validItems.length === 0) {
      setCreateError("Agrega al menos un artículo válido");
      return;
    }

    setCreating(true);
    setCreateError(null);
    try {
      const payload = {
        type: createType,
        clientName: createClientName.trim(),
        clientPhone: createClientPhone.trim() || undefined,
        items: validItems.map((item) => ({
          desc: item.desc,
          cantidad: Number(item.cantidad) || 1,
          precio: Number(item.precio) || 0,
          itbis: !!item.itbis,
        })),
        notes: createNotes.trim() || undefined,
      };
      await api.post("/invoices", payload);
      setShowCreateModal(false);
      resetCreateForm();
      await fetchQuotations();
    } catch (err: any) {
      console.error(err);
      setCreateError(err?.response?.data?.error || "Error creando documento");
    } finally {
      setCreating(false);
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

  const handleConfirmPayment = async () => {
    if (!selectedQuotation) return;
    setConfirmingPayment(true);
    try {
      await api.post(`/invoices/${selectedQuotation.id}/confirm-payment`, {
        payment_method: "manual",
      });
      await fetchQuotations();
      const refreshed = quotations.find((q) => q.id === selectedQuotation.id);
      if (refreshed) setSelectedQuotation(refreshed);
      else setSelectedQuotation((prev) => (prev ? { ...prev, status: "paid" } : prev));
    } catch (err: any) {
      console.error(err);
      alert(err?.response?.data?.error || "Error confirmando pago");
    } finally {
      setConfirmingPayment(false);
    }
  };

  const rawPdfUrl = useMemo(() => {
    if (!selectedQuotation?.pdf_path) return null;
    const filename = selectedQuotation.pdf_path.split("/").pop();
    return `${getAPIUrl()}/api/invoices/pdf/${filename}`;
  }, [selectedQuotation]);

  useEffect(() => {
    if (!rawPdfUrl) {
      setPdfBlobUrl(null);
      return;
    }

    let revoked = false;
    setPdfLoading(true);
    fetchAuthenticatedFile(rawPdfUrl)
      .then((url) => {
        if (!revoked) setPdfBlobUrl(url);
      })
      .catch((err) => {
        console.error("Failed to load PDF:", err);
        setPdfBlobUrl(null);
      })
      .finally(() => setPdfLoading(false));

    return () => {
      revoked = true;
      setPdfBlobUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
    };
  }, [rawPdfUrl]);

  const statusBadgeVariant = {
    draft: "neutral" as const,
    approved: "main" as const,
    sent: "outline" as const,
    paid: "main" as const,
  };

  const statusLabel: Record<string, string> = {
    draft: "Pendiente",
    approved: "Aprobada",
    sent: "Enviada",
    paid: "Pagada",
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
          <NeoButton
            onClick={() => {
              resetCreateForm();
              setShowCreateModal(true);
            }}
            className="mt-3 w-full"
            size="sm"
          >
            <Plus size={16} />
            Nueva cotización / factura
          </NeoButton>
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
              {pdfBlobUrl && (
                <NeoButton
                  variant="neutral"
                  size="sm"
                  onClick={() => {
                    const a = document.createElement("a");
                    a.href = pdfBlobUrl;
                    a.download = `${selectedQuotation.doc_number}.pdf`;
                    a.click();
                  }}
                >
                  <Download size={14} />
                  <span className="hidden sm:inline">Descargar</span>
                </NeoButton>
              )}

              {/* Fullscreen */}
              {pdfBlobUrl && (
                <NeoButton
                  variant="neutral"
                  size="sm"
                  onClick={() => setPdfFullscreen(true)}
                  title="Ver en pantalla completa"
                >
                  <Maximize2 size={14} />
                  <span className="hidden sm:inline">Ampliar</span>
                </NeoButton>
              )}

              {/* Print */}
              {pdfBlobUrl && (
                <NeoButton
                  variant="neutral"
                  size="sm"
                  onClick={() => window.open(pdfBlobUrl, "_blank")}
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

              {isAdmin && selectedQuotation.status !== "paid" && (
                <div className="mt-4 flex gap-2 pt-2 border-t-2 border-border">
                  <NeoButton
                    onClick={handleConfirmPayment}
                    disabled={confirmingPayment}
                    className="flex-1"
                  >
                    {confirmingPayment ? (
                      <RefreshCw size={16} className="mr-1 animate-spin" />
                    ) : (
                      <CheckCircle size={16} />
                    )}
                    Confirmar pago
                  </NeoButton>
                </div>
              )}
            </div>

            {/* PDF Viewer */}
            <div className="relative flex flex-1 flex-col bg-secondary-background">
              {pdfLoading ? (
                <div className="flex flex-1 flex-col items-center justify-center text-foreground/50">
                  <div className="mb-3 h-8 w-8 animate-spin rounded-full border-2 border-border border-t-main" />
                  <p className="text-base font-medium text-foreground">
                    Cargando PDF…
                  </p>
                </div>
              ) : pdfBlobUrl ? (
                <object
                  data={pdfBlobUrl}
                  type="application/pdf"
                  className="h-full w-full"
                  aria-label={`Vista previa ${selectedQuotation.doc_number}`}
                >
                  <p className="text-foreground/50 text-center mt-8">
                    Tu navegador no puede mostrar PDFs.
                    <a href={pdfBlobUrl} download={`${selectedQuotation.doc_number}.pdf`} className="underline text-main ml-2">
                      Descargar
                    </a>
                  </p>
                </object>
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

      {/* Fullscreen PDF modal */}
      {pdfFullscreen && pdfBlobUrl && selectedQuotation && (
        <div
          className="fixed inset-0 z-50 flex flex-col bg-black/90 p-4"
          onClick={() => setPdfFullscreen(false)}
        >
          <div className="flex items-center justify-between pb-2">
            <span className="font-base text-sm font-semibold text-white">
              {selectedQuotation.doc_number}.pdf
            </span>
            <button
              onClick={() => setPdfFullscreen(false)}
              className="rounded-base border-2 border-white/30 bg-white/10 p-2 text-white hover:bg-white/20"
            >
              <X size={18} />
            </button>
          </div>
          <object
            data={pdfBlobUrl}
            type="application/pdf"
            className="flex-1 w-full rounded-base bg-white"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-white text-center mt-8">
              Tu navegador no puede mostrar PDFs.
              <a href={pdfBlobUrl} download={`${selectedQuotation.doc_number}.pdf`} className="underline text-main ml-2">
                Descargar
              </a>
            </p>
          </object>
        </div>
      )}

      {/* Create quotation/invoice modal */}
      {showCreateModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => setShowCreateModal(false)}
        >
          <div
            className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-base border-2 border-border bg-background shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex flex-shrink-0 items-center justify-between border-b-2 border-border bg-secondary-background px-4 py-3">
              <h3 className="font-heading text-lg font-black">Nueva cotización / factura</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="rounded-base border-2 border-border bg-secondary-background p-1.5 text-foreground hover:bg-main hover:text-main-foreground"
              >
                <X size={16} />
              </button>
            </div>

            {/* Body */}
            <div className="custom-scroll flex-1 overflow-y-auto p-4">
              {/* Type selector */}
              <div className="mb-4 flex gap-2">
                <NeoButton
                  type="button"
                  variant={createType === "COTIZACIÓN" ? "default" : "neutral"}
                  className="flex-1"
                  onClick={() => setCreateType("COTIZACIÓN")}
                >
                  Cotización
                </NeoButton>
                <NeoButton
                  type="button"
                  variant={createType === "FACTURA" ? "default" : "neutral"}
                  className="flex-1"
                  onClick={() => setCreateType("FACTURA")}
                >
                  Factura
                </NeoButton>
              </div>

              {/* Client fields */}
              <div className="mb-4 space-y-3">
                <div>
                  <label className="mb-1 block font-base text-sm font-semibold text-foreground/80">
                    Nombre del cliente *
                  </label>
                  <input
                    type="text"
                    value={createClientName}
                    onChange={(e) => setCreateClientName(e.target.value)}
                    placeholder="Ej: Juan Pérez"
                    className="w-full rounded-base border-2 border-border bg-background px-3 py-2 font-base text-sm text-foreground shadow-none outline-none focus:border-main"
                  />
                </div>
                <div>
                  <label className="mb-1 block font-base text-sm font-semibold text-foreground/80">
                    Teléfono
                  </label>
                  <input
                    type="text"
                    value={createClientPhone}
                    onChange={(e) => setCreateClientPhone(e.target.value)}
                    placeholder="Ej: 8095551234"
                    className="w-full rounded-base border-2 border-border bg-background px-3 py-2 font-base text-sm text-foreground shadow-none outline-none focus:border-main"
                  />
                </div>
              </div>

              {/* Items */}
              <div className="mb-4">
                <div className="mb-2 flex items-center justify-between">
                  <label className="font-base text-sm font-semibold text-foreground/80">
                    Artículos *
                  </label>
                  <NeoButton type="button" size="sm" variant="neutral" onClick={addCreateItem}>
                    <Plus size={14} />
                    Agregar
                  </NeoButton>
                </div>
                <div className="space-y-2">
                  {createItems.map((item, idx) => (
                    <div key={idx} className="rounded-base border-2 border-border bg-secondary-background p-2">
                      <input
                        type="text"
                        value={item.desc || ""}
                        onChange={(e) => updateCreateItem(idx, "desc", e.target.value)}
                        placeholder="Descripción"
                        className="mb-2 w-full rounded-base border-2 border-border bg-background px-2 py-1.5 font-base text-sm text-foreground shadow-none outline-none focus:border-main"
                      />
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min={1}
                          value={item.cantidad || ""}
                          onChange={(e) => updateCreateItem(idx, "cantidad", e.target.value)}
                          placeholder="Cant."
                          className="w-20 rounded-base border-2 border-border bg-background px-2 py-1.5 font-base text-sm text-foreground shadow-none outline-none focus:border-main"
                        />
                        <input
                          type="number"
                          min={0}
                          value={item.precio || ""}
                          onChange={(e) => updateCreateItem(idx, "precio", e.target.value)}
                          placeholder="Precio"
                          className="flex-1 rounded-base border-2 border-border bg-background px-2 py-1.5 font-base text-sm text-foreground shadow-none outline-none focus:border-main"
                        />
                        <label className="flex items-center gap-1 whitespace-nowrap font-base text-xs font-semibold">
                          <input
                            type="checkbox"
                            checked={!!item.itbis}
                            onChange={(e) => updateCreateItem(idx, "itbis", e.target.checked)}
                            className="h-4 w-4 accent-main"
                          />
                          ITBIS
                        </label>
                        {createItems.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeCreateItem(idx)}
                            className="rounded-base p-1.5 text-red-500 hover:bg-red-500/10"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div className="mb-4">
                <label className="mb-1 block font-base text-sm font-semibold text-foreground/80">
                  Notas
                </label>
                <textarea
                  value={createNotes}
                  onChange={(e) => setCreateNotes(e.target.value)}
                  placeholder="Condiciones de pago, detalles adicionales..."
                  rows={3}
                  className="w-full resize-none rounded-base border-2 border-border bg-background px-3 py-2 font-base text-sm text-foreground shadow-none outline-none focus:border-main"
                />
              </div>

              {/* Totals */}
              <NeoCard variant="main" className="mb-4 p-3">
                <div className="flex items-center justify-between text-sm text-main-foreground/80">
                  <span>Subtotal</span>
                  <span>RD$ {createTotals.subtotal.toLocaleString("es-DO")}</span>
                </div>
                {createTotals.itbis > 0 && (
                  <div className="flex items-center justify-between text-sm text-main-foreground/80">
                    <span>ITBIS (18%)</span>
                    <span>RD$ {createTotals.itbis.toLocaleString("es-DO")}</span>
                  </div>
                )}
                <div className="mt-2 flex items-center justify-between border-t-2 border-main-foreground/30 pt-2">
                  <span className="font-base text-sm font-black uppercase">Total</span>
                  <span className="font-heading text-xl font-bold text-main-foreground">
                    RD$ {createTotals.total.toLocaleString("es-DO")}
                  </span>
                </div>
              </NeoCard>

              {createError && (
                <p className="mb-2 font-base text-sm text-red-600">{createError}</p>
              )}
            </div>

            {/* Footer */}
            <div className="flex flex-shrink-0 items-center justify-end gap-2 border-t-2 border-border bg-secondary-background px-4 py-3">
              <NeoButton
                type="button"
                variant="neutral"
                onClick={() => setShowCreateModal(false)}
                disabled={creating}
              >
                Cancelar
              </NeoButton>
              <NeoButton
                type="button"
                onClick={handleCreate}
                disabled={creating}
              >
                {creating ? (
                  <RefreshCw size={16} className="mr-1 animate-spin" />
                ) : (
                  <Plus size={16} className="mr-1" />
                )}
                Crear {createType === "FACTURA" ? "factura" : "cotización"}
              </NeoButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
