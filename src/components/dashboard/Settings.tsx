import React, { useState, useEffect } from "react";
import { settingsAPI } from "../../services/api";

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
      const response = await settingsAPI.getEmployeePercentage();
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
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Configuración del Sistema
      </h2>

      {loading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Current Settings Display */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">
              Distribución Actual de Ganancias
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-3 rounded shadow-sm">
                <p className="text-sm text-gray-600">Empleados</p>
                <p className="text-2xl font-bold text-blue-600">
                  {employeePercentage}%
                </p>
              </div>
              <div className="bg-white p-3 rounded shadow-sm">
                <p className="text-sm text-gray-600">Administración</p>
                <p className="text-2xl font-bold text-green-600">
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
                className="block text-sm font-medium text-gray-700 mb-2"
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={saving}
                required
              />
              <p className="mt-2 text-sm text-gray-500">
                Administración recibirá: {adminPercentage.toFixed(2)}%
              </p>
            </div>

            {/* Start Date Picker */}
            <div>
              <label
                htmlFor="startDate"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Fecha de Inicio (Aplicar desde)
              </label>
              <div className="flex gap-2">
                <input
                  type="date"
                  id="startDate"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={saving}
                  required
                />
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
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm"
                >
                  Este Lunes
                </button>
                <button
                  type="button"
                  onClick={() => setStartDate(new Date().toISOString().split('T')[0])}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm"
                >
                  Hoy
                </button>
              </div>
              <p className="mt-2 text-sm text-gray-500">
                ⚠️ Todos los servicios desde esta fecha usarán el nuevo porcentaje
              </p>
            </div>

            {/* Visual Preview */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm font-medium text-gray-700 mb-2">
                Vista Previa de la Nueva Distribución:
              </p>
              <div className="flex h-8 rounded-lg overflow-hidden shadow-sm">
                <div
                  className="bg-blue-500 flex items-center justify-center text-white text-xs font-semibold"
                  style={{ width: `${newPercentage}%` }}
                >
                  {parseFloat(newPercentage) > 10 && `${newPercentage}%`}
                </div>
                <div
                  className="bg-green-500 flex items-center justify-center text-white text-xs font-semibold"
                  style={{ width: `${adminPercentage}%` }}
                >
                  {adminPercentage > 10 && `${adminPercentage.toFixed(2)}%`}
                </div>
              </div>
              <div className="flex justify-between mt-2 text-xs text-gray-600">
                <span>Empleados</span>
                <span>Administración</span>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {/* Success Message */}
            {successMessage && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
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
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {saving ? "Guardando..." : "Guardar Cambios"}
              </button>
              <button
                type="button"
                onClick={() => setNewPercentage(employeePercentage.toString())}
                disabled={saving}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
              >
                Resetear
              </button>
            </div>
          </form>

          {/* Info Section */}
          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
            <h4 className="font-semibold text-yellow-900 mb-2 flex items-center gap-2">
              <svg
                className="w-5 h-5"
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
            <ul className="text-sm text-yellow-800 space-y-1 ml-7">
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
