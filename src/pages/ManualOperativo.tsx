import { useState, useEffect, useRef } from "react";

// ==========================================
// 🚀 UTILIDADES API GEMINI (LLM)
// ==========================================
const callGeminiAPI = async (prompt: string, systemPrompt: string) => {
  const apiKey = ""; // Inyectado por el entorno
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;

  const payload = {
    contents: [{ parts: [{ text: prompt }] }],
    systemInstruction: { parts: [{ text: systemPrompt }] },
  };

  const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));
  const retries = [1000, 2000, 4000, 8000, 16000];

  for (let i = 0; i <= retries.length; i++) {
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      return (
        data.candidates?.[0]?.content?.parts?.[0]?.text ||
        "Error de formato en la respuesta."
      );
    } catch (e: any) {
      if (i === retries.length)
        throw new Error(
          "Error de conexión con Gurú AI tras múltiples intentos."
        );
      await delay(retries[i]);
    }
  }
  return "";
};

// ==========================================
// 🏛️ BASE DE DATOS CORPORATIVA Y JURÍDICA
// ==========================================

const serviciosData = [
  {
    id: 1,
    title: "Digitación",
    emoji: "⌨️",
    num: "01",
    desc: "Redacción de contratos legales desde cero (civiles, penales, notariales, comerciales). Constituye la principal actividad económica de la franquicia.",
    reglas: [
      "Si el documento exige modificar múltiples puntos estructurales, procede a cobrar una redacción nueva.",
      "El documento se redacta de manera estricta utilizando la información suministrada por el usuario.",
    ],
    incluye: [
      "Resguardo de copia en nuestro folio (Base de Datos).",
      "Una (1) impresión del primer original.",
    ],
  },
  {
    id: 2,
    title: "Modificaciones",
    emoji: "✍️",
    num: "02",
    desc: "Alteración de detalles selectivos de un documento sin modificar su esencia jurídica. No constituye una redacción final.",
    reglas: [
      "No es una REDACCIÓN FINAL, por ende, la responsabilidad del contenido recae en el texto original.",
      "Si excede de tres (3) modificaciones de fondo, se recomienda facturar una REDACCIÓN completa.",
      "El documento base debe ser suministrado en formato editable por el usuario.",
    ],
    incluye: [
      "Verificación de forma en búsqueda de inconsistencias.",
      "Una (1) impresión del documento modificado.",
    ],
  },
  {
    id: 3,
    title: "Impresión",
    emoji: "🖨️",
    num: "03",
    desc: "Materialización física de expedientes. Incluye edición, corte y perfilado de documentos o fotografías con altos estándares de calidad.",
    reglas: [
      "Toda impresión errónea producto de una equivocación del cliente será facturada.",
      "Recepción exclusiva de formatos de extensión admisibles y seguros.",
    ],
    incluye: [
      "Organización lógica del expediente a imprimir.",
      "Vigilancia de calidad experta.",
    ],
  },
  {
    id: 4,
    title: "Escáner",
    emoji: "📸",
    num: "04",
    desc: "Digitalización estructurada para preservación y visualización legal y empresarial.",
    reglas: [
      "El sistema de cobro es escalonado: a mayor volumen, se aplican ajustes de tarifa corporativa.",
      "El agente debe verificar fehacientemente el destinatario (correo/WhatsApp) antes de enviar la información.",
    ],
    incluye: [
      "Un (1) envío digital gratuito de los archivos escaneados.",
      "Copia de respaldo en nuestras bases de datos.",
    ],
  },
  {
    id: 5,
    title: "Cert. Online",
    emoji: "🌐",
    num: "05",
    desc: "Gestión y solicitud de certificaciones ante instituciones públicas o privadas utilizando los datos del requirente.",
    reglas: [
      "Plazo de recepción: Mínimo 48 horas de antelación.",
      "El depósito de documentos no garantiza la aprobación de la solicitud; esto depende del órgano rector.",
    ],
    incluye: [
      "Seguimiento y monitoreo diario del estatus.",
      "Recordatorios de servicio al cliente.",
    ],
  },
  {
    id: 6,
    title: "Traducción",
    emoji: "🌍",
    num: "06",
    desc: "Transcripción textual a un idioma extranjero, avalada, firmada y sellada por un Intérprete Judicial acreditado.",
    reglas: [
      "Se debe traducir única y exclusivamente la versión final y oficial entregada.",
      "La facturación se calcula por página, considerando el formato y la cantidad de caracteres.",
    ],
    incluye: [
      "Sello de Intérprete Judicial hábil ante la ley.",
      "Doble revisión administrativa previa entrega.",
    ],
  },
  {
    id: 7,
    title: "Notarización",
    emoji: "⚖️",
    num: "07",
    desc: "Autenticación de firmas mediante un Abogado Notario Público, otorgando fe pública y validez legal al instrumento.",
    reglas: [
      "El documento no debe poseer espacios en blanco ni tachaduras que invaliden el texto.",
      "Honorarios regulados en base a la Ley 140-15 del Colegio de Notarios.",
      "El Notario firma hasta dos (2) originales; los excedentes se procesan como DUPLICADOS.",
    ],
    incluye: [
      "Firma y sello de Abogado Notario de la jurisdicción correspondiente.",
      "Revisión jurídica previa de coherencia.",
    ],
  },
  {
    id: 8,
    title: "Mensajería",
    emoji: "🛵",
    num: "08",
    desc: "Despliegue de auxiliares para transporte de documentos, gestión de filas y depósitos en instituciones públicas/privadas.",
    reglas: [
      "La tarifa se calcula en base a la distancia (zonificación) y el agente asignado.",
      "Exige un plazo mínimo de 24 horas para agendar la ruta logística.",
      "Los costos de impuestos son fijados por la administración y el Estado.",
    ],
    incluye: [
      "Auxiliar con experiencia en manejo de expedientes legales.",
      "Garantía corporativa contra pérdida en trayecto.",
    ],
  },
  {
    id: 9,
    title: "Trámites",
    emoji: "📑",
    num: "09",
    desc: "Ejecución integral de procesos legales que combinan múltiples servicios para emitir una certificación o registrar un derecho.",
    reglas: [
      "La viabilidad del trámite debe ser pre-evaluada antes de su aceptación.",
      "En caso de rechazo institucional por causas ajenas a nosotros, solo se reembolsa el 30% (el saldo cubre honorarios y gastos logísticos).",
    ],
    incluye: [
      "Gestión administrativa completa y mensajería vinculada.",
      "Garantía de custodia de documentos originales.",
    ],
  },
];

interface Costo {
  item: string;
  p: string;
}

interface Fase {
  titulo: string;
  accion: string;
  educacion: string;
  preguntas: string[];
  costos: Costo[];
}

interface Tramite {
  id: string;
  title: string;
  emoji: string;
  complejidad: string;
  fases: Fase[];
}

const tramitesData: Tramite[] = [
  {
    id: "t1",
    title: "Traspaso Vehículo de Motor",
    emoji: "🚗",
    complejidad: "Nivel III",
    fases: [
      {
        titulo: "Instrumentación del Contrato",
        accion: "Redactar y Notarizar el Acto de Venta de Vehículo.",
        educacion:
          'FUNDAMENTO JURÍDICO: El contrato de venta es el título traslaticio de dominio. En derecho civil, la exactitud es vital. Como profesional, tu responsabilidad es transcribir el Chasis y la Placa exactamente como figuran en la matrícula original. Un error tipográfico resultará en un rechazo automático por la DGII, perjudicando los intereses de nuestro cliente.',
        preguntas: [
          "¿El documento es redactado en nuestra oficina o suministrado por el cliente?",
          "¿El monto de la venta supera el umbral de la Ley 155-17 (Lavado de Activos)? Si es así, requiera comprobante bancario.",
        ],
        costos: [{ item: "Acto de Venta (Redacción + Notario)", p: "RD$ 1,000+" }],
      },
      {
        titulo: "Autenticación Notarial",
        accion: "Proceso de Legalización ante la Procuraduría General.",
        educacion:
          "PROCEDIMIENTO ADMINISTRATIVO: La Procuraduría emite una certificación que da fe de que el Notario está activo y su firma es genuina. Bajo ninguna circunstancia debe enviarse un acto a legalizar si falta la firma de alguna de las partes (Comprador/Vendedor).",
        preguntas: [
          "¿El cliente requiere nuestro servicio de mensajería para esta etapa?",
        ],
        costos: [
          { item: "Impuesto Procuraduría", p: "RD$ 700" },
          { item: "Mensajería Legalización", p: "RD$ 1,000" },
        ],
      },
      {
        titulo: "Verificación Vehicular (Plan Piloto)",
        accion:
          "Coordinación de cita presencial para inspección por la Policía Nacional.",
        educacion:
          "CONTROL DE RIESGOS: Esta fase asegura que el vehículo no posea alteraciones de chasis ni reportes de sustracción. Es un acto estrictamente presencial e ineludible. Sin la presencia del vehículo, el trámite es nulo.",
        preguntas: [
          "¿Dónde se encuentra físicamente el vehículo?",
          "¿El vehículo ha sido objeto de choque, robo o incautación previa?",
        ],
        costos: [{ item: "Asistencia Digitador", p: "RD$ 500" }],
      },
      {
        titulo: "Depósito y Transferencia (DGII)",
        accion: "Pre-validación en plataforma y depósito físico del expediente.",
        educacion:
          'EJECUCIÓN FISCAL: La Dirección General de Impuestos Internos aplicará una tasa del 2% basada en el valor mayor entre el acto de venta y su tabla referencial. Adicionalmente, el sistema bloqueará el traspaso si existen multas de tránsito u oposiciones legales.',
        preguntas: [
          "¿Posee el vehículo deudas, multas u oposiciones registradas?",
          "¿El Marbete se encuentra vigente?",
        ],
        costos: [
          { item: "Cert. DGII (Honorarios)", p: "RD$ 1,000" },
          { item: "Mensajería DGII", p: "RD$ 3,000" },
          { item: "Impuesto Valor", p: "2%" },
          { item: "Impresión Matrícula/Marbete", p: "RD$ 200" },
        ],
      },
    ],
  },
  {
    id: "t2",
    title: "Permiso Salida de Menor",
    emoji: "✈️",
    complejidad: "Nivel IV",
    fases: [
      {
        titulo: "Elaboración de Poder Especial",
        accion: "Redacción y notarización de la autorización de viaje.",
        educacion:
          "FUNDAMENTO JURÍDICO: En materia de derecho de familia, el Estado salvaguarda a los menores contra sustracciones ilícitas. Por ello, el padre o madre que no viaja debe otorgar su consentimiento expreso. Los nombres deben coincidir de forma perfecta con las actas de nacimiento y pasaportes.",
        preguntas: [
          "PREMISA: ¿La fecha de viaje es en menos de 24 horas? (De ser afirmativo, rechazar para no comprometer nuestra garantía).",
          "¿El autorizante se encuentra en territorio nacional para firmar?",
          "¿El menor viaja con un particular o bajo custodia de la aerolínea?",
        ],
        costos: [{ item: "Poder Especial Notarizado", p: "RD$ 1,500+" }],
      },
      {
        titulo: "Validación del Estado",
        accion: "Legalización de firma en la Procuraduría General de la República.",
        educacion:
          "NORMATIVA MIGRATORIA: La Dirección General de Migración (DGM) no admite poderes sin la legalización de la Procuraduría. Tome en cuenta que estos documentos tienen vigencia limitada; coordine el trámite cercano a la fecha del vuelo.",
        preguntas: [],
        costos: [
          { item: "Impuesto Banco Reservas", p: "RD$ 700" },
          { item: "Mensajería Procuraduría", p: "RD$ 1,000" },
        ],
      },
      {
        titulo: "Emisión de Certificación (DGM)",
        accion: "Desglose, pre-validación en plataforma y depósito físico.",
        educacion:
          "GESTIÓN DOCUMENTAL: Un expediente impecable requiere: Poder legalizado, copias de cédulas, acta de nacimiento inextensa y fotos 2x2. Si un padre posee la guarda absoluta, la Sentencia de Divorcio/Guarda suplanta el poder del otro progenitor.",
        preguntas: [
          "¿Cuál es el estatus de la tutela? ¿Se requiere indexar una sentencia de guarda legal o un estatus migratorio extranjero (ej. Residencia/EZTA)?",
        ],
        costos: [
          { item: "Solicitud Plataforma", p: "RD$ 1,000" },
          { item: "Impuesto Migratorio Ley", p: "RD$ 2,000" },
          { item: "Mensajería DGM", p: "RD$ 3,000" },
        ],
      },
    ],
  },
  {
    id: "t3",
    title: "Documento Notarial Auténtico",
    emoji: "🏛️",
    complejidad: "Nivel III",
    fases: [
      {
        titulo: "Instrumentación Auténtica",
        accion: "Elaboración del Acto Auténtico por el Abogado Notario.",
        educacion:
          "FUNDAMENTO JURÍDICO: A diferencia del acto 'Bajo Firma Privada', el Acto Auténtico es declarado directamente ante el Notario en su protocolo. Requiere un lenguaje solemne, carente de abreviaturas y con todos los montos expresados en letras y números.",
        preguntas: [
          "¿El documento es pre-elaborado por el cliente o requiere nuestra redacción técnica integral?",
        ],
        costos: [{ item: "Contrato Auténtico", p: "RD$ 1,500+" }],
      },
      {
        titulo: "Registro en Conservaduría",
        accion: "Pago de impuestos y registro en el Ayuntamiento correspondiente.",
        educacion:
          "PUBLICIDAD REGISTRAL: Para que un acto auténtico sea oponible a terceros, la ley exige su transcripción en los libros de la Conservaduría de Hipotecas y Registro Civil del Ayuntamiento.",
        preguntas: [
          "NOTA: Actualmente solo tramitamos esta fase en la jurisdicción de la Provincia de Santo Domingo.",
        ],
        costos: [
          { item: "Impuesto de Registro (Aprox.)", p: "RD$ 300" },
          { item: "Mensajería Ayuntamiento", p: "RD$ 500" },
        ],
      },
      {
        titulo: "Emisión de Compulsa y Legalización",
        accion: "Redacción de Compulsa Notarial y Legalización en Procuraduría.",
        educacion:
          "ENTREGABLE FINAL: El cliente nunca recibe el acto original (este se queda en el protocolo del notario). Se le entrega una 'Primera Compulsa' (Copia fiel certificada) la cual debe ser debidamente legalizada.",
        preguntas: [],
        costos: [
          { item: "Impuesto Procuraduría", p: "RD$ 700" },
          { item: "Mensajería Procuraduría", p: "RD$ 1,000" },
        ],
      },
    ],
  },
  {
    id: "t4",
    title: "Apostille Internacional",
    emoji: "🌍",
    complejidad: "Nivel II",
    fases: [
      {
        titulo: "Auditoría de Requisitos",
        accion: "Validación de firma pública y legalización previa del documento base.",
        educacion:
          "DERECHO INTERNACIONAL: El Convenio de La Haya establece que el Apostille solo da fe de la firma de un funcionario público. Por tanto, todo documento privado debe ser elevado a la categoría de público (mediante notarización y legalización en Procuraduría) ANTES de solicitar el Apostille.",
        preguntas: [
          "¿El documento ya cuenta con las legalizaciones previas correspondientes (Procuraduría, JCE, MESCYT, etc.)?",
          "¿Debemos elaborar el documento desde cero?",
        ],
        costos: [
          { item: "Contrato Notarial", p: "Variable" },
          { item: "Impuesto Legalización", p: "RD$ 700" },
          { item: "Mensajería Previa", p: "RD$ 1,000" },
        ],
      },
      {
        titulo: "Gestión Consular (MIREX)",
        accion: "Solicitud y expedición de Apostille en el Ministerio de Relaciones Exteriores.",
        educacion:
          "EFICIENCIA OPERATIVA: Verifica si el documento posee código de barras o QR institucional. De ser afirmativo, el impuesto puede liquidarse vía online, agilizando los tiempos de respuesta y reduciendo costos de traslado.",
        preguntas: [
          "Confirmar: ¿El país de destino del documento pertenece al Convenio de La Haya? (En caso negativo, aplica otro procedimiento de legalización consular).",
        ],
        costos: [
          { item: "Impuesto Apostille", p: "RD$ 620" },
          { item: "Apostille Consular (Especial)", p: "RD$ 750" },
        ],
      },
    ],
  },
  {
    id: "t5",
    title: "Traducción Judicial",
    emoji: "🗣️",
    complejidad: "Nivel II",
    fases: [
      {
        titulo: "Traducción Oficial",
        accion: "Traducción fiel del documento, sellada por Intérprete Judicial.",
        educacion:
          "RESPONSABILIDAD CIVIL: El Intérprete Judicial actúa bajo fe pública. El documento resultante debe ser un espejo exacto del original, respetando la estructura y declarando la existencia de sellos o firmas. No se interpreta, se traduce literalmente.",
        preguntas: [
          "¿El cliente proporciona el documento original físico o debemos gestionar su impresión/certificación previa?",
        ],
        costos: [{ item: "Honorarios de Traducción", p: "Sujeto a Cotización" }],
      },
      {
        titulo: "Ensamblaje y Legalización (Opcional)",
        accion: "Unión de originales con traducción y envío a Procuraduría.",
        educacion:
          "ESTÁNDAR INTERNACIONAL: Para que la traducción tenga fuerza probatoria en el extranjero, la firma del Intérprete Judicial debe ser refrendada por la Procuraduría General de la República.",
        preguntas: [
          "¿El cliente requiere la legalización final del documento traducido?",
        ],
        costos: [{ item: "Mensajería/Gestión Adicional", p: "Variable" }],
      },
    ],
  },
];

// ==========================================
// 🧠 COMPONENTE: HERRAMIENTAS AI (GEMINI) ✨
// ==========================================

const AIToolsViewer = () => {
  const [activeAITab, setActiveAITab] = useState("redactor");

  // States para Redactor
  const [hechosInput, setHechosInput] = useState("");
  const [clausulaOutput, setClausulaOutput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  // States para Analizador
  const [docInput, setDocInput] = useState("");
  const [analisisOutput, setAnalisisOutput] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const [errorMsj, setErrorMsj] = useState("");

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
    } catch (err: any) {
      setErrorMsj(err.message);
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
    } catch (err: any) {
      setErrorMsj(err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="flex h-full w-full flex-col bg-[#030303]">
      <div className="relative flex shrink-0 items-center justify-between border-b border-cyan-900/40 bg-black px-8 py-6">
        <div className="pointer-events-none absolute top-0 right-0 h-full w-1/2 bg-gradient-to-l from-purple-900/10 to-transparent"></div>
        <div>
          <h4 className="mb-1 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-purple-400">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-purple-500"></span>{" "}
            Inteligencia Artificial
          </h4>
          <h2 className="flex items-center gap-3 text-2xl font-black text-white md:text-3xl">
            ✨{" "}
            <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text tracking-tight text-transparent">
              Asistencia Gurú AI
            </span>
          </h2>
        </div>
      </div>

      {/* Tabs AI */}
      <div className="shrink-0 border-b border-[#222] bg-[#050505] px-8 pt-4">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveAITab("redactor")}
            className={`border-b-2 px-4 py-3 text-xs font-black uppercase tracking-widest transition-all ${
              activeAITab === "redactor"
                ? "border-purple-500 text-purple-400"
                : "border-transparent text-slate-600 hover:text-slate-400"
            }`}
          >
            ✍️ Redactor Jurídico
          </button>
          <button
            onClick={() => setActiveAITab("analizador")}
            className={`border-b-2 px-4 py-3 text-xs font-black uppercase tracking-widest transition-all ${
              activeAITab === "analizador"
                ? "border-purple-500 text-purple-400"
                : "border-transparent text-slate-600 hover:text-slate-400"
            }`}
          >
            🛡️ Auditor de Riesgos
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#0a0514] to-[#000] p-8">
        {errorMsj && (
          <div className="mb-6 rounded-md border border-red-500/50 bg-red-900/20 p-4 text-xs font-medium text-red-200">
            ⚠️ Error de Conexión: {errorMsj}
          </div>
        )}

        {/* --- VISTA: REDACTOR --- */}
        {activeAITab === "redactor" && (
          <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-2">
            <div className="flex flex-col gap-4">
              <div>
                <h3 className="mb-2 text-xs font-black uppercase tracking-widest text-purple-400">
                  1. Ingrese los hechos brutos
                </h3>
                <p className="mb-4 text-[10px] uppercase tracking-wider text-slate-400">
                  Ej: &quot;Juan Pérez le vende una casa a María por 2 millones.
                  Casa ubicada en Piantini.&quot;
                </p>
              </div>
              <textarea
                value={hechosInput}
                onChange={(e) => setHechosInput(e.target.value)}
                className="custom-scrollbar h-64 w-full resize-none rounded-md border border-[#333] bg-[#0a0a0c] p-4 text-sm text-slate-200 outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                placeholder="Escriba los datos del cliente aquí..."
              ></textarea>
              <button
                onClick={handleGenerarClausula}
                disabled={isGenerating || !hechosInput.trim()}
                className="flex items-center justify-center gap-2 rounded-md border border-purple-500/50 bg-purple-900/40 py-4 text-xs font-black uppercase tracking-widest text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.15)] transition-all disabled:cursor-not-allowed disabled:opacity-50 hover:bg-purple-800 hover:text-white"
              >
                {isGenerating ? (
                  <span className="animate-spin text-lg">⏳</span>
                ) : (
                  <span>✨ Generar Párrafo Legal</span>
                )}
              </button>
            </div>

            <div className="flex flex-col gap-4">
              <h3 className="mb-2 text-xs font-black uppercase tracking-widest text-emerald-400">
                2. Resultado Profesional
              </h3>
              <div className="custom-scrollbar relative h-[calc(100%-2rem)] overflow-y-auto rounded-md border border-emerald-900/50 bg-[#050a05] p-5 text-sm text-emerald-100/90 shadow-inner">
                {isGenerating && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="flex flex-col items-center gap-3 text-xs font-bold uppercase tracking-widest animate-pulse text-purple-400">
                      <span className="text-3xl">🤖</span> Procesando terminología
                      jurídica...
                    </div>
                  </div>
                )}
                {!isGenerating && !clausulaOutput && (
                  <div className="mt-20 text-center font-bold uppercase tracking-widest text-emerald-900/50">
                    Esperando datos...
                  </div>
                )}
                {clausulaOutput && (
                  <div className="whitespace-pre-wrap font-medium leading-relaxed">
                    {clausulaOutput}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* --- VISTA: ANALIZADOR --- */}
        {activeAITab === "analizador" && (
          <div className="mx-auto flex h-full max-w-4xl flex-col gap-6">
            <div>
              <h3 className="mb-2 text-xs font-black uppercase tracking-widest text-purple-400">
                🛡️ Auditoría Anti-Errores
              </h3>
              <p className="text-[10px] uppercase tracking-wider text-slate-400">
                Pegue el contrato o documento redactado para que Gurú AI detecte
                vulnerabilidades legales antes de la impresión.
              </p>
            </div>
            <textarea
              value={docInput}
              onChange={(e) => setDocInput(e.target.value)}
              className="custom-scrollbar h-40 w-full shrink-0 resize-none rounded-md border border-[#333] bg-[#0a0a0c] p-4 text-sm text-slate-200 outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
              placeholder="Pegue el documento legal aquí..."
            ></textarea>

            <button
              onClick={handleAnalizarDocumento}
              disabled={isAnalyzing || !docInput.trim()}
              className="flex shrink-0 items-center justify-center gap-2 rounded-md border border-cyan-500/50 bg-cyan-900/30 py-3 text-xs font-black uppercase tracking-widest text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.2)] transition-all disabled:cursor-not-allowed disabled:opacity-50 hover:bg-cyan-800 hover:text-white"
            >
              {isAnalyzing ? (
                <span className="animate-spin text-lg">⏳</span>
              ) : (
                <span>🔍 Iniciar Auditoría AI ✨</span>
              )}
            </button>

            <div className="custom-scrollbar relative flex-1 overflow-y-auto rounded-md border border-red-900/50 bg-[#1a0505] p-6 text-sm text-red-100/90 shadow-inner">
              {isAnalyzing && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/80 backdrop-blur-sm">
                  <div className="flex flex-col items-center gap-3 text-xs font-bold uppercase tracking-widest animate-pulse text-red-400">
                    <span className="text-3xl">👁️</span> Escaneando
                    vulnerabilidades...
                  </div>
                </div>
              )}
              {!isAnalyzing && !analisisOutput && (
                <div className="mt-10 text-center font-bold uppercase tracking-widest text-red-900/40">
                  Panel de Reportes Vacío
                </div>
              )}
              {analisisOutput && (
                <div className="whitespace-pre-wrap font-medium leading-relaxed text-red-200">
                  {analisisOutput}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ==========================================
// 🦉 ASESOR VIRTUAL GURÚ (DRAGGABLE & EXPANDED)
// ==========================================

const GuruDraggable = () => {
  const tips = [
    "ASISTENCIA EN LÍNEA: Haz clic sobre mí para consultar directrices corporativas y jurídicas.",
    "ÉTICA PROFESIONAL: El activo más valioso de Gurú Soluciones es la confianza. Jamás asumas un dato, confírmalo con el cliente.",
    "DERECHO CIVIL 101: Un contrato con tachaduras o espacios en blanco es vulnerable a la nulidad. Perfila tus documentos.",
    "ADMINISTRACIÓN: Recuerda, si un trámite fracasa por negligencia externa, nuestra política protege el 30% del honorario por gestión.",
    "EFICIENCIA OPERATIVA: No garantices tiempos imposibles. Trámites institucionales exigen un mínimo de 24 a 48 horas.",
    "LEY NOTARIAL: La Ley 140-15 es nuestra guía de honorarios. Conocerla te da autoridad frente a clientes exigentes.",
    "ATENCIÓN AL CLIENTE: Tu rol no es solo digitar, es asesorar. Escucha el problema de fondo del cliente antes de cotizar.",
    "SOPORTE LEGAL: Los Poderes Especiales para salida de menores tienen fecha de caducidad práctica. Vigila el itinerario de vuelo.",
    "GESTIÓN FINANCIERA: Exige comprobantes bancarios para operaciones vehiculares altas; la Ley de Lavado de Activos (155-17) es estricta.",
    "CONTROL DE CALIDAD: Sé meticuloso. Un error de un dígito en una cédula obliga a recomenzar todo el proceso en la Procuraduría.",
    "DERECHO INTERNACIONAL: Antes de apostillar, valida el país de destino en la lista actualizada del Convenio de La Haya.",
    "PROTOCOLOS: El Intérprete Judicial da fe de su traducción, pero no de la veracidad del documento original. Diferencia estos roles.",
    "GESTIÓN DE RIESGOS: Todo acto de venta debe firmarse con ambas partes presentes o confirmadas. Evita el fraude.",
    "SERVICIO VIP: La calidad 'Experta' de nuestras impresiones es nuestra carta de presentación física. No entregues hojas manchadas.",
    "VISIÓN DE NEGOCIO: Cada cliente que atendemos es un potencial socio comercial a largo plazo. Cultiva la relación.",
    "FINANZAS INTERNAS: Los cobros de mensajería están directamente atados al tabulador de distancias. No regales el trabajo logístico.",
    "TRÁMITES AYUNTAMIENTO: Asegúrate de incluir la tasa registral (aprox RD$300) dentro de tu presupuesto inicial para actos auténticos.",
    "DIGITALIZACIÓN: El Apostille permite el pago de impuestos en línea si el documento cuenta con código de barras validable. Aprovecha esto para ganar tiempo.",
    "SEGURIDAD DE LA INFORMACIÓN: Una vez concluida la digitación y facturación, asegúrate de almacenar los documentos en nuestro folio. Los datos son oro.",
    "FACTURACIÓN DE ERRORES: Si el cliente revisó el borrador, lo aprobó y luego de impreso notó un error, el costo de la reimpresión corre por él, no por la empresa.",
  ];

  const [tipIndex, setTipIndex] = useState(0);
  const [animando, setAnimando] = useState(false);

  // Drag and Drop Logic
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    dragStart.current = {
      x: e.clientX - offset.x,
      y: e.clientY - offset.y,
    };
    (e.target as Element).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setOffset({
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y,
    });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    (e.target as Element).releasePointerCapture(e.pointerId);
  };

  const cambiarTip = () => {
    if (isDragging) return;
    setAnimando(true);
    setTipIndex((prev) => (prev + 1) % tips.length);
    setTimeout(() => setAnimando(false), 300);
  };

  return (
    <div
      className="group fixed bottom-6 right-6 z-[100] flex items-end gap-4 md:bottom-10 md:right-10"
      style={{
        transform: `translate(${offset.x}px, ${offset.y}px)`,
        touchAction: "none",
      }}
    >
      <div
        className={`relative max-w-[260px] overflow-hidden rounded-xl border border-cyan-700/60 bg-black/90 px-6 py-4 text-sm font-medium text-cyan-50 shadow-[0_0_15px_rgba(6,182,212,0.2)] backdrop-blur-md transition-all ${
          animando
            ? "scale-95 opacity-50"
            : "scale-100 opacity-100"
        }`}
      >
        <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-cyan-500 to-blue-600"></div>
        <p className="mb-1 text-[9px] font-black uppercase tracking-widest text-cyan-400">
          Gurú // Asesoría Jurídica
        </p>
        <p className="leading-relaxed text-xs">{tips[tipIndex]}</p>
        <p className="mt-3 animate-pulse text-right text-[8px] uppercase tracking-[0.2em] text-slate-500">
          Click en el Búho para otro tip
        </p>
      </div>

      <div
        className="relative cursor-grab active:cursor-grabbing"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onClick={cambiarTip}
      >
        <div className="absolute inset-0 animate-pulse rounded-full bg-cyan-600 opacity-40 blur-[20px] group-hover:opacity-80 transition-opacity"></div>
        <div className="relative z-10 select-none text-6xl drop-shadow-[0_0_15px_rgba(6,182,212,0.6)] transition-transform hover:scale-105">
          🦉
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 🗺️ CONTROL DE EXPEDIENTES (TRÁMITES)
// ==========================================

const TramiteViewer = ({ tramite }: { tramite: Tramite }) => {
  const [faseActual, setFaseActual] = useState(0);

  useEffect(() => {
    setFaseActual(0);
  }, [tramite.id]);

  const fase = tramite.fases[faseActual];
  const completado = faseActual === tramite.fases.length - 1;

  return (
    <div className="flex h-full flex-1 animate-in flex-col bg-[#030303] fade-in duration-500">
      {/* ENCABEZADO DEL TRÁMITE */}
      <div className="relative flex shrink-0 items-center justify-between overflow-hidden border-b border-cyan-900/40 bg-black px-8 py-6">
        <div className="pointer-events-none absolute top-0 right-0 h-full w-1/2 bg-gradient-to-l from-cyan-900/20 to-transparent"></div>
        <div>
          <h4 className="mb-1 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-cyan-500">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-500"></span>{" "}
            Expediente Activo
          </h4>
          <h2 className="flex items-center gap-3 text-2xl font-black text-white md:text-3xl">
            {tramite.emoji}{" "}
            <span className="tracking-tight">{tramite.title}</span>
          </h2>
        </div>
        <div className="hidden text-right md:block">
          <div className="mb-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">
            Categoría Operativa
          </div>
          <div className="text-sm font-black uppercase tracking-widest text-cyan-400">
            {tramite.complejidad}
          </div>
        </div>
      </div>

      {/* FLUJO DE PROCESO (PROGRESS BAR) */}
      <div className="relative shrink-0 border-b border-white/5 bg-[#050505] px-10 py-8">
        <div className="relative z-10 flex items-center justify-between">
          <div className="absolute top-1/2 left-0 z-0 h-1 w-full -translate-y-1/2 bg-[#111]"></div>
          <div
            className="absolute top-1/2 left-0 z-0 h-1 -translate-y-1/2 bg-cyan-500 shadow-[0_0_15px_#06b6d4] transition-all duration-700"
            style={{
              width: `${(faseActual / (tramite.fases.length - 1)) * 100}%`,
            }}
          ></div>

          {tramite.fases.map((_, idx) => (
            <div key={idx} className="relative z-10 flex flex-col items-center gap-2">
              <button
                onClick={() => setFaseActual(idx)}
                className={`flex h-10 w-10 items-center justify-center rounded-sm border-2 text-sm font-black transition-all duration-300 ${
                  idx === faseActual
                    ? "scale-125 border-cyan-300 bg-cyan-500 text-black shadow-[0_0_15px_#06b6d4]"
                    : idx < faseActual
                      ? "border-cyan-700 bg-cyan-900/50 text-cyan-400 hover:bg-cyan-800"
                      : "border-slate-800 bg-[#0a0a0a] text-slate-600"
                }`}
              >
                {idx < faseActual ? "✓" : idx + 1}
              </button>
              <span
                className={`absolute -bottom-5 w-24 text-center text-[9px] font-bold uppercase tracking-wider ${
                  idx === faseActual ? "text-cyan-400" : "text-slate-600"
                }`}
              >
                Fase {idx + 1}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* DETALLE DE FASE (EDUCACIÓN & OPERACIÓN) */}
      <div className="relative flex-1 overflow-y-auto bg-black p-8">
        <div
          className="mx-auto max-w-3xl space-y-6"
          key={faseActual}
        >
          <div className="mb-4 flex items-center gap-4">
            <div className="select-none text-5xl font-black text-cyan-900/30">
              0{faseActual + 1}
            </div>
            <div>
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-cyan-400">
                Fase Operativa
              </h3>
              <h4 className="text-xl font-black text-white">{fase.titulo}</h4>
            </div>
          </div>

          {/* Acción Administrativa */}
          <div className="relative overflow-hidden rounded-lg border border-cyan-900/50 bg-[#0a0a0c] p-5 border-l-4 border-l-cyan-500 group">
            <h5 className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-cyan-400">
              <span className="text-sm">🎯</span> Requerimiento
            </h5>
            <p className="text-base text-slate-200">{fase.accion}</p>
          </div>

          {/* Formación Jurídica */}
          <div className="relative rounded-lg border border-blue-500/30 bg-gradient-to-br from-blue-900/10 to-[#030303] p-5 shadow-inner">
            <h5 className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-blue-400">
              <span className="text-sm">⚖️</span> Educación Jurídica Continua
            </h5>
            <p className="text-sm leading-relaxed text-justify text-slate-300">
              {fase.educacion}
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {/* Control de Calidad */}
            {fase.preguntas.length > 0 && (
              <div className="rounded-lg border border-red-900/50 bg-[#1a0505] p-4">
                <h5 className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-red-500">
                  <span className="text-sm">⚠️</span> Control de Calidad
                  (Preguntas)
                </h5>
                <ul className="space-y-3">
                  {fase.preguntas.map((pregunta, i) => (
                    <li
                      key={i}
                      className="flex gap-2 text-xs leading-tight text-red-100/90"
                    >
                      <span className="font-black text-red-500">»</span>{" "}
                      {pregunta}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Presupuesto (Costos) */}
            <div className="rounded-lg border border-emerald-900/50 bg-[#051a05] p-4">
              <h5 className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-emerald-500">
                <span className="text-sm">💼</span> Honorarios e Impuestos
              </h5>
              <ul className="space-y-2">
                {fase.costos.map((costo, i) => (
                  <li
                    key={i}
                    className="flex items-center justify-between border-b border-emerald-900/30 pb-2 text-xs last:border-0 last:pb-0"
                  >
                    <span className="text-slate-300">{costo.item}</span>
                    <span className="rounded border border-emerald-700/50 bg-emerald-900/40 px-2 py-1 font-bold text-emerald-400">
                      {costo.p}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Navegación del Trámite */}
        <div className="mx-auto mt-10 flex max-w-3xl items-center justify-between border-t border-white/5 pt-4">
          <button
            onClick={() => setFaseActual(Math.max(0, faseActual - 1))}
            className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition-all ${
              faseActual === 0
                ? "pointer-events-none opacity-0"
                : "text-slate-500 hover:text-cyan-400"
            }`}
          >
            &lt; Etapa Anterior
          </button>

          {!completado ? (
            <button
              onClick={() => setFaseActual(faseActual + 1)}
              className="flex items-center gap-2 rounded-sm border-b-2 border-r-2 border-cyan-800 bg-cyan-600 px-6 py-3 text-xs font-black uppercase tracking-[0.1em] text-white shadow-[0_0_15px_#06b6d4] transition-all hover:border-cyan-400 hover:bg-cyan-500 active:translate-x-px active:translate-y-px active:border-b-0 active:border-r-0"
            >
              Aprobar Fase{" "}
              <span className="leading-none text-sm">»</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 rounded-sm border border-emerald-500/50 bg-emerald-900/30 px-6 py-3 text-xs font-black uppercase tracking-[0.1em] text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
              <span className="text-sm">✅</span> Expediente Concluido
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 🚀 MAIN APP (ACADEMIA DIGITAL OPERATIVA)
// ==========================================

export default function ManualOperativo() {
  const [activeTab, setActiveTab] = useState("servicios");
  const [selectedService, setSelectedService] = useState<
    (typeof serviciosData)[0] | null
  >(null);
  const [selectedTramiteId, setSelectedTramiteId] = useState(
    tramitesData[0].id
  );

  return (
    <div className="relative flex h-full flex-col items-center justify-center overflow-hidden bg-black p-2 font-sans text-slate-200 selection:bg-cyan-500 selection:text-black md:p-6">
      {/* Fondo Matrix Sutil */}
      <div className="pointer-events-none absolute inset-0 z-0 border-[#111] bg-black bg-[linear-gradient(rgba(0,0,0,0.9)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.9)_1px,transparent_1px)] bg-[size:40px_40px]"></div>

      {/* CONTENEDOR PRINCIPAL */}
      <div className="relative z-10 flex h-[92vh] min-h-[700px] w-full max-w-[1400px] flex-col overflow-hidden rounded-xl border border-[#222] bg-[#000000] shadow-[0_0_40px_rgba(0,0,0,0.8)]">
        {/* ================= ENCABEZADO CORPORATIVO/ELÉCTRICO ================= */}
        <header className="relative z-20 flex h-20 shrink-0 items-center justify-between overflow-hidden border-b border-cyan-900/50 bg-[#020202] px-6">
          <div className="pointer-events-none absolute inset-0 opacity-10"></div>

          <div className="flex flex-col">
            <h1 className="glitch-text bg-gradient-to-r from-white via-cyan-100 to-cyan-500 bg-clip-text text-2xl font-black uppercase tracking-tighter text-transparent md:text-4xl">
              GURÚ OS
            </h1>
            <div className="mt-1 flex items-center gap-2">
              <div className="h-px w-8 bg-cyan-500 shadow-[0_0_8px_#06b6d4]"></div>
              <p className="electric-pulse text-[8px] font-black uppercase tracking-[0.3em] text-cyan-400 md:text-[10px]">
                Academia Digital Empresarial
              </p>
            </div>
          </div>

          <div className="hidden items-center gap-6 md:flex">
            <div className="text-right">
              <div className="mb-1 text-[8px] font-black uppercase tracking-widest text-[#555]">
                Estatus del Servidor
              </div>
              <div className="flex items-center justify-end gap-1.5 text-[10px] font-black uppercase tracking-widest text-emerald-500">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500 shadow-[0_0_5px_#10b981]"></span>{" "}
                Operativo
              </div>
            </div>
            <div className="h-8 w-px bg-[#222]"></div>
            <div className="text-right">
              <div className="mb-1 text-[8px] font-black uppercase tracking-widest text-[#555]">
                Credencial de Acceso
              </div>
              <div className="rounded border border-cyan-600/40 bg-cyan-900/20 px-2 py-1 text-[9px] font-black uppercase tracking-[0.1em] text-cyan-300 shadow-[0_0_8px_rgba(6,182,212,0.1)]">
                Digitador Oficial
              </div>
            </div>
          </div>
        </header>

        {/* ================= CONTENIDO Y BARRA LATERAL ================= */}
        <div className="flex flex-1 overflow-hidden">
          {/* BARRA LATERAL NEÓN */}
          <aside className="z-20 flex w-[80px] shrink-0 flex-col items-center gap-6 border-r border-[#111] bg-[#020202] py-8 md:w-[90px]">
            <button
              onClick={() => {
                setActiveTab("servicios");
                setSelectedService(null);
              }}
              className={`group flex flex-col items-center gap-2 transition-all ${
                activeTab === "servicios"
                  ? "text-cyan-400"
                  : "text-slate-600 hover:text-cyan-500/60"
              }`}
            >
              <div
                className={`relative flex h-12 w-12 items-center justify-center rounded-lg transition-all duration-300 ${
                  activeTab === "servicios"
                    ? "border border-cyan-500 bg-cyan-900/30 shadow-[0_0_12px_rgba(6,182,212,0.3)]"
                    : "border border-transparent group-hover:bg-[#111]"
                }`}
              >
                <span className="text-xl drop-shadow-md filter">🛠️</span>
                {activeTab === "servicios" && (
                  <div className="absolute -left-1 top-1/2 h-5 w-[3px] -translate-y-1/2 bg-cyan-400 shadow-[0_0_8px_#06b6d4]"></div>
                )}
              </div>
              <span className="text-[8px] font-black uppercase tracking-[0.2em]">
                Servicios
              </span>
            </button>

            <button
              onClick={() => setActiveTab("tramites")}
              className={`group flex flex-col items-center gap-2 transition-all ${
                activeTab === "tramites"
                  ? "text-cyan-400"
                  : "text-slate-600 hover:text-cyan-500/60"
              }`}
            >
              <div
                className={`relative flex h-12 w-12 items-center justify-center rounded-lg transition-all duration-300 ${
                  activeTab === "tramites"
                    ? "border border-cyan-500 bg-cyan-900/30 shadow-[0_0_12px_rgba(6,182,212,0.3)]"
                    : "border border-transparent group-hover:bg-[#111]"
                }`}
              >
                <span className="text-xl drop-shadow-md filter">🗺️</span>
                {activeTab === "tramites" && (
                  <div className="absolute -left-1 top-1/2 h-5 w-[3px] -translate-y-1/2 bg-cyan-400 shadow-[0_0_8px_#06b6d4]"></div>
                )}
              </div>
              <span className="text-[8px] font-black uppercase tracking-[0.2em]">
                Trámites
              </span>
            </button>

            <div className="my-2 h-px w-8 bg-[#222]"></div>

            <button
              onClick={() => setActiveTab("ai_tools")}
              className={`group flex flex-col items-center gap-2 transition-all ${
                activeTab === "ai_tools"
                  ? "text-purple-400"
                  : "text-slate-600 hover:text-purple-400/60"
              }`}
            >
              <div
                className={`relative flex h-12 w-12 items-center justify-center rounded-lg transition-all duration-300 ${
                  activeTab === "ai_tools"
                    ? "border border-purple-500 bg-purple-900/30 shadow-[0_0_12px_rgba(168,85,247,0.3)]"
                    : "border border-transparent group-hover:bg-[#111]"
                }`}
              >
                <span className="text-xl drop-shadow-md filter">✨</span>
                {activeTab === "ai_tools" && (
                  <div className="absolute -left-1 top-1/2 h-5 w-[3px] -translate-y-1/2 bg-purple-400 shadow-[0_0_8px_#a855f7]"></div>
                )}
              </div>
              <span className="text-center text-[8px] font-black uppercase leading-tight tracking-[0.2em]">
                Herramientas
                <br />
                AI
              </span>
            </button>
          </aside>

          {/* ÁREA DE CONTENIDO */}
          <main className="flex flex-1 overflow-hidden bg-[#000]">
            {/* ================= TAB: SERVICIOS (VISTA GENERAL) ================= */}
            {activeTab === "servicios" && !selectedService && (
              <div className="custom-scrollbar h-full w-full animate-in overflow-y-auto bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#0a0a14] to-[#000] p-8 fade-in zoom-in-95 duration-500">
                <div className="mb-8 max-w-4xl">
                  <h2 className="mb-2 flex items-center gap-2 text-2xl font-black uppercase tracking-widest text-white">
                    <span className="text-2xl text-cyan-500">⚡</span>{" "}
                    Portafolio de Servicios
                  </h2>
                  <p className="text-xs font-medium uppercase tracking-wider text-[#777]">
                    Selecciona un módulo para acceder a las directrices
                    operativas.
                  </p>
                </div>

                <div className="grid max-w-6xl grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                  {serviciosData.map((svc) => (
                    <button
                      key={svc.id}
                      onClick={() => setSelectedService(svc)}
                      className="group relative overflow-hidden rounded-md border border-[#222] bg-[#050505] p-5 text-left transition-all duration-300 hover:-translate-y-1 hover:border-cyan-500 hover:shadow-[0_8px_25px_rgba(6,182,212,0.15)]"
                    >
                      <div className="absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100"></div>

                      <div className="absolute top-3 right-3 select-none font-mono text-3xl font-black text-[#151515] transition-colors group-hover:text-cyan-900/40">
                        {svc.num}
                      </div>

                      <div className="relative z-10 mb-3 origin-left text-3xl drop-shadow-md transition-transform group-hover:scale-110">
                        {svc.emoji}
                      </div>

                      <h3 className="relative z-10 mb-2 text-xs font-black uppercase tracking-widest text-white transition-colors group-hover:text-cyan-400">
                        {svc.title}
                      </h3>

                      <p className="relative z-10 mb-4 min-h-[35px] text-[11px] font-medium text-[#888] line-clamp-2">
                        {svc.desc}
                      </p>

                      <div className="relative z-10 flex items-center justify-between border-t border-[#222] pt-3 transition-colors group-hover:border-cyan-900/50">
                        <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500">
                          Revisar Protocolo
                        </span>
                        <span className="text-cyan-500 transition-transform group-hover:translate-x-1">
                          →
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ================= TAB: SERVICIOS (VISTA DE DETALLE / PANEL) ================= */}
            {activeTab === "servicios" && selectedService && (
              <div className="relative z-10 flex h-full w-full animate-in flex-col bg-[#030303] slide-in-from-right-8 duration-300">
                {/* Header del Servicio Detallado */}
                <div className="flex shrink-0 items-center justify-between border-b border-[#222] bg-[#050505] p-6">
                  <button
                    onClick={() => setSelectedService(null)}
                    className="flex items-center gap-2 rounded-sm border border-[#333] bg-[#111] px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-300 transition-all hover:bg-[#222] active:scale-95"
                  >
                    <span>←</span> Retornar al Catálogo
                  </button>
                  <h2 className="flex items-center gap-3 text-lg font-black uppercase tracking-widest text-cyan-400">
                    <span className="rounded border border-[#333] bg-[#111] p-1 text-xl">
                      {selectedService.emoji}
                    </span>
                    {selectedService.title}
                  </h2>
                </div>

                {/* Cuerpo del Servicio Detallado */}
                <div className="custom-scrollbar grid flex-1 gap-8 overflow-y-auto bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#0a0a14] to-[#000] p-8 md:grid-cols-2">
                  <div className="space-y-6">
                    <div className="rounded-r border-l-2 border-cyan-500 bg-cyan-900/10 p-5">
                      <h4 className="mb-2 text-[10px] font-black uppercase tracking-widest text-cyan-500">
                        Definición Estratégica
                      </h4>
                      <p className="text-sm font-medium leading-relaxed text-justify text-cyan-50">
                        {selectedService.desc}
                      </p>
                    </div>

                    <div className="rounded-sm border border-emerald-900/50 bg-[#050505] p-6 shadow-inner">
                      <h4 className="mb-4 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-emerald-500">
                        <span className="text-lg">📦</span> Entregables
                        Garantizados
                      </h4>
                      <div className="space-y-3">
                        {selectedService.incluye.map((inc, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-3 text-xs"
                          >
                            <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500"></div>
                            <span className="text-emerald-100/90">
                              {inc}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="h-full rounded-sm border border-orange-900/60 bg-[#0a0505] p-6 shadow-[0_0_15px_rgba(234,88,12,0.05)]">
                      <h4 className="mb-5 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-orange-500">
                        <span className="text-lg">⚖️</span> Reglas y Políticas
                        Corporativas
                      </h4>
                      <div className="space-y-4">
                        {selectedService.reglas.map((regla, i) => (
                          <div
                            key={i}
                            className="rounded border-l-2 border-orange-600 bg-black/80 p-4 text-xs font-medium leading-relaxed text-justify text-orange-100/90"
                          >
                            {regla}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ================= TAB: TRÁMITES (CATÁLOGO OPERATIVO) ================= */}
            {activeTab === "tramites" && (
              <div className="flex h-full w-full">
                {/* Menú Lateral de Expedientes */}
                <div className="z-10 flex w-[300px] shrink-0 flex-col border-r border-[#111] bg-[#020202]">
                  <div className="border-b border-[#111] p-5">
                    <h3 className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] text-cyan-500">
                      <span className="text-xs">📂</span> Catálogo Operativo
                    </h3>
                  </div>
                  <div className="custom-scrollbar flex-1 space-y-2 overflow-y-auto p-3">
                    {tramitesData.map((tramite) => (
                      <button
                        key={tramite.id}
                        onClick={() => setSelectedTramiteId(tramite.id)}
                        className={`group relative flex w-full items-center gap-3 overflow-hidden rounded-sm p-3 text-left transition-all ${
                          selectedTramiteId === tramite.id
                            ? "border-l-2 border-cyan-400 bg-cyan-900/20"
                            : "border-l-2 border-transparent bg-[#050505] hover:border-[#333] hover:bg-[#0a0a0a]"
                        }`}
                      >
                        {selectedTramiteId === tramite.id && (
                          <div className="pointer-events-none absolute inset-0 opacity-20"></div>
                        )}
                        <span className="z-10 rounded border border-[#222] bg-[#000] p-1.5 text-xl drop-shadow-md filter">
                          {tramite.emoji}
                        </span>
                        <div className="z-10 min-w-0 flex-1">
                          <span
                            className={`block truncate text-[10px] font-black uppercase tracking-wider ${
                              selectedTramiteId === tramite.id
                                ? "text-white"
                                : "text-[#888] group-hover:text-slate-300"
                            }`}
                          >
                            {tramite.title}
                          </span>
                          <span className="mt-1 block text-[8px] font-bold tracking-widest text-[#666]">
                            {tramite.complejidad}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Visor de Expediente (Timeline Profesional) */}
                <TramiteViewer
                  tramite={
                    tramitesData.find((t) => t.id === selectedTramiteId)!
                  }
                />
              </div>
            )}

            {/* ================= TAB: AI TOOLS (GEMINI) ================= */}
            {activeTab === "ai_tools" && <AIToolsViewer />}
          </main>
        </div>
      </div>

      {/* ASESOR VIRTUAL (ARRASTRABLE) */}
      <GuruDraggable />

      {/* ================= ESTILOS GLOBALES ================= */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #000; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(6, 182, 212, 0.3); border-radius: 0; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(6, 182, 212, 0.8); }

        .glitch-text {
          position: relative;
          text-shadow: 0.05em 0 0 rgba(255,0,0,0.75), -0.025em -0.05em 0 rgba(0,255,0,0.75), 0.025em 0.05em 0 rgba(0,0,255,0.75);
          animation: glitch 3s infinite;
        }
        @keyframes glitch {
          0% { text-shadow: 0.05em 0 0 rgba(255,0,0,0.75), -0.05em -0.025em 0 rgba(0,255,0,0.75), -0.025em 0.05em 0 rgba(0,0,255,0.75); }
          14% { text-shadow: 0.05em 0 0 rgba(255,0,0,0.75), -0.05em -0.025em 0 rgba(0,255,0,0.75), -0.025em 0.05em 0 rgba(0,0,255,0.75); }
          15% { text-shadow: -0.05em -0.025em 0 rgba(255,0,0,0.75), 0.025em 0.025em 0 rgba(0,255,0,0.75), -0.05em -0.05em 0 rgba(0,0,255,0.75); }
          49% { text-shadow: -0.05em -0.025em 0 rgba(255,0,0,0.75), 0.025em 0.025em 0 rgba(0,255,0,0.75), -0.05em -0.05em 0 rgba(0,0,255,0.75); }
          50% { text-shadow: 0.025em 0.05em 0 rgba(255,0,0,0.75), 0.05em 0 0 rgba(0,255,0,0.75), 0 -0.05em 0 rgba(0,0,255,0.75); }
          99% { text-shadow: 0.025em 0.05em 0 rgba(255,0,0,0.75), 0.05em 0 0 rgba(0,255,0,0.75), 0 -0.05em 0 rgba(0,0,255,0.75); }
          100% { text-shadow: -0.025em 0 0 rgba(255,0,0,0.75), -0.025em -0.025em 0 rgba(0,255,0,0.75), -0.025em -0.05em 0 rgba(0,0,255,0.75); }
        }

        .electric-pulse {
          animation: electric-glow 2s infinite alternate;
        }
        @keyframes electric-glow {
          from { text-shadow: 0 0 2px #06b6d4, 0 0 5px #06b6d4; }
          to { text-shadow: 0 0 5px #06b6d4, 0 0 10px #06b6d4, 0 0 15px #3b82f6; }
        }
      `}</style>
    </div>
  );
}
