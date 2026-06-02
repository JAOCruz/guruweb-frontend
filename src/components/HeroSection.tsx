import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ChevronRight,
  MousePointer2,
  Menu,
  X,
  Shield,
  MapPin,
  Scale,
  ScrollText,
  Globe,
  Printer,
  Bike,
  Camera,
  Landmark,
} from "lucide-react";

const NB = {
  btn: "border-4 border-[#000080] bg-[#0000FF] text-white shadow-[6px_6px_0px_0px_rgba(0,0,128,1)] transition-all hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-[3px_3px_0px_0px_rgba(0,0,128,1)] active:translate-x-[6px] active:translate-y-[6px] active:shadow-none",
  tag: "border-3 border-[#000080] bg-[#0000FF] text-white px-4 py-1.5 text-xs font-black uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(0,0,128,1)]",
  navLink:
    "border-3 border-[#000080] bg-black px-4 py-2 font-[Outfit] text-sm font-medium text-white shadow-[4px_4px_0px_0px_rgba(0,0,128,1)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,128,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none",
  mobileLink:
    "w-full border-4 border-[#000080] bg-black py-4 text-center font-[Outfit] text-xl font-medium text-white shadow-[4px_4px_0px_0px_rgba(0,0,128,1)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,128,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none",
};

const HeroSection = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      });
    };
    const handleScroll = () => setScrolled(window.scrollY > 50);
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
    <div className="relative flex min-h-screen w-full flex-col overflow-hidden bg-[#020617] font-sans selection:bg-blue-500/30">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&family=Space+Grotesk:wght@700&display=swap');
        .scanlines {
          background: linear-gradient(to bottom, rgba(255,255,255,0), rgba(255,255,255,0) 50%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.2));
          background-size: 100% 4px;
          animation: scanline 10s linear infinite;
          pointer-events: none;
        }
        .retro-grid {
          background-image: linear-gradient(to right, rgba(59,130,246,0.3) 1px, transparent 1px), linear-gradient(to bottom, rgba(59,130,246,0.3) 1px, transparent 1px);
          background-size: 60px 60px;
          transform: perspective(500px) rotateX(60deg);
          mask-image: linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 100%);
        }
        .extruded-3d {
          text-shadow: 1px 1px 0 #0000FF, 2px 2px 0 #0000CC, 3px 3px 0 #0000AA, 4px 4px 0 #000080, 5px 5px 0 #000060, 6px 6px 0 #000040, 7px 7px 0 #000030, 8px 8px 0 #000020, 9px 9px 0 #000010, 10px 10px 0 #000000;
        }
        @keyframes float-y { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        .animate-float { animation: float-y 4s ease-in-out infinite; }
      `}</style>

      {/* Background */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/40 via-[#020617] to-[#020617]" />
      <div className="pointer-events-none absolute inset-0 z-[1] opacity-[0.25]" style={{ background: 'radial-gradient(#ffffff 1.5px, transparent 1.5px)', backgroundSize: '20px 20px' }} />
      <motion.div className="retro-grid absolute right-[-50%] bottom-[-30%] left-[-50%] z-0 h-[80vh] opacity-20" animate={{ backgroundPosition: ['0px 0px', '0px 60px'] }} transition={{ repeat: Infinity, duration: 3, ease: 'linear' }} />
      <div className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(circle,_transparent_60%,_#000_100%)]" />
      <div className="scanlines absolute inset-0 z-10 opacity-10" />

      {/* Header — WHITE background for black logo */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: 'circOut' }}
        className={`fixed top-0 left-0 z-50 w-full border-b-4 border-[#000080] bg-white px-6 py-4 transition-all duration-300 ${scrolled ? 'shadow-lg' : ''}`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          {/* Logo PNG only */}
          <div className="flex items-center">
            <img src="/logo.png" alt="Gurú Soluciones" className="h-14 w-auto object-contain md:h-16" />
          </div>

          <div className="hidden items-center gap-4 md:flex">
            {navLinks.map((item) => (
              <a key={item.name} href={item.href} className={NB.navLink}>{item.name}</a>
            ))}
          </div>

          <div className="hidden md:block">
            <a href="https://wa.me/18298049017" target="_blank" rel="noopener noreferrer">
              <button className={NB.btn}>Contáctanos</button>
            </a>
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="relative z-[60] border-4 border-[#000080] bg-[#0000FF] p-3 text-white shadow-[4px_4px_0px_0px_rgba(0,0,128,1)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,128,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none md:hidden"
            style={{ WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation' }}
          >
            {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[55] flex flex-col items-center justify-center bg-[#020617] md:hidden">
          <div className="flex w-full flex-col items-center gap-3 px-8">
            {navLinks.map((item) => (
              <a key={item.name} href={item.href} onClick={() => setMobileMenuOpen(false)} className={NB.mobileLink}>{item.name}</a>
            ))}
            <a href="https://wa.me/18298049017" target="_blank" rel="noopener noreferrer" onClick={() => setMobileMenuOpen(false)} className={`mt-6 ${NB.btn} px-10 py-4 text-xl`}>Contáctanos</a>
          </div>
        </div>
      )}

      {/* Main Content — pulled upward so it doesn't collide with marquee */}
      <div className="relative z-20 mx-auto flex w-full max-w-5xl flex-col items-center px-4 pt-20 pb-40 text-center md:pt-24" style={{ perspective: '1000px' }}>
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'circOut' }}
          style={{ rotateX: mousePosition.y * 5, rotateY: mousePosition.x * 5 }}
          className="relative mb-4 w-full md:mb-6"
        >
          <h1 className="font-[Outfit] text-5xl leading-[0.9] font-extrabold tracking-tighter sm:text-6xl md:text-8xl lg:text-9xl" style={{ perspective: '1000px' }}>
            <motion.span
              className="mb-2 block text-white extruded-3d"
              initial={{ opacity: 0, rotateX: -45, z: -200, y: 60 }}
              animate={{ opacity: 1, rotateX: 0, z: 0, y: 0 }}
              transition={{ duration: 0.9, ease: [0.215, 0.61, 0.355, 1] }}
              style={{
                transformStyle: 'preserve-3d',
                textShadow: `${2 + mousePosition.x * 4}px ${2 + mousePosition.y * 4}px 0 #0000FF, ${4 + mousePosition.x * 8}px ${4 + mousePosition.y * 8}px 0 #0000AA, ${6 + mousePosition.x * 12}px ${6 + mousePosition.y * 12}px 0 #000080, ${8 + mousePosition.x * 16}px ${8 + mousePosition.y * 16}px 0 #000050`,
              }}
            >
              Una Experiencia
            </motion.span>
            <motion.span
              className="relative block px-2 pb-2 md:px-4 md:pb-4"
              initial={{ opacity: 0, rotateX: -45, z: -200, y: 60 }}
              animate={{ opacity: 1, rotateX: 0, z: 0, y: 0 }}
              transition={{ duration: 0.9, delay: 0.25, ease: [0.215, 0.61, 0.355, 1] }}
              style={{ transformStyle: 'preserve-3d' }}
            >
              <span
                className="relative block text-white extruded-3d"
                style={{
                  textShadow: `${2 + mousePosition.x * 4}px ${2 + mousePosition.y * 4}px 0 #0000FF, ${4 + mousePosition.x * 8}px ${4 + mousePosition.y * 8}px 0 #0000AA, ${6 + mousePosition.x * 12}px ${6 + mousePosition.y * 12}px 0 #000080, ${8 + mousePosition.x * 16}px ${8 + mousePosition.y * 16}px 15px rgba(0,0,0,0.8)`,
                }}
              >
                Legal Inteligente
              </span>
            </motion.span>
          </h1>
        </motion.div>

        {/* Subtitle — BIGGER */}
        <motion.div
          className="mb-6 inline-block md:mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
        >
          <div className="border-3 border-[#000080] bg-[#0000FF] px-5 py-2 text-sm font-black uppercase tracking-widest text-white shadow-[4px_4px_0px_0px_rgba(0,0,128,1)] md:px-6 md:py-2.5 md:text-base lg:text-lg">
            Tus documentos en manos de expertos
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
          <button className={`group relative inline-flex h-[60px] items-center gap-3 border-4 border-[#000080] bg-[#0000FF] px-5 text-white shadow-[6px_6px_0px_0px_rgba(0,0,128,1)] transition-all hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-[3px_3px_0px_0px_rgba(0,0,128,1)] active:translate-x-[6px] active:translate-y-[6px] active:shadow-none md:h-[80px] md:gap-4 md:px-8`}>
            <div className="border-2 border-[#000080] bg-white p-2 text-[#0000FF] md:p-2.5">
              <MousePointer2 size={18} className="fill-current" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-[8px] font-bold tracking-widest text-blue-200 uppercase md:text-[9px]">Sistema Iniciado</span>
              <span className="mt-0.5 font-[Outfit] text-base leading-none font-bold tracking-wide text-white md:mt-1 md:text-xl">Descubre más</span>
            </div>
            <ChevronRight size={20} className="text-blue-200 transition-transform group-hover:translate-x-1" />
          </button>
        </motion.div>

        {/* Santo Domingo — centered below CTA */}
        <motion.div
          className="mt-5 inline-flex items-center gap-2 border-2 border-[#000080] bg-black px-3 py-2 text-xs font-black uppercase tracking-widest text-white shadow-[5px_5px_0px_0px_rgba(0,0,128,1)] md:mt-6 md:px-4 md:py-2.5 md:text-sm"
          animate={{ y: [0, -10, 0] }}
          transition={{ repeat: Infinity, duration: 3.5, ease: 'easeInOut' }}
        >
          <MapPin size={14} className="md:size-[16px]" /> Santo Domingo
        </motion.div>
      </div>

      {/* Marquee — raised to avoid overlap */}
      <div className="absolute bottom-[40px] left-0 z-20 w-full overflow-hidden border-y-4 border-[#000080] bg-[#0000FF] py-3 shadow-[0_6px_0px_0px_rgba(0,0,128,1)]">
        <motion.div className="flex whitespace-nowrap" animate={{ x: [0, -1500] }} transition={{ repeat: Infinity, duration: 20, ease: 'linear' }}>
          {Array.from({ length: 10 }).map((_, i) => (
            <span key={i} className="mx-8 flex items-center gap-6 font-[Space_Grotesk] text-sm font-black uppercase tracking-widest text-white whitespace-nowrap">
              <span className="flex items-center gap-2"><Scale size={16} /> Servicios Legales</span><span>•</span>
              <span className="flex items-center gap-2"><ScrollText size={16} /> Redacción</span><span>•</span>
              <span className="flex items-center gap-2"><Shield size={16} /> Notarización</span><span>•</span>
              <span className="flex items-center gap-2"><Globe size={16} /> Traducciones</span><span>•</span>
              <span className="flex items-center gap-2"><Printer size={16} /> Impresión</span><span>•</span>
              <span className="flex items-center gap-2"><Bike size={16} /> Mensajería</span><span>•</span>
              <span className="flex items-center gap-2"><Camera size={16} /> Fotos 2x2</span><span>•</span>
              <span className="flex items-center gap-2"><Landmark size={16} /> Certificaciones</span><span>•</span>
            </span>
          ))}
        </motion.div>
      </div>

      {/* HUD Decorations — raised */}
      <div className="absolute bottom-[100px] left-8 hidden opacity-40 md:block">
        <div className="flex items-end gap-1">
          <div className="h-8 w-1 bg-blue-500" />
          <div className="h-5 w-1 bg-blue-500/50" />
          <div className="h-3 w-1 bg-blue-500/30" />
        </div>
      </div>
      <div className="absolute right-8 bottom-[100px] hidden text-right font-mono text-[10px] text-blue-400 opacity-50 md:block">
        <div>COORDINATES_XY</div>
        <div className="tracking-widest text-white">{Math.round(mousePosition.x * 100)} : {Math.round(mousePosition.y * 100)}</div>
      </div>

      {/* Transition */}
      <div className="pointer-events-none absolute bottom-0 left-0 z-10 h-64 w-full bg-gradient-to-t from-[#020617] to-transparent" />
      <div className="absolute bottom-0 left-1/2 z-20 h-[1px] w-full max-w-7xl -translate-x-1/2 bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />
    </div>
  );
};

export default HeroSection;
