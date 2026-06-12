import React, { useState, useMemo } from "react";
import { ExcelRow, USER_COLUMNS, WorkerKey } from "../../services/excelService";
import { servicesAPI } from "../../services/api";
import {
  Trash2,
  MessageCircle,
  Sparkles,


  Check,
  X,
  Loader2,
} from "lucide-react";
import { formatCurrency } from "../../utils";

// --- TIPOS ---
interface AdminDataTableProps {
  data: ExcelRow[];
  onSort: (column: string, direction: "asc" | "desc") => void;
  onServiceDeleted?: () => void;
  employeePercentage: number;
  isEmployeeView?: boolean; // Nuevo prop para controlar vista empleado
  currentEmployee?: string; // Nuevo prop para saber quién está logueado
}

interface UserServiceEntry {
  service: string;
  earnings: number;
  client: string;
  time: string;
  comment?: string;
  id?: number;
}

type GroupedUserData = Record<WorkerKey, UserServiceEntry[]>;

// API Key de Gemini - se configura en variables de entorno (VITE_GEMINI_API_KEY)
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";

const AdminDataTable: React.FC<AdminDataTableProps> = ({
  data,
  onServiceDeleted,
  employeePercentage,
  isEmployeeView = false,
  currentEmployee,
}) => {
  // --- ESTADOS ---
  const [activeUser, setActiveUser] = useState<WorkerKey | "all">(
    isEmployeeView && currentEmployee ? (currentEmployee as WorkerKey) : "all",
  );
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState<string>("");

  // Estados IA
  const [aiLoading, setAiLoading] = useState(false);
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiInsight, setAiInsight] = useState("");

  // --- TU LÓGICA DE DATOS ORIGINAL (INTACTA) ---
  const groupDataByUser = (): GroupedUserData => {
    const groupedData = USER_COLUMNS.reduce<GroupedUserData>((acc, user) => {
      acc[user] = [];
      return acc;
    }, {} as GroupedUserData);

    const findDetailValue = (
      currentIndex: number,
      detailType: string,
      user: WorkerKey,
    ) => {
      // Changed from [1, 2, 3, -1, -2, -3] to forward-only including 4 for "NOTA"
      const searchOffsets = [1, 2, 3, 4];
      for (const offset of searchOffsets) {
        const candidate = data[currentIndex + offset];
        if (candidate && candidate.DETALLE === detailType)
          return candidate[user];
      }
      return undefined;
    };

    const findServiceId = (
      currentIndex: number,
      user: WorkerKey,
    ): number | undefined => {
      const searchOffsets = [-3, -2, -1, 0, 1, 2, 3];
      const userIdKey = `${user}_id`;
      for (const offset of searchOffsets) {
        const candidate = data[currentIndex + offset];
        if (candidate && candidate.DETALLE === "SERVICIO" && candidate[user]) {
          if (candidate[userIdKey]) return Number(candidate[userIdKey]);
          if (candidate.id) return Number(candidate.id);
        }
      }
      return undefined;
    };

    data.forEach((row, index) => {
      if (row.DETALLE !== "SERVICIO") return;

      USER_COLUMNS.forEach((user) => {
        const serviceValue = row[user];
        if (!serviceValue) return;

        const earnings = Number(findDetailValue(index, "GANANCIA", user)) || 0;
        const clientValue = findDetailValue(index, "CLIENTE", user);
        const timeValue = findDetailValue(index, "HORA", user);
        const commentValue = findDetailValue(index, "NOTA", user);

        let serviceId = row[`${user}_id`]
          ? Number(row[`${user}_id`])
          : row.id
            ? Number(row.id)
            : findServiceId(index, user);

        groupedData[user].push({
          service: String(serviceValue),
          earnings,
          client: clientValue ? String(clientValue) : "",
          time: timeValue ? String(timeValue) : "",
          comment: commentValue ? String(commentValue) : "",
          id: serviceId,
        });
      });
    });
    return groupedData;
  };

  const groupedData = useMemo(() => groupDataByUser(), [data]);

  const calculateUserTotals = () => {
    const totals: any = {};
    USER_COLUMNS.forEach((user) => {
      const total = groupedData[user].reduce(
        (acc, s) => acc + (Number(s.earnings) || 0),
        0,
      );
      totals[user] = {
        total,
        adminShare: total * (1 - employeePercentage / 100),
        userShare: total * (employeePercentage / 100),
      };
    });
    return totals;
  };

  const userTotals = useMemo(
    () => calculateUserTotals(),
    [groupedData, employeePercentage],
  );

  const adminTotal = USER_COLUMNS.reduce(
    (acc, user) => acc + (userTotals[user]?.adminShare ?? 0),
    0,
  );

  // --- HANDLERS ---
  const handleDelete = async (serviceId: number | undefined) => {
    if (!serviceId) return;
    if (!window.confirm("¿Eliminar servicio?")) return;
    try {
      setDeletingId(serviceId);
      await servicesAPI.deleteService(serviceId);
      onServiceDeleted?.();
    } catch (error) {
      console.error(error);
      alert("Error al eliminar");
    } finally {
      setDeletingId(null);
    }
  };

  const handleEditComment = (id: string, current: string) => {
    setEditingCommentId(id);
    setCommentText(current);
  };

  const handleSaveComment = async (
    serviceId: number | undefined,
    userId: string,
    index: number,
  ) => {
    if (!serviceId) return;
    try {
      await servicesAPI.updateComment(serviceId, commentText);
      setEditingCommentId(null);
      onServiceDeleted?.();
    } catch (error) {
      console.error(error);
    }
  };

  // --- GEMINI AI HANDLER ---
  const handleGenerateInsights = async () => {
    setAiModalOpen(true);
    setAiLoading(true);
    setAiInsight("");

    // Preparar datos para el prompt
    const userToAnalyze =
      activeUser === "all" ? "Todos los usuarios" : activeUser;
    const statsText =
      activeUser === "all"
        ? `Total Global: ${adminTotal}`
        : `Usuario: ${activeUser}, Total: ${userTotals[activeUser].total}`;

    // Simplificar datos para enviar a IA (evitar payload gigante)
    const contextData =
      activeUser === "all"
        ? USER_COLUMNS.map((u) => ({
            user: u,
            total: userTotals[u].total,
            count: groupedData[u].length,
          }))
        : groupedData[activeUser].map((s) => ({ s: s.service, m: s.earnings }));

    const prompt = `
      Actúa como gerente de "Gurú Soluciones". Analiza estos datos del día:
      Contexto: ${userToAnalyze}. Estadísticas: ${statsText}.
      Detalle simplificado: ${JSON.stringify(contextData).slice(0, 1000)}...
      
      Dame 3 puntos clave muy breves (con emojis):
      1. Rendimiento general.
      2. Servicio destacado o empleado destacado.
      3. Una recomendación corta.
    `;

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
        },
      );
      const result = await response.json();
      setAiInsight(
        result.candidates?.[0]?.content?.parts?.[0]?.text ||
          "No se pudo generar análisis.",
      );
    } catch (e) {
      setAiInsight("Error conectando con la IA.");
    } finally {
      setAiLoading(false);
    }
  };

  // --- RENDER ---
  const usersToRender = activeUser === "all" ? USER_COLUMNS : [activeUser];

  return (
    <div className="animate-in fade-in space-y-6 duration-500">
      {/* 1. HEADER: Tabs y Botón IA */}
      <div className="flex flex-col items-center justify-between gap-4 rounded-xl border-4 border-[#000080] bg-[#0000FF] p-4 shadow-[6px_6px_0px_0px_rgba(0,0,128,1)] md:flex-row sm:p-5">
        {/* Tabs de Usuario */}
        {!isEmployeeView && (
          <div className="flex w-full flex-wrap gap-2 md:w-auto">
            <button
              onClick={() => setActiveUser("all")}
              className={`rounded-lg px-4 py-1.5 text-xs font-bold tracking-wide whitespace-nowrap uppercase transition-all ${
                activeUser === "all"
                  ? "border-2 border-white bg-[#000080] text-white shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)]"
                  : "border-2 border-transparent bg-[#000080]/40 text-white/70 hover:bg-[#000080]/60"
              }`}
            >
              Todos
            </button>
            {USER_COLUMNS.map((user) => (
              <button
                key={user}
                onClick={() => setActiveUser(user)}
                className={`rounded-lg px-4 py-1.5 text-xs font-bold tracking-wide whitespace-nowrap uppercase transition-all ${
                  activeUser === user
                    ? "bg-blue-600 text-white shadow-[0_0_10px_rgba(37,99,235,0.4)]"
                    : "bg-[#000080] text-white/80 hover:bg-[#000080]/60"
                }`}
              >
                {user}
              </button>
            ))}
          </div>
        )}

        {/* Botón IA */}
        <button
          onClick={handleGenerateInsights}
          className="flex items-center gap-2 rounded-xl border-4 border-[#000080] bg-[#0000FF] px-5 py-2.5 text-sm font-black text-white shadow-[6px_6px_0px_0px_rgba(0,0,128,1)] transition-all hover:-translate-y-0.5 hover:shadow-[8px_8px_0px_0px_rgba(0,0,128,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none"
        >
          <Sparkles size={16} />
          Insights IA
        </button>
      </div>

      {/* 2. TABLAS / LISTAS DE SERVICIOS */}
      {usersToRender.map((user) => (
        <div
          key={user}
          className="overflow-hidden rounded-xl border-4 border-[#000080] bg-[#0000FF] shadow-[6px_6px_0px_0px_rgba(0,0,128,1)]"
        >
          {/* Header de la Tabla */}
          <div className="flex flex-col gap-2 border-b-4 border-[#000080] bg-[#0000FF] p-3 sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:p-5">
            <h3 className="text-sm font-black uppercase tracking-wider text-white sm:text-base">
              {user}
            </h3>
            <div className="flex gap-3 font-mono text-xs sm:gap-4">
              <span className="font-bold tracking-widest text-white/80 uppercase">
                Total:{" "}
                <span className="text-white">
                  {formatCurrency(userTotals[user].total)}
                </span>
              </span>
              <span className="font-bold tracking-widest text-white/80 uppercase">
                Admin:{" "}
                <span className="text-white">
                  {formatCurrency(userTotals[user].adminShare)}
                </span>
              </span>
            </div>
          </div>

          {/* VISTA ESCRITORIO (Tabla) */}
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full text-left">
              <thead className="bg-[#000080] text-[10px] font-bold tracking-wider text-white/80 uppercase">
                <tr>
                  <th className="p-5">Hora</th>
                  <th className="p-5">Servicio / Cliente</th>
                  <th className="p-5">Ganancia</th>
                  <th className="p-5">Participación</th>
                  <th className="p-5">Nota</th>
                  <th className="p-5 text-center">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#000080]/40">
                {groupedData[user].length > 0 ? (
                  groupedData[user].map((item, idx) => {
                    const isEditing = editingCommentId === `${user}-${idx}`;
                    return (
                      <tr
                        key={`${user}-${idx}`}
                        className="transition-colors hover:bg-[#000080]/50"
                      >
                        <td className="p-5 font-mono text-xs text-white/80">
                          {item.time || "--:--"}
                        </td>
                        <td className="p-5">
                          <div className="text-sm font-bold text-white">
                            {item.service}
                          </div>
                          <div className="mt-1 text-xs text-white">
                            {item.client || "Cliente General"}
                          </div>
                        </td>
                        <td className="p-5 font-mono font-bold text-white">
                          {formatCurrency(item.earnings)}
                        </td>
                        <td className="p-5">
                          <div className="flex flex-col gap-1 font-mono">
                            <span className="text-[10px] font-bold tracking-widest text-white/60 uppercase">
                              Admin:{" "}
                              <span className="text-white">
                                {formatCurrency(
                                  item.earnings *
                                    (1 - employeePercentage / 100),
                                )}
                              </span>
                            </span>
                            <span className="text-[10px] font-bold tracking-widest text-white/60 uppercase">
                              User:{" "}
                              <span className="text-yellow-400">
                                {formatCurrency(
                                  item.earnings * (employeePercentage / 100),
                                )}
                              </span>
                            </span>
                          </div>
                        </td>
                        <td className="p-5">
                          {isEditing ? (
                            <div className="flex gap-2">
                              <input
                                autoFocus
                                className="w-full rounded-lg border border-slate-700 bg-[#000080] px-3 py-1.5 text-xs text-white focus:border-blue-500 focus:outline-none"
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                              />
                              <button
                                onClick={() =>
                                  handleSaveComment(item.id, user, idx)
                                }
                                className="rounded-lg bg-blue-600/20 p-1.5 text-white transition-all hover:bg-blue-600 hover:text-white"
                              >
                                <Check size={14} />
                              </button>
                              <button
                                onClick={() => setEditingCommentId(null)}
                                className="rounded-lg bg-red-600/20 p-1.5 text-red-400 transition-all hover:bg-red-600 hover:text-white"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          ) : (
                            <div
                              onClick={() =>
                                handleEditComment(
                                  `${user}-${idx}`,
                                  item.comment || "",
                                )
                              }
                              className="group/edit flex cursor-pointer items-center gap-2 text-xs text-white/80 transition-colors hover:text-white"
                            >
                              <span className="max-w-[150px] truncate italic">
                                {item.comment || "Agregar nota..."}
                              </span>
                            </div>
                          )}
                        </td>
                        <td className="p-5 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button className="rounded-lg bg-[#000080] p-2 text-white transition-colors hover:bg-[#000080]/60">
                              <MessageCircle size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(item.id)}
                              disabled={deletingId === item.id}
                              className="rounded-lg bg-[#000080] p-2 text-white/60 transition-all hover:bg-red-900/60 hover:text-red-300"
                            >
                              {deletingId === item.id ? (
                                <Loader2 className="animate-spin" size={16} />
                              ) : (
                                <Trash2 size={16} />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan={6}
                      className="p-8 text-center text-sm text-white/60 italic"
                    >
                      Sin servicios registrados hoy
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* VISTA MÓVIL (Tarjetas) */}
          <div className="divide-y divide-[#000080]/40 md:hidden">
            {groupedData[user].length > 0 ? (
              groupedData[user].map((item, idx) => (
                <div key={`${user}-m-${idx}`} className="bg-[#000080]/30 p-3">
                  {/* Row 1: Service name + earnings */}
                  <div className="mb-1 flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm leading-tight font-bold break-words text-white">
                        {item.service}
                      </p>
                      <p className="mt-0.5 text-xs text-white/60">
                        {item.client || "Cliente General"}
                      </p>
                    </div>
                    <span className="flex-shrink-0 text-base font-bold text-white">
                      {formatCurrency(item.earnings)}
                    </span>
                  </div>
                  {/* Row 2: Time, comment, delete */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5 font-mono text-xs text-white/60">
                      <span className="whitespace-nowrap">{item.time || "--:--"}</span>
                      {item.comment && (
                        <span className="truncate rounded bg-[#000080] px-1.5 py-0.5 text-white/90">
                          {item.comment}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => handleDelete(item.id)}
                      disabled={deletingId === item.id}
                      className="flex-shrink-0 rounded p-1 text-white/50 hover:text-red-300"
                    >
                      {deletingId === item.id ? (
                        <Loader2 className="animate-spin" size={16} />
                      ) : (
                        <Trash2 size={16} />
                      )}
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-sm text-white/60 italic">
                Sin servicios registrados hoy
              </div>
            )}
          </div>
        </div>
      ))}

      {/* MODAL IA */}
      {aiModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-slate-700 bg-[#000080]/30 p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-xl font-bold text-white">
                <Sparkles className="text-white" /> Análisis IA
              </h3>
              <button onClick={() => setAiModalOpen(false)}>
                <X className="text-white/80" />
              </button>
            </div>
            <div className="min-h-[150px] rounded-xl bg-[#000080]/50 p-4 leading-relaxed whitespace-pre-wrap text-white">
              {aiLoading ? (
                <div className="flex h-full flex-col items-center justify-center gap-3 text-white/60">
                  <Loader2 className="animate-spin text-blue-500" size={32} />
                  <p>Analizando transacciones...</p>
                </div>
              ) : (
                aiInsight
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDataTable;
