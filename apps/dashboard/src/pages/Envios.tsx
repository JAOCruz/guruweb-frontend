import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Plus, Pencil, Truck, CheckCircle2, XCircle, RotateCcw } from "lucide-react";
import { NeoButton } from "@guru/ui";
import Modal, { fieldCls, labelCls } from "../components/users/Modal";
import { deliveriesAPI, type Delivery, type DeliveryFields, type DeliveryStatus } from "../services/api";

// Envíos: documentos que se mandan al cliente (Uber). El bot recoge los datos (registrar_envio) y aquí el equipo
// los mueve de estado. Sin montos: el pago del Uber lo maneja el digitador o el admin.
const TABS: { key: DeliveryStatus; label: string; emoji: string }[] = [
  { key: "por_enviar", label: "Por enviar", emoji: "📦" },
  { key: "enviado", label: "Enviado", emoji: "🚗" },
  { key: "entregado", label: "Entregado", emoji: "✅" },
  { key: "cancelado", label: "Cancelado", emoji: "✖️" },
];

const EMPTY_COUNTS: Record<DeliveryStatus, number> = { por_enviar: 0, enviado: 0, entregado: 0, cancelado: 0 };
const card = "rounded-base border-2 border-border bg-background shadow-shadow";

const when = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleString("es-DO", { dateStyle: "medium", timeStyle: "short" }) : "";

export default function Envios() {
  const [params] = useSearchParams();
  const highlight = Number(params.get("envio")) || null;
  const [tab, setTab] = useState<DeliveryStatus>("por_enviar");
  const [items, setItems] = useState<Delivery[]>([]);
  const [counts, setCounts] = useState(EMPTY_COUNTS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Delivery | "new" | null>(null);
  const [busy, setBusy] = useState<number | null>(null);

  const load = useCallback(async (status: DeliveryStatus) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await deliveriesAPI.list(status);
      setItems(data.deliveries);
      setCounts({ ...EMPTY_COUNTS, ...data.counts });
    } catch (err: any) {
      setError(err?.response?.data?.error || "No se pudieron cargar los envíos");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(tab);
  }, [tab, load]);

  // From the bell: scroll to the highlighted delivery
  useEffect(() => {
    if (highlight && !loading) document.getElementById(`envio-${highlight}`)?.scrollIntoView?.({ block: "center" });
  }, [highlight, loading]);

  const move = async (d: Delivery, status: DeliveryStatus) => {
    setBusy(d.id);
    try {
      await deliveriesAPI.setStatus(d.id, status);
      await load(tab);
    } catch (err: any) {
      setError(err?.response?.data?.error || "No se pudo cambiar el estado");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6 md:p-4">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-heading text-4xl font-black tracking-tight md:text-5xl">Envíos</h2>
          <p className="text-sm font-medium text-foreground/70">
            Documentos que se mandan al cliente. El bot anota la dirección y quién recibe; el Uber y su pago los manejan ustedes.
          </p>
        </div>
        <NeoButton onClick={() => setEditing("new")}>
          <Plus size={16} /> Nuevo envío
        </NeoButton>
      </div>

      <div role="tablist" className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            role="tab"
            aria-selected={tab === t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 rounded-base border-2 border-border px-3 py-2 text-sm font-bold transition-all ${
              tab === t.key ? "bg-main text-main-foreground shadow-shadow" : "bg-background hover:-translate-y-0.5"
            }`}
          >
            <span aria-hidden="true">{t.emoji}</span> {t.label}
            <span className="rounded-full border-2 border-current px-2 text-xs">{counts[t.key]}</span>
          </button>
        ))}
      </div>

      {error && <p role="alert" className="font-semibold text-red-600">{error}</p>}

      {loading ? (
        <p className="text-foreground/60">Cargando…</p>
      ) : items.length === 0 ? (
        <div className={`${card} p-8 text-center text-foreground/60`}>No hay envíos en «{TABS.find((t) => t.key === tab)?.label}».</div>
      ) : (
        <div className="grid grid-cols-[minmax(0,1fr)] gap-4 md:grid-cols-2">
          {items.map((d) => (
            <article
              key={d.id}
              id={`envio-${d.id}`}
              data-testid={`envio-${d.id}`}
              className={`${card} min-w-0 space-y-3 p-4 ${highlight === d.id ? "ring-4 ring-main ring-offset-2" : ""}`}
            >
              <header className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate font-heading text-lg font-black">{d.client_name || d.recipient_name || "Cliente"}</p>
                  <p className="text-xs text-foreground/60">
                    {d.source === "whatsapp" ? "🤖 Por el bot" : `✍️ ${d.created_by_name || "A mano"}`} · {when(d.created_at)}
                    {d.case_number ? ` · ${d.case_number}` : ""}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setEditing(d)}
                  className="shrink-0 rounded-base border-2 border-border p-1.5 hover:-translate-y-0.5"
                  aria-label="Editar"
                  title="Editar"
                >
                  <Pencil size={14} />
                </button>
              </header>

              {d.document && <p className="text-sm font-bold">{d.document}</p>}
              <div className="space-y-1 text-sm">
                <p>
                  📍 <span className="font-semibold">{d.address}</span>
                  {d.reference && <span className="text-foreground/70"> — {d.reference}</span>}
                </p>
                {(d.recipient_name || d.recipient_phone) && (
                  <p>
                    👤 {d.recipient_name}
                    {d.recipient_phone && (
                      <>
                        {" · "}
                        <a className="underline" href={`tel:${d.recipient_phone}`}>{d.recipient_phone}</a>
                      </>
                    )}
                  </p>
                )}
                {d.note && <p>📝 {d.note}</p>}
                {d.sent_at && <p className="text-xs text-foreground/60">Enviado: {when(d.sent_at)}</p>}
                {d.delivered_at && <p className="text-xs text-foreground/60">Entregado: {when(d.delivered_at)}</p>}
              </div>

              <div className="flex flex-wrap gap-2">
                {d.status === "por_enviar" && (
                  <NeoButton className="text-xs" disabled={busy === d.id} onClick={() => move(d, "enviado")}>
                    <Truck size={14} /> Marcar enviado
                  </NeoButton>
                )}
                {d.status === "enviado" && (
                  <>
                    <NeoButton className="text-xs" disabled={busy === d.id} onClick={() => move(d, "entregado")}>
                      <CheckCircle2 size={14} /> Marcar entregado
                    </NeoButton>
                    <NeoButton variant="neutral" className="text-xs" disabled={busy === d.id} onClick={() => move(d, "por_enviar")}>
                      <RotateCcw size={14} /> Volver a por enviar
                    </NeoButton>
                  </>
                )}
                {(d.status === "por_enviar" || d.status === "enviado") && (
                  <NeoButton variant="neutral" className="text-xs" disabled={busy === d.id} onClick={() => move(d, "cancelado")}>
                    <XCircle size={14} /> Cancelar
                  </NeoButton>
                )}
                {(d.status === "cancelado" || d.status === "entregado") && (
                  <NeoButton variant="neutral" className="text-xs" disabled={busy === d.id} onClick={() => move(d, "por_enviar")}>
                    <RotateCcw size={14} /> Reabrir
                  </NeoButton>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      {editing && (
        <DeliveryForm
          delivery={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={async () => {
            setEditing(null);
            await load(tab);
          }}
        />
      )}
    </div>
  );
}

const FIELDS: { key: keyof DeliveryFields; label: string; placeholder?: string; area?: boolean }[] = [
  { key: "document", label: "Documento", placeholder: "Ej.: Contrato de alquiler" },
  { key: "address", label: "Dirección", placeholder: "Calle, número, sector, ciudad" },
  { key: "reference", label: "Referencia", placeholder: "Cerca de…, frente a…" },
  { key: "recipient_name", label: "Quién recibe" },
  { key: "recipient_phone", label: "Teléfono de quien recibe" },
  { key: "note", label: "Nota", area: true },
];

function DeliveryForm({ delivery, onClose, onSaved }: { delivery: Delivery | null; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState<DeliveryFields>(() =>
    Object.fromEntries(FIELDS.map((f) => [f.key, (delivery?.[f.key] as string | null | undefined) ?? ""])),
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.address?.trim()) return setError("Falta la dirección");
    setSaving(true);
    setError(null);
    try {
      if (delivery) await deliveriesAPI.update(delivery.id, form);
      else await deliveriesAPI.create(form);
      onSaved();
    } catch (err: any) {
      setError(err?.response?.data?.error || "No se pudo guardar el envío");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title={delivery ? "Editar envío" : "Nuevo envío"} onClose={onClose}>
      <form onSubmit={save} className="space-y-3">
        {FIELDS.map((f) => (
          <label key={f.key} className={labelCls}>
            {f.label}
            {f.area ? (
              <textarea
                rows={2}
                className={fieldCls}
                value={form[f.key] ?? ""}
                onChange={(e) => setForm((v) => ({ ...v, [f.key]: e.target.value }))}
              />
            ) : (
              <input
                className={fieldCls}
                placeholder={f.placeholder}
                value={form[f.key] ?? ""}
                onChange={(e) => setForm((v) => ({ ...v, [f.key]: e.target.value }))}
              />
            )}
          </label>
        ))}
        {error && <p role="alert" className="text-sm font-semibold text-red-600">{error}</p>}
        <div className="flex justify-end gap-2 pt-2">
          <NeoButton type="button" variant="neutral" onClick={onClose}>
            Cancelar
          </NeoButton>
          <NeoButton type="submit" disabled={saving}>
            {saving ? "Guardando…" : "Guardar"}
          </NeoButton>
        </div>
      </form>
    </Modal>
  );
}
