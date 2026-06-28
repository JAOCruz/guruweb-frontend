import { useState } from "react";
import api from "../services/api";
import {
  NeoCard,
  NeoCardHeader,
  NeoCardTitle,
  NeoCardDescription,
  NeoCardContent,
  NeoCardFooter,
} from "../components/ui/neo/NeoCard";
import { NeoButton } from "../components/ui/neo/NeoButton";
import { Sparkles, ShieldCheck, PenTool, Loader2, Copy, Check } from "lucide-react";

// ==========================================
// 🚀 UTILIDADES API GEMINI (LLM)
// ==========================================
const callGeminiAPI = async (prompt: string, systemPrompt: string) => {
  const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));
  const retries = [1000, 2000, 4000, 8000, 16000];

  for (let i = 0; i <= retries.length; i++) {
    try {
      const response = await api.post("/ai/generate", {
        prompt,
        systemPrompt,
      });
      return response.data.text || "Error de formato en la respuesta.";
    } catch {
      if (i === retries.length)
        throw new Error(
          "Error de conexión con Gurú AI tras múltiples intentos."
        );
      await delay(retries[i]);
    }
  }
  return "";
};

const TABS = [
  { id: "redactor", label: "Redactor Jurídico", icon: PenTool },
  { id: "analizador", label: "Auditor de Riesgos", icon: ShieldCheck },
] as const;

type AITab = (typeof TABS)[number]["id"];

export default function AIGuru() {
  const [activeTab, setActiveTab] = useState<AITab>("redactor");

  // Redactor states
  const [hechosInput, setHechosInput] = useState("");
  const [clausulaOutput, setClausulaOutput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  // Auditor states
  const [docInput, setDocInput] = useState("");
  const [analisisOutput, setAnalisisOutput] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const [errorMsj, setErrorMsj] = useState("");
  const [copied, setCopied] = useState(false);

  const handleGenerarClausula = async () => {
    if (!hechosInput.trim()) return;
    setIsGenerating(true);
    setErrorMsj("");
    setClausulaOutput("");

    const sysPrompt =
      "Eres un Abogado Corporativo y Notario experto de República Dominicana. Tu objetivo es convertir hechos simples o viñetas en una cláusula jurídica o párrafo legal formal, impecable y profesional. Utiliza la terminología legal correcta del Código Civil y Ley 140-15. Redacta de forma clara, seria y sin espacios en blanco. Si faltan datos clave (ej. montos en letras, números de cédula), incluye marcadores [ESPECIFICAR CÉDULA] de forma profesional.";
    const userPrompt = `Transfórmame estos hechos en un texto legal formal:\n${hechosInput}`;

    try {
      const resp = await callGeminiAPI(userPrompt, sysPrompt);
      setClausulaOutput(resp);
    } catch (err) {
      setErrorMsj((err as Error).message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAnalizarDocumento = async () => {
    if (!docInput.trim()) return;
    setIsAnalyzing(true);
    setErrorMsj("");
    setAnalisisOutput("");

    const sysPrompt =
      "Eres un Auditor Legal Experto y Paralegal Senior en República Dominicana. Tu trabajo es revisar textos jurídicos y contratos para encontrar vulnerabilidades antes de notarizarlos. Identifica: 1. Espacios en blanco peligrosos. 2. Ausencia de montos escritos en letras. 3. Ambigüedades en nombres o documentos de identidad (cédulas/pasaportes). 4. Falta de coherencia. Responde con un reporte ejecutivo usando viñetas (⚠️ Riesgo detectado, ✅ Sugerencia de corrección). Mantén un tono sumamente profesional y corporativo.";
    const userPrompt = `Audita el siguiente fragmento legal y detecta sus riesgos:\n${docInput}`;

    try {
      const resp = await callGeminiAPI(userPrompt, sysPrompt);
      setAnalisisOutput(resp);
    } catch (err) {
      setErrorMsj((err as Error).message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {/* Header */}
      <NeoCard variant="main" className="relative overflow-hidden">
        <div className="pointer-events-none absolute top-0 right-0 h-full w-1/2 bg-white/5" />
        <NeoCardHeader>
          <div className="flex items-center gap-3">
            <Sparkles className="h-8 w-8 text-main-foreground" />
            <div>
              <NeoCardTitle className="text-main-foreground">
                Gurú AI
              </NeoCardTitle>
              <NeoCardDescription className="text-main-foreground/80">
                Asistencia legal inteligente para redactar y auditar documentos.
              </NeoCardDescription>
            </div>
          </div>
        </NeoCardHeader>
      </NeoCard>

      {/* Tabs */}
      <div className="flex flex-wrap gap-3">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <NeoButton
              key={tab.id}
              variant={isActive ? "default" : "neutral"}
              onClick={() => {
                setActiveTab(tab.id);
                setErrorMsj("");
              }}
            >
              <Icon size={18} />
              {tab.label}
            </NeoButton>
          );
        })}
      </div>

      {/* Error */}
      {errorMsj && (
        <NeoCard variant="outline" className="border-red-500 bg-red-50 text-red-700">
          <p className="text-base font-bold">⚠️ Error de Conexión: {errorMsj}</p>
        </NeoCard>
      )}

      {/* Redactor */}
      {activeTab === "redactor" && (
        <div className="grid gap-6 lg:grid-cols-2">
          <NeoCard>
            <NeoCardHeader>
              <NeoCardTitle>1. Hechos brutos</NeoCardTitle>
              <NeoCardDescription>
                Describe los datos del caso. Ej: “Juan Pérez le vende una casa a
                María por 2 millones, ubicada en Piantini.”
              </NeoCardDescription>
            </NeoCardHeader>
            <NeoCardContent>
              <textarea
                value={hechosInput}
                onChange={(e) => setHechosInput(e.target.value)}
                className="custom-scroll h-64 w-full resize-none rounded-base border-2 border-border bg-secondary-background p-4 text-base text-foreground placeholder:text-foreground/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border"
                placeholder="Escriba los datos del cliente aquí..."
              />
            </NeoCardContent>
            <NeoCardFooter>
              <NeoButton
                onClick={handleGenerarClausula}
                disabled={isGenerating || !hechosInput.trim()}
                className="w-full sm:w-auto"
              >
                {isGenerating ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <Sparkles size={18} />
                )}
                {isGenerating ? "Procesando..." : "Generar Párrafo Legal"}
              </NeoButton>
            </NeoCardFooter>
          </NeoCard>

          <NeoCard variant="neutral">
            <NeoCardHeader>
              <NeoCardTitle>2. Resultado profesional</NeoCardTitle>
              <NeoCardDescription>
                Texto legal formal listo para copiar y ajustar.
              </NeoCardDescription>
            </NeoCardHeader>
            <NeoCardContent className="relative">
              <div className="custom-scroll relative h-64 overflow-y-auto rounded-base border-2 border-border bg-background p-4 text-base leading-relaxed text-foreground">
                {isGenerating && (
                  <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-background/80 backdrop-blur-sm">
                    <Loader2 className="animate-spin text-main" size={32} />
                    <p className="text-sm font-black uppercase tracking-wider text-foreground/70">
                      Procesando terminología jurídica...
                    </p>
                  </div>
                )}
                {!isGenerating && !clausulaOutput && (
                  <div className="flex h-full items-center justify-center text-sm font-black uppercase tracking-widest text-foreground/40">
                    Esperando datos...
                  </div>
                )}
                {clausulaOutput && (
                  <div className="whitespace-pre-wrap">{clausulaOutput}</div>
                )}
              </div>
            </NeoCardContent>
            <NeoCardFooter>
              <NeoButton
                variant="outline"
                onClick={() => copyToClipboard(clausulaOutput)}
                disabled={!clausulaOutput}
              >
                {copied ? <Check size={18} /> : <Copy size={18} />}
                {copied ? "Copiado" : "Copiar resultado"}
              </NeoButton>
            </NeoCardFooter>
          </NeoCard>
        </div>
      )}

      {/* Analizador */}
      {activeTab === "analizador" && (
        <div className="grid gap-6 lg:grid-cols-2">
          <NeoCard>
            <NeoCardHeader>
              <NeoCardTitle>1. Documento a auditar</NeoCardTitle>
              <NeoCardDescription>
                Pega el contrato o cláusula para detectar riesgos antes de
                notarizar.
              </NeoCardDescription>
            </NeoCardHeader>
            <NeoCardContent>
              <textarea
                value={docInput}
                onChange={(e) => setDocInput(e.target.value)}
                className="custom-scroll h-64 w-full resize-none rounded-base border-2 border-border bg-secondary-background p-4 text-base text-foreground placeholder:text-foreground/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border"
                placeholder="Pegue el documento legal aquí..."
              />
            </NeoCardContent>
            <NeoCardFooter>
              <NeoButton
                onClick={handleAnalizarDocumento}
                disabled={isAnalyzing || !docInput.trim()}
                className="w-full sm:w-auto"
              >
                {isAnalyzing ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <ShieldCheck size={18} />
                )}
                {isAnalyzing ? "Analizando..." : "Iniciar Auditoría"}
              </NeoButton>
            </NeoCardFooter>
          </NeoCard>

          <NeoCard variant="neutral">
            <NeoCardHeader>
              <NeoCardTitle>2. Reporte de riesgos</NeoCardTitle>
              <NeoCardDescription>
                Vulnerabilidades detectadas y sugerencias de corrección.
              </NeoCardDescription>
            </NeoCardHeader>
            <NeoCardContent className="relative">
              <div className="custom-scroll relative h-64 overflow-y-auto rounded-base border-2 border-border bg-background p-4 text-base leading-relaxed text-foreground">
                {isAnalyzing && (
                  <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-background/80 backdrop-blur-sm">
                    <Loader2 className="animate-spin text-main" size={32} />
                    <p className="text-sm font-black uppercase tracking-wider text-foreground/70">
                      Escaneando vulnerabilidades...
                    </p>
                  </div>
                )}
                {!isAnalyzing && !analisisOutput && (
                  <div className="flex h-full items-center justify-center text-sm font-black uppercase tracking-widest text-foreground/40">
                    Panel de reportes vacío
                  </div>
                )}
                {analisisOutput && (
                  <div className="whitespace-pre-wrap">{analisisOutput}</div>
                )}
              </div>
            </NeoCardContent>
            <NeoCardFooter>
              <NeoButton
                variant="outline"
                onClick={() => copyToClipboard(analisisOutput)}
                disabled={!analisisOutput}
              >
                {copied ? <Check size={18} /> : <Copy size={18} />}
                {copied ? "Copiado" : "Copiar reporte"}
              </NeoButton>
            </NeoCardFooter>
          </NeoCard>
        </div>
      )}
    </div>
  );
}
