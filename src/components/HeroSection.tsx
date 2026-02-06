import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronRight, MousePointer2, Menu } from "lucide-react";

const HeroSection = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [scrolled, setScrolled] = useState(false);

  // Parallax Effect Logic
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      });
    };

    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const navLinks = [
    { name: "Inicio", href: "#" },
    { name: "Servicios", href: "#servicios" },
    { name: "Sobre el Gurú", href: "#sobre-guru" },
    { name: "¿Trabajas con Nosotros?", href: "/login" },
  ];

  return (
    <div className="relative flex h-screen w-full flex-col overflow-hidden bg-[#020617] font-sans selection:bg-blue-500/30">
      {/* --- ASSETS & STYLES --- */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&family=Space+Grotesk:wght@700&display=swap');
        
        .scanlines {
          background: linear-gradient(
            to bottom,
            rgba(255,255,255,0),
            rgba(255,255,255,0) 50%,
            rgba(0,0,0,0.2) 50%,
            rgba(0,0,0,0.2)
          );
          background-size: 100% 4px;
          animation: scanline 10s linear infinite;
          pointer-events: none;
        }
        
        .retro-grid {
          background-image: 
            linear-gradient(to right, rgba(59, 130, 246, 0.3) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(59, 130, 246, 0.3) 1px, transparent 1px);
          background-size: 60px 60px;
          transform: perspective(500px) rotateX(60deg);
          mask-image: linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 100%);
        }

        @keyframes pulse-glow {
          0%, 100% { opacity: 0.5; filter: blur(40px); }
          50% { opacity: 0.8; filter: blur(60px); }
        }

        .text-glow {
          text-shadow: 0 0 20px rgba(59, 130, 246, 0.5);
        }
      `}</style>

      {/* --- BACKGROUND LAYERS --- */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/40 via-[#020617] to-[#020617]" />
      <motion.div
        className="retro-grid absolute right-[-50%] bottom-[-30%] left-[-50%] z-0 h-[80vh] opacity-20"
        animate={{ backgroundPosition: ["0px 0px", "0px 60px"] }}
        transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
      />
      <div className="absolute top-1/2 left-1/2 z-0 h-[400px] w-[600px] -translate-x-1/2 -translate-y-1/2 animate-[pulse-glow_4s_ease-in-out_infinite] rounded-full bg-blue-600/20 mix-blend-screen blur-[100px]" />
      <div className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(circle,_transparent_60%,_#000_100%)]" />
      <div className="scanlines absolute inset-0 z-10 opacity-10" />

      {/* --- HEADER --- */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: "circOut" }}
        className={`fixed top-0 left-0 z-50 w-full px-6 py-6 transition-all duration-300 ${scrolled ? "border-b border-blue-500/10 bg-[#020617]/80 backdrop-blur-md" : ""}`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          {/* Logo */}
          <div className="flex flex-col leading-tight">
            <span className="font-[Outfit] text-2xl font-extrabold tracking-tighter text-white">
              GURÚ
            </span>
            <span className="font-[Space_Grotesk] text-[10px] tracking-[0.3em] text-blue-400 uppercase">
              Soluciones
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden items-center gap-8 md:flex">
            {navLinks.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="group relative font-[Outfit] text-sm font-medium text-slate-400 transition-colors hover:text-white"
              >
                {item.name}
                <span className="absolute -bottom-1 left-0 h-[2px] w-0 bg-blue-500 transition-all group-hover:w-full" />
              </a>
            ))}
          </div>

          {/* CTA Button */}
          <div className="hidden md:block">
            <a
              href="https://wa.me/18298049017"
              target="_blank"
              rel="noopener noreferrer"
            >
              <button className="rounded-lg border border-blue-500/30 bg-blue-600/10 px-6 py-2.5 text-sm font-bold tracking-wide text-blue-300 shadow-[0_0_15px_rgba(37,99,235,0.1)] transition-all duration-300 hover:border-blue-400 hover:bg-blue-600 hover:text-white hover:shadow-[0_0_25px_rgba(37,99,235,0.4)]">
                Contáctanos
              </button>
            </a>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="text-white md:hidden">
            <Menu />
          </div>
        </div>
      </motion.nav>

      {/* --- MAIN CONTENT --- */}
      <div
        className="relative z-20 mx-auto mt-16 flex max-w-5xl flex-1 flex-col items-center justify-center px-4 text-center"
        style={{ perspective: "1000px" }}
      >
        {/* Main Heading */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "circOut" }}
          style={{
            rotateX: mousePosition.y * 5,
            rotateY: mousePosition.x * 5,
          }}
          className="relative mb-12 w-full"
        >
          <h1 className="font-[Outfit] text-6xl leading-[0.9] font-extrabold tracking-tighter md:text-8xl lg:text-9xl">
            <span className="mb-2 block text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.6)]">
              Una Experiencia
            </span>

            <span className="relative block px-4 pb-4">
              <span
                className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent opacity-50 blur-lg"
                aria-hidden="true"
              >
                Legal Inteligente
              </span>
              <span className="relative bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent drop-shadow-[0_0_25px_rgba(59,130,246,0.6)]">
                Legal Inteligente
              </span>
            </span>
          </h1>
        </motion.div>

        {/* Subtitle Pill */}
        <motion.div
          className="mb-16 inline-block"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
        >
          <div className="flex cursor-default items-center gap-3 rounded-full border border-blue-500/30 bg-blue-950/40 px-6 py-2 shadow-[0_0_20px_rgba(59,130,246,0.2)] backdrop-blur-md transition-colors hover:border-blue-400/50">
            <span className="h-2 w-2 animate-pulse rounded-full bg-green-400 shadow-[0_0_10px_#4ade80]" />
            <p className="font-[Space_Grotesk] text-sm tracking-[0.2em] text-blue-100 uppercase md:text-lg">
              Tus documentos en manos de expertos
            </p>
          </div>
        </motion.div>

        {/* Fixed Main CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <button className="group relative h-[80px] w-[280px] bg-transparent focus:outline-none">
            <div className="absolute inset-0 skew-x-[-12deg] rounded-lg border border-blue-500/50 bg-blue-900/20 transition-all duration-300 group-hover:skew-x-[-6deg] group-hover:border-blue-400 group-hover:bg-blue-600 group-hover:shadow-[0_0_40px_rgba(37,99,235,0.6)]" />

            <div className="absolute inset-0 skew-x-[-12deg] overflow-hidden rounded-lg transition-all duration-300 group-hover:skew-x-[-6deg]">
              <div className="absolute top-0 left-[-100%] h-full w-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-all duration-700 group-hover:left-[100%]" />
            </div>

            <div className="absolute inset-0 flex items-center justify-between px-8 text-white">
              <div className="flex items-center gap-4">
                <div className="rounded-lg bg-blue-500 p-2.5 text-white shadow-lg transition-colors group-hover:bg-white group-hover:text-blue-600">
                  <MousePointer2 size={20} className="fill-current" />
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-[9px] font-bold tracking-widest text-blue-300 uppercase group-hover:text-blue-100">
                    Sistema Iniciado
                  </span>
                  <span className="mt-1 font-[Outfit] text-xl leading-none font-bold tracking-wide text-white">
                    Descubre más
                  </span>
                </div>
              </div>
              <ChevronRight className="text-blue-400 transition-transform group-hover:translate-x-1 group-hover:text-white" />
            </div>
          </button>
        </motion.div>
      </div>

      {/* --- HUD DECORATIONS --- */}
      <div className="absolute bottom-8 left-8 hidden opacity-40 md:block">
        <div className="flex items-end gap-1">
          <div className="h-8 w-1 animate-pulse bg-blue-500" />
          <div className="h-5 w-1 bg-blue-500/50" />
          <div className="h-3 w-1 bg-blue-500/30" />
        </div>
      </div>

      <div className="absolute right-8 bottom-8 hidden text-right font-mono text-[10px] text-blue-400 opacity-50 md:block">
        <div>COORDINATES_XY</div>
        <div className="tracking-widest text-white">
          {Math.round(mousePosition.x * 100)} :{" "}
          {Math.round(mousePosition.y * 100)}
        </div>
      </div>

      {/* --- TRANSITION TO NEXT SECTION --- */}
      <div className="pointer-events-none absolute bottom-0 left-0 z-10 h-64 w-full bg-gradient-to-t from-[#020617] to-transparent" />
      <div className="absolute bottom-0 left-1/2 z-20 h-[1px] w-full max-w-7xl -translate-x-1/2 bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />
    </div>
  );
};

export default HeroSection;
