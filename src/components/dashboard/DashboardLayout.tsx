import React, { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  Menu,
  X,
  LayoutDashboard,
  Database,
  BarChart3,
  BookOpen,
  LogOut,
} from "lucide-react";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { user, logout, isAdmin } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const location = useLocation();

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Close sidebar on route change on mobile
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [location, isMobile]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex min-h-screen overflow-x-hidden bg-[#0B1120] font-sans text-slate-200 selection:bg-blue-500/30">
      {/* INJECT FONTS & GLOBAL DASHBOARD STYLES */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Space+Grotesk:wght@300;400;500;600;700&display=swap');
        
        .dashboard-body { font-family: 'Outfit', sans-serif; }
        .font-display { font-family: 'Space Grotesk', sans-serif; }
        
        /* Subtle Grid Pattern */
        .bg-cyber-grid {
          background-size: 50px 50px;
          background-image: 
            linear-gradient(to right, rgba(59, 130, 246, 0.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(59, 130, 246, 0.05) 1px, transparent 1px);
        }
      `}</style>

      {/* BACKGROUND ELEMENTS */}
      <div className="bg-cyber-grid pointer-events-none fixed inset-0 z-0" />
      <div className="fixed top-0 left-0 z-50 h-1 w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 shadow-[0_0_20px_rgba(59,130,246,0.5)]" />

      {/* Mobile Overlay Backdrop */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-md transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`fixed top-0 left-0 z-40 flex h-full flex-col border-r border-slate-800 bg-[#0F172A] transition-all duration-300 ease-in-out ${
          isMobile
            ? sidebarOpen
              ? "w-64 translate-x-0"
              : "w-64 -translate-x-full"
            : sidebarOpen
              ? "w-64"
              : "w-20"
        }`}
      >
        <div className="flex h-16 items-center justify-between p-6">
          {sidebarOpen || isMobile ? (
            <h1 className="font-display truncate text-xl font-bold tracking-wide text-white">
              Gurú<span className="text-blue-500">Dashboard</span>
            </h1>
          ) : (
            <div className="font-display mx-auto text-xl font-bold text-blue-500">
              G
            </div>
          )}

          {isMobile && (
            <button
              onClick={() => setSidebarOpen(false)}
              className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
            >
              <X size={20} />
            </button>
          )}
        </div>

        <nav className="flex-1 space-y-2 overflow-y-auto px-4 py-8">
          <NavItem
            to="/dashboard"
            icon={<LayoutDashboard size={18} />}
            label="Dashboard"
            sidebarOpen={sidebarOpen}
            isMobile={isMobile}
          />
          <NavItem
            to="/dashboard/data"
            icon={<Database size={18} />}
            label="Datos"
            sidebarOpen={sidebarOpen}
            isMobile={isMobile}
          />
          <NavItem
            to="/dashboard/charts"
            icon={<BarChart3 size={18} />}
            label="Gráficos"
            sidebarOpen={sidebarOpen}
            isMobile={isMobile}
          />
          <NavItem
            to="/dashboard/flipbooks"
            icon={<BookOpen size={18} />}
            label="Guías"
            sidebarOpen={sidebarOpen}
            isMobile={isMobile}
          />
        </nav>

        <div className="border-t border-slate-800 p-4">
          <div
            className={`flex items-center gap-3 px-2 py-2 ${!sidebarOpen && !isMobile ? "justify-center" : ""}`}
          >
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-tr from-blue-500 to-purple-500 text-xs font-bold text-white shadow-lg shadow-blue-500/20">
              {user?.username?.charAt(0).toUpperCase()}
            </div>
            {(sidebarOpen || isMobile) && (
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-white">
                  {user?.username}
                </p>
                <button
                  onClick={logout}
                  className="flex cursor-pointer items-center gap-1 text-[10px] font-bold tracking-wider text-blue-400 uppercase hover:underline"
                >
                  <LogOut size={10} /> Cerrar sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div
        className={`relative z-10 flex min-h-screen flex-1 flex-col transition-all duration-300 ease-in-out ${
          isMobile ? "ml-0" : sidebarOpen ? "ml-64" : "ml-20"
        }`}
      >
        {/* TOP BAR */}
        <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-white/5 bg-[#0B1120]/80 px-8 backdrop-blur-xl">
          <div className="flex items-center gap-4">
            <button
              onClick={toggleSidebar}
              className="rounded-xl p-2 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
            >
              <Menu size={24} />
            </button>
            <h2 className="font-display text-2xl font-bold text-white">
              {isAdmin ? "Panel Admin" : "Panel Usuario"}
              {!isAdmin && user?.dataColumn && (
                <span className="ml-3 hidden rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 font-sans text-sm font-medium text-blue-500 md:inline-block">
                  {user.dataColumn}
                </span>
              )}
            </h2>
          </div>

          <div className="hidden md:block">
            <span className="text-xs font-bold tracking-widest text-slate-500 uppercase">
              Sesión activa:{" "}
              <span className="text-blue-400">{user?.username}</span>
            </span>
          </div>
        </header>

        {/* Page Content */}
        <main className="dashboard-body h-full p-8">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
};

// Updated NavItem component for new theme
const NavItem = ({ to, icon, label, sidebarOpen, isMobile }: any) => (
  <NavLink
    to={to}
    end={to === "/dashboard"}
    className={({ isActive }) =>
      `group flex w-full items-center gap-3 rounded-xl px-4 py-3 transition-all duration-300 ${
        isActive
          ? "bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]"
          : "text-slate-400 hover:bg-slate-800 hover:text-white"
      } ${!sidebarOpen && !isMobile ? "justify-center" : ""}`
    }
  >
    <div
      className={`flex-shrink-0 ${!sidebarOpen && !isMobile ? "" : "group-hover:text-blue-400"}`}
    >
      {icon}
    </div>
    {(sidebarOpen || isMobile) && <span className="font-medium">{label}</span>}
  </NavLink>
);

export default DashboardLayout;
