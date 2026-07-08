import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authAPI } from "../services/api";
import LoadingScreen from "../components/LoadingScreen";

type UserRole = "admin" | "employee" | "auxiliar_i" | "auxiliar_ii";

interface User {
  id: number;
  username: string;
  role: UserRole;
  dataColumn: string | null;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Try to load user via HttpOnly cookie (no localStorage needed)
    loadUser();
  }, []);

  const loadUser = async (retries = 2) => {
    setLoading(true);
    try {
      const response = await authAPI.getCurrentUser();
      setUser(response.data.user || response.data);
    } catch (error: any) {
      const status = error.response?.status;
      console.log("[AuthContext] loadUser failed — status:", status, "message:", error.message, "retries left:", retries);
      // Only clear token on 401 (unauthorized). Other errors (500, timeout,
      // network blip) should NOT wipe the session — the user might just be
      // offline or Railway is restarting.
      if (status === 401) {
        localStorage.removeItem("token");
        setUser(null);
      } else if (retries > 0 && !error.response) {
        // Network error: retry after 1.5s (Railway cold-start, etc.)
        console.log("[AuthContext] Retrying loadUser in 1.5s...");
        setTimeout(() => loadUser(retries - 1), 1500);
        return; // Keep loading=true while retrying
      }
      // For 500s or final retry failure, stay logged out visually
      // but DON'T wipe the token so a refresh might recover.
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (username: string, password: string) => {
    try {
      const response = await authAPI.login(username, password);
      const { token, user } = response.data;

      // Backend sets HttpOnly cookie automatically.
      // We keep localStorage as a temporary fallback for backward-compat.
      if (token) localStorage.setItem("token", token);
      setUser(user);
      navigate("/dashboard");
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Login failed");
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout(); // Backend clears HttpOnly cookie
    } catch (err) {
      // Ignore — always clear local state
    }
    localStorage.removeItem("token");
    setUser(null);
    navigate("/login");
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAdmin: user?.role === "admin",
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  return <>{children}</>;
};
