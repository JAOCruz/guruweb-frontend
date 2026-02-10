import React, { useState, useEffect } from "react";
import { settingsAPI } from "../services/api";

const Settings: React.FC = () => {
  const [employeePercentage, setEmployeePercentage] = useState<number>(50);
  const [newPercentage, setNewPercentage] = useState<string>("50");
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchEmployeePercentage();
  }, []);

  const fetchEmployeePercentage = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await settingsAPI.getCurrentPercentage();
      const percentage = response.data.percentage;
      setEmployeePercentage(percentage);
      setNewPercentage(percentage.toString());
    } catch (err: any) {
      setError(err.response?.data?.error || "Error al cargar la configuración");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setSaving(true);

    const percentageValue = parseFloat(newPercentage);

    if (isNaN(percentageValue) || percentageValue < 0 || percentageValue > 100) {
      setError("El porcentaje debe estar entre 0 y 100");
      setSaving(false);
      return;
    }

    try {
      await settingsAPI.updateEmployeePercentage(percentageValue, startDate);
      setEmployeePercentage(percentageValue);
      setSuccessMessage("Porcentaje actualizado exitosamente desde " + new Date(startDate).toLocaleDateString('es-ES'));

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || "Error al actualizar el porcentaje");
    } finally {
      setSaving(false);
    }
  };

  const adminPercentage = 100 - parseFloat(newPercentage || "0");

  return (
    <div className="mx-auto max-w-4xl rounded-2xl border border-slate-700 bg-slate-900 p-8 shadow-xl">
      <h2 className="mb-8 text-3xl font-bold text-white">
        Configuración del Sistema
      </h2>

      {loading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Current Settings Display */}
          <div className="rounded-xl border border-blue-500/20 bg-blue-900/20 p-6">
            <h3 className="mb-4 text-lg font-semibold text-blue-300">
              Distribución Actual de Ganancias
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg border border-slate-600 bg-slate-800 p-4 shadow-sm">
                <p className="text-sm text-slate-400">Empleados</p>
                <p className="text-3xl font-bold text-blue-400">
                  {employeePercentage}%
                </p>
              </div>
              <div className="rounded-lg border border-slate-600 bg-slate-800 p-4 shadow-sm">
                <p className="text-sm text-slate-400">Administración</p>
                <p className="text-3xl font-bold text-emerald-400">
                  {100 - employeePercentage}%
                </p>
              </div>
            </div>
          </div>

          {/* Update Form */}
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label
                htmlFor="percentage"
                className="mb-2 block text-sm font-medium text-slate-300"
              >
                Nuevo Porcentaje para Empleados (0-100)
              </label>
              <input
                type="number"
                id="percentage"
                value={newPercentage}
                onChange={(e) => setNewPercentage(e.target.value)}
                min="0"
                max="100"
                step="0.01"
                className="w-full rounded-lg border border-slate-600 bg-slate-800 px-4 py-3 text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                disabled={saving}
                required
              />
              <p className="mt-2 text-sm text-slate-400">
                Administración recibirá: {adminPercentage.toFixed(2)}%
              </p>
            </div>

            {/* Start Date Picker */}
            <div>
              <label
                htmlFor="startDate"
                className="mb-2 block text-sm font-medium text-slate-300"
              >
                Fecha de Inicio (Aplicar desde)
              </label>
              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  type="date"
                  id="startDate"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full flex-1 rounded-lg border border-slate-600 bg-slate-800 px-4 py-3 text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 sm:w-auto"
                  disabled={saving}
                  required
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const today = new Date();
                      const dayOfWeek = today.getDay();
                      const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Sunday = 0
                      const monday = new Date(today);
                      monday.setDate(today.getDate() + diff);
                      setStartDate(monday.toISOString().split('T')[0]);
                    }}
                    className="flex-1 whitespace-nowrap rounded-lg bg-slate-700 px-4 py-3 text-sm text-slate-300 hover:bg-slate-600 sm:flex-none"
                  >
                    Este Lunes
                  </button>
                  <button
                    type="button"
                    onClick={() => setStartDate(new Date().toISOString().split('T')[0])}
                    className="flex-1 whitespace-nowrap rounded-lg bg-slate-700 px-4 py-3 text-sm text-slate-300 hover:bg-slate-600 sm:flex-none"
                  >
                    Hoy
                  </button>
                </div>
              </div>
              <p className="mt-2 text-sm text-yellow-400">
                ⚠️ Todos los servicios desde esta fecha usarán el nuevo porcentaje
              </p>
            </div>

            {/* Visual Preview */}
            <div className="rounded-xl border border-slate-600 bg-slate-800 p-4">
              <p className="mb-3 text-sm font-medium text-slate-300">
                Vista Previa de la Nueva Distribución:
              </p>
              <div className="flex h-10 overflow-hidden rounded-lg shadow-sm">
                <div
                  className="flex items-center justify-center bg-blue-500 text-xs font-semibold text-white"
                  style={{ width: `${newPercentage}%` }}
                >
                  {parseFloat(newPercentage) > 10 && `${newPercentage}%`}
                </div>
                <div
                  className="flex items-center justify-center bg-emerald-500 text-xs font-semibold text-white"
                  style={{ width: `${adminPercentage}%` }}
                >
                  {adminPercentage > 10 && `${adminPercentage.toFixed(2)}%`}
                </div>
              </div>
              <div className="mt-2 flex justify-between text-xs text-slate-400">
                <span>Empleados</span>
                <span>Administración</span>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="rounded-lg border border-red-500/50 bg-red-900/20 px-4 py-3 text-red-400">
                {error}
              </div>
            )}

            {/* Success Message */}
            {successMessage && (
              <div className="rounded-lg border border-emerald-500/50 bg-emerald-900/20 px-4 py-3 text-emerald-400">
                {successMessage}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={
                  saving ||
                  parseFloat(newPercentage) === employeePercentage
                }
                className="flex-1 rounded-lg bg-blue-600 px-4 py-3 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-600 disabled:text-slate-400"
              >
                {saving ? "Guardando..." : "Guardar Cambios"}
              </button>
              <button
                type="button"
                onClick={() => setNewPercentage(employeePercentage.toString())}
                disabled={saving}
                className="rounded-lg border border-slate-600 bg-slate-700 px-4 py-3 text-slate-300 hover:bg-slate-600 disabled:cursor-not-allowed disabled:bg-slate-800 disabled:text-slate-500"
              >
                Resetear
              </button>
            </div>
          </form>

          {/* Info Section */}
          <div className="rounded-xl border border-yellow-500/30 bg-yellow-900/10 p-4">
            <h4 className="mb-2 flex items-center gap-2 font-semibold text-yellow-400">
              <svg
                className="h-5 w-5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
              Información Importante
            </h4>
            <ul className="ml-7 space-y-1 text-sm text-yellow-200/80">
              <li>• Este cambio es <strong>retroactivo</strong> - afectará todos los servicios desde la fecha seleccionada</li>
              <li>• Puedes volver a cambiar el porcentaje más tarde y los servicios se recalcularán automáticamente</li>
              <li>• Ejemplo: Cambiar a 55% desde "Este Lunes" aplicará 55/45 a todos los servicios de esta semana</li>
              <li>• Solo el administrador puede modificar este porcentaje</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
