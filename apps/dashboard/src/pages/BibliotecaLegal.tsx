import { useCallback, useEffect, useState } from "react";
import { Plus, Pencil, Search, ExternalLink, EyeOff, Eye } from "lucide-react";
import { NeoButton } from "@guru/ui";
import Modal, { fieldCls, labelCls } from "../components/users/Modal";
import { useAuth } from "../context/AuthContext";
import { legalAPI, type LegalLaw, type LegalSearch, type LegalTopic, type LegalTopicFields } from "../services/api";

// Biblioteca legal: lo que el bot puede citar en sus micro asesorías. Las leyes vienen de fuentes públicas (por
// artículo); los temas y las instituciones los escribe el equipo. Todos leen y prueban la búsqueda; el admin escribe.
type Tab = "tema" | "institucion" | "leyes";
const TABS: { key: Tab; label: string; emoji: string }[] = [
  { key: "tema", label: "Temas", emoji: "💡" },
  { key: "institucion", label: "Instituciones", emoji: "🏛️" },
  { key: "leyes", label: "Leyes", emoji: "⚖️" },
];
const card = "rounded-base border-2 border-border bg-background shadow-shadow";

export default function BibliotecaLegal() {
  const { isAdmin } = useAuth();
  const [tab, setTab] = useState<Tab>("tema");
  const [topics, setTopics] = useState<LegalTopic[]>([]);
  const [laws, setLaws] = useState<LegalLaw[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<LegalTopic | "new" | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const [t, l] = await Promise.all([legalAPI.topics(), legalAPI.laws()]);
      setTopics(t.data.topics);
      setLaws(l.data.laws);
    } catch (err: any) {
      setError(err?.response?.data?.error || "No se pudo cargar la biblioteca");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const toggle = async (t: LegalTopic) => {
    try {
      await legalAPI.updateTopic(t.id, { active: !t.active });
      await load();
    } catch (err: any) {
      setError(err?.response?.data?.error || "No se pudo cambiar el tema");
    }
  };

  const list = topics.filter((t) => t.kind === tab);

  return (
    <div className="mx-auto max-w-5xl space-y-6 md:p-4">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-heading text-4xl font-black tracking-tight md:text-5xl">Biblioteca legal</h2>
          <p className="max-w-2xl text-sm font-medium text-foreground/70">
            Lo que el bot puede citar cuando explica un trámite: artículos de las leyes cargadas y los temas que escriben
            ustedes. Si algo no está aquí, el bot no lo cita.
          </p>
        </div>
        {isAdmin && tab !== "leyes" && (
          <NeoButton onClick={() => setEditing("new")}>
            <Plus size={16} /> {tab === "tema" ? "Nuevo tema" : "Nueva institución"}
          </NeoButton>
        )}
      </div>

      <SearchBox />

      <div role="tablist" className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            role="tab"
            aria-selected={tab === t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 rounded-base border-2 border-border px-3 py-2 text-sm font-bold transition-all ${
              tab === t.key ? "bg-main text-main-foreground shadow-shadow" : "bg-background hover:-translate-y-0.5"
            }`}
          >
            <span aria-hidden="true">{t.emoji}</span> {t.label}
            <span className="rounded-full border-2 border-current px-2 text-xs">
              {t.key === "leyes" ? laws.length : topics.filter((x) => x.kind === t.key).length}
            </span>
          </button>
        ))}
      </div>

      {error && <p role="alert" className="font-semibold text-red-600">{error}</p>}

      {loading ? (
        <p className="text-foreground/60">Cargando…</p>
      ) : tab === "leyes" ? (
        <div className="grid grid-cols-[minmax(0,1fr)] gap-3 md:grid-cols-2">
          {laws.length === 0 && <p className="text-foreground/60">Aún no hay leyes cargadas (Configuración → Ejecutar migraciones).</p>}
          {laws.map((l) => (
            <article key={l.code} className={`${card} min-w-0 space-y-1 p-4`}>
              <p className="font-heading text-lg font-black">{l.short}</p>
              <p className="text-sm text-foreground/70">{l.title}</p>
              <p className="text-xs text-foreground/60">
                {l.article_count} artículos · bajada el {l.fetched_at ? String(l.fetched_at).slice(0, 10) : "—"} ·{" "}
                {l.source_url ? (
                  <a className="underline" href={l.source_url} target="_blank" rel="noreferrer">
                    {l.source_name || "Fuente"}
                  </a>
                ) : (
                  l.source_name
                )}
              </p>
            </article>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {list.length === 0 && <p className="text-foreground/60">No hay nada aquí todavía.</p>}
          {list.map((t) => (
            <article key={t.id} className={`${card} min-w-0 space-y-2 p-4 ${t.active ? "" : "opacity-50"}`}>
              <header className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-heading text-lg font-black">{t.title}</p>
                  {!t.active && <p className="text-xs font-bold text-red-600">Desactivado: el bot no lo usa</p>}
                </div>
                {isAdmin && (
                  <div className="flex shrink-0 gap-2">
                    <button
                      type="button"
                      onClick={() => setEditing(t)}
                      className="rounded-base border-2 border-border p-1.5 hover:-translate-y-0.5"
                      aria-label="Editar"
                      title="Editar"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => toggle(t)}
                      className="rounded-base border-2 border-border p-1.5 hover:-translate-y-0.5"
                      aria-label={t.active ? "Desactivar" : "Activar"}
                      title={t.active ? "Desactivar" : "Activar"}
                    >
                      {t.active ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                )}
              </header>
              <p className="whitespace-pre-line text-sm">{t.body}</p>
              {t.legal_basis && <p className="text-sm font-semibold">⚖️ {t.legal_basis}</p>}
              {t.url && (
                <a className="inline-flex items-center gap-1 text-sm underline" href={t.url} target="_blank" rel="noreferrer">
                  <ExternalLink size={14} /> {t.url}
                </a>
              )}
            </article>
          ))}
        </div>
      )}

      {editing && (
        <TopicForm
          topic={editing === "new" ? null : editing}
          kind={tab === "institucion" ? "institucion" : "tema"}
          onClose={() => setEditing(null)}
          onSaved={async () => {
            setEditing(null);
            await load();
          }}
        />
      )}
    </div>
  );
}

function SearchBox() {
  const [q, setQ] = useState("");
  const [result, setResult] = useState<LegalSearch | null>(null);
  const [busy, setBusy] = useState(false);

  const run = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!q.trim()) return;
    setBusy(true);
    try {
      const { data } = await legalAPI.search(q.trim());
      setResult(data);
    } catch {
      setResult({ temas: [], articulos: [], error: "No se pudo buscar" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className={`${card} space-y-3 p-4`}>
      <form onSubmit={run} className="flex flex-wrap items-end gap-2">
        <label className={`${labelCls} min-w-[14rem] flex-1`}>
          Probar: ¿qué encontraría el bot?
          <input className={fieldCls} placeholder="Ej.: presunción de ausencia, duplicado de título…" value={q} onChange={(e) => setQ(e.target.value)} />
        </label>
        <NeoButton type="submit" disabled={busy}>
          <Search size={16} /> Buscar
        </NeoButton>
      </form>
      {result && (
        <div className="space-y-2 text-sm">
          {result.error && <p className="text-red-600">{result.error}</p>}
          {result.nota && <p className="text-foreground/70">{result.nota}</p>}
          {result.temas.map((t, i) => (
            <p key={`t${i}`}>
              {t.tipo === "institucion" ? "🏛️" : "💡"} <b>{t.titulo}</b>
              {t.base_legal ? ` — ${t.base_legal}` : ""}
            </p>
          ))}
          {result.articulos.map((a, i) => (
            <details key={`a${i}`} className="rounded-base border-2 border-border p-2">
              <summary className="cursor-pointer font-semibold">
                {a.ley}, art. {a.articulo}
              </summary>
              <p className="mt-1 whitespace-pre-line">{a.texto}</p>
            </details>
          ))}
        </div>
      )}
    </section>
  );
}

const FIELDS: { key: keyof LegalTopicFields; label: string; area?: boolean; hint?: string }[] = [
  { key: "title", label: "Título" },
  { key: "body", label: "Explicación (lo que el bot le dice al cliente)", area: true },
  { key: "legal_basis", label: "Base legal (ley y artículos)", hint: "Ej.: Código Civil, arts. 112 al 143" },
  { key: "keywords", label: "Palabras con que lo buscan los clientes", hint: "Ej.: desaparecido ausencia cobrar salario" },
  { key: "url", label: "Enlace (opcional)" },
];

function TopicForm({ topic, kind, onClose, onSaved }: { topic: LegalTopic | null; kind: "tema" | "institucion"; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState<LegalTopicFields>(() =>
    Object.fromEntries(FIELDS.map((f) => [f.key, (topic?.[f.key] as string | null | undefined) ?? ""])),
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!String(form.title || "").trim()) return setError("Falta el título");
    if (!String(form.body || "").trim()) return setError("Falta la explicación");
    setSaving(true);
    setError(null);
    try {
      if (topic) await legalAPI.updateTopic(topic.id, form);
      else await legalAPI.createTopic({ ...form, kind });
      onSaved();
    } catch (err: any) {
      setError(err?.response?.data?.error || "No se pudo guardar");
    } finally {
      setSaving(false);
    }
  };

  const noun = (topic?.kind ?? kind) === "institucion" ? "institución" : "tema";
  return (
    <Modal title={topic ? `Editar ${noun}` : `Nuevo ${noun}`} onClose={onClose}>
      <form onSubmit={save} className="space-y-3">
        {FIELDS.map((f) => (
          <label key={f.key} className={labelCls}>
            {f.label}
            {f.area ? (
              <textarea rows={6} className={fieldCls} value={String(form[f.key] ?? "")} onChange={(e) => setForm((v) => ({ ...v, [f.key]: e.target.value }))} />
            ) : (
              <input className={fieldCls} placeholder={f.hint} value={String(form[f.key] ?? "")} onChange={(e) => setForm((v) => ({ ...v, [f.key]: e.target.value }))} />
            )}
          </label>
        ))}
        <p className="text-xs text-foreground/60">
          El bot cita la base legal tal cual. Escriba solo leyes y artículos que haya revisado.
        </p>
        {error && <p role="alert" className="text-sm font-semibold text-red-600">{error}</p>}
        <div className="flex justify-end gap-2 pt-2">
          <NeoButton type="button" variant="neutral" onClick={onClose}>
            Cancelar
          </NeoButton>
          <NeoButton type="submit" disabled={saving}>
            {saving ? "Guardando…" : "Guardar"}
          </NeoButton>
        </div>
      </form>
    </Modal>
  );
}
