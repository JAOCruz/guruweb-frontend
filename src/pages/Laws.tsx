import { useState, useMemo } from "react";
import { Search, ExternalLink, ArrowLeft, Sparkles } from "lucide-react";
import { LAWS, LawCategory } from "../data/laws";

/* ── Category config ── */
const CATEGORY_CONFIG: Record<
  LawCategory,
  { emoji: string; color: string }
> = {
  "Notariado y Registros": { emoji: "📋", color: "#0000FF" },
  "Electoral y Civil": { emoji: "🗳️", color: "#0000FF" },
  Judicial: { emoji: "⚖️", color: "#0000FF" },
  "Tributario y Financiero": { emoji: "💰", color: "#0000FF" },
  "Pensiones y AFP": { emoji: "🏦", color: "#0000FF" },
  "Gobierno y Municipios": { emoji: "🏛️", color: "#0000FF" },
  "Servicios Públicos": { emoji: "⚡", color: "#0000FF" },
  "Migracion y Seguridad": { emoji: "🛂", color: "#0000FF" },
  "Tránsito y Vehículos": { emoji: "🚗", color: "#0000FF" },
  "Seguridad Ciudadana": { emoji: "🚔", color: "#0000FF" },
  Otros: { emoji: "📌", color: "#0000FF" },
};

/* ── Neo-Brutalist helpers ── */
const NB = {
  card: "flex flex-col gap-3 rounded-xl border-2 border-slate-700 bg-slate-900 p-4 shadow-[4px_4px_0px_0px_rgba(30,41,59,1)] transition-all hover:shadow-[2px_2px_0px_0px_rgba(30,41,59,1)] hover:translate-x-[2px] hover:translate-y-[2px]",
  btnBlue:
    "border-2 border-[#000080] bg-[#0000FF] text-white shadow-[4px_4px_0px_0px_rgba(0,0,128,1)] transition-all hover:shadow-[2px_2px_0px_0px_rgba(0,0,128,1)] hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-none active:translate-x-[4px] active:translate-y-[4px]",
  btnSecondary:
    "border-2 border-slate-700 bg-slate-800 text-slate-300 shadow-[3px_3px_0px_0px_rgba(30,41,59,1)] transition-all hover:shadow-[1px_1px_0px_0px_rgba(30,41,59,1)] hover:translate-x-[1px] hover:translate-y-[1px] active:shadow-none",
  chipActive:
    "border-2 border-[#000080] bg-[#0000FF] text-white shadow-[3px_3px_0px_0px_rgba(0,0,128,1)]",
  chipInactive:
    "border-2 border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-500 hover:text-slate-200",
};

/* ── Law Card (blue neo-brutalist like ServiceCatalog) ── */
function LawCard({ law }: { law: (typeof LAWS)[0] }) {
  const cfg = CATEGORY_CONFIG[law.category];
  const docCount = law.relatedDocCategories.length;

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border-4 border-[#000080] bg-[#0000FF] p-5 shadow-[6px_6px_0px_0px_rgba(0,0,128,1)] transition-all hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-[3px_3px_0px_0px_rgba(0,0,128,1)] active:translate-x-[6px] active:translate-y-[6px] active:shadow-none">
      {/* Header */}
      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="mb-1 text-3xl">{cfg.emoji}</div>
          <h3 className="text-base font-black leading-tight text-white line-clamp-2">
            {law.institution}
          </h3>
        </div>
      </div>

      {/* Category badge */}
      <span className="mb-3 w-fit rounded-lg border-2 border-[#000080] bg-white px-2.5 py-1 text-[10px] font-black uppercase text-[#0000FF] shadow-[2px_2px_0px_0px_rgba(0,0,128,1)]">
        {law.category}
      </span>

      {/* Description */}
      <p className="mb-3 line-clamp-3 text-xs text-white/80">
        {law.description}
      </p>

      {/* Related document categories */}
      {docCount > 0 && (
        <div className="mb-3 space-y-1 border-t-2 border-white/30 pt-2">
          <p className="text-[10px] font-black uppercase tracking-wider text-white/60">
            Documentos relacionados
          </p>
          <div className="flex flex-wrap gap-1">
            {law.relatedDocCategories.map((cat, i) => (
              <span
                key={i}
                className="rounded border border-white/30 bg-white/20 px-2 py-0.5 text-[10px] font-bold text-white whitespace-nowrap"
              >
                {cat}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Open link button */}
      <a
        href={law.url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-auto flex items-center justify-center gap-2 rounded-lg border-2 border-[#000080] bg-white px-3 py-2.5 text-xs font-black uppercase text-[#0000FF] shadow-[3px_3px_0px_0px_rgba(0,0,128,1)] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,128,1)] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none"
      >
        <ExternalLink className="h-3.5 w-3.5" />
        Abrir enlace
      </a>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════ */
export default function Laws() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<LawCategory | null>(
    null
  );

  const categories = useMemo(
    () =>
      Array.from(new Set(LAWS.map((law) => law.category))).sort() as LawCategory[],
    []
  );

  const categoryStats = useMemo(() => {
    const stats: Record<string, number> = {};
    categories.forEach((cat) => {
      stats[cat] = LAWS.filter((l) => l.category === cat).length;
    });
    return stats;
  }, [categories]);

  const filteredLaws = useMemo(() => {
    return LAWS.filter((law) => {
      const matchesSearch =
        searchQuery === "" ||
        law.institution.toLowerCase().includes(searchQuery.toLowerCase()) ||
        law.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        !selectedCategory || law.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  /* ── Home View: category cards ── */
  const HomeView = () => (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center gap-3 rounded-xl border-2 border-[#000080] bg-[#0000FF] px-6 py-3 shadow-[6px_6px_0px_0px_rgba(0,0,128,1)]">
          <Sparkles className="h-8 w-8 text-white" />
          <div className="text-left">
            <h1 className="text-2xl font-black uppercase tracking-wider text-white">
              Base Legal
            </h1>
            <p className="text-xs font-bold text-white/70">
              Leyes, regulaciones y enlaces gubernamentales
            </p>
          </div>
        </div>
        <p className="mt-3 text-sm font-bold text-[#3333FF]">
          {LAWS.length} enlaces · {categories.length} categorías
        </p>
      </div>

      {/* Category Grid */}
      <div className="grid auto-rows-fr grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((cat) => {
          const cfg = CATEGORY_CONFIG[cat];
          const count = categoryStats[cat] || 0;
          return (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategory(cat);
                setSearchQuery("");
              }}
              className="group flex flex-col items-center gap-3 rounded-xl border-4 border-[#000080] bg-[#0000FF] p-6 shadow-[6px_6px_0px_0px_rgba(0,0,128,1)] transition-all hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-[3px_3px_0px_0px_rgba(0,0,128,1)] active:translate-x-[6px] active:translate-y-[6px] active:shadow-none"
            >
              <span className="text-5xl drop-shadow-lg transition-transform group-hover:scale-110">
                {cfg.emoji}
              </span>
              <h2 className="text-center text-lg font-black uppercase tracking-wide text-white">
                {cat}
              </h2>
              <span className="rounded-lg bg-white/20 px-3 py-1 text-xs font-black text-white border-2 border-white/30">
                {count} {count === 1 ? "enlace" : "enlaces"}
              </span>
            </button>
          );
        })}
      </div>

      {/* Decorative footer */}
      <div className="flex justify-center gap-2">
        {["💎", "🔵", "🟦", "🔷", "💠"].map((e, i) => (
          <span key={i} className="text-xl opacity-40">
            {e}
          </span>
        ))}
      </div>
    </div>
  );

  /* ── Category View: law cards inside selected category ── */
  const CategoryView = () => {
    if (!selectedCategory) return null;
    const cfg = CATEGORY_CONFIG[selectedCategory];

    return (
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-wrap items-center gap-4">
          <button
            onClick={() => {
              setSelectedCategory(null);
              setSearchQuery("");
            }}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-black ${NB.btnSecondary}`}
          >
            <ArrowLeft size={16} /> Volver
          </button>
          <div className="flex items-center gap-3 rounded-xl border-4 border-[#000080] bg-[#0000FF] px-5 py-3 shadow-[6px_6px_0px_0px_rgba(0,0,128,1)]">
            <span className="text-3xl">{cfg.emoji}</span>
            <div>
              <h2 className="text-xl font-black uppercase text-white">
                {selectedCategory}
              </h2>
              <p className="text-xs font-bold text-white/70">
                {filteredLaws.length} de {categoryStats[selectedCategory] || 0}{" "}
                enlaces
              </p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[#0000FF]"
          />
          <input
            type="text"
            placeholder={`🔍 Buscar en ${selectedCategory}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border-2 border-[#000080] bg-white py-3 pl-12 pr-4 text-[#000080] placeholder-[#0000FF]/50 outline-none focus:border-[#0000FF] focus:shadow-[4px_4px_0px_0px_rgba(0,0,128,1)] transition-all"
          />
        </div>

        {/* Content */}
        {filteredLaws.length === 0 ? (
          <div className="rounded-xl border-4 border-dashed border-[#000080] bg-[#0000FF]/20 p-12 text-center">
            <span className="text-4xl">🕸️</span>
            <p className="mt-2 text-lg font-bold text-[#0000FF]">
              No se encontraron enlaces
            </p>
            <p className="text-sm text-[#0000FF]/60">
              Prueba con otra búsqueda
            </p>
          </div>
        ) : (
          <div className="grid auto-rows-fr grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredLaws.map((law) => (
              <LawCard key={law.id} law={law} />
            ))}
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
      {!selectedCategory ? <HomeView /> : <CategoryView />}

      {/* Footer */}
      <div className="text-right">
        <p className="text-xs font-bold text-slate-600">
          {filteredLaws.length} de {LAWS.length} enlaces
        </p>
      </div>
    </div>
  );
}
