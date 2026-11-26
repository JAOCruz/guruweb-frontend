import React, { useState } from "react";
import { NeoButton } from "@guru/ui";
import { useAuth } from "../../context/AuthContext";
import { authAPI } from "../../services/api";

interface Props {
  card: string;
  inputCls: string;
}

// Admin only (Mi cuenta): the 4-digit PIN the dashboard asks before showing the earnings cards.
// Creating or changing it needs the account password; a forgotten PIN is changed the same way.
export default function EarningsPinSection({ card, inputCls }: Props) {
  const { user, refreshUser } = useAuth();
  const [password, setPassword] = useState("");
  const [pin, setPin] = useState("");
  const [pin2, setPin2] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const hasPin = !!user?.hasEarningsPin;
  const digits = (v: string) => v.replace(/\D/g, "").slice(0, 4);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    if (!password) return setMsg({ ok: false, text: "Escribe tu contraseña" });
    if (!/^\d{4}$/.test(pin)) return setMsg({ ok: false, text: "El PIN debe tener 4 números" });
    if (pin !== pin2) return setMsg({ ok: false, text: "Los PIN no coinciden" });
    setSaving(true);
    try {
      await authAPI.setEarningsPin(password, pin);
      await refreshUser();
      setPassword("");
      setPin("");
      setPin2("");
      setMsg({ ok: true, text: "PIN guardado. Las ganancias del dashboard ahora piden el PIN." });
    } catch (err: any) {
      setMsg({ ok: false, text: err?.response?.data?.error || "No se pudo guardar el PIN" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className={card}>
      <div className="border-b-2 border-border bg-main px-5 py-3 font-heading text-lg font-black text-main-foreground">
        PIN de ganancias
      </div>
      <form onSubmit={save} className="space-y-4 p-5">
        <p className="text-sm">
          {hasPin
            ? "Tu PIN está activo. Para cambiarlo (o si lo olvidaste), pon tu contraseña y uno nuevo."
            : "Pon un PIN de 4 números: las tarjetas de ganancias del dashboard lo pedirán para mostrarse."}
        </p>
        <label className="block text-sm font-bold">
          Contraseña para el PIN
          <input type="password" autoComplete="current-password" className={inputCls} value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
        <label className="block text-sm font-bold">
          PIN nuevo (4 números)
          <input type="password" inputMode="numeric" autoComplete="off" maxLength={4} className={inputCls} value={pin} onChange={(e) => setPin(digits(e.target.value))} />
        </label>
        <label className="block text-sm font-bold">
          Repite el PIN
          <input type="password" inputMode="numeric" autoComplete="off" maxLength={4} className={inputCls} value={pin2} onChange={(e) => setPin2(digits(e.target.value))} />
        </label>
        <div className="flex flex-wrap items-center gap-3">
          <NeoButton type="submit" disabled={saving}>
            {saving ? "Guardando…" : "Guardar PIN"}
          </NeoButton>
          {msg && (
            <span role="status" className={`basis-full text-sm font-semibold ${msg.ok ? "text-green-700" : "text-red-600"}`}>{msg.text}</span>
          )}
        </div>
      </form>
    </section>
  );
}
