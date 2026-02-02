import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  LayoutDashboard,
  PieChart,
  Settings,
  LogOut,
  Menu,
  ChevronRight,
  User,
} from "lucide-react"; // Asegúrate de tener lucide-react instalado

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { user, logout, isAdmin } = useAuth();
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex min-h-screen bg-slate-950 font-sans text-slate-200 selection:bg-blue-500/30">
      {/* SIDEBAR */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r border-slate-800 bg-slate-900 transition-all duration-300 ${
          isSidebarOpen ? "w-64" : "w-20"
        }`}
      >
        {/* Logo */}
        <div className="flex h-16 items-center border-b border-slate-800 px-6">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600">
            <span className="font-bold text-white">G</span>
          </div>
          <span
            className={`ml-3 text-lg font-bold text-white transition-opacity duration-300 ${!isSidebarOpen && "hidden opacity-0"}`}
          >
            Gurú<span className="text-blue-500">Admin</span>
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-2 px-3 py-6">
          <NavItem
            to="/dashboard"
            icon={<LayoutDashboard size={20} />}
            label="Dashboard"
            isOpen={isSidebarOpen}
          />
          <NavItem
            to="/dashboard/charts"
            icon={<PieChart size={20} />}
            label="Gráficos"
            isOpen={isSidebarOpen}
          />
          {isAdmin && (
            <NavItem
              to="/dashboard/settings"
              icon={<Settings size={20} />}
              label="Configuración"
              isOpen={isSidebarOpen}
            />
          )}
        </nav>

        {/* User Footer */}
        <div className="border-t border-slate-800 p-4">
          <div
            className={`flex items-center gap-3 rounded-xl bg-slate-800/50 p-2 transition-all ${!isSidebarOpen && "justify-center"}`}
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-500/20 font-bold text-blue-400">
              {user?.username?.charAt(0).toUpperCase() || "U"}
            </div>
            {isSidebarOpen && (
              <div className="min-w-0 overflow-hidden">
                <p className="truncate text-sm font-medium text-white">
                  {user?.username}
                </p>
                <button
                  onClick={logout}
                  className="flex items-center gap-1 text-xs text-slate-400 transition-colors hover:text-red-400"
                >
                  <LogOut size={12} /> Cerrar sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div
        className={`flex min-h-screen flex-1 flex-col transition-all duration-300 ${
          isSidebarOpen ? "ml-64" : "ml-20"
        }`}
      >
        {/* Top Header */}
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-slate-800 bg-slate-900/80 px-6 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!isSidebarOpen)}
              className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-800"
            >
              <Menu size={20} />
            </button>
            <h2 className="flex items-center gap-2 text-sm font-medium text-slate-400">
              <span className="text-slate-500">Panel</span>
              <ChevronRight size={14} />
              <span className="text-slate-200">
                {isAdmin ? "Administración" : "Empleado"}
              </span>
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <span className="rounded-md border border-blue-500/20 bg-blue-500/10 px-2 py-1 text-xs font-medium text-blue-400">
              {user?.dataColumn || "General"}
            </span>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 overflow-x-hidden p-6">{children}</main>
      </div>
    </div>
  );
};

// Helper Component for Links
const NavItem = ({ to, icon, label, isOpen }: any) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex items-center gap-3 rounded-xl px-3 py-3 transition-all duration-200 ${
        isActive
          ? "border border-blue-600/20 bg-blue-600/10 text-blue-400 shadow-sm"
          : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
      } ${!isOpen && "justify-center px-2"} `
    }
  >
    {icon}
    {isOpen && <span className="text-sm font-medium">{label}</span>}
  </NavLink>
);

export default DashboardLayout;
