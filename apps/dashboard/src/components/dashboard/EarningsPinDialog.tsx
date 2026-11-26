import { useState } from "react";
import { Lock } from "lucide-react";
import Modal from "../users/Modal";
import { authAPI } from "../../services/api";

interface Props {
  onUnlocked: () => void;
  onClose: () => void;
}

// Asks the admin's 4-digit PIN before showing the earnings; checks as soon as the 4th digit is typed
export default function EarningsPinDialog({ onUnlocked, onClose }: Props) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);

  const check = (value: string) => {
    setChecking(true);
    setError(null);
    authAPI.verifyEarningsPin(value).then(
      () => {
        setChecking(false);
        onUnlocked();
      },
      (err: any) => {
        setChecking(false);
        setError(err?.response?.data?.error || "No se pudo verificar el PIN");
        setPin("");
      },
    );
  };

  const onChange = (raw: string) => {
    const value = raw.replace(/\D/g, "").slice(0, 4);
    setPin(value);
    if (value.length === 4 && !checking) check(value);
  };

  return (
    <Modal title="Ver ganancias" onClose={onClose}>
      <p className="mb-3 flex items-center gap-2 text-sm">
        <Lock size={16} /> Escribe tu PIN de 4 números.
      </p>
      <input
        aria-label="PIN"
        type="password"
        inputMode="numeric"
        autoComplete="off"
        autoFocus
        maxLength={4}
        value={pin}
        disabled={checking}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-base border-2 border-border bg-white px-3 py-3 text-center font-heading text-3xl tracking-[0.6em] focus:outline-none"
      />
      {error && (
        <p role="alert" className="mt-3 text-sm font-semibold text-red-600">
          {error}
        </p>
      )}
    </Modal>
  );
}
