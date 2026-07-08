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

type ClientStatus = "idle" | "typing" | "waiting" | "paused" | "error";

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

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const generateId = () => Math.random().toString(36).slice(2, 10);

const generateClientName = (index: number) => `Cliente ${index + 1}`;

const formatHistory = (messages: ChatMessage[]) => {
  return messages
    .map((m) => `${m.role === "client" ? "Cliente" : "Bot"}: ${m.text}`)
    .join("\n");
};

const ClientSimulator: React.FC = () => {
  const [clientCount, setClientCount] = useState<number>(3);
  const [scenario, setScenario] = useState<ScenarioKey>("new");
  const [clients, setClients] = useState<AIClient[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const isPausedRef = useRef(false);
  const isRunningRef = useRef(false);

  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  useEffect(() => {
    isRunningRef.current = isRunning;
  }, [isRunning]);

  const updateClient = useCallback(
    (clientId: string, updater: (client: AIClient) => AIClient) => {
      setClients((prev) =>
        prev.map((c) => (c.id === clientId ? updater(c) : c))
      );
    },
    []
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

  const setClientStatus = useCallback(
    (clientId: string, status: ClientStatus, error?: string) => {
      updateClient(clientId, (c) => ({ ...c, status, error }));
    },
    [updateClient]
  );

  const generateClientMessage = async (
    client: AIClient,
    isFirst: boolean
  ): Promise<string> => {
    const scenarioConfig = SCENARIOS[client.scenario];
    const history = formatHistory(client.messages);

    let userPrompt: string;
    if (isFirst) {
      userPrompt = `Eres un ${scenarioConfig.profile.toLowerCase()}. Escribe un primer mensaje corto y natural a Gurú Soluciones por WhatsApp pidiendo ayuda o información. Solo el mensaje del cliente, sin explicaciones.`;
    } else {
      userPrompt = `Historial de la conversación:\n${history}\n\nEres un ${scenarioConfig.profile.toLowerCase()}. Responde al último mensaje del bot de forma breve y natural. Si el bot ya resolvió tu duda, puedes agradecer o hacer una última pregunta. Solo el mensaje del cliente, sin explicaciones.`;
    }

    const response = await api.post(
      "/ai/generate",
      {
        prompt: userPrompt,
        systemPrompt: scenarioConfig.systemPrompt,
      },
      { signal: abortControllerRef.current?.signal }
    );

    return (response.data.text || "").trim();
  };

  const sendToBot = async (client: AIClient, message: string) => {
    const response = await api.post(
      "/bot/simulate",
      {
        message,
        sessionId: client.sessionId,
      },
      { signal: abortControllerRef.current?.signal }
    );
    return response.data.response || "No se recibió respuesta.";
  };

  const waitWhilePaused = async () => {
    while (isPausedRef.current && isRunningRef.current) {
      await sleep(300);
    }
  };

  const runClientSimulation = async (client: AIClient) => {
    try {
      for (let turn = 0; turn < MESSAGES_PER_CLIENT; turn++) {
        if (!isRunningRef.current) break;
        await waitWhilePaused();
        if (!isRunningRef.current) break;

        setClientStatus(client.id, "typing");
        await sleep(800 + Math.random() * 1200);
        await waitWhilePaused();
        if (!isRunningRef.current) break;

        const isFirst = client.messages.length === 0;
        const clientText = await generateClientMessage(client, isFirst);
        if (!clientText) {
          setClientStatus(client.id, "error", "No se generó mensaje del cliente");
          break;
        }

        addMessage(client.id, "client", clientText);
        setClientStatus(client.id, "waiting");

        await sleep(1000 + Math.random() * 2000);
        await waitWhilePaused();
        if (!isRunningRef.current) break;

        const botText = await sendToBot(client, clientText);
        addMessage(client.id, "bot", botText);

        await sleep(1000 + Math.random() * 2000);
      }

      if (isRunningRef.current) {
        setClientStatus(client.id, "idle");
      }
    } catch (err: any) {
      if (err.name === "AbortError" || err.code === "ERR_CANCELED") {
        setClientStatus(client.id, "idle");
        return;
      }
      console.error(`Error en cliente ${client.name}:`, err);
      setClientStatus(
        client.id,
        "error",
        err.response?.data?.error || err.message || "Error en simulación"
      );
    }
  };

  const handleStart = async () => {
    if (isRunning) return;

    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();

    const count = Math.max(MIN_CLIENTS, Math.min(MAX_CLIENTS, clientCount));
    setClientCount(count);

    const newClients: AIClient[] = Array.from({ length: count }).map((_, i) => ({
      id: generateId(),
      name: generateClientName(i),
      profile: SCENARIOS[scenario].profile,
      scenario,
      messages: [],
      status: "idle",
      sessionId: `sim_client_${Date.now()}_${generateId()}`,
    }));

    setClients(newClients);
    setIsRunning(true);
    setIsPaused(false);

    await Promise.all(newClients.map((client) => runClientSimulation(client)));

    setIsRunning(false);
    setIsPaused(false);
    abortControllerRef.current = null;
  };

  const handlePauseResume = () => {
    if (!isRunning) return;
    setIsPaused((prev) => !prev);
  };

  const handleStop = () => {
    abortControllerRef.current?.abort();
    setIsRunning(false);
    setIsPaused(false);
    setClients((prev) =>
      prev.map((c) =>
        c.status === "typing" || c.status === "waiting" || c.status === "paused"
          ? { ...c, status: "idle" }
          : c
      )
    );
  };

  const handleClientCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (Number.isNaN(value)) {
      setClientCount(1);
      return;
    }
    setClientCount(Math.max(MIN_CLIENTS, Math.min(MAX_CLIENTS, value)));
  };

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
                <StatusBadge status={client.status} />
              </div>

              {/* Chat history */}
              <div className="mt-4 flex-1 space-y-3 overflow-y-auto pr-1 custom-scroll">
                {client.messages.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center text-center text-sm text-foreground/50">
                    <MessageCircle size={24} className="mb-2 opacity-50" />
                    <p>Esperando para iniciar...</p>
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
    typing: { label: "Escribiendo", variant: "main" },
    waiting: { label: "Esperando", variant: "main" },
    paused: { label: "Pausado", variant: "outline" },
    error: { label: "Error", variant: "outline" },
  };

  const { label, variant } = config[status];
  return <NeoBadge variant={variant}>{label}</NeoBadge>;
};

export default ClientSimulator;
