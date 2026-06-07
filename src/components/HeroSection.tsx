import { useState, useEffect, useRef, Suspense } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import {
  ChevronRight,
  MousePointer2,
  Menu,
  X,
  MapPin,
  Scale,
  ScrollText,
  Shield,
  Globe,
  Printer,
  Bike,
  Camera,
  Landmark,
} from "lucide-react";

const NB = {
  btn: "border-4 border-[#000080] bg-[#0000FF] text-white shadow-[6px_6px_0px_0px_rgba(0,0,128,1)] transition-all hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-[3px_3px_0px_0px_rgba(0,0,128,1)] active:translate-x-[6px] active:translate-y-[6px] active:shadow-none",
  navLink:
    "border-3 border-[#000080] bg-black px-4 py-2 font-[Outfit] text-sm font-medium text-white shadow-[4px_4px_0px_0px_rgba(0,0,128,1)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,128,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none",
  mobileLink:
    "w-full border-4 border-[#000080] bg-black py-4 text-center font-[Outfit] text-xl font-medium text-white shadow-[4px_4px_0px_0px_rgba(0,0,128,1)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,128,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none",
};

/* ── 3D Lady Justice Model ── */
function LadyJusticeModel({ scrollProgress }: { scrollProgress: React.MutableRefObject<number> }) {
  const { scene } = useGLTF("/lady_justice.glb", true);
  const groupRef = useRef<any>(null);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    scene.traverse((child: any) => {
      if (child.isMesh && child.material) {
        const mats = Array.isArray(child.material) ? child.material : [child.material];
        mats.forEach((mat: any) => {
          if (mat.map) mat.map = null;
          if (mat.vertexColors) mat.vertexColors = false;
          mat.color.set("#FFFFFF");
          if (mat.emissive) mat.emissive.set("#000022");
          mat.needsUpdate = true;
        });
      }
    });
  }, [scene]);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    const p = scrollProgress.current;
    const targetScale = 1.8 + p * 0.5;
    const current = groupRef.current.scale.x;
    const next = current + (targetScale - current) * 0.05;
    groupRef.current.scale.setScalar(next);
    groupRef.current.rotation.y += delta * (hovered ? 0.8 : 0.15);
    groupRef.current.position.y = Math.sin(Date.now() * 0.001) * 0.06;
  });

  return (
    <group
      ref={groupRef}
      scale={1.8}
      position={[0, -0.3, 0]}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <primitive object={scene} />
    </group>
  );
}

/* ── Scroll Camera ── */
function ScrollCamera({ scrollProgress }: { scrollProgress: React.MutableRefObject<number> }) {
  const { camera } = useThree();
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouse = (e: MouseEvent) => {
      mouseRef.current.x = (e.clientX / window.innerWidth - 0.5) * 0.2;
      mouseRef.current.y = (e.clientY / window.innerHeight - 0.5) * 0.2;
    };
    window.addEventListener("mousemove", handleMouse);
    return () => window.removeEventListener("mousemove", handleMouse);
  }, []);

  useFrame(() => {
    const p = scrollProgress.current;
    const baseZ = 6 - p * 1.0;
    const baseY = 1.0 + p * 0.15;
    camera.position.x = mouseRef.current.x;
    camera.position.y = baseY + mouseRef.current.y;
    camera.position.z = baseZ;
    camera.lookAt(0, -0.2, 0);
  });

  return null;
}

const HeroSection = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const progressRef = useRef(0);

  useEffect(() => {
    const unsub = scrollYProgress.on("change", (v) => {
      progressRef.current = v;
    });
    return () => unsub();
  }, [scrollYProgress]);

  // Hero text fades out as you scroll
  const heroOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 0.6], [0, -60]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Inicio", href: "#" },
    { name: "Servicios", href: "#servicios" },
    { name: "Sobre el Gurú", href: "#sobre-guru" },
    { name: "¿Trabajas con Nosotros?", href: "/login" },
  ];

  return (
    <section ref={containerRef} className="relative h-screen bg-[#020617]">
      <div className="relative h-full w-full overflow-hidden">
        {/* 3D Scene */}
        <div className="absolute inset-0">
          <Canvas
            camera={{ position: [0, 1, 6], fov: 50 }}
            style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
          >
            <ambientLight intensity={0.3} />
            <directionalLight position={[5, 5, 5]} intensity={2} color="#ffffff" />
            <directionalLight position={[-3, 2, -3]} intensity={1.2} color="#0000FF" />
            <pointLight position={[0, 3, 2]} intensity={1.5} color="#4444ff" />
            <Suspense fallback={null}>
              <LadyJusticeModel scrollProgress={progressRef} />
              <ScrollCamera scrollProgress={progressRef} />
            </Suspense>
          </Canvas>
        </div>

        {/* Overlays */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_30%,_rgba(0,0,0,0.4)_65%)]" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/30" />

        {/* Header — WHITE */}
        <motion.nav
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.8, ease: "circOut" }}
          className={`fixed top-0 left-0 z-50 w-full border-b-4 border-[#000080] bg-white px-6 py-4 transition-all duration-300 ${scrolled ? "shadow-lg" : ""}`}
        >
          <div className="mx-auto flex max-w-7xl items-center justify-between">
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
              style={{ WebkitTapHighlightColor: "transparent", touchAction: "manipulation" }}
            >
              {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </motion.nav>

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

        {/* Hero Text — fades out on scroll */}
        <motion.div
          className="absolute inset-0 z-20 flex flex-col items-center justify-center px-4 pt-16 text-center"
          style={{ opacity: heroOpacity, y: heroY }}
        >
          <h1 className="font-[Outfit] text-5xl leading-[0.9] font-extrabold tracking-tighter sm:text-6xl md:text-8xl lg:text-9xl" style={{ perspective: "1000px" }}>
            <motion.span
              className="mb-2 block text-white"
              initial={{ opacity: 0, rotateX: -45, z: -200, y: 60 }}
              animate={{ opacity: 1, rotateX: 0, z: 0, y: 0 }}
              transition={{ duration: 0.9, ease: [0.215, 0.61, 0.355, 1] }}
              style={{ transformStyle: "preserve-3d", textShadow: "2px 2px 0 #0000FF, 4px 4px 0 #0000AA, 6px 6px 0 #000080, 8px 8px 0 #000050" }}
            >
              Una Experiencia
            </motion.span>
            <motion.span
              className="relative block px-2 pb-2 md:px-4 md:pb-4"
              initial={{ opacity: 0, rotateX: -45, z: -200, y: 60 }}
              animate={{ opacity: 1, rotateX: 0, z: 0, y: 0 }}
              transition={{ duration: 0.9, delay: 0.25, ease: [0.215, 0.61, 0.355, 1] }}
              style={{ transformStyle: "preserve-3d" }}
            >
              <span className="relative block text-white" style={{ textShadow: "2px 2px 0 #0000FF, 4px 4px 0 #0000AA, 6px 6px 0 #000080, 8px 8px 15px rgba(0,0,0,0.8)" }}>
                Legal Inteligente
              </span>
            </motion.span>
          </h1>

          <motion.div className="mb-6 inline-block md:mb-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 1 }}>
            <div className="border-3 border-[#000080] bg-[#0000FF] px-5 py-2 text-sm font-black uppercase tracking-widest text-white shadow-[4px_4px_0px_0px_rgba(0,0,128,1)] md:px-6 md:py-2.5 md:text-base lg:text-lg">
              Tus documentos en manos de expertos
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
            <a href="https://wa.me/18298049017" target="_blank" rel="noopener noreferrer">
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
            </a>
          </motion.div>

          <motion.div
            className="mt-5 inline-flex items-center gap-2 border-2 border-[#000080] bg-black px-3 py-2 text-xs font-black uppercase tracking-widest text-white shadow-[5px_5px_0px_0px_rgba(0,0,128,1)] md:mt-6 md:px-4 md:py-2.5 md:text-sm"
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut" }}
          >
            <MapPin size={14} className="md:size-[16px]" /> Santo Domingo
          </motion.div>
        </motion.div>

        {/* Marquee */}
        <div className="absolute bottom-0 left-0 z-30 w-full overflow-hidden border-t-4 border-[#000080] bg-[#0000FF] py-3">
          <motion.div className="flex whitespace-nowrap" animate={{ x: [0, -1500] }} transition={{ repeat: Infinity, duration: 20, ease: "linear" }}>
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
      </div>
    </section>
  );
};

export default HeroSection;
