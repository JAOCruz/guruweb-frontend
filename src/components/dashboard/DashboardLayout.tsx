import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { user, logout, isAdmin } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex h-screen bg-gray-900">
      {/* Background effect - fixed and non-interactive */}
      <div className="hero-bg pointer-events-none fixed inset-0 z-0"></div>

      {/* Sidebar - Fixed position */}
      <div
        className="fixed top-0 left-0 z-20 h-full border-r border-blue-900/30 bg-gray-900/90 shadow-lg"
        style={{
          width: sidebarOpen ? "250px" : "80px",
          transition: "width 0.3s",
        }}
      >
        <div className="flex h-full flex-col">
          {/* Sidebar Header */}
          <div className="flex h-16 flex-shrink-0 items-center justify-between border-b border-blue-900/50 px-4">
            {sidebarOpen ? (
              <h1 className="neon-text text-xl font-bold">Gurú Dashboard</h1>
            ) : (
              <div className="neon-text mx-auto text-xl font-bold">G</div>
            )}
            <button
              onClick={toggleSidebar}
              className="glow-animation rounded-md p-2 text-blue-400 hover:bg-blue-900/30 hover:text-white"
            >
              {sidebarOpen ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 5l7 7-7 7M5 5l7 7-7 7"
                  />
                </svg>
              )}
            </button>
          </div>

          {/* Sidebar Navigation - Scrollable if needed */}
          <nav className="flex-1 space-y-2 overflow-y-auto px-2 py-6">
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `flex items-center rounded-lg px-4 py-3 transition-colors ${
                  isActive
                    ? "bg-blue-900/40 text-white"
                    : "text-gray-300 hover:bg-blue-900/30 hover:text-white"
                }`
              }
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                />
              </svg>
              {sidebarOpen && <span className="ml-3">Dashboard</span>}
            </NavLink>
            <NavLink
              to="/dashboard/charts"
              className={({ isActive }) =>
                `flex items-center rounded-lg px-4 py-3 transition-colors ${
                  isActive
                    ? "bg-blue-900/40 text-white"
                    : "text-gray-300 hover:bg-blue-900/30 hover:text-white"
                }`
              }
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
                />
              </svg>
              {sidebarOpen && <span className="ml-3">Gráficos</span>}
            </NavLink>
          </nav>

          {/* Sidebar Footer */}
          <div className="flex-shrink-0 border-t border-blue-900/50 p-4">
            <div className="flex items-center">
              <div className="glow-animation flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-500 text-white">
                {user?.username.charAt(0).toUpperCase()}
              </div>
              {sidebarOpen && (
                <div className="ml-3 min-w-0">
                  <p className="truncate font-medium text-white">
                    {user?.username}
                  </p>
                  <button
                    onClick={logout}
                    className="text-sm text-blue-400 hover:text-white"
                  >
                    Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div
        className="z-10 flex h-screen flex-col"
        style={{
          marginLeft: sidebarOpen ? "250px" : "80px",
          width: sidebarOpen ? "calc(100% - 250px)" : "calc(100% - 80px)",
          transition: "margin-left 0.3s, width 0.3s",
        }}
      >
        {/* Header - Fixed at top */}
        <header className="flex h-16 flex-shrink-0 items-center justify-between border-b border-blue-900/50 bg-gray-900/80 px-6 backdrop-blur-sm">
          <h2 className="bevel-text text-xl font-semibold">
            {isAdmin ? "Panel de Administración" : "Panel de Usuario"}
            {!isAdmin && user?.dataColumn && (
              <span className="ml-2 text-blue-400">- {user.dataColumn}</span>
            )}
          </h2>
          <div className="flex items-center">
            <span className="mr-4 text-sm text-gray-300">
              Bienvenido, {user?.username}
              {isAdmin && <span className="ml-1 text-blue-400">(Admin)</span>}
            </span>
            <button
              onClick={logout}
              className="rounded-md border border-red-900/30 bg-red-500/20 px-4 py-2 text-sm text-red-300 hover:bg-red-500/30"
            >
              Cerrar sesión
            </button>
          </div>
        </header>

        {/* Page Content - Scrollable area - FIX: Solo un overflow aquí */}
        <main className="flex-1 overflow-y-auto bg-gray-800/90 backdrop-blur-sm">
          <div className="mx-auto max-w-full p-6">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
