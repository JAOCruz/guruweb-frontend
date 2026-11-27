import { useEffect, useState } from "react";
import { BellRing, BellOff } from "lucide-react";
import { settingsAPI } from "../../services/api";

// Seguimiento automático de cotizaciones (src/agent/followup.js en el backend): el bot le escribe una vez al
// cliente que no contestó una cotización, a las 22 h de su último mensaje y solo en chats que atiende el bot.

// General switch, on the bot page. Everyone sees it; only the admin changes it.
export function SeguimientoGeneral({ isAdmin }: { isAdmin: boolean }) {
  const [activo, setActivo] = useState<boolean | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    settingsAPI
      .getSeguimiento()
      .then(({ data }) => setActivo(data.activo))
      .catch(() => setError("No se pudo leer el seguimiento"));
  }, []);

  const toggle = async () => {
    if (activo === null) return;
    setSaving(true);
    setError(null);
    try {
      const { data } = await settingsAPI.setSeguimiento(!activo);
      setActivo(data.activo);
    } catch (err: any) {
      setError(err?.response?.data?.error || "No se pudo guardar");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <p className="mb-3 font-base text-base font-bold uppercase tracking-widest text-foreground/60">Seguimiento de cotizaciones</p>
      <div className="flex items-start gap-3">
        <button
          type="button"
          role="switch"
          aria-checked={activo === true}
          aria-label="Seguimiento automático de cotizaciones"
          disabled={!isAdmin || saving || activo === null}
          onClick={toggle}
          className={`relative mt-0.5 h-7 w-12 shrink-0 rounded-full border-2 border-border transition-colors disabled:opacity-60 ${
            activo ? "bg-main" : "bg-background"
          }`}
        >
          <span
            className={`absolute top-0.5 h-5 w-5 rounded-full border-2 border-border bg-white transition-all ${activo ? "left-5" : "left-0.5"}`}
          />
        </button>
        <p className="font-base text-sm text-foreground/80">
          {activo ? "Encendido" : activo === false ? "Apagado" : "…"}: si el cliente no contesta una cotización o factura, el bot
          le escribe una vez a las 22 h de su último mensaje (antes de que se cierre el plazo de WhatsApp). Solo en chats que
          atiende el bot; se puede apagar por cliente en Mensajes.
        </p>
      </div>
      {error && <p className="mt-2 text-sm font-semibold text-red-600">{error}</p>}
    </div>
  );
}

// Per-client pill, in the chat strip of Mensajes. Anyone on the team can change it.
export function SeguimientoCliente({ clientId }: { clientId: number | null | undefined }) {
  const [off, setOff] = useState<boolean | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setOff(null);
    if (!clientId) return;
    let alive = true;
    settingsAPI
      .getClientFollowup(clientId)
      .then(({ data }) => alive && setOff(data.followup_off))
      .catch(() => alive && setOff(null));
    return () => {
      alive = false;
    };
  }, [clientId]);

  if (!clientId || off === null) return null;

  const toggle = async () => {
    setSaving(true);
    try {
      const { data } = await settingsAPI.setClientFollowup(clientId, !off);
      setOff(data.followup_off);
    } catch {
      /* stays as it was */
    } finally {
      setSaving(false);
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={saving}
      title={off ? "El bot no le da seguimiento a las cotizaciones de este cliente" : "El bot le da seguimiento a las cotizaciones sin respuesta"}
      className={`inline-flex items-center gap-1 rounded-full border-2 border-border px-2.5 py-0.5 text-xs font-bold ${
        off ? "bg-background text-foreground/60" : "bg-main/15 text-foreground"
      }`}
    >
      {off ? <BellOff size={13} /> : <BellRing size={13} />}
      Seguimiento: {off ? "no" : "sí"}
    </button>
  );
}
