import React, { useEffect, useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import {
  MessageCircle,
  QrCode,
  Wifi,
  Loader2,
  CheckCircle2,
  Users,
  UserCheck,
  Pause,
  Play,
  Power,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { botAPI, BotStatus, BotMode } from "../services/botApi";
import { NeoCard, NeoButton, NeoBadge } from "../components/ui/neo";

// ─── Status badge ─────────────────────────────────────────────────────────────
const StatusBadge: React.FC<{ status: BotStatus["status"]; paused?: boolean }> = ({
  status,
  paused,
}) => {
  if (status === "connected") {
    return paused ? (
      <NeoBadge variant="outline" className="gap-2 normal-case text-base">
        <span className="h-2.5 w-2.5 rounded-full bg-foreground" />
        Bot Pausado
      </NeoBadge>
    ) : (
      <NeoBadge variant="main" className="gap-2 normal-case text-base">
        <span className="h-2.5 w-2.5 rounded-full bg-main-foreground" />
        Bot Activo
      </NeoBadge>
    );
  }

  if (status === "connecting") {
    return (
      <NeoBadge variant="main" className="gap-2 normal-case text-base">
        <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-main-foreground" />
        Conectando…
      </NeoBadge>
    );
  }

  return (
    <NeoBadge variant="neutral" className="gap-2 normal-case text-base">
      <span className="h-2.5 w-2.5 rounded-full bg-foreground/50" />
      Desconectado
    </NeoBadge>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const WhatsAppBot: React.FC = () => {
  const [status, setStatus] = useState<BotStatus>({
    status: "disconnected",
    paused: false,
    mode: "all",
  });
  const [qr, setQr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const statusIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const qrIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Fetch helpers ──────────────────────────────────────────────────────────

  const fetchStatus = useCallback(async () => {
    try {
      const res = await botAPI.getStatus();
      // Adapt backend response: {connected, botActive, botMode} → {status, mode}
      const raw = res.data as unknown;
      setStatus({
        status: (raw as any).connected ? "connected" : "disconnected",
        paused: !(raw as any).botActive,
        mode: ((raw as any).botMode as "all" | "selected") ?? "all",
        // @ts-ignore
      });
    } catch {
      // silently ignore polling errors
    }
  }, []);

  const fetchQR = useCallback(async () => {
    try {
      const res = await botAPI.getQR();
      setQr(res.data.qr);
    } catch {
      // silently ignore
    }
  }, []);

  // ── Polling setup ──────────────────────────────────────────────────────────

  useEffect(() => {
    fetchStatus();
    statusIntervalRef.current = setInterval(fetchStatus, 5000);
    return () => {
      if (statusIntervalRef.current) clearInterval(statusIntervalRef.current);
    };
  }, [fetchStatus]);

  useEffect(() => {
    if (status.status === "connecting") {
      fetchQR();
      qrIntervalRef.current = setInterval(fetchQR, 2000);
    } else {
      if (qrIntervalRef.current) clearInterval(qrIntervalRef.current);
      if (status.status === "disconnected") setQr(null);
    }
    return () => {
      if (qrIntervalRef.current) clearInterval(qrIntervalRef.current);
    };
  }, [status.status, fetchQR]);

  // ── Actions ────────────────────────────────────────────────────────────────

  const handleConnect = async () => {
    setError(null);
    setLoading(true);
    try {
      await botAPI.connect();
      await fetchStatus();
    } catch (e: any) {
      setError(e?.response?.data?.message || "Error al iniciar conexión");
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    setError(null);
    setLoading(true);
    try {
      await botAPI.disconnect();
      await fetchStatus();
    } catch (e: any) {
      setError(e?.response?.data?.message || "Error al desconectar");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleBot = async () => {
    setError(null);
    try {
      await botAPI.toggleBot();
      await fetchStatus();
    } catch (e: any) {
      setError(e?.response?.data?.message || "Error al cambiar estado del bot");
    }
  };

  const handleSetMode = async (mode: BotMode) => {
    setError(null);
    try {
      await botAPI.setBotMode(mode);
      setStatus((prev) => ({ ...prev, mode }));
    } catch (e: any) {
      setError(e?.response?.data?.message || "Error al cambiar modo");
    }
  };

  const currentMode = status.mode ?? "all";

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-base border-2 border-border bg-main text-main-foreground shadow-button">
            <MessageCircle size={22} />
          </div>
          <div>
            <h2 className="font-heading text-xl font-bold text-foreground md:text-2xl">
              WhatsApp Bot
            </h2>
            <p className="font-base text-base text-foreground/70">
              Gestiona la conexión y el modo de respuesta automática
            </p>
          </div>
        </div>
      </motion.div>

      {/* Error banner */}
      {error && (
        <NeoCard variant="outline" className="p-4">
          <p className="font-base text-base text-foreground">{error}</p>
        </NeoCard>
      )}

      {/* Two-column grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* ── LEFT: Connection status + controls ── */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <NeoCard>
            <h3 className="font-heading text-xl font-bold text-foreground md:text-2xl">
              Estado de Conexión
            </h3>

            {/* Status badge */}
            <div className="mb-6">
              <StatusBadge status={status.status} paused={status.paused} />
              {status.phone && status.status === "connected" && (
                <p className="mt-2 font-base text-base text-foreground/70">
                  Número:{" "}
                  <span className="font-semibold text-foreground">
                    {status.phone}
                  </span>
                </p>
              )}
            </div>

            {/* Action buttons by state */}
            <div className="mb-6 space-y-3">
              {status.status === "disconnected" && (
                <NeoButton
                  onClick={handleConnect}
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Wifi size={18} />
                  )}
                  Iniciar Conexión
                </NeoButton>
              )}

              {status.status === "connecting" && (
                <div className="flex items-center justify-center gap-3 rounded-base border-2 border-border bg-secondary-background px-5 py-3 text-foreground shadow-shadow">
                  <Loader2 size={18} className="animate-spin" />
                  <span className="font-base text-base font-semibold">
                    Esperando escaneo del QR…
                  </span>
                </div>
              )}

              {status.status === "connected" && (
                <div className="flex flex-col gap-3">
                  <NeoButton
                    onClick={handleToggleBot}
                    variant={status.paused ? "default" : "neutral"}
                    className="w-full"
                  >
                    {status.paused ? (
                      <>
                        <Play size={18} /> Reanudar Bot
                      </>
                    ) : (
                      <>
                        <Pause size={18} /> Pausar Bot
                      </>
                    )}
                  </NeoButton>
                  <NeoButton
                    onClick={handleDisconnect}
                    disabled={loading}
                    variant="outline"
                    className="w-full"
                  >
                    {loading ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Power size={16} />
                    )}
                    Desconectar
                  </NeoButton>
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="mb-5 border-t-2 border-border" />

            {/* Mode selector — always visible */}
            <div>
              <p className="mb-3 font-base text-base font-bold uppercase tracking-widest text-foreground/60">
                Modo de Respuesta
              </p>
              <div className="flex gap-3">
                <NeoButton
                  onClick={() => handleSetMode("all")}
                  variant={currentMode === "all" ? "default" : "neutral"}
                  className="flex-1"
                >
                  <Users size={16} />
                  Todos
                </NeoButton>
                <NeoButton
                  onClick={() => handleSetMode("selected")}
                  variant={currentMode === "selected" ? "default" : "neutral"}
                  className="flex-1"
                >
                  <UserCheck size={16} />
                  Seleccionados
                </NeoButton>
              </div>

              {currentMode === "selected" && status.status === "disconnected" && (
                <div className="mt-3 rounded-base border-2 border-border bg-secondary-background p-3 font-base text-base text-foreground/80 shadow-shadow">
                  💡 Conecta para gestionar contactos habilitados
                </div>
              )}
            </div>
          </NeoCard>
        </motion.div>

        {/* ── RIGHT: QR Code ── */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <NeoCard className="flex min-h-[320px] flex-col items-center justify-center">
            <h3 className="mb-6 w-full font-heading text-xl font-bold text-foreground md:text-2xl">
              Código QR
            </h3>

            {status.status === "connected" ? (
              <div className="flex flex-col items-center gap-4 py-6">
                <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-border bg-secondary-background shadow-button">
                  <CheckCircle2 size={40} className="text-main" />
                </div>
                <div className="text-center">
                  <p className="font-heading text-xl font-bold text-foreground md:text-2xl">
                    ¡Sesión Activa!
                  </p>
                  <p className="mt-1 font-base text-base text-foreground/70">
                    WhatsApp conectado y listo
                  </p>
                </div>
              </div>
            ) : qr ? (
              <div className="flex flex-col items-center gap-4">
                <div className="rounded-base border-2 border-border bg-main-foreground p-4 shadow-shadow">
                  <QRCodeSVG value={qr} size={224} level="M" />
                </div>
                <p className="text-center font-base text-base text-foreground/70">
                  Escanea con WhatsApp →{" "}
                  <span className="font-semibold text-foreground">
                    Menú → Dispositivos vinculados
                  </span>
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4 py-6">
                <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-border bg-secondary-background shadow-button">
                  {status.status === "connecting" ? (
                    <Loader2 size={36} className="animate-spin text-main" />
                  ) : (
                    <QrCode size={36} className="text-foreground/50" />
                  )}
                </div>
                <div className="text-center">
                  <p className="font-base text-base font-semibold text-foreground/80">
                    {status.status === "connecting"
                      ? "Generando QR…"
                      : "Iniciar Conexión para ver QR"}
                  </p>
                  <p className="mt-1 font-base text-base text-foreground/50">
                    El código aparecerá aquí automáticamente
                  </p>
                </div>
              </div>
            )}
          </NeoCard>
        </motion.div>
      </div>
    </div>
  );
};

export default WhatsAppBot;
