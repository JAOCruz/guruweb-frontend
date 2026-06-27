import React, { useState, useEffect } from "react";
import { settingsAPI } from "../services/api";
import api from "../services/api";
import { Database, Play, CheckCircle, AlertCircle, Loader2, Info } from "lucide-react";
import {
  NeoCard,
  NeoCardHeader,
  NeoCardTitle,
  NeoCardDescription,
  NeoCardContent,
} from "../components/ui/neo/NeoCard";
import { NeoButton } from "../components/ui/neo/NeoButton";
import { NeoInput } from "../components/ui/neo/NeoInput";

const Settings: React.FC = () => {
  const [employeePercentage, setEmployeePercentage] = useState<number>(50);
  const [newPercentage, setNewPercentage] = useState<string>("50");
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Migrations state
  const [migrating, setMigrating] = useState(false);
  const [migrationResult, setMigrationResult] = useState<{
    ok?: boolean;
    message?: string;
    ran?: string[];
    skipped?: string[];
    error?: string;
  } | null>(null);

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

  const handleRunMigrations = async () => {
    if (!window.confirm("¿Ejecutar migraciones pendientes en la base de datos?")) return;
    setMigrating(true);
    setMigrationResult(null);
    try {
      const response = await api.post("/admin/run-migrations");
      setMigrationResult({
        ok: true,
        message: response.data.message,
        ran: response.data.ran,
        skipped: response.data.skipped,
      });
    } catch (err: any) {
      setMigrationResult({
        ok: false,
        error: err.response?.data?.error || err.message || "Error al ejecutar migraciones",
      });
    } finally {
      setMigrating(false);
    }
  };

  return (
    <NeoCard className="mx-auto max-w-4xl">
      <NeoCardHeader>
        <NeoCardTitle>Configuración del Sistema</NeoCardTitle>
        <NeoCardDescription>
          Administra la distribución de ganancias y herramientas del sistema.
        </NeoCardDescription>
      </NeoCardHeader>

      <NeoCardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 size={40} className="animate-spin text-main" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Current Settings Display */}
            <NeoCard variant="main">
              <NeoCardHeader>
                <NeoCardTitle className="text-main-foreground">
                  Distribución Actual de Ganancias
                </NeoCardTitle>
              </NeoCardHeader>
              <NeoCardContent>
                <div className="grid grid-cols-2 gap-4">
                  <NeoCard className="items-center text-center">
                    <p className="text-sm font-bold text-foreground/70">Empleados</p>
                    <p className="font-heading text-3xl font-black text-main">
                      {employeePercentage}%
                    </p>
                  </NeoCard>
                  <NeoCard className="items-center text-center">
                    <p className="text-sm font-bold text-foreground/70">Administración</p>
                    <p className="font-heading text-3xl font-black text-chart-2">
                      {100 - employeePercentage}%
                    </p>
                  </NeoCard>
                </div>
              </NeoCardContent>
            </NeoCard>

            {/* Update Form */}
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label
                  htmlFor="percentage"
                  className="mb-2 block text-base font-bold text-foreground"
                >
                  Nuevo Porcentaje para Empleados (0-100)
                </label>
                <NeoInput
                  type="number"
                  id="percentage"
                  value={newPercentage}
                  onChange={(e) => setNewPercentage(e.target.value)}
                  min="0"
                  max="100"
                  step="0.01"
                  disabled={saving}
                  required
                />
                <p className="mt-2 text-base text-foreground/70">
                  Administración recibirá: <span className="font-bold text-chart-2">{adminPercentage.toFixed(2)}%</span>
                </p>
              </div>

              {/* Start Date Picker */}
              <div>
                <label
                  htmlFor="startDate"
                  className="mb-2 block text-base font-bold text-foreground"
                >
                  Fecha de Inicio (Aplicar desde)
                </label>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <NeoInput
                    type="date"
                    id="startDate"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    disabled={saving}
                    required
                    className="sm:w-auto"
                  />
                  <div className="flex gap-2">
                    <NeoButton
                      type="button"
                      variant="neutral"
                      onClick={() => {
                        const today = new Date();
                        const dayOfWeek = today.getDay();
                        const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Sunday = 0
                        const monday = new Date(today);
                        monday.setDate(today.getDate() + diff);
                        setStartDate(monday.toISOString().split('T')[0]);
                      }}
                      className="flex-1 sm:flex-none"
                    >
                      Este Lunes
                    </NeoButton>
                    <NeoButton
                      type="button"
                      variant="neutral"
                      onClick={() => setStartDate(new Date().toISOString().split('T')[0])}
                      className="flex-1 sm:flex-none"
                    >
                      Hoy
                    </NeoButton>
                  </div>
                </div>
                <p className="mt-2 text-base text-chart-4">
                  ⚠️ Todos los servicios desde esta fecha usarán el nuevo porcentaje
                </p>
              </div>

              {/* Visual Preview */}
              <NeoCard variant="neutral">
                <p className="mb-3 text-base font-bold text-foreground">
                  Vista Previa de la Nueva Distribución:
                </p>
                <div className="flex h-12 overflow-hidden rounded-base border-2 border-border shadow-button">
                  <div
                    className="flex items-center justify-center bg-main text-base font-black text-main-foreground"
                    style={{ width: `${newPercentage}%` }}
                  >
                    {parseFloat(newPercentage) > 10 && `${newPercentage}%`}
                  </div>
                  <div
                    className="flex items-center justify-center bg-chart-2 text-base font-black text-white"
                    style={{ width: `${adminPercentage}%` }}
                  >
                    {adminPercentage > 10 && `${adminPercentage.toFixed(2)}%`}
                  </div>
                </div>
                <div className="mt-2 flex justify-between text-sm font-bold text-foreground/70">
                  <span>Empleados</span>
                  <span>Administración</span>
                </div>
              </NeoCard>

              {/* Error Message */}
              {error && (
                <NeoCard className="border-chart-4 bg-chart-4/10 text-chart-4">
                  <div className="flex items-center gap-2">
                    <AlertCircle size={18} />
                    <p className="text-base font-bold">{error}</p>
                  </div>
                </NeoCard>
              )}

              {/* Success Message */}
              {successMessage && (
                <NeoCard className="border-chart-5 bg-chart-5/10 text-chart-5">
                  <div className="flex items-center gap-2">
                    <CheckCircle size={18} />
                    <p className="text-base font-bold">{successMessage}</p>
                  </div>
                </NeoCard>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <NeoButton
                  type="submit"
                  disabled={
                    saving ||
                    parseFloat(newPercentage) === employeePercentage
                  }
                  className="flex-1"
                >
                  {saving ? "Guardando..." : "Guardar Cambios"}
                </NeoButton>
                <NeoButton
                  type="button"
                  variant="neutral"
                  onClick={() => setNewPercentage(employeePercentage.toString())}
                  disabled={saving}
                >
                  Resetear
                </NeoButton>
              </div>
            </form>

            {/* Admin Tools: Database Migrations */}
            <NeoCard variant="outline" className="border-chart-2">
              <NeoCardHeader>
                <NeoCardTitle className="flex items-center gap-2 text-chart-2">
                  <Database size={24} />
                  Herramientas de Administrador
                </NeoCardTitle>
              </NeoCardHeader>
              <NeoCardContent className="space-y-4">
                <p className="text-base text-foreground/80">
                  Ejecuta las migraciones pendientes de la base de datos. Esto crea las tablas necesarias para el bot de WhatsApp y el simulador.
                </p>
                <NeoButton
                  type="button"
                  onClick={handleRunMigrations}
                  disabled={migrating}
                  variant="neutral"
                >
                  {migrating ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Ejecutando migraciones...
                    </>
                  ) : (
                    <>
                      <Play size={18} />
                      Ejecutar Migraciones
                    </>
                  )}
                </NeoButton>

                {migrationResult && (
                  <NeoCard
                    className={
                      migrationResult.ok
                        ? "border-chart-5 bg-chart-5/10 text-chart-5"
                        : "border-chart-4 bg-chart-4/10 text-chart-4"
                    }
                  >
                    <div className="flex items-start gap-2">
                      {migrationResult.ok ? (
                        <CheckCircle size={18} className="mt-0.5 flex-shrink-0" />
                      ) : (
                        <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />
                      )}
                      <div className="text-base">
                        <p className="font-bold">
                          {migrationResult.ok ? migrationResult.message : "Error"}
                        </p>
                        {migrationResult.ok && migrationResult.ran && migrationResult.ran.length > 0 && (
                          <ul className="mt-1 list-disc pl-4">
                            {migrationResult.ran.map((file) => (
                              <li key={file}>{file}</li>
                            ))}
                          </ul>
                        )}
                        {migrationResult.ok && migrationResult.skipped && migrationResult.skipped.length > 0 && (
                          <p className="mt-2 text-sm opacity-80">
                            Omitidas (ya aplicadas): {migrationResult.skipped.join(", ")}
                          </p>
                        )}
                        {migrationResult.error && <p>{migrationResult.error}</p>}
                      </div>
                    </div>
                  </NeoCard>
                )}
              </NeoCardContent>
            </NeoCard>

            {/* Info Section */}
            <NeoCard variant="outline" className="border-chart-3">
              <NeoCardHeader>
                <NeoCardTitle className="flex items-center gap-2 text-chart-3">
                  <Info size={22} />
                  Información Importante
                </NeoCardTitle>
              </NeoCardHeader>
              <NeoCardContent>
                <ul className="ml-6 list-disc space-y-1 text-base text-foreground/80">
                  <li>Este cambio es <strong>retroactivo</strong> - afectará todos los servicios desde la fecha seleccionada</li>
                  <li>Puedes volver a cambiar el porcentaje más tarde y los servicios se recalcularán automáticamente</li>
                  <li>Ejemplo: Cambiar a 55% desde "Este Lunes" aplicará 55/45 a todos los servicios de esta semana</li>
                  <li>Solo el administrador puede modificar este porcentaje</li>
                </ul>
              </NeoCardContent>
            </NeoCard>
          </div>
        )}
      </NeoCardContent>
    </NeoCard>
  );
};

export default Settings;
