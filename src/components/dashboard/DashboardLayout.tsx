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
    <div className="flex h-[100dvh] w-full overflow-hidden bg-gray-900">
      {/* Background effect */}
      <div className="hero-bg pointer-events-none fixed inset-0 z-0"></div>

      {/* Mobile Overlay Backdrop */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-full border-r border-blue-900/30 bg-gray-900/95 shadow-2xl backdrop-blur-md transition-all duration-300 ease-in-out ${
          isMobile
            ? sidebarOpen
              ? "w-[280px] translate-x-0"
              : "w-[280px] -translate-x-full"
            : sidebarOpen
              ? "w-[250px]"
              : "w-[80px]"
        } `}
      >
        <div className="flex h-full flex-col">
          {/* Sidebar Header */}
          <div className="flex h-16 flex-shrink-0 items-center justify-between border-b border-blue-900/50 px-4">
            {sidebarOpen || isMobile ? (
              <h1 className="text-xl font-bold text-white">Gurú Dashboard</h1>
            ) : (
              <div className="mx-auto text-xl font-bold text-blue-400">G</div>
            )}

            {/* Mobile Close Button */}
            {isMobile && (
              <button
                onClick={() => setSidebarOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                <X size={20} />
              </button>
            )}
          </div>

          {/* Sidebar Navigation */}
          <nav
            className="flex-1 space-y-2 overflow-y-auto px-3 py-6"
            id="sidebar-nav"
          >
            <NavItem
              to="/dashboard"
              icon={<LayoutDashboard size={24} />}
              label="Dashboard"
              sidebarOpen={sidebarOpen}
              isMobile={isMobile}
            />
            <NavItem
              to="/dashboard/data"
              icon={<Database size={24} />}
              label="Datos"
              sidebarOpen={sidebarOpen}
              isMobile={isMobile}
            />
            <NavItem
              to="/dashboard/charts"
              icon={<BarChart3 size={24} />}
              label="Gráficos"
              sidebarOpen={sidebarOpen}
              isMobile={isMobile}
            />
            <NavItem
              to="/dashboard/flipbooks"
              icon={<BookOpen size={24} />}
              label="Guías"
              sidebarOpen={sidebarOpen}
              isMobile={isMobile}
            />
          </nav>

          {/* Sidebar Footer */}
          <div className="flex-shrink-0 border-t border-blue-900/50 p-4">
            <div
              className={`flex items-center ${!sidebarOpen && !isMobile ? "justify-center" : ""}`}
            >
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-900/20">
                {user?.username?.charAt(0).toUpperCase()}
              </div>

              {(sidebarOpen || isMobile) && (
                <div className="ml-3 min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-white">
                    {user?.username}
                  </p>
                  <button
                    onClick={logout}
                    className="flex items-center gap-1 text-xs text-blue-400 transition-colors hover:text-blue-300"
                  >
                    <LogOut size={12} /> Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div
        className={`flex h-full flex-1 flex-col overflow-hidden transition-all duration-300 ease-in-out ${
          isMobile
            ? "ml-0 w-full"
            : sidebarOpen
              ? "ml-[250px] w-[calc(100%-250px)]"
              : "ml-[80px] w-[calc(100%-80px)]"
        } `}
      >
        {/* Header */}
        <header className="z-20 flex h-16 flex-shrink-0 items-center justify-between border-b border-blue-900/50 bg-gray-900/80 px-4 backdrop-blur-sm md:px-6">
          <div className="flex items-center gap-4">
            <button
              onClick={toggleSidebar}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <Menu size={24} />
            </button>
            <h2 className="truncate text-lg font-semibold text-white md:text-xl">
              {isAdmin ? "Panel Admin" : "Panel Usuario"}
              {!isAdmin && user?.dataColumn && (
                <span className="ml-2 hidden text-blue-400 md:inline">
                  - {user.dataColumn}
                </span>
              )}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            {/* Mobile User Info simplified */}
            <span className="hidden text-sm text-gray-300 md:inline">
              Hola, {user?.username}
            </span>
          </div>
        </header>

        {/* Page Content */}
        <main className="relative flex-1 overflow-x-hidden overflow-y-auto bg-slate-900/50 p-4 md:p-6">
          <div className="animate-in fade-in slide-in-from-bottom-4 mx-auto max-w-7xl duration-500">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

// Helper Component for Navigation Items
const NavItem = ({ to, icon, label, sidebarOpen, isMobile }: any) => (
  <NavLink
    to={to}
    end={to === "/dashboard"} // Only exact match for root dashboard
    className={({ isActive }) =>
      `group flex items-center rounded-xl px-3 py-3 transition-all duration-200 ${
        isActive
          ? "border border-blue-500/20 bg-blue-600/20 text-blue-400 shadow-[0_0_20px_rgba(37,99,235,0.1)]"
          : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-100"
      } ${!sidebarOpen && !isMobile ? "justify-center" : ""}`
    }
  >
    <span
      className={`flex-shrink-0 transition-transform duration-200 ${!sidebarOpen && !isMobile ? "group-hover:scale-110" : ""}`}
    >
      {icon}
    </span>
    {(sidebarOpen || isMobile) && (
      <span className="ml-3 font-medium tracking-wide">{label}</span>
    )}
  </NavLink>
);

export default DashboardLayout;
