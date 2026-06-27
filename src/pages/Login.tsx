import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import {
  NeoCard,
  NeoCardHeader,
  NeoCardTitle,
  NeoCardDescription,
} from "../components/ui/neo/NeoCard";
import { NeoInput } from "../components/ui/neo/NeoInput";
import { NeoButton } from "../components/ui/neo/NeoButton";
import { Sun, Moon } from "lucide-react";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background px-4">
      <button
        onClick={toggleTheme}
        className="absolute top-4 right-4 rounded-base border-2 border-border bg-secondary-background p-2 text-foreground shadow-button transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
        title={theme === "light" ? "Modo oscuro" : "Modo claro"}
      >
        {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
      </button>
      <div className="w-full max-w-md">
        <NeoCard variant="main" className="relative overflow-hidden">
          <div className="absolute -right-4 -bottom-6 text-8xl font-black text-white/10 select-none">
            G
          </div>
          <NeoCardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-base border-2 border-border bg-white text-3xl font-black text-main shadow-button">
              G
            </div>
            <NeoCardTitle className="text-3xl md:text-4xl">Gurú Dashboard</NeoCardTitle>
            <NeoCardDescription className="text-lg">
              Ingresa a tu panel de control
            </NeoCardDescription>
          </NeoCardHeader>

          {error && (
            <div className="rounded-base border-2 border-red-600 bg-red-50 p-4 text-center text-base font-bold text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-black uppercase tracking-wider text-white/90">
                Usuario
              </label>
              <NeoInput
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Ingresa tu usuario"
                required
                className="h-14 text-lg"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-black uppercase tracking-wider text-white/90">
                Contraseña
              </label>
              <NeoInput
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="h-14 text-lg"
              />
            </div>

            <NeoButton
              type="submit"
              variant="neutral"
              disabled={loading}
              className="w-full text-lg"
            >
              {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
            </NeoButton>
          </form>
        </NeoCard>
      </div>
    </div>
  );
};

export default Login;
