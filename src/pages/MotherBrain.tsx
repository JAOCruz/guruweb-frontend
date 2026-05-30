import { useState, useEffect, useMemo } from "react";
import {
  Search,
  Users,
  Tag,
  Play,
  Download,
  X,
  Loader2,
  ArrowLeft,
  Brain,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import api from "../services/api";

interface DocCategory {
  id: number;
  name: string;
  slug: string;
  parent_id: number | null;
  templates: DocTemplate[] | null;
}

interface DocTemplate {
  id: number;
  name: string;
  slug: string;
  description: string;
  doc_type: string;
  required_roles: string[];
  category_name?: string;
}

interface DocVariable {
  tag: string;
  description: string;
  is_rol_dynamic: boolean;
  rol_type: string;
}

/* ── Neo-Brutalist Category Styles ── */
const CAT_STYLES: Record<
  string,
  {
    emoji: string;
    bg: string;
    border: string;
    shadow: string;
    text: string;
    accent: string;
    tagline: string;
  }
> = {
  notificaciones: {
    emoji: "📢",
    bg: "bg-[#0000FF]",
    border: "border-[#000080]",
    shadow: "shadow-[6px_6px_0px_0px_rgba(0,0,128,1)]",
    text: "text-white",
    accent: "bg-[#3333FF]",
    tagline: "¡Avisos oficiales con estilo!",
  },
  "contratos-civiles": {
    emoji: "📜",
    bg: "bg-[#0000FF]",
    border: "border-[#000080]",
    shadow: "shadow-[6px_6px_0px_0px_rgba(0,0,128,1)]",
    text: "text-white",
    accent: "bg-[#3333FF]",
    tagline: "Papelitos que salvan vidas 💼",
  },
  "instancias-y-escritos": {
    emoji: "⚖️",
    bg: "bg-[#0000FF]",
    border: "border-[#000080]",
    shadow: "shadow-[6px_6px_0px_0px_rgba(0,0,128,1)]",
    text: "text-white",
    accent: "bg-[#3333FF]",
    tagline: "Justicia digital al instante",
  },
};

const SUBCAT_EMOJIS: Record<string, string> = {
  "contratos-bajo-firma-privada": "✍️",
  "contratos-autenticos": "🔏",
  instancias: "📨",
  recursos: "📤",
  demandas: "⚔️",
  avisos: "📰",
  "bienes-traslativos": "🚗",
  "rentas-o-alquileres": "🏠",
  laboral: "💼",
  comerciales: "🏪",
  financieros: "💰",
  acuerdos: "🤝",
  "protocolo-notarial": "📜",
  inmobiliaria: "🏗️",
  natalidad: "👶",
  "poderes-y-autorizaciones-especiales": "⚡",
  "estado-civil": "💍",
  "herencia-o-familiaridad": "👨‍👩‍👧‍👦",
  vehiculos: "🚙",
  "embarcacion-nave-maritima": "⛵",
  ganado: "🐄",
  inmuebles: "🏡",
  "punto-comercial": "🏬",
  "maquina-industrial": "⚙️",
  agrimensura: "📐",
};

const DEFAULT_SUBCAT_EMOJI = "📁";

/* ── Tree Helpers ── */
const getDescendants = (parentId: number, allCats: DocCategory[]): DocCategory[] => {
  const children = allCats.filter((c) => c.parent_id === parentId);
  const grandchildren = children.flatMap((c) => getDescendants(c.id, allCats));
  return [...children, ...grandchildren];
};

const getTemplateEmoji = (name: string) => {
  const n = name.toUpperCase();
  if (n.includes("VEHICULO") || n.includes("AUTO")) return "🚗";
  if (n.includes("INMUEBLE") || n.includes("CASA") || n.includes("APARTAMENTO"))
    return "🏠";
  if (n.includes("ALQUILER") || n.includes("ARRIENDO")) return "🔑";
  if (n.includes("PODER")) return "⚡";
  if (n.includes("HERENCIA") || n.includes("FAMILIAR")) return "👨‍👩‍👧‍👦";
  if (n.includes("NOTARIO") || n.includes("NOTARIAL")) return "📜";
  if (n.includes("ALGUACIL") || n.includes("NOTIFICACION")) return "📢";
  if (n.includes("DEMANDA") || n.includes("DEMANDO")) return "⚔️";
  if (n.includes("INSTANCIA") || n.includes("SOLICITUD")) return "📨";
  if (n.includes("ACUERDO") || n.includes("TRANSACCION")) return "🤝";
  if (n.includes("COMODATO") || n.includes("USO GRATUITO")) return "🎁";
  if (n.includes("COMPRA") || n.includes("VENTA")) return "💵";
  if (n.includes("CONTRATO")) return "📄";
  return "📋";
};

export default function MotherBrain() {
  /* ── State ── */
  const [categories, setCategories] = useState<DocCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<DocTemplate | null>(null);
  const [templateDetail, setTemplateDetail] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // Test generation modal
  const [showModal, setShowModal] = useState(false);
  const [testData, setTestData] = useState<Record<string, string>>({});
  const [testRoles, setTestRoles] = useState<Record<string, Record<string, string>>>({});
  const [generating, setGenerating] = useState(false);
  const [generatedFile, setGeneratedFile] = useState<string | null>(null);
  const [generatedSessionId, setGeneratedSessionId] = useState<number | null>(null);

  /* ── Derived: parent/child grouping ── */
  const parentCategories = useMemo(
    () => categories.filter((c) => c.parent_id === null),
    [categories]
  );

  const activeParent = useMemo(
    () => parentCategories.find((c) => c.slug === selectedCategory) || null,
    [parentCategories, selectedCategory]
  );

  const activeDescendants = useMemo(() => {
    if (!activeParent) return [];
    return getDescendants(activeParent.id, categories);
  }, [activeParent, categories]);

  // Leaf categories = categories that actually have templates (any level)
  const leafCategories = useMemo(() => {
    if (!activeParent) return [];
    const allInTree = activeParent.templates?.length
      ? [activeParent, ...activeDescendants]
      : activeDescendants;
    return allInTree.filter((c) => (c.templates?.length || 0) > 0);
  }, [activeParent, activeDescendants]);

  // Templates to display
  const displayedTemplates = useMemo(() => {
    if (!activeParent) return [];
    let source: DocCategory[];
    if (selectedSubcategory) {
      const cat = categories.find((c) => c.slug === selectedSubcategory);
      source = cat ? [cat] : [];
    } else {
      // "Todos" — show all templates from entire subtree
      source = activeParent.templates?.length
        ? [activeParent, ...activeDescendants]
        : activeDescendants;
    }
    const all: DocTemplate[] = [];
    source.forEach((c) => {
      if (c.templates) all.push(...c.templates);
    });
    if (search) {
      return all.filter((t) => t.name.toLowerCase().includes(search.toLowerCase()));
    }
    return all;
  }, [activeParent, activeDescendants, categories, selectedSubcategory, search]);

  /* ── Effects ── */
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await api.get("/docgen/categories");
      // Normalize null templates to []
      const normalized = (res.data.categories || []).map((c: DocCategory) => ({
        ...c,
        templates: c.templates || [],
      }));
      setCategories(normalized);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const selectCategory = (slug: string) => {
    setSelectedCategory(slug);
    setSelectedSubcategory(null);
    setSelectedTemplate(null);
    setTemplateDetail(null);
    setSearch("");
  };

  const selectSubcategory = (slug: string) => {
    setSelectedSubcategory(slug);
    setSelectedTemplate(null);
    setTemplateDetail(null);
  };

  const selectTemplate = async (t: DocTemplate) => {
    setSelectedTemplate(t);
    setGeneratedFile(null);
    try {
      const res = await api.get(`/docgen/templates/${t.id}`);
      setTemplateDetail(res.data);
      const initData: Record<string, string> = {};
      const initRoles: Record<string, Record<string, string>> = {};
      if (res.data.variables) {
        res.data.variables.forEach((v: DocVariable) => {
          if (!v.is_rol_dynamic) initData[v.tag] = "";
        });
      }
      if (res.data.requiredRoles) {
        Object.keys(res.data.requiredRoles).forEach((role: string) => {
          initRoles[role] = {};
          res.data.requiredRoles[role].forEach((field: string) => {
            initRoles[role][field] = "";
          });
        });
      }
      setTestData(initData);
      setTestRoles(initRoles);
    } catch (err) {
      console.error(err);
    }
  };

  const openTestModal = () => {
    setShowModal(true);
    setGeneratedFile(null);
  };

  const runTestGeneration = async () => {
    if (!selectedTemplate) return;
    setGenerating(true);
    try {
      const sessionRes = await api.post("/docgen/sessions", {
        templateId: selectedTemplate.id,
      });
      const sessionId = sessionRes.data.session.id;
      await api.put(`/docgen/sessions/${sessionId}/data`, {
        collectedData: testData,
        assignedRoles: testRoles,
      });
      const genRes = await api.post(`/docgen/sessions/${sessionId}/generate`);
      setGeneratedFile(genRes.data.fileName);
      setGeneratedSessionId(sessionId);
    } catch (err: any) {
      console.error("Generation failed:", err);
      const msg =
        err.response?.data?.error ||
        err.response?.data?.details ||
        err.message ||
        "Error desconocido";
      alert(`Error generando documento: ${msg}`);
    } finally {
      setGenerating(false);
    }
  };

  const downloadGeneratedFile = async () => {
    if (!generatedSessionId) return;
    try {
      const res = await api.get(`/docgen/sessions/${generatedSessionId}/download`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", generatedFile || "documento.docx");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error("Download failed:", err);
      alert("Error descargando documento. Revisa la consola.");
    }
  };

  const clearSelection = () => {
    setSelectedCategory(null);
    setSelectedSubcategory(null);
    setSelectedTemplate(null);
    setTemplateDetail(null);
    setSearch("");
  };

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="flex h-full items-center justify-center text-[#3333FF]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#0000FF] border-t-transparent" />
        <span className="ml-3 text-lg font-bold">Cargando Mother Brain...</span>
      </div>
    );
  }

  /* ═══════════════════════════════════════════════════════════════
     HOME VIEW — 3 Big Neo-Brutalist Category Cards
     ═══════════════════════════════════════════════════════════════ */
  const HomeView = () => (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center gap-3 rounded-xl border-2 border-[#000080] bg-[#0000FF] px-6 py-3 shadow-[6px_6px_0px_0px_rgba(0,0,128,1)]">
          <Brain className="h-8 w-8 text-white" />
          <h1 className="text-3xl font-black uppercase tracking-wider text-white">
            Mother Brain
          </h1>
          <Sparkles className="h-6 w-6 text-white" />
        </div>
        <p className="mt-4 text-lg font-bold text-[#6666FF]">
          🧠 Sistema de Generación de Documentos Legales
        </p>
        <p className="text-sm text-[#0000FF]/70">
          161 plantillas · 3 categorías · 1 cerebro
        </p>
      </div>

      {/* 3 Category Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {parentCategories.map((cat) => {
          const style = CAT_STYLES[cat.slug] || CAT_STYLES["notificaciones"];
          const descendants = getDescendants(cat.id, categories);
          const leafCount = descendants.filter(
            (c) => (c.templates?.length || 0) > 0
          ).length;
          const tmplCount =
            (cat.templates?.length || 0) +
            descendants.reduce(
              (sum, c) => sum + (c.templates?.length || 0),
              0
            );

          return (
            <button
              key={cat.id}
              onClick={() => selectCategory(cat.slug)}
              className={`group relative flex flex-col items-center gap-4 rounded-xl ${style.bg} ${style.border} border-4 p-8 ${style.shadow} transition-all hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,0.4)] active:translate-x-[6px] active:translate-y-[6px] active:shadow-none`}
            >
              <span className="text-6xl drop-shadow-lg transition-transform group-hover:scale-110">
                {style.emoji}
              </span>
              <h2
                className={`text-center text-xl font-black uppercase tracking-wide ${style.text}`}
              >
                {cat.name}
              </h2>
              <p className={`text-sm font-bold ${style.text} opacity-80`}>
                {style.tagline}
              </p>
              <div className="mt-2 flex gap-2">
                <span
                  className={`rounded-lg ${style.accent} px-3 py-1 text-xs font-black uppercase ${style.text} border-2 ${style.border}`}
                >
                  {tmplCount} docs
                </span>
                {leafCount > 0 && (
                  <span
                    className={`rounded-lg bg-white/30 px-3 py-1 text-xs font-black uppercase ${style.text} border-2 ${style.border}`}
                  >
                    {leafCount} subcat
                  </span>
                )}
              </div>
              <ChevronRight
                className={`mt-2 h-6 w-6 ${style.text} opacity-60 group-hover:opacity-100 transition-opacity`}
              />
            </button>
          );
        })}
      </div>

      {/* Decorative footer */}
      <div className="flex justify-center gap-2">
        {["🔵", "🟦", "🔷", "💠", "🔹"].map((e, i) => (
          <span key={i} className="text-xl opacity-40">
            {e}
          </span>
        ))}
      </div>
    </div>
  );

  /* ═══════════════════════════════════════════════════════════════
     CATEGORY VIEW — Subcategories + Templates
     ═══════════════════════════════════════════════════════════════ */
  const CategoryView = () => {
    if (!activeParent) return null;
    const style = CAT_STYLES[activeParent.slug] || CAT_STYLES["notificaciones"];

    return (
      <div className="flex flex-col gap-6">
        {/* Category Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={clearSelection}
            className="flex items-center gap-2 rounded-lg border-2 border-slate-700 bg-slate-800 px-4 py-2 text-sm font-bold text-slate-300 shadow-[4px_4px_0px_0px_rgba(30,41,59,1)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(30,41,59,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none"
          >
            <ArrowLeft size={16} />
            Volver
          </button>
          <div
            className={`flex items-center gap-3 rounded-xl ${style.bg} ${style.border} border-4 px-5 py-3 ${style.shadow}`}
          >
            <span className="text-3xl">{style.emoji}</span>
            <div>
              <h2 className={`text-xl font-black uppercase ${style.text}`}>
                {activeParent.name}
              </h2>
              <p className={`text-xs font-bold ${style.text} opacity-70`}>
                {displayedTemplates.length} documentos
              </p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#0000FF]" />
          <input
            type="text"
            placeholder="🔍 Buscar plantilla..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border-2 border-[#000080] bg-slate-900 py-3 pl-12 pr-4 text-white placeholder-[#0000FF]/50 outline-none focus:border-[#0000FF] focus:shadow-[4px_4px_0px_0px_rgba(0,0,128,1)] transition-all"
          />
        </div>

        {/* Subcategory Chips — show ALL leaf categories with templates */}
        {leafCategories.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedSubcategory(null)}
              className={`rounded-lg border-2 px-3 py-1.5 text-xs font-black uppercase transition-all ${
                !selectedSubcategory
                  ? `${style.bg} ${style.border} ${style.text} shadow-[3px_3px_0px_0px_rgba(0,0,0,0.3)]`
                  : "border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-500 hover:text-slate-200"
              }`}
            >
              🗂️ Todos
            </button>
            {leafCategories.map((child) => {
              const isActive = selectedSubcategory === child.slug;
              const emoji = SUBCAT_EMOJIS[child.slug] || DEFAULT_SUBCAT_EMOJI;
              return (
                <button
                  key={child.id}
                  onClick={() => selectSubcategory(child.slug)}
                  className={`rounded-lg border-2 px-3 py-1.5 text-xs font-black uppercase transition-all ${
                    isActive
                      ? `${style.bg} ${style.border} ${style.text} shadow-[3px_3px_0px_0px_rgba(0,0,0,0.3)]`
                      : "border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-500 hover:text-slate-200"
                  }`}
                >
                  {emoji} {child.name}
                </button>
              );
            })}
          </div>
        )}

        {/* Templates Grid */}
        {displayedTemplates.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-slate-700 bg-slate-900/50 p-12 text-center">
            <span className="text-4xl">🕸️</span>
            <p className="mt-2 text-lg font-bold text-slate-500">
              No hay documentos aquí
            </p>
            <p className="text-sm text-slate-600">
              Prueba con otra búsqueda o subcategoría
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {displayedTemplates.map((t) => {
              const emoji = getTemplateEmoji(t.name);
              const isSelected = selectedTemplate?.id === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => selectTemplate(t)}
                  className={`group flex flex-col gap-2 rounded-xl border-2 p-4 text-left transition-all ${
                    isSelected
                      ? "border-[#0000FF] bg-[#000033]/40 shadow-[4px_4px_0px_0px_rgba(0,0,255,1)]"
                      : "border-slate-700 bg-slate-900 shadow-[4px_4px_0px_0px_rgba(30,41,59,1)] hover:border-[#0000AA] hover:shadow-[2px_2px_0px_0px_rgba(30,41,59,1)] hover:translate-x-[2px] hover:translate-y-[2px]"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{emoji}</span>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-bold text-white">
                        {t.name}
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        {t.required_roles?.length > 0 && (
                          <span className="flex items-center gap-1 rounded bg-[#0000FF]/10 px-1.5 py-0.5 text-[10px] font-bold text-[#3333FF] border border-[#0000FF]/20">
                            <Users size={10} />
                            {t.required_roles.length} roles
                          </span>
                        )}
                        <span className="rounded bg-slate-700/50 px-1.5 py-0.5 text-[10px] font-bold uppercase text-slate-400 border border-slate-600">
                          {t.doc_type}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Template Detail Panel (inline when selected) */}
        {selectedTemplate && templateDetail && (
          <div className="rounded-xl border-2 border-[#0000AA] bg-slate-900 p-6 shadow-[6px_6px_0px_0px_rgba(0,0,128,0.5)]">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xs font-black uppercase tracking-wider text-[#3333FF]">
                  {templateDetail.template?.category_name}
                </div>
                <h3 className="mt-1 text-lg font-black text-white">
                  {selectedTemplate.name}
                </h3>
                <p className="mt-1 text-sm text-slate-400">
                  {selectedTemplate.description || "Sin descripción"}
                </p>
              </div>
              <button
                onClick={() => {
                  setSelectedTemplate(null);
                  setTemplateDetail(null);
                }}
                className="rounded-lg border-2 border-slate-700 bg-slate-800 p-2 text-slate-400 transition-all hover:border-slate-500 hover:text-white shadow-[2px_2px_0px_0px_rgba(30,41,59,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]"
              >
                <X size={16} />
              </button>
            </div>

            {/* Required Roles */}
            {templateDetail.requiredRoles &&
              Object.keys(templateDetail.requiredRoles).length > 0 && (
                <div className="mt-4">
                  <div className="mb-2 flex items-center gap-2 text-sm font-black text-white">
                    <Users size={16} className="text-[#3333FF]" />
                    Roles Requeridos
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(templateDetail.requiredRoles).map(
                      ([role, fields]: [string, any]) => (
                        <div
                          key={role}
                          className="rounded-lg border-2 border-[#0000AA] bg-[#000033]/50 px-3 py-2"
                        >
                          <div className="text-xs font-black text-[#3333FF]">
                            {role}
                          </div>
                          <div className="text-[10px] font-bold text-slate-500">
                            {fields.length} campos
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

            {/* Variables */}
            {templateDetail.variables && templateDetail.variables.length > 0 && (
              <div className="mt-4">
                <div className="mb-2 flex items-center gap-2 text-sm font-black text-white">
                  <Tag size={16} className="text-purple-400" />
                  Variables ({templateDetail.variables.length})
                </div>
                <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                  {templateDetail.variables.map((v: DocVariable) => (
                    <div
                      key={v.tag}
                      className={`rounded-lg border px-3 py-2 text-xs ${
                        v.is_rol_dynamic
                          ? "border-[#0000AA] bg-[#000033]/30 text-[#9999FF]"
                          : "border-slate-700 bg-slate-800 text-slate-300"
                      }`}
                    >
                      <div className="font-mono font-bold">{v.tag}</div>
                      {v.description && (
                        <div className="mt-1 text-[10px] text-slate-500">
                          {v.description}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={openTestModal}
                className="flex items-center gap-2 rounded-lg border-2 border-[#000080] bg-[#0000CC] px-5 py-2.5 text-sm font-black uppercase text-white shadow-[4px_4px_0px_0px_rgba(0,0,128,1)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,128,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none"
              >
                <Play size={16} />
                Probar Generación
              </button>
              {generatedSessionId && (
                <button
                  onClick={downloadGeneratedFile}
                  className="flex items-center gap-2 rounded-lg border-2 border-green-800 bg-green-700 px-5 py-2.5 text-sm font-black uppercase text-white shadow-[4px_4px_0px_0px_rgba(20,83,45,1)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(20,83,45,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none"
                >
                  <Download size={16} />
                  Descargar Último
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  /* ═══════════════════════════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════════════════════════ */
  return (
    <div className="custom-scroll flex h-full flex-col gap-6 overflow-y-auto p-6">
      {selectedCategory ? <CategoryView /> : <HomeView />}

      {/* Test Generation Modal */}
      {showModal && selectedTemplate && templateDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="flex max-h-[90vh] w-full max-w-3xl flex-col rounded-2xl border-4 border-[#0000AA] bg-[#0b1120] shadow-[8px_8px_0px_0px_rgba(0,0,128,1)]">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b-2 border-[#000080]/50 p-5">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🧪</span>
                <div>
                  <h3 className="text-lg font-black text-white">
                    Probar: {selectedTemplate.name}
                  </h3>
                  <p className="text-xs font-bold text-[#3333FF]">
                    Llena los datos de prueba y genera el documento
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="rounded-lg border-2 border-slate-700 bg-slate-800 p-2 text-slate-400 transition-all hover:border-slate-500 hover:text-white shadow-[2px_2px_0px_0px_rgba(30,41,59,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-5 custom-scroll">
              {/* Role inputs */}
              {Object.entries(templateDetail.requiredRoles || {}).map(
                ([role, fields]: [string, any]) => (
                  <div key={role} className="mb-6">
                    <div className="mb-3 flex items-center gap-2 text-sm font-black text-[#3333FF]">
                      <span>👤</span> {role}
                    </div>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {fields.map((field: string) => (
                        <div key={`${role}-${field}`}>
                          <label className="mb-1 block text-[11px] font-black uppercase tracking-wider text-slate-500">
                            {field}
                          </label>
                          <input
                            type="text"
                            value={testRoles[role]?.[field] || ""}
                            onChange={(e) =>
                              setTestRoles((prev) => ({
                                ...prev,
                                [role]: { ...prev[role], [field]: e.target.value },
                              }))
                            }
                            className="w-full rounded-xl border-2 border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white placeholder-slate-600 outline-none focus:border-[#0000FF] focus:shadow-[3px_3px_0px_0px_rgba(0,0,128,1)] transition-all"
                            placeholder={`${field}...`}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )
              )}

              {/* Field inputs */}
              {templateDetail.variables?.filter((v: DocVariable) => !v.is_rol_dynamic)
                .length > 0 && (
                <div className="mb-6">
                  <div className="mb-3 flex items-center gap-2 text-sm font-black text-purple-400">
                    <span>📝</span> Datos Adicionales
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {templateDetail.variables
                      .filter((v: DocVariable) => !v.is_rol_dynamic)
                      .map((v: DocVariable) => (
                        <div key={v.tag}>
                          <label className="mb-1 block text-[11px] font-black uppercase tracking-wider text-slate-500">
                            {v.tag}
                          </label>
                          <input
                            type="text"
                            value={testData[v.tag] || ""}
                            onChange={(e) =>
                              setTestData((prev) => ({
                                ...prev,
                                [v.tag]: e.target.value,
                              }))
                            }
                            className="w-full rounded-xl border-2 border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white placeholder-slate-600 outline-none focus:border-[#0000FF] focus:shadow-[3px_3px_0px_0px_rgba(0,0,128,1)] transition-all"
                            placeholder={v.description || v.tag}
                          />
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Generated file */}
              {generatedFile && generatedSessionId && (
                <div className="mb-4 rounded-xl border-2 border-green-700 bg-green-950/30 p-4">
                  <div className="flex items-center gap-2 text-sm font-black text-green-400">
                    <Download size={16} />
                    Documento generado: {generatedFile}
                  </div>
                  <button
                    onClick={downloadGeneratedFile}
                    className="mt-3 inline-flex items-center gap-2 rounded-lg border-2 border-green-800 bg-green-700 px-4 py-2 text-sm font-black text-white shadow-[3px_3px_0px_0px_rgba(20,83,45,1)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
                  >
                    <Download size={16} />
                    Descargar Documento .docx
                  </button>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex gap-3 border-t-2 border-[#000080]/50 p-5">
              <button
                onClick={runTestGeneration}
                disabled={generating}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl border-2 border-[#000080] bg-[#0000CC] py-3 text-sm font-black uppercase text-white shadow-[4px_4px_0px_0px_rgba(0,0,128,1)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,128,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {generating ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Generando...
                  </>
                ) : (
                  <>
                    <Play size={18} />
                    Generar Documento
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
