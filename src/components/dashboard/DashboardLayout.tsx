import React, { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { NeoBadge } from "../ui/neo/NeoBadge";
import { cn } from "../../lib/utils";
import {
  Menu,
  X,
  LayoutDashboard,
  Database,
  BarChart3,
  BookOpen,
  LogOut,
  Settings,
  MessageCircle,
  MessageSquare,
  Wifi,
  Users,
  ChevronDown,
  ChevronRight,
  BarChart2,
  Briefcase,
  FileText,
  Brain,
  Bot,
  Sun,
  Palette,
  Moon,
} from "lucide-react";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { user, logout, isAdmin } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [whatsappOpen, setWhatsappOpen] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const location = useLocation();
  const { theme, headingFont, darkBg, toggleTheme, setHeadingFont, setDarkBg } = useTheme();

  const whatsappPaths = [
    "/dashboard/whatsapp",
    "/dashboard/bot-messages",
    "/dashboard/bot-clients",
    "/dashboard/cotizaciones",
    "/dashboard/cases",
    "/dashboard/documents",
    "/dashboard/bot-simulator",
    "/dashboard/simulator-review",
    "/dashboard/motherbrain",
    "/dashboard/services-catalog",
  ];
  const isWhatsappActive = whatsappPaths.some((p) =>
    location.pathname.startsWith(p)
  );

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setSidebarOpen(!mobile);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (isMobile) setSidebarOpen(false);
  }, [location, isMobile]);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <div className="flex min-h-screen w-full overflow-x-hidden bg-background font-base text-foreground">
      {/* Mobile overlay */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 flex h-full flex-col border-r-2 border-border bg-main shadow-sidebar transition-all duration-300 ease-in-out ${
          isMobile
            ? sidebarOpen
              ? "w-64 translate-x-0"
              : "w-64 -translate-x-full"
            : sidebarOpen
              ? "w-64"
              : "w-20"
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b-2 border-border bg-[#0000CC] p-4">
          {sidebarOpen || isMobile ? (
            <h1 className="font-heading truncate text-3xl md:text-4xl font-black tracking-tight text-white">
              Gurú<span className="text-yellow-300">Dash</span>
            </h1>
          ) : (
            <div className="mx-auto font-heading text-4xl md:text-5xl font-black text-white">
              G
            </div>
          )}
          {isMobile && (
            <button
              onClick={() => setSidebarOpen(false)}
              className="rounded-base border-2 border-white/30 p-1 text-white hover:bg-white/20"
            >
              <X size={20} />
            </button>
          )}
        </div>

        <nav className="flex-1 space-y-2 overflow-y-auto p-4">
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

          {/* WhatsApp Bot collapsible */}
          <div>
            <button
              onClick={() => setWhatsappOpen((o) => !o)}
              className={`group flex w-full items-center gap-3 rounded-base border-2 px-4 py-3 font-base transition-all ${
                isWhatsappActive
                  ? "border-border bg-secondary-background text-foreground shadow-shadow"
                  : "border-transparent bg-[#0000CC] text-white hover:border-white/30"
              } ${!sidebarOpen && !isMobile ? "justify-center" : ""}`}
            >
              <div className="flex-shrink-0">
                <MessageCircle size={18} />
              </div>
              {(sidebarOpen || isMobile) && (
                <>
                  <span className="flex-1 text-left font-bold">WhatsApp Bot</span>
                  {whatsappOpen ? (
                    <ChevronDown size={15} />
                  ) : (
                    <ChevronRight size={15} />
                  )}
                </>
              )}
            </button>

            {(sidebarOpen || isMobile) && whatsappOpen && (
              <div className="mt-2 ml-4 space-y-1 border-l-2 border-white/30 pl-3">
                <SubNavLink to="/dashboard/whatsapp" icon={<Wifi size={14} />} label="Conexión" />
                <SubNavLink to="/dashboard/bot-simulator" icon={<Bot size={14} />} label="Simulador Bot" />
                <SubNavLink to="/dashboard/simulator-review" icon={<MessageSquare size={14} />} label="Revisión Simulador" />
                <SubNavLink to="/dashboard/bot-messages" icon={<MessageSquare size={14} />} label="Mensajes" />
                <SubNavLink to="/dashboard/bot-clients" icon={<Users size={14} />} label="Clientes" />
                <SubNavLink to="/dashboard/cotizaciones" icon={<FileText size={14} />} label="Cotizaciones" />
                <SubNavLink to="/dashboard/cases" icon={<Briefcase size={14} />} label="Casos" />
                <SubNavLink to="/dashboard/documents" icon={<FileText size={14} />} label="Documentos" />
                <SubNavLink to="/dashboard/services-catalog" icon={<Database size={14} />} label="Catálogo Precios" />
                <SubNavLink to="/dashboard/motherbrain" icon={<Brain size={14} />} label="Mother Brain" />
              </div>
            )}
          </div>

          <NavItem
            to="/dashboard/ai-insights"
            icon={<BarChart2 size={18} />}
            label="IA Analytics"
            sidebarOpen={sidebarOpen}
            isMobile={isMobile}
          />

          {isAdmin && (
            <NavItem
              to="/dashboard/settings"
              icon={<Settings size={18} />}
              label="Configuración"
              sidebarOpen={sidebarOpen}
              isMobile={isMobile}
            />
          )}
        </nav>

        <div className="border-t-2 border-border bg-[#0000CC] p-4">
          <div
            className={`flex items-center gap-3 ${!sidebarOpen && !isMobile ? "justify-center" : ""}`}
          >
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-base border-2 border-border bg-secondary-background text-sm font-black text-foreground shadow-button">
              {user?.username?.charAt(0).toUpperCase()}
            </div>
            {(sidebarOpen || isMobile) && (
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-white">
                  {user?.username}
                </p>
                <button
                  onClick={logout}
                  className="flex cursor-pointer items-center gap-1 text-[10px] font-black uppercase tracking-wider text-white/80 hover:underline"
                >
                  <LogOut size={10} /> Cerrar sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div
        className={`relative z-10 flex min-h-screen min-w-0 flex-1 flex-col overflow-x-hidden transition-all duration-300 ease-in-out ${
          isMobile ? "ml-0" : sidebarOpen ? "ml-64" : "ml-20"
        }`}
      >
        {/* Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b-2 border-border bg-background px-4 shadow-header md:h-20 md:px-8">
          <div className="flex items-center gap-4">
            <button
              onClick={toggleSidebar}
              className="rounded-base border-2 border-border bg-main p-2 text-main-foreground shadow-button transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
            >
              <Menu size={22} />
            </button>
            <h2 className="font-heading text-lg font-black md:text-2xl">
              {isAdmin ? "Panel Admin" : "Panel Usuario"}
              {!isAdmin && user?.dataColumn && (
                <NeoBadge className="ml-3 hidden md:inline-flex">
                  {user.dataColumn}
                </NeoBadge>
              )}
            </h2>
          </div>

          <div className="hidden items-center gap-2 md:flex">
            <button
              onClick={toggleTheme}
              className="rounded-base border-2 border-border bg-main p-2 text-main-foreground shadow-button transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
              title={theme === "light" ? "Modo oscuro" : "Modo claro"}
            >
              {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
            </button>

            <div className="relative">
              <button
                onClick={() => setShowThemeMenu((v) => !v)}
                className="rounded-base border-2 border-border bg-secondary-background p-2 text-foreground shadow-button transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
                title="Opciones de tema"
              >
                <Palette size={20} />
              </button>
              {showThemeMenu && (
                <div className="absolute right-0 top-full mt-2 w-56 rounded-base border-2 border-border bg-background p-3 shadow-shadow">
                  <p className="mb-2 text-xs font-black uppercase tracking-wider text-foreground/60">Fuente títulos</p>
                  <div className="mb-3 flex gap-2">
                    <button
                      onClick={() => { setHeadingFont("space"); setShowThemeMenu(false); }}
                      className={`flex-1 rounded-base border-2 px-2 py-1.5 text-xs font-black transition-all ${headingFont === "space" ? "border-border bg-main text-main-foreground" : "border-border bg-secondary-background text-foreground"}`}
                    >
                      Space
                    </button>
                    <button
                      onClick={() => { setHeadingFont("barlow"); setShowThemeMenu(false); }}
                      className={`flex-1 rounded-base border-2 px-2 py-1.5 text-xs font-black transition-all ${headingFont === "barlow" ? "border-border bg-main text-main-foreground" : "border-border bg-secondary-background text-foreground"}`}
                    >
                      Barlow
                    </button>
                  </div>
                  {theme === "dark" && (
                    <>
                      <p className="mb-2 text-xs font-black uppercase tracking-wider text-foreground/60">Fondo oscuro</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => { setDarkBg("solid"); setShowThemeMenu(false); }}
                          className={`flex-1 rounded-base border-2 px-2 py-1.5 text-xs font-black transition-all ${darkBg === "solid" ? "border-border bg-main text-main-foreground" : "border-border bg-secondary-background text-foreground"}`}
                        >
                          Sólido
                        </button>
                        <button
                          onClick={() => { setDarkBg("dots"); setShowThemeMenu(false); }}
                          className={`flex-1 rounded-base border-2 px-2 py-1.5 text-xs font-black transition-all ${darkBg === "dots" ? "border-border bg-main text-main-foreground" : "border-border bg-secondary-background text-foreground"}`}
                        >
                          Puntos
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            <span className="text-xs font-black tracking-widest uppercase text-foreground/60">
              Sesión: <span className="text-main">{user?.username}</span>
            </span>
          </div>
        </header>

        {/* Page content */}
        <main className="h-full min-w-0 p-4 md:p-8">
          <div className="mx-auto min-w-0 max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
};

const NavItem = ({ to, icon, label, sidebarOpen, isMobile }: any) => (
  <NavLink
    to={to}
    end={to === "/dashboard"}
    className={({ isActive }) =>
      cn(
        "group flex w-full items-center gap-3 rounded-base border-2 px-4 py-3 font-base transition-all",
        isActive
          ? "border-border bg-secondary-background text-foreground shadow-shadow"
          : "border-transparent bg-[#0000CC] text-white hover:border-white/30",
        !sidebarOpen && !isMobile && "justify-center"
      )
    }
  >
    <div className="flex-shrink-0">{icon}</div>
    {(sidebarOpen || isMobile) && <span className="font-bold">{label}</span>}
  </NavLink>
);

const SubNavLink = ({ to, icon, label }: any) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      cn(
        "flex items-center gap-2.5 rounded-base border-2 px-3 py-2 text-sm font-base transition-all",
        isActive
          ? "border-border bg-secondary-background text-foreground shadow-button"
          : "border-transparent text-white/90 hover:border-white/30 hover:bg-[#0000CC]"
      )
    }
  >
    {icon}
    <span>{label}</span>
  </NavLink>
);

export default DashboardLayout;
