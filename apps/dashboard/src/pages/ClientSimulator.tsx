import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Users,
  Play,
  Pause,
  Square,
  MessageCircle,
  Bot,
  User,
  Loader2,
  Sparkles,
  AlertCircle,
  RotateCcw,
  Terminal,
} from "lucide-react";
import api from "../services/api";
import {
  NeoCard,
  NeoCardHeader,
  NeoCardTitle,
  NeoCardDescription,
  NeoCardContent,
  NeoCardFooter,
  NeoButton,
  NeoInput,
  NeoSelect,
  NeoBadge,
} from "@guru/ui";

type ClientStatus = "idle" | "connecting" | "typing" | "waiting" | "paused" | "error";

interface ChatMessage {
  id: string;
  role: "client" | "bot";
  text: string;
  timestamp: Date;
}

interface AIClient {
  id: string;
  name: string;
  profile: string;
  scenario: ScenarioKey;
  messages: ChatMessage[];
  status: ClientStatus;
  sessionId: string;
  error?: string;
}

type ScenarioKey =
  | "urgent"
  | "confused"
  | "quoting"
  | "dissatisfied"
  | "new";

interface ScenarioConfig {
  label: string;
  profile: string;
  systemPrompt: string;
}

const SCENARIOS: Record<ScenarioKey, ScenarioConfig> = {
  urgent: {
    label: "Cliente urgente",
    profile: "Cliente urgente",
    systemPrompt:
      "Eres un cliente urgente escribiendo por WhatsApp a Gurú Soluciones (servicios legales y administrativos en República Dominicana). Eres directo, impaciente y necesitas resolver algo rápido. Usa mensajes cortos, naturales, en español dominicano. No uses saludos formales ni firmas.",
  },
  confused: {
    label: "Cliente confundido",
    profile: "Cliente confundido",
    systemPrompt:
      "Eres un cliente confundido escribiendo por WhatsApp a Gurú Soluciones (servicios legales y administrativos en República Dominicana). Haces preguntas básicas, repites dudas y necesitas que te expliquen paso a paso. Eres amable pero perdido. Mensajes cortos y naturales en español dominicano.",
  },
  quoting: {
    label: "Cliente cotizando",
    profile: "Cliente cotizando",
    systemPrompt:
      "Eres un cliente cotizando un servicio escribiendo por WhatsApp a Gurú Soluciones (servicios legales y administrativos en República Dominicana). Preguntas precios, tiempos y detalles. Eres pragmático y quieres saber cuánto cuesta. Mensajes cortos y naturales en español dominicano.",
  },
  dissatisfied: {
    label: "Cliente insatisfecho",
    profile: "Cliente insatisfecho",
    systemPrompt:
      "Eres un cliente insatisfecho escribiendo por WhatsApp a Gurú Soluciones (servicios legales y administrativos en República Dominicana). Expresas frustración educada pero firme sobre un servicio anterior. Pides solución. Mensajes cortos y naturales en español dominicano.",
  },
  new: {
    label: "Cliente nuevo",
    profile: "Cliente nuevo",
    systemPrompt:
      "Eres un cliente nuevo escribiendo por WhatsApp a Gurú Soluciones (servicios legales y administrativos en República Dominicana). No sabes bien cómo funciona, pides información general y te presentas brevemente. Mensajes cortos y naturales en español dominicano.",
  },
};

const MAX_CLIENTS = 10;
const MIN_CLIENTS = 1;
const MESSAGES_PER_CLIENT = 6;
const MAX_LOGS = 50;
const MAX_RETRIES = 3;
const RETRY_BASE_DELAY_MS = 500;
const START_STAGGER_MS = 500;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const generateId = () => Math.random().toString(36).slice(2, 10);

const generateClientName = (index: number) => `Cliente ${index + 1}`;

const formatHistory = (messages: ChatMessage[]) => {
  return messages
    .map((m) => `${m.role === "client" ? "Cliente" : "Bot"}: ${m.text}`)
    .join("\n");
};

const getErrorMessage = (err: any): string => {
  if (err?.response?.data?.error) return String(err.response.data.error);
  if (err?.response?.data?.message) return String(err.response.data.message);
  if (err?.message) return String(err.message);
  return "Error desconocido";
};

const isCancellationError = (err: any): boolean => {
  return err?.name === "AbortError" || err?.code === "ERR_CANCELED";
};

const ClientSimulator: React.FC = () => {
  const [clientCount, setClientCount] = useState<number>(3);
  const [scenario, setScenario] = useState<ScenarioKey>("new");
  const [clients, setClients] = useState<AIClient[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [simulationLog, setSimulationLog] = useState<string[]>([]);

  const abortControllerRef = useRef<AbortController | null>(null);
  const isPausedRef = useRef(false);
  const isRunningRef = useRef(false);
  const activeSimulationsRef = useRef(0);

  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  useEffect(() => {
    isRunningRef.current = isRunning;
  }, [isRunning]);

  const addLog = useCallback((message: string) => {
    const time = new Date().toLocaleTimeString("es-DO", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    setSimulationLog((prev) => {
      const next = [`[${time}] ${message}`, ...prev];
      return next.slice(0, MAX_LOGS);
    });
  }, []);

  const updateClient = useCallback(
    (clientId: string, updater: (client: AIClient) => AIClient) => {
      setClients((prev) =>
        prev.map((c) => (c.id === clientId ? updater(c) : c))
      );
    },
    []
  );

  const setClientStatus = useCallback(
    (clientId: string, status: ClientStatus, error?: string) => {
      updateClient(clientId, (c) => ({ ...c, status, error }));
    },
    [updateClient]
  );

  const addMessage = useCallback(
    (clientId: string, role: ChatMessage["role"], text: string) => {
      const message: ChatMessage = {
        id: generateId(),
        role,
        text,
        timestamp: new Date(),
      };
      updateClient(clientId, (c) => ({
        ...c,
        messages: [...c.messages, message],
      }));
      return message;
    },
    [updateClient]
  );

  const withRetry = useCallback(
    async <T,>(
      operation: () => Promise<T>,
      operationName: string,
      clientName?: string
    ): Promise<T> => {
      for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
          return await operation();
        } catch (err: any) {
          if (isCancellationError(err)) throw err;

          const errorMsg = getErrorMessage(err);
          if (attempt === MAX_RETRIES) {
            addLog(
              `${operationName} falló para ${clientName || "endpoint"} tras ${MAX_RETRIES} intentos: ${errorMsg}`
            );
            throw err;
          }

          const delay = RETRY_BASE_DELAY_MS * Math.pow(2, attempt - 1);
          addLog(
            `${operationName} falló para ${clientName || "endpoint"} (intento ${attempt}/${MAX_RETRIES}): ${errorMsg}. Reintentando en ${delay}ms...`
          );
          await sleep(delay);
        }
      }
      throw new Error("withRetry: unreachable");
    },
    [addLog]
  );

  const testAIEndpoint = useCallback(async (): Promise<void> => {
    await withRetry(
      () =>
        api.post(
          "/ai/generate",
          {
            prompt: "Hola",
            systemPrompt: "Responde brevemente.",
          },
          { signal: abortControllerRef.current?.signal }
        ),
      "Prueba de endpoint AI",
      "/ai/generate"
    );
  }, [withRetry]);

  const waitWhilePaused = useCallback(async () => {
    while (isPausedRef.current && isRunningRef.current) {
      await sleep(300);
    }
  }, []);

  const generateClientMessage = useCallback(
    async (client: AIClient, isFirst: boolean): Promise<string> => {
      const scenarioConfig = SCENARIOS[client.scenario];

      let userPrompt: string;
      if (isFirst) {
        userPrompt = `Eres un ${scenarioConfig.profile.toLowerCase()}. Escribe un primer mensaje corto y natural a Gurú Soluciones por WhatsApp pidiendo ayuda o información. Solo el mensaje del cliente, sin explicaciones.`;
      } else {
        userPrompt = `Historial de la conversación:\n${formatHistory(client.messages)}\n\nEres un ${scenarioConfig.profile.toLowerCase()}. Responde al último mensaje del bot de forma breve y natural. Si el bot ya resolvió tu duda, puedes agradecer o hacer una última pregunta. Solo el mensaje del cliente, sin explicaciones.`;
      }

      const response = await withRetry(
        () =>
          api.post(
            "/ai/generate",
            {
              prompt: userPrompt,
              systemPrompt: scenarioConfig.systemPrompt,
            },
            { signal: abortControllerRef.current?.signal }
          ),
        "Generación de mensaje",
        client.name
      );

      return (response.data.text || "").trim();
    },
    [withRetry]
  );

  const sendToBot = useCallback(
    async (client: AIClient, message: string) => {
      const response = await withRetry(
        () =>
          api.post(
            "/bot/simulate",
            {
              message,
              sessionId: client.sessionId,
            },
            { signal: abortControllerRef.current?.signal }
          ),
        "Envío al bot",
        client.name
      );
      return response.data.response || "No se recibió respuesta.";
    },
    [withRetry]
  );

  const runClientSimulation = useCallback(
    async (client: AIClient) => {
      // Local mutable copy keeps conversation history in sync even if React
      // batches state updates.
      let localMessages = [...client.messages];

      const pushMessage = (role: ChatMessage["role"], text: string) => {
        const message: ChatMessage = {
          id: generateId(),
          role,
          text,
          timestamp: new Date(),
        };
        localMessages = [...localMessages, message];
        addMessage(client.id, role, text);
      };

      try {
        addLog(`${client.name} iniciado`);

        for (let turn = 0; turn < MESSAGES_PER_CLIENT; turn++) {
          if (!isRunningRef.current) break;
          await waitWhilePaused();
          if (!isRunningRef.current) break;

          setClientStatus(client.id, "typing");
          await sleep(800 + Math.random() * 1200);
          await waitWhilePaused();
          if (!isRunningRef.current) break;

          const isFirst = localMessages.length === 0;
          const clientMessage = { ...client, messages: localMessages };

          let clientText: string;
          try {
            clientText = await generateClientMessage(clientMessage, isFirst);
          } catch (err: any) {
            if (isCancellationError(err)) throw err;
            const msg = getErrorMessage(err);
            setClientStatus(client.id, "error", msg);
            setGlobalError(`${client.name}: ${msg}`);
            addLog(`Error en ${client.name}: ${msg}`);
            continue;
          }

          if (!clientText) {
            setClientStatus(
              client.id,
              "error",
              "No se generó mensaje del cliente"
            );
            addLog(`Error en ${client.name}: no se generó mensaje`);
            continue;
          }

          pushMessage("client", clientText);
          setClientStatus(client.id, "waiting");

          await sleep(1000 + Math.random() * 2000);
          await waitWhilePaused();
          if (!isRunningRef.current) break;

          let botText: string;
          try {
            botText = await sendToBot({ ...client, messages: localMessages }, clientText);
          } catch (err: any) {
            if (isCancellationError(err)) throw err;
            const msg = getErrorMessage(err);
            setClientStatus(client.id, "error", msg);
            setGlobalError(`${client.name}: ${msg}`);
            addLog(`Error en ${client.name}: ${msg}`);
            continue;
          }

          pushMessage("bot", botText);

          await sleep(1000 + Math.random() * 2000);
        }

        if (isRunningRef.current) {
          setClientStatus(client.id, "idle");
          addLog(`${client.name} finalizó`);
        }
      } catch (err: any) {
        if (isCancellationError(err)) {
          setClientStatus(client.id, "idle");
          return;
        }
        const msg = getErrorMessage(err);
        console.error(`Error en cliente ${client.name}:`, err);
        setClientStatus(client.id, "error", msg);
        setGlobalError(`${client.name}: ${msg}`);
        addLog(`Error crítico en ${client.name}: ${msg}`);
      }
    },
    [
      addLog,
      addMessage,
      generateClientMessage,
      sendToBot,
      setClientStatus,
      waitWhilePaused,
    ]
  );

  const startSimulation = useCallback(
    (client: AIClient) => {
      activeSimulationsRef.current += 1;
      setClientStatus(client.id, "connecting");
      runClientSimulation(client).finally(() => {
        activeSimulationsRef.current = Math.max(
          0,
          activeSimulationsRef.current - 1
        );
        if (
          activeSimulationsRef.current === 0 &&
          isRunningRef.current &&
          !isPausedRef.current
        ) {
          setIsRunning(false);
          setIsPaused(false);
          abortControllerRef.current = null;
          addLog("Simulación finalizada");
        }
      });
    },
    [addLog, runClientSimulation, setClientStatus]
  );

  const restartClient = useCallback(
    (clientId: string) => {
      if (!isRunningRef.current) return;
      const client = clients.find((c) => c.id === clientId);
      if (!client) return;

      setClients((prev) =>
        prev.map((c) =>
          c.id === clientId
            ? { ...c, messages: [], status: "connecting", error: undefined }
            : c
        )
      );
      addLog(`${client.name} reiniciado`);
      startSimulation({ ...client, messages: [], status: "connecting", error: undefined });
    },
    [clients, addLog, startSimulation]
  );

  const handleStart = useCallback(async () => {
    if (isRunning) return;

    setGlobalError(null);
    setSimulationLog([]);

    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();

    try {
      addLog("Verificando endpoint de AI...");
      await testAIEndpoint();
      addLog("Endpoint de AI respondió correctamente");
    } catch (err: any) {
      const msg = getErrorMessage(err);
      setGlobalError(
        `No se pudo verificar el backend (${msg}). La simulación no se inició.`
      );
      addLog(`Fallo en verificación de backend: ${msg}`);
      abortControllerRef.current = null;
      return;
    }

    try {
      const count = Math.max(MIN_CLIENTS, Math.min(MAX_CLIENTS, clientCount));
      setClientCount(count);

      const newClients: AIClient[] = Array.from({ length: count }).map((_, i) => ({
        id: generateId(),
        name: generateClientName(i),
        profile: SCENARIOS[scenario].profile,
        scenario,
        messages: [],
        status: "connecting",
        sessionId: `sim_client_${Date.now()}_${generateId()}`,
      }));

      setClients(newClients);
      setIsRunning(true);
      setIsPaused(false);
      activeSimulationsRef.current = 0;
      addLog(`Iniciando ${count} clientes...`);

      // Staggered start to avoid backend saturation.
      for (const client of newClients) {
        if (!isRunningRef.current) break;
        startSimulation(client);
        await sleep(START_STAGGER_MS);
      }
    } catch (err: any) {
      const msg = getErrorMessage(err);
      setGlobalError(`Error al iniciar la simulación: ${msg}`);
      addLog(`Error al iniciar la simulación: ${msg}`);
      setIsRunning(false);
      abortControllerRef.current = null;
    }
  }, [
    isRunning,
    clientCount,
    scenario,
    addLog,
    testAIEndpoint,
    startSimulation,
  ]);

  const handlePauseResume = useCallback(() => {
    if (!isRunning) return;
    setIsPaused((prev) => !prev);
  }, [isRunning]);

  const handleStop = useCallback(() => {
    abortControllerRef.current?.abort();
    setIsRunning(false);
    setIsPaused(false);
    setClients((prev) =>
      prev.map((c) =>
        c.status === "connecting" ||
        c.status === "typing" ||
        c.status === "waiting" ||
        c.status === "paused"
          ? { ...c, status: "idle" }
          : c
      )
    );
    activeSimulationsRef.current = 0;
    addLog("Simulación detenida");
  }, [addLog]);

  const handleClientCountChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = parseInt(e.target.value, 10);
      if (Number.isNaN(value)) {
        setClientCount(1);
        return;
      }
      setClientCount(Math.max(MIN_CLIENTS, Math.min(MAX_CLIENTS, value)));
    },
    []
  );

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      {/* Header */}
      <NeoCard variant="main" className="relative overflow-hidden">
        <div className="pointer-events-none absolute top-0 right-0 h-full w-1/2 bg-white/5" />
        <NeoCardHeader>
          <div className="flex items-center gap-3">
            <Users className="h-8 w-8 text-main-foreground" />
            <div>
              <NeoCardTitle className="text-main-foreground">
                Simulador de Clientes AI
              </NeoCardTitle>
              <NeoCardDescription className="text-main-foreground/80">
                Genera hasta {MAX_CLIENTS} clientes AI con distintas
                personalidades y observa cómo responde el bot de WhatsApp en
                paralelo.
              </NeoCardDescription>
            </div>
          </div>
        </NeoCardHeader>
      </NeoCard>

      {/* Configuration */}
      <NeoCard>
        <NeoCardHeader>
          <NeoCardTitle className="text-xl">Configuración</NeoCardTitle>
          <NeoCardDescription>
            Define la cantidad de clientes, la personalidad y controla la
            simulación.
          </NeoCardDescription>
        </NeoCardHeader>
        <NeoCardContent>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-wider text-foreground/60">
                Número de clientes AI (1-{MAX_CLIENTS})
              </label>
              <NeoInput
                type="number"
                min={MIN_CLIENTS}
                max={MAX_CLIENTS}
                value={clientCount}
                onChange={handleClientCountChange}
                disabled={isRunning}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-wider text-foreground/60">
                Escenario / Personalidad
              </label>
              <NeoSelect
                value={scenario}
                onChange={(e) => setScenario(e.target.value as ScenarioKey)}
                disabled={isRunning}
              >
                {Object.entries(SCENARIOS).map(([key, config]) => (
                  <option key={key} value={key}>
                    {config.label}
                  </option>
                ))}
              </NeoSelect>
            </div>

            <div className="flex items-end gap-2 lg:col-span-2">
              <NeoButton
                onClick={handleStart}
                disabled={isRunning}
                className="flex-1"
              >
                {isRunning ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Play size={18} />
                )}
                {isRunning ? "Simulando..." : "Iniciar simulación"}
              </NeoButton>
              <NeoButton
                variant="neutral"
                onClick={handlePauseResume}
                disabled={!isRunning}
              >
                {isPaused ? <Play size={18} /> : <Pause size={18} />}
                {isPaused ? "Continuar" : "Pausar"}
              </NeoButton>
              <NeoButton
                variant="outline"
                onClick={handleStop}
                disabled={!isRunning}
              >
                <Square size={18} />
                Detener
              </NeoButton>
            </div>
          </div>
        </NeoCardContent>
        {isPaused && (
          <NeoCardFooter>
            <NeoBadge variant="outline">Simulación pausada</NeoBadge>
          </NeoCardFooter>
        )}
      </NeoCard>

      {/* Global error banner */}
      {globalError && (
        <NeoCard variant="outline" className="border-red-400 bg-red-50">
          <NeoCardContent className="flex items-start gap-3 py-4">
            <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600" />
            <div className="flex-1">
              <p className="font-bold text-red-700">Error</p>
              <p className="text-sm text-red-700">{globalError}</p>
            </div>
            <NeoButton
              variant="outline"
              size="sm"
              onClick={() => setGlobalError(null)}
            >
              Cerrar
            </NeoButton>
          </NeoCardContent>
        </NeoCard>
      )}

      {/* Global simulation log */}
      <NeoCard>
        <NeoCardHeader>
          <div className="flex items-center gap-2">
            <Terminal size={18} />
            <NeoCardTitle className="text-base">Log de simulación</NeoCardTitle>
          </div>
        </NeoCardHeader>
        <NeoCardContent>
          <div className="max-h-48 overflow-y-auto rounded-base border-2 border-border bg-secondary-background p-3 font-mono text-xs">
            {simulationLog.length === 0 ? (
              <p className="text-foreground/50">Aún no hay eventos.</p>
            ) : (
              <ul className="space-y-1">
                {simulationLog.map((entry, idx) => (
                  <li key={idx} className="break-words">
                    {entry}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </NeoCardContent>
      </NeoCard>

      {/* Clients grid */}
      {clients.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {clients.map((client) => (
            <NeoCard
              key={client.id}
              className="flex h-[420px] flex-col"
              variant={client.status === "error" ? "outline" : "default"}
            >
              {/* Card header */}
              <div className="flex items-center gap-3 border-b-2 border-border pb-4">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full border-2 border-border bg-main text-main-foreground shadow-button">
                  <User size={22} />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-heading text-lg font-black">
                    {client.name}
                  </h3>
                  <p className="truncate text-xs font-base text-foreground/70">
                    {client.profile}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={client.status} />
                  {client.status === "error" && (
                    <NeoButton
                      variant="outline"
                      size="sm"
                      onClick={() => restartClient(client.id)}
                      disabled={!isRunning}
                      title="Reiniciar cliente"
                    >
                      <RotateCcw size={14} />
                    </NeoButton>
                  )}
                </div>
              </div>

              {/* Chat history */}
              <div className="mt-4 flex-1 space-y-3 overflow-y-auto pr-1 custom-scroll">
                {client.messages.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center text-center text-sm text-foreground/50">
                    <MessageCircle size={24} className="mb-2 opacity-50" />
                    {client.status === "connecting" ? (
                      <>
                        <Loader2 size={16} className="mb-1 animate-spin" />
                        <p>Conectando...</p>
                      </>
                    ) : client.status === "error" ? (
                      <p className="text-red-600">{client.error || "Error"}</p>
                    ) : (
                      <p>Esperando para iniciar...</p>
                    )}
                  </div>
                ) : (
                  client.messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${
                        msg.role === "client" ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[90%] rounded-base border-2 px-3 py-2 text-sm font-base shadow-shadow ${
                          msg.role === "client"
                            ? "border-border bg-main text-main-foreground"
                            : "border-border bg-secondary-background text-foreground"
                        }`}
                      >
                        <div className="mb-1 flex items-center gap-1 text-[10px] font-black uppercase tracking-wider opacity-80">
                          {msg.role === "client" ? (
                            <User size={10} />
                          ) : (
                            <Bot size={10} />
                          )}
                          {msg.role === "client" ? "Cliente" : "Gurú Bot"}
                        </div>
                        <p className="whitespace-pre-wrap">{msg.text}</p>
                      </div>
                    </div>
                  ))
                )}
                {client.status === "typing" && (
                  <div className="flex justify-start">
                    <div className="flex items-center gap-2 rounded-base border-2 border-border bg-secondary-background px-3 py-2 text-sm text-foreground shadow-shadow">
                      <Loader2 size={12} className="animate-spin" />
                      Escribiendo...
                    </div>
                  </div>
                )}
                {client.status === "waiting" && (
                  <div className="flex justify-start">
                    <div className="flex items-center gap-2 rounded-base border-2 border-border bg-secondary-background px-3 py-2 text-sm text-foreground/70 shadow-shadow">
                      <Sparkles size={12} />
                      Gurú respondiendo...
                    </div>
                  </div>
                )}
                {client.status === "connecting" && client.messages.length > 0 && (
                  <div className="flex justify-start">
                    <div className="flex items-center gap-2 rounded-base border-2 border-border bg-secondary-background px-3 py-2 text-sm text-foreground/70 shadow-shadow">
                      <Loader2 size={12} className="animate-spin" />
                      Conectando...
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="mt-4 border-t-2 border-border pt-3">
                <p className="truncate text-[10px] font-black uppercase tracking-wider text-foreground/50">
                  Session: {client.sessionId}
                </p>
                {client.error && (
                  <p className="mt-1 text-xs font-medium text-red-600">
                    {client.error}
                  </p>
                )}
              </div>
            </NeoCard>
          ))}
        </div>
      )}
    </div>
  );
};

const StatusBadge: React.FC<{ status: ClientStatus }> = ({ status }) => {
  const config: Record<
    ClientStatus,
    { label: string; variant: "main" | "neutral" | "outline" }
  > = {
    idle: { label: "Listo", variant: "neutral" },
    connecting: { label: "Conectando", variant: "outline" },
    typing: { label: "Escribiendo", variant: "main" },
    waiting: { label: "Esperando", variant: "main" },
    paused: { label: "Pausado", variant: "outline" },
    error: { label: "Error", variant: "outline" },
  };

  const { label, variant } = config[status];
  return <NeoBadge variant={variant}>{label}</NeoBadge>;
};

export default ClientSimulator;
