import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
        <Card className="relative gap-5 overflow-hidden bg-main p-6 text-main-foreground">
          <div className="absolute -right-4 -bottom-6 text-8xl font-black text-white/10 select-none">
            G
          </div>
          <CardHeader className="flex flex-col gap-2 p-0 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-base border-2 border-border bg-white text-3xl font-black text-main shadow-button">
              G
            </div>
            <CardTitle className="font-heading text-3xl leading-none md:text-4xl">
              Gurú Dashboard
            </CardTitle>
            <CardDescription className="text-lg text-main-foreground/80">
              Ingresa a tu panel de control
            </CardDescription>
          </CardHeader>

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
              <Input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Ingresa tu usuario"
                required
                className="h-14 border-2 border-border bg-white px-4 text-lg text-foreground placeholder:text-foreground/50 focus-visible:ring-foreground"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-black uppercase tracking-wider text-white/90">
                Contraseña
              </label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="h-14 border-2 border-border bg-white px-4 text-lg text-foreground placeholder:text-foreground/50 focus-visible:ring-foreground"
              />
            </div>

            <Button
              type="submit"
              variant="neutral"
              disabled={loading}
              className="h-14 w-full px-7 text-lg"
            >
              {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Login;
