import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { servicesAPI } from "../../services/api";

interface Service {
  id: number;
  service_name: string;
  client: string | null;
  time: string | null;
  earnings: number;
  date: string;
  comment?: string | null;
}

interface EmployeeDataTableProps {
  services: Service[];
}

const EmployeeDataTable: React.FC<EmployeeDataTableProps> = ({ services }) => {
  const { user } = useAuth();
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [commentText, setCommentText] = useState<string>("");
  const [localServices, setLocalServices] = useState<Service[]>(services);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Update local services when props change
  React.useEffect(() => {
    setLocalServices(services);
  }, [services]);

  // Get display name from user context
  const displayName = user?.dataColumn || user?.username || "Usuario";

  const handleEditComment = (service: Service) => {
    setEditingCommentId(service.id);
    setCommentText(service.comment || "");
  };

  const handleSaveComment = async (serviceId: number) => {
    try {
      await servicesAPI.updateComment(serviceId, commentText);
      // Update local state
      setLocalServices(
        localServices.map((s) =>
          s.id === serviceId ? { ...s, comment: commentText } : s,
        ),
      );
      setEditingCommentId(null);
      setCommentText("");
    } catch (error) {
      console.error("Error updating comment:", error);
      alert("Error al guardar el comentario");
    }
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setCommentText("");
  };

  const handleDelete = async (serviceId: number) => {
    if (!window.confirm("¿Estás seguro de que quieres eliminar este servicio?")) {
      return;
    }

    try {
      setDeletingId(serviceId);
      await servicesAPI.deleteService(serviceId);
      // Update local state
      setLocalServices(localServices.filter((s) => s.id !== serviceId));
    } catch (error) {
      console.error("Error deleting service:", error);
      alert("Error al eliminar el servicio");
    } finally {
      setDeletingId(null);
    }
  };

  // Calculate totals
  const total = localServices.reduce(
    (acc, service) => acc + Number(service.earnings),
    0,
  );
  const userShare = total * 0.5;

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <div className="perspective-container rounded-lg border border-blue-700 bg-blue-900/20 p-6">
        <h3 className="metallic-3d-text mb-4 text-2xl font-semibold">
          Resumen de {displayName}
        </h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-lg border border-gray-700 bg-gray-800/80 p-4">
            <p className="text-sm text-gray-400">Total Ganado</p>
            <p className="text-2xl font-bold text-white">{total.toFixed(2)}</p>
          </div>
          <div className="rounded-lg border border-green-700 bg-green-900/20 p-4">
            <p className="text-sm text-gray-400">Tu Parte (50%)</p>
            <p className="text-2xl font-bold text-green-400">
              {userShare.toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {/* Services Table */}
      <div className="rounded-2xl border border-blue-900/30 bg-gray-900/70 shadow-lg backdrop-blur-md">
        <div className="border-b border-blue-900/30 bg-gray-950/80 px-6 py-4">
          <h3 className="metallic-3d-text text-2xl font-semibold tracking-[0.25em] uppercase">
            {displayName}
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full table-fixed divide-y divide-gray-800 text-base">
            <thead className="bg-gray-950/70">
              <tr>
                <th className="w-[20%] px-6 py-4 text-left text-sm font-semibold tracking-[0.2em] text-blue-300 uppercase">
                  Servicio
                </th>
                <th className="w-[15%] px-6 py-4 text-left text-sm font-semibold tracking-[0.2em] text-blue-300 uppercase">
                  Cliente
                </th>
                <th className="w-[10%] px-6 py-4 text-left text-sm font-semibold tracking-[0.2em] text-blue-300 uppercase">
                  Hora
                </th>
                <th className="w-[13%] px-6 py-4 text-left text-sm font-semibold tracking-[0.2em] text-blue-300 uppercase">
                  Ganancia
                </th>
                <th className="w-[30%] px-6 py-4 text-left text-sm font-semibold tracking-[0.2em] text-blue-300 uppercase">
                  Nota
                </th>
                <th className="w-[12%] px-6 py-4 text-left text-sm font-semibold tracking-[0.2em] text-blue-300 uppercase">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50 bg-gray-900/40">
              {localServices.length > 0 ? (
                localServices.map((service) => (
                  <tr key={service.id} className="hover:bg-blue-900/10">
                    <td
                      className="w-[20%] truncate px-6 py-4 text-base text-gray-200"
                      title={service.service_name}
                    >
                      {service.service_name}
                    </td>
                    <td
                      className="w-[15%] truncate px-6 py-4 text-base text-gray-200"
                      title={service.client || "—"}
                    >
                      {service.client || "—"}
                    </td>
                    <td className="w-[10%] px-6 py-4 text-base whitespace-nowrap text-gray-200">
                      {service.time || "—"}
                    </td>
                    <td className="w-[13%] px-6 py-4 text-base font-semibold whitespace-nowrap text-blue-200">
                      {Number(service.earnings).toFixed(2)}
                    </td>
                    <td className="w-[30%] px-6 py-4 text-base text-gray-200">
                      {editingCommentId === service.id ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            className="flex-1 rounded border border-gray-600 bg-gray-800 px-2 py-1 text-sm text-gray-200 focus:border-blue-500 focus:outline-none"
                            placeholder="Agregar nota..."
                            autoFocus
                          />
                          <button
                            onClick={() => handleSaveComment(service.id)}
                            className="rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700"
                          >
                            Guardar
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="rounded bg-gray-600 px-3 py-1 text-sm text-white hover:bg-gray-700"
                          >
                            Cancelar
                          </button>
                        </div>
                      ) : (
                        <div
                          className="cursor-pointer truncate hover:text-blue-300"
                          onClick={() => handleEditComment(service)}
                          title={service.comment || "Click para agregar nota"}
                        >
                          {service.comment || (
                            <span className="text-gray-500 italic">
                              Agregar nota...
                            </span>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="w-[12%] px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleDelete(service.id)}
                        disabled={deletingId === service.id}
                        className="rounded border border-red-900/30 bg-red-500/20 px-3 py-1 text-sm text-red-300 hover:bg-red-500/30 disabled:opacity-50"
                      >
                        {deletingId === service.id ? "Eliminando..." : "Eliminar"}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-4 text-center text-base text-gray-400"
                  >
                    No hay servicios registrados
                  </td>
                </tr>
              )}
              {/* Total row */}
              <tr className="bg-gray-900/80">
                <td
                  className="metallic-3d-text px-6 py-4 text-base font-bold tracking-[0.2em] whitespace-nowrap"
                  colSpan={3}
                >
                  TOTAL
                </td>
                <td className="metallic-3d-text px-6 py-4 text-base font-bold tracking-[0.2em] whitespace-nowrap text-blue-200">
                  {total.toFixed(2)}
                </td>
                <td></td>
                <td></td>
              </tr>

              <tr className="bg-gray-900/50">
                <td
                  className="px-6 py-4 text-base whitespace-nowrap text-gray-300"
                  colSpan={3}
                >
                  {displayName} (50%)
                </td>
                <td className="px-6 py-4 text-base font-semibold whitespace-nowrap text-yellow-400">
                  {userShare.toFixed(2)}
                </td>
                <td></td>
                <td></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDataTable;
