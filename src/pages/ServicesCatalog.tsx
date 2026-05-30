import { useState, useEffect, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Search, Plus, Pencil, Trash2, X, Save, ChevronDown, ChevronUp,
  DollarSign, Layers, AlertTriangle, Package, ArrowLeft, Sparkles,
} from "lucide-react";
import { serviceCatalogAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";

interface PriceTier { min: number; max: number | null; label: string; price: number; }
interface Service {
  id: number; name: string; description: string | null;
  category_id: number | null; category_name: string | null;
  digitacion_price: string | number | null;
  notarizacion_price: string | number | null;
  price_tiers: PriceTier[] | null;
  unit_type: string | null; active: boolean;
}
interface Category { id: number; name: string; }

const DEFAULT_TIER: PriceTier = { min: 0, max: null, label: "", price: 0 };

/* ── 3 Big Groups ── */
const GROUP_MAP: Record<string, string[]> = {
  "Papelería o Consumibles": ["Papelería", "Consumibles"],
  Digitación: [
    "Redactar o digitar un documento", "Creación De Un Correo",
    "Modificación de un Documento", "Revisión de contrato",
    "Scanner de documentos", "Notarización",
    "Solicitud de Certificaciones", "Redactar y Certificar una Traducción",
    "Impresión", "Fotos 2x2", "Legalización",
    "Corrección de Documento", "Máquina de escribir",
  ],
  Mensajería: ["Mensajería", "Compra de Impuestos"],
};

const GROUP_EMOJIS: Record<string, string> = {
  "Papelería o Consumibles": "📦",
  Digitación: "⌨️",
  Mensajería: "📨",
};

const CATEGORY_EMOJIS: Record<string, string> = {
  Papelería: "📄", Consumibles: "🍽️", Impresión: "🖨️",
  "Modificación de un Documento": "✏️",
  "Redactar o digitar un documento": "⌨️",
  Notarización: "✍️",
  "Redactar y Certificar una Traducción": "🌐",
  "Solicitud de Certificaciones": "📜",
  "Scanner de documentos": "📠",
  "Fotos 2x2": "📷",
  "Creación De Un Correo": "📧",
  "Compra de Impuestos": "💰",
  Mensajería: "📨", Legalización: "⚖️",
  "Revisión de contrato": "🔍",
  "Corrección de Documento": "📝",
  "Máquina de escribir": "⌨️",
};

const getCategoryEmoji = (name: string | null) =>
  name ? CATEGORY_EMOJIS[name] || "⭐" : "📋";

/* ── Style helpers ── */
const NB = {
  card: "border-2 border-slate-700 bg-slate-900 shadow-[4px_4px_0px_0px_rgba(30,41,59,1)] transition-all hover:shadow-[2px_2px_0px_0px_rgba(30,41,59,1)] hover:translate-x-[2px] hover:translate-y-[2px]",
  btnBlue: "border-2 border-[#000080] bg-[#0000FF] text-white shadow-[4px_4px_0px_0px_rgba(0,0,128,1)] transition-all hover:shadow-[2px_2px_0px_0px_rgba(0,0,128,1)] hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-none active:translate-x-[4px] active:translate-y-[4px]",
  btnSecondary: "border-2 border-slate-700 bg-slate-800 text-slate-300 shadow-[3px_3px_0px_0px_rgba(30,41,59,1)] transition-all hover:shadow-[1px_1px_0px_0px_rgba(30,41,59,1)] hover:translate-x-[1px] hover:translate-y-[1px] active:shadow-none",
  input: "w-full rounded-xl border-2 border-slate-700 bg-slate-800 px-4 py-2.5 text-sm text-white placeholder-slate-600 outline-none focus:border-[#0000FF] focus:shadow-[3px_3px_0px_0px_rgba(0,0,128,1)] transition-all",
  chipActive: "border-2 border-[#000080] bg-[#0000FF] text-white shadow-[3px_3px_0px_0px_rgba(0,0,128,1)]",
  chipInactive: "border-2 border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-500 hover:text-slate-200",
};

const fmtMoney = (v: string | number | null) => {
  const n = Number(v) || 0;
  return `RD$ ${n.toLocaleString("es-DO")}`;
};
const hasNota = (svc: Service) => {
  const n = Number(svc.notarizacion_price);
  return !isNaN(n) && n > 0;
};
const hasTiers = (svc: Service) =>
  Array.isArray(svc.price_tiers) && svc.price_tiers.length > 0;

export default function ServicesCatalog() {
  const { isAdmin } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [selectedSubcat, setSelectedSubcat] = useState<string>("all");
  const [expandedTiers, setExpandedTiers] = useState<Set<number>>(new Set());

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [form, setForm] = useState<Partial<Service> & { price_tiers: PriceTier[] }>({
    name: "", description: "", category_id: null,
    digitacion_price: 0, notarizacion_price: 0, price_tiers: [], unit_type: "por documento",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [svcRes, catRes] = await Promise.all([
        serviceCatalogAPI.getAll(), serviceCatalogAPI.getCategories(),
      ]);
      setServices(svcRes.data.services || []);
      setCategories(catRes.data.categories || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const servicesByGroup = useMemo(() => {
    const map: Record<string, Service[]> = {};
    Object.keys(GROUP_MAP).forEach((g) => (map[g] = []));
    services.forEach((s) => {
      const cat = s.category_name || "Sin categoría";
      for (const [group, members] of Object.entries(GROUP_MAP)) {
        if (members.includes(cat)) { map[group].push(s); break; }
      }
    });
    return map;
  }, [services]);

  const groupStats = useMemo(() => {
    const stats: Record<string, { count: number; min: number; max: number; hasNota: boolean; hasTiers: boolean; subcats: string[] }> = {};
    Object.entries(servicesByGroup).forEach(([group, svcs]) => {
      const prices = svcs.map((s) => Number(s.digitacion_price) || 0);
      const subcats = Array.from(new Set(svcs.map((s) => s.category_name).filter(Boolean)));
      stats[group] = {
        count: svcs.length, min: prices.length ? Math.min(...prices) : 0, max: prices.length ? Math.max(...prices) : 0,
        hasNota: svcs.some(hasNota), hasTiers: svcs.some(hasTiers), subcats,
      };
    });
    return stats;
  }, [servicesByGroup]);

  const filteredServices = useMemo(() => {
    if (!selectedGroup) return [];
    let result = servicesByGroup[selectedGroup] || [];
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((s) => s.name.toLowerCase().includes(q) || (s.description || "").toLowerCase().includes(q));
    }
    if (selectedSubcat !== "all") result = result.filter((s) => s.category_name === selectedSubcat);
    return [...result].sort((a, b) => (a.category_name || "").localeCompare(b.category_name || ""));
  }, [servicesByGroup, selectedGroup, search, selectedSubcat]);

  const servicesBySubcat = useMemo(() => {
    const map: Record<string, Service[]> = {};
    filteredServices.forEach((s) => {
      const c = s.category_name || "Sin categoría";
      if (!map[c]) map[c] = []; map[c].push(s);
    });
    return map;
  }, [filteredServices]);

  const openCreate = () => {
    setEditingService(null);
    setForm({ name: "", description: "", category_id: categories[0]?.id || null, digitacion_price: 0, notarizacion_price: 0, price_tiers: [], unit_type: "por documento" });
    setShowModal(true);
  };
  const openEdit = (svc: Service) => {
    setEditingService(svc);
    setForm({
      name: svc.name, description: svc.description || "", category_id: svc.category_id,
      digitacion_price: Number(svc.digitacion_price) || 0, notarizacion_price: Number(svc.notarizacion_price) || 0,
      price_tiers: Array.isArray(svc.price_tiers) ? svc.price_tiers.map((t) => ({ min: Number(t.min) || 0, max: t.max === null || t.max === undefined ? null : Number(t.max), label: t.label || "", price: Number(t.price) || 0 })) : [],
      unit_type: svc.unit_type || "por documento",
    });
    setShowModal(true);
  };
  const handleSave = async () => {
    if (!form.name || form.digitacion_price === undefined) { alert("Nombre y precio son requeridos."); return; }
    try {
      setSaving(true);
      const payload = { ...form, digitacion_price: Number(form.digitacion_price), notarizacion_price: Number(form.notarizacion_price) || 0, price_tiers: form.price_tiers.map((t) => ({ min: Number(t.min), max: t.max === null || t.max === undefined ? null : Number(t.max), label: t.label, price: Number(t.price) })) };
      if (editingService) await serviceCatalogAPI.update(editingService.id, payload); else await serviceCatalogAPI.create(payload);
      await fetchData(); setShowModal(false);
    } catch (err: any) { alert(err.response?.data?.error || "Error guardando."); }
    finally { setSaving(false); }
  };
  const handleDelete = async (id: number) => { if (!confirm("¿Eliminar?")) return; try { await serviceCatalogAPI.delete(id); await fetchData(); } catch { alert("Error eliminando."); } };
  const addTier = () => setForm((p) => ({ ...p, price_tiers: [...(p.price_tiers || []), { ...DEFAULT_TIER }] }));
  const removeTier = (idx: number) => setForm((p) => ({ ...p, price_tiers: (p.price_tiers || []).filter((_, i) => i !== idx) }));
  const updateTier = (idx: number, field: keyof PriceTier, value: any) => setForm((p) => { const tiers = [...(p.price_tiers || [])]; tiers[idx] = { ...tiers[idx], [field]: value }; return { ...p, price_tiers: tiers }; });
  const toggleTiers = (id: number) => setExpandedTiers((p) => { const n = new Set(p); if (n.has(id)) n.delete(id); else n.add(id); return n; });

  if (!isAdmin) return (
    <div className="flex flex-col items-center justify-center py-20 text-[#0000FF]">
      <AlertTriangle size={48} className="mb-4 text-[#0000FF]" />
      <p className="text-lg font-black">Acceso restringido</p>
    </div>
  );

  /* ── Service Card ── */
  const ServiceCard = ({ svc, idx }: { svc: Service; idx: number }) => {
    const showNota = hasNota(svc);
    const showTiers = hasTiers(svc);
    const tiersOpen = expandedTiers.has(svc.id);
    return (
      <motion.div
        key={svc.id}
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ delay: idx * 0.03 }}
        className="flex flex-col overflow-hidden rounded-xl border-4 border-[#000080] bg-[#0000FF] p-5 shadow-[6px_6px_0px_0px_rgba(0,0,128,1)] transition-all hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-[3px_3px_0px_0px_rgba(0,0,128,1)] active:translate-x-[6px] active:translate-y-[6px] active:shadow-none"
      >
        <div className="mb-2 flex items-start justify-between gap-2">
          <h3 className="text-base font-black leading-tight text-white">{svc.name}</h3>
          {svc.category_name && selectedSubcat === "all" && (
            <span className="shrink-0 rounded-lg border-2 border-[#000080] bg-white px-2 py-0.5 text-[10px] font-black text-[#0000FF] whitespace-nowrap shadow-[2px_2px_0px_0px_rgba(0,0,128,1)]">
              {getCategoryEmoji(svc.category_name)} {svc.category_name}
            </span>
          )}
        </div>
        {svc.description && <p className="mb-3 text-xs text-white/70 line-clamp-2">{svc.description}</p>}

        {showNota ? (
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl border-2 border-[#000080] bg-white p-3 text-center shadow-[3px_3px_0px_0px_rgba(0,0,128,1)]">
              <p className="text-[10px] font-black uppercase tracking-wider text-[#0000FF]">Digitación</p>
              <p className="mt-1 text-lg font-black text-[#000080]">{fmtMoney(svc.digitacion_price)}</p>
            </div>
            <div className="rounded-xl border-2 border-[#000080] bg-white p-3 text-center shadow-[3px_3px_0px_0px_rgba(0,0,128,1)]">
              <p className="text-[10px] font-black uppercase tracking-wider text-[#0000FF]">Notarización</p>
              <p className="mt-1 text-lg font-black text-[#000080]">{fmtMoney(svc.notarizacion_price)}</p>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border-2 border-[#000080] bg-white p-3 text-center shadow-[3px_3px_0px_0px_rgba(0,0,128,1)]">
            <p className="text-[10px] font-black uppercase tracking-wider text-[#0000FF]">Precio</p>
            <p className="mt-1 text-xl font-black text-[#000080]">{fmtMoney(svc.digitacion_price)}</p>
          </div>
        )}

        {showTiers && (
          <button onClick={() => toggleTiers(svc.id)} className="mt-3 flex items-center gap-2 self-start rounded-lg border-2 border-[#000080] bg-white px-3 py-1.5 text-xs font-black text-[#0000FF] shadow-[2px_2px_0px_0px_rgba(0,0,128,1)] hover:bg-white/90">
            <Layers size={14} /> {svc.price_tiers!.length} rangos {tiersOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        )}

        <AnimatePresence>
          {tiersOpen && showTiers && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
              <div className="mt-3 space-y-2 rounded-xl border-2 border-[#000080] bg-white p-3 shadow-[3px_3px_0px_0px_rgba(0,0,128,1)]">
                {svc.price_tiers!.map((t, i) => (
                  <div key={i} className="flex items-center justify-between rounded-lg border-2 border-[#000080] bg-[#0000FF] px-3 py-2 shadow-[2px_2px_0px_0px_rgba(0,0,128,1)]">
                    <div className="flex flex-col">
                      <span className="text-xs font-black text-white">{t.label || `Rango ${i + 1}`}</span>
                      <span className="text-[10px] text-white/70">{t.min.toLocaleString("es-DO")} — {t.max === null || t.max === undefined ? "∞" : t.max.toLocaleString("es-DO")}</span>
                    </div>
                    <span className="text-sm font-black text-white">RD$ {t.price.toLocaleString("es-DO")}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex-1" />
        <div className="mt-4 flex items-center justify-end gap-2 border-t-2 border-white/30 pt-3">
          <button onClick={() => openEdit(svc)} className="flex items-center gap-2 rounded-lg border-2 border-[#000080] bg-white px-3 py-2 text-xs font-black text-[#0000FF] shadow-[2px_2px_0px_0px_rgba(0,0,128,1)] hover:bg-white/90"><Pencil size={14} /> Editar</button>
          <button onClick={() => handleDelete(svc.id)} className="flex items-center gap-2 rounded-lg border-2 border-[#000080] bg-white px-3 py-2 text-xs font-black text-red-500 shadow-[2px_2px_0px_0px_rgba(0,0,128,1)] hover:bg-white/90"><Trash2 size={14} /> Eliminar</button>
        </div>
      </motion.div>
    );
  };

  /* ═══════════════════════════════════════════════════════════════
     HOME VIEW
     ═══════════════════════════════════════════════════════════════ */
  const HomeView = () => (
    <div className="flex flex-col gap-8">
      <div className="text-center">
        <div className="inline-flex items-center gap-3 rounded-xl border-2 border-[#000080] bg-[#0000FF] px-6 py-3 shadow-[6px_6px_0px_0px_rgba(0,0,128,1)]">
          <Sparkles className="h-8 w-8 text-white" />
          <div className="text-left">
            <h1 className="text-2xl font-black uppercase tracking-wider text-white">Catálogo de Precios</h1>
            <p className="text-xs font-bold text-white/70">Servicios y tarifas</p>
          </div>
        </div>
        <p className="mt-3 text-sm font-bold text-[#3333FF]">{services.length} servicios · 3 categorías</p>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {Object.keys(GROUP_MAP).map((group) => {
          const stats = groupStats[group];
          return (
            <button key={group} onClick={() => { setSelectedGroup(group); setSelectedSubcat("all"); setSearch(""); }} className="group flex flex-col items-center gap-4 rounded-xl border-4 border-[#000080] bg-[#0000FF] p-8 shadow-[6px_6px_0px_0px_rgba(0,0,128,1)] transition-all hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-[3px_3px_0px_0px_rgba(0,0,128,1)] active:translate-x-[6px] active:translate-y-[6px] active:shadow-none">
              <span className="text-6xl drop-shadow-lg transition-transform group-hover:scale-110">{GROUP_EMOJIS[group]}</span>
              <h2 className="text-center text-xl font-black uppercase tracking-wide text-white">{group}</h2>
              <div className="flex flex-wrap justify-center gap-1">
                {stats?.subcats.slice(0, 4).map((sub) => (
                  <span key={sub} className="rounded bg-white/20 px-2 py-0.5 text-[10px] font-black text-white border border-white/30">{getCategoryEmoji(sub)} {sub}</span>
                ))}
                {(stats?.subcats.length || 0) > 4 && <span className="rounded bg-white/10 px-2 py-0.5 text-[10px] font-black text-white/70">+{(stats?.subcats.length || 0) - 4}</span>}
              </div>
              <div className="flex gap-2">
                <span className="rounded-lg bg-white/20 px-3 py-1 text-xs font-black text-white border-2 border-white/30">{stats?.count || 0} servicios</span>
                {stats?.hasNota && <span className="rounded-lg bg-white/20 px-3 py-1 text-xs font-black text-white border-2 border-white/30">✍️ Nota</span>}
              </div>
              {stats && stats.count > 0 && <p className="text-xs font-bold text-white/60">{fmtMoney(stats.min)} — {fmtMoney(stats.max)}</p>}
            </button>
          );
        })}
      </div>
      <div className="flex justify-center gap-2">
        {["💎", "🔵", "🟦", "🔷", "💠"].map((e, i) => <span key={i} className="text-xl opacity-40">{e}</span>)}
      </div>
    </div>
  );

  /* ═══════════════════════════════════════════════════════════════
     GROUP VIEW
     ═══════════════════════════════════════════════════════════════ */
  const GroupView = () => {
    if (!selectedGroup) return null;
    const stats = groupStats[selectedGroup];
    const subcatKeys = Object.keys(servicesBySubcat).sort();

    return (
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-wrap items-center gap-4">
          <button onClick={() => { setSelectedGroup(null); setSelectedSubcat("all"); }} className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-black ${NB.btnSecondary}`}>
            <ArrowLeft size={16} /> Volver
          </button>
          <div className="flex items-center gap-3 rounded-xl border-4 border-[#000080] bg-[#0000FF] px-5 py-3 shadow-[6px_6px_0px_0px_rgba(0,0,128,1)]">
            <span className="text-3xl">{GROUP_EMOJIS[selectedGroup]}</span>
            <div>
              <h2 className="text-xl font-black uppercase text-white">{selectedGroup}</h2>
              <p className="text-xs font-bold text-white/70">{filteredServices.length} de {stats?.count || 0} servicios</p>
            </div>
          </div>
          <button onClick={openCreate} className={`ml-auto flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-black uppercase ${NB.btnBlue}`}><Plus size={18} /> Nuevo</button>
        </div>

        {/* Sub-category chips */}
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setSelectedSubcat("all")} className={`rounded-lg px-3 py-1.5 text-xs font-black uppercase transition-all ${selectedSubcat === "all" ? NB.chipActive : NB.chipInactive}`}>🗂️ Todos</button>
          {stats?.subcats.map((sub) => (
            <button key={sub} onClick={() => setSelectedSubcat((p) => (p === sub ? "all" : sub))} className={`rounded-lg px-3 py-1.5 text-xs font-black uppercase transition-all ${selectedSubcat === sub ? NB.chipActive : NB.chipInactive}`}>
              {getCategoryEmoji(sub)} {sub}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#0000FF]" />
          <input type="text" placeholder={`🔍 Buscar en ${selectedGroup}...`} value={search} onChange={(e) => setSearch(e.target.value)} className="w-full rounded-xl border-2 border-[#000080] bg-white py-3 pl-12 pr-4 text-[#000080] placeholder-[#0000FF]/50 outline-none focus:border-[#0000FF] focus:shadow-[4px_4px_0px_0px_rgba(0,0,128,1)] transition-all" />
        </div>

        {/* Services */}
        {filteredServices.length === 0 ? (
          <div className="rounded-xl border-4 border-dashed border-[#000080] bg-[#0000FF]/20 p-12 text-center">
            <span className="text-4xl">🕸️</span>
            <p className="mt-2 text-lg font-bold text-[#0000FF]">No hay servicios aquí</p>
            <p className="text-sm text-[#0000FF]/60">Prueba con otra búsqueda o subcategoría</p>
          </div>
        ) : selectedSubcat !== "all" ? (
          /* Single sub-category — flat grid */
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            <AnimatePresence>{filteredServices.map((svc, idx) => <ServiceCard key={svc.id} svc={svc} idx={idx} />)}</AnimatePresence>
          </div>
        ) : (
          /* "All" — grouped by sub-category with section headers */
          <div className="flex flex-col gap-8">
            {subcatKeys.map((subcat) => (
              <div key={subcat} className="flex flex-col gap-3">
                {/* Section header */}
                <div className="flex items-center gap-3">
                  <div className="h-1 flex-1 bg-[#0000FF]" />
                  <button onClick={() => setSelectedSubcat(subcat)} className="flex items-center gap-2 rounded-lg border-2 border-[#000080] bg-[#0000FF] px-4 py-2 text-sm font-black text-white shadow-[3px_3px_0px_0px_rgba(0,0,128,1)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,128,1)]">
                    <span className="text-lg">{getCategoryEmoji(subcat)}</span> {subcat}
                    <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs">{servicesBySubcat[subcat].length}</span>
                  </button>
                  <div className="h-1 flex-1 bg-[#0000FF]" />
                </div>
                {/* Cards */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                  <AnimatePresence>{servicesBySubcat[subcat].map((svc, idx) => <ServiceCard key={svc.id} svc={svc} idx={idx} />)}</AnimatePresence>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  /* ═══════════════════════════════════════════════════════════════
     MODAL
     ═══════════════════════════════════════════════════════════════ */
  const Modal = () => {
    if (!showModal) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
        <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border-4 border-[#0000AA] bg-[#0b1120] p-6 shadow-[8px_8px_0px_0px_rgba(0,0,128,1)]">
          <div className="mb-6 flex items-center justify-between border-b-2 border-[#000080]/50 pb-4">
            <h3 className="text-xl font-black text-white">{editingService ? "✏️ Editar Servicio" : "➕ Nuevo Servicio"}</h3>
            <button onClick={() => setShowModal(false)} className="rounded-lg border-2 border-slate-700 bg-slate-800 p-2 text-slate-400 hover:border-slate-500 hover:text-white shadow-[2px_2px_0px_0px_rgba(30,41,59,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]"><X size={20} /></button>
          </div>
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-black uppercase tracking-wider text-slate-500">Nombre del servicio *</label>
              <input type="text" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} className={NB.input} placeholder="Ej: Acto de Venta - Bien Inmueble" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-black uppercase tracking-wider text-slate-500">Categoría</label>
              <select value={form.category_id || ""} onChange={(e) => setForm((p) => ({ ...p, category_id: e.target.value ? Number(e.target.value) : null }))} className={NB.input}>
                <option value="">Sin categoría</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{getCategoryEmoji(c.name)} {c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-black uppercase tracking-wider text-slate-500">Descripción</label>
              <textarea value={form.description || ""} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} className={NB.input} rows={2} placeholder="Descripción opcional..." />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className="mb-1 block text-xs font-black uppercase tracking-wider text-slate-500">Precio / Digitación (RD$) *</label>
                <div className="relative">
                  <DollarSign size={14} className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-500" />
                  <input type="number" min={0} value={form.digitacion_price} onChange={(e) => setForm((p) => ({ ...p, digitacion_price: Number(e.target.value) }))} className={`${NB.input} pl-9`} />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-black uppercase tracking-wider text-slate-500">Notarización (RD$)</label>
                <div className="relative">
                  <DollarSign size={14} className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-500" />
                  <input type="number" min={0} value={form.notarizacion_price} onChange={(e) => setForm((p) => ({ ...p, notarizacion_price: Number(e.target.value) }))} className={`${NB.input} pl-9`} />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-black uppercase tracking-wider text-slate-500">Unidad</label>
                <div className="relative">
                  <Package size={14} className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-500" />
                  <input type="text" value={form.unit_type || ""} onChange={(e) => setForm((p) => ({ ...p, unit_type: e.target.value }))} className={`${NB.input} pl-9`} placeholder="por documento" />
                </div>
              </div>
            </div>
            <div className="rounded-xl border-2 border-slate-700 bg-slate-800/20 p-4">
              <div className="mb-3 flex items-center justify-between">
                <label className="text-xs font-black uppercase tracking-wider text-slate-500">Rangos de precio (por valor del bien)</label>
                <button onClick={addTier} className="flex items-center gap-1 rounded-lg border border-purple-800 bg-purple-950/20 px-3 py-1.5 text-xs font-black text-purple-400 hover:bg-purple-950/30"><Plus size={14} /> Agregar rango</button>
              </div>
              {(form.price_tiers || []).length === 0 ? <p className="text-xs text-slate-500">Sin rangos. El precio será fijo.</p> : (
                <div className="space-y-3">
                  {(form.price_tiers || []).map((tier, idx) => (
                    <div key={idx} className="grid grid-cols-1 gap-2 rounded-lg border-2 border-slate-700/50 bg-slate-800/30 p-3 sm:grid-cols-5">
                      <input type="text" placeholder="Etiqueta" value={tier.label} onChange={(e) => updateTier(idx, "label", e.target.value)} className="rounded-lg border-2 border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white outline-none focus:border-purple-500 focus:shadow-[2px_2px_0px_0px_rgba(88,28,135,1)] transition-all sm:col-span-2" />
                      <input type="number" placeholder="Mín" value={tier.min} onChange={(e) => updateTier(idx, "min", Number(e.target.value))} className="rounded-lg border-2 border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white outline-none focus:border-purple-500 focus:shadow-[2px_2px_0px_0px_rgba(88,28,135,1)] transition-all" />
                      <input type="number" placeholder="Máx (vacío = ∞)" value={tier.max === null || tier.max === undefined ? "" : tier.max} onChange={(e) => { const val = e.target.value; updateTier(idx, "max", val === "" ? null : Number(val)); }} className="rounded-lg border-2 border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white outline-none focus:border-purple-500 focus:shadow-[2px_2px_0px_0px_rgba(88,28,135,1)] transition-all" />
                      <div className="flex items-center gap-2">
                        <input type="number" placeholder="Precio" value={tier.price} onChange={(e) => updateTier(idx, "price", Number(e.target.value))} className="flex-1 rounded-lg border-2 border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white outline-none focus:border-purple-500 focus:shadow-[2px_2px_0px_0px_rgba(88,28,135,1)] transition-all" />
                        <button onClick={() => removeTier(idx)} className="rounded-lg border border-slate-700 p-2 text-slate-400 hover:border-red-800 hover:text-red-400"><Trash2 size={14} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="mt-6 flex items-center justify-end gap-3 border-t-2 border-[#000080]/50 pt-4">
            <button onClick={() => setShowModal(false)} className="rounded-xl border-2 border-slate-600 bg-slate-800 px-5 py-2.5 text-sm font-black text-slate-300 hover:bg-slate-700 hover:text-white">Cancelar</button>
            <button onClick={handleSave} disabled={saving} className={`flex items-center gap-2 rounded-xl border-2 border-[#000080] bg-[#0000CC] px-5 py-2.5 text-sm font-black text-white shadow-[4px_4px_0px_0px_rgba(0,0,128,1)] transition-all hover:shadow-[2px_2px_0px_0px_rgba(0,0,128,1)] hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-none active:translate-x-[4px] active:translate-y-[4px] disabled:opacity-50`}><Save size={16} /> {saving ? "Guardando..." : "Guardar"}</button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="custom-scroll flex h-full flex-col gap-6 overflow-y-auto p-6">
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-[#0000FF]">
          <div className="mb-4 h-10 w-10 animate-spin rounded-full border-4 border-[#000080] border-t-[#0000FF]" />
          <p className="text-lg font-black">Cargando precios...</p>
        </div>
      ) : selectedGroup ? <GroupView /> : <HomeView />}
      <Modal />
    </div>
  );
}
