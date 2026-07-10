import { useState, useEffect, Suspense, useRef } from "react";
import { motion } from "framer-motion";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import {
  Menu,
  X,
  Scale,
  ScrollText,
  Shield,
  Globe,
  Printer,
  Bike,
  Camera,
  Landmark,
} from "lucide-react";
import { NeoButton, NeoBadge } from "./ui/neo";

/* ── 3D Scales of Justice Hero Model ── */
function ScalesHeroModel() {
  const { scene } = useGLTF("/scales_of_justice_hero.glb", true);
  const groupRef = useRef<any>(null);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    scene.traverse((child: any) => {
      if (child.isMesh && child.material) {
        const mats = Array.isArray(child.material) ? child.material : [child.material];
        mats.forEach((mat: any) => {
          if (mat.map) mat.map = null;
          if (mat.vertexColors) mat.vertexColors = false;
          mat.color.set("#6ADCA8");
          if (mat.emissive) mat.emissive.set("#143326");
          mat.needsUpdate = true;
        });
      }
    });
  }, [scene]);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y += delta * (hovered ? 1.0 : 0.25);
    groupRef.current.position.y = Math.sin(Date.now() * 0.001) * 0.06;
  });

  return (
    <group
      ref={groupRef}
      scale={0.48}
      position={[0, -0.3, 0]}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <primitive object={scene} />
    </group>
  );
}

function ScalesHeroCanvas() {
  return (
    <div className="relative mx-auto h-40 w-full max-w-xs md:h-52 md:max-w-sm lg:h-64 lg:max-w-md">
      <Canvas
        camera={{ position: [0, 0.3, 42], fov: 60 }}
        style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
      >
        <ambientLight intensity={1.2} />
        <directionalLight position={[5, 5, 5]} intensity={2.0} />
        <directionalLight position={[-3, 2, -5]} intensity={0.8} color="#327361" />
        <pointLight position={[0, 2, 2]} intensity={1.5} color="#ffffff" />
        <Suspense fallback={null}>
          <ScalesHeroModel />
        </Suspense>
      </Canvas>
    </div>
  );
}

const HeroSection = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    <section className="relative h-screen w-full overflow-hidden bg-background">
      {/* ── NEO-BRUTALIST BACKGROUND ── */}
      <style>{`
        .retro-grid {
          background-image:
            linear-gradient(to right, color-mix(in srgb, var(--foreground) 15%, transparent) 1px, transparent 1px),
            linear-gradient(to bottom, color-mix(in srgb, var(--foreground) 15%, transparent) 1px, transparent 1px);
          background-size: 60px 60px;
          transform: perspective(500px) rotateX(60deg);
          mask-image: linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 100%);
        }
      `}</style>

      {/* Retro perspective grid */}
      <motion.div
        className="retro-grid absolute right-[-50%] bottom-[-30%] left-[-50%] z-0 h-[80vh] opacity-30"
        animate={{ backgroundPosition: ["0px 0px", "0px 60px"] }}
        transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
      />

      {/* ── HEADER — THEME AWARE ── */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: "circOut" }}
        className={`fixed top-0 left-0 z-50 w-full border-b-4 border-border bg-background px-6 py-4 transition-all duration-300 ${
          scrolled ? "shadow-header" : ""
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center">
            <img
              src="/logo.png"
              alt="Gurú Soluciones"
              className="h-14 w-auto object-contain md:h-16"
            />
          </div>
          <div className="hidden items-center gap-4 md:flex">
            {navLinks.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="rounded-base border-2 border-border bg-secondary-background px-4 py-2 font-base text-sm font-medium text-foreground shadow-shadow transition-all hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none active:translate-x-boxShadowX active:translate-y-boxShadowY active:shadow-none"
              >
                {item.name}
              </a>
            ))}
          </div>
          <div className="hidden md:block">
            <NeoButton asChild>
              <a
                href="https://wa.me/18298049017"
                target="_blank"
                rel="noopener noreferrer"
              >
                Contáctanos
              </a>
            </NeoButton>
          </div>
          <NeoButton
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </NeoButton>
        </div>
      </motion.nav>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[55] flex flex-col items-center justify-center bg-background md:hidden">
          <div className="flex w-full flex-col items-center gap-3 px-8">
            {navLinks.map((item) => (
              <a
                key={item.name}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="w-full rounded-base border-4 border-border bg-secondary-background py-4 text-center font-base text-xl font-medium text-foreground shadow-shadow transition-all hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none active:translate-x-boxShadowX active:translate-y-boxShadowY active:shadow-none"
              >
                {item.name}
              </a>
            ))}
            <NeoButton
              size="lg"
              className="mt-6"
              asChild
            >
              <a
                href="https://wa.me/18298049017"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMobileMenuOpen(false)}
              >
                Contáctanos
              </a>
            </NeoButton>
          </div>
        </div>
      )}

      {/* ── HERO TEXT ── */}
      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center px-4 pt-0 text-center">
        {/* 3D Scales above the title */}
        <motion.div
          className="mb-[-5rem] w-full md:mb-[-6rem] lg:mb-[-7rem]"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <ScalesHeroCanvas />
        </motion.div>

        <h1
          className="font-heading text-4xl leading-[0.95] font-extrabold tracking-tighter md:text-6xl"
          style={{ perspective: "1000px" }}
        >
          <motion.span
            className="mb-0 block text-foreground"
            initial={{ opacity: 0, rotateX: -45, z: -200, y: 60 }}
            animate={{ opacity: 1, rotateX: 0, z: 0, y: 0 }}
            transition={{ duration: 0.9, ease: [0.215, 0.61, 0.355, 1] }}
            style={{
              transformStyle: "preserve-3d",
              textShadow: "4px 4px 0px var(--main)",
            }}
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
            <span
              className="relative block text-foreground"
              style={{
                textShadow: "4px 4px 0px var(--main)",
              }}
            >
              Legal Inteligente
            </span>
          </motion.span>
        </h1>

        <motion.div
          className="mb-6 inline-block md:mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
        >
          <NeoBadge variant="main" className="px-5 py-2 text-sm md:text-base">
            Tus documentos en manos de expertos
          </NeoBadge>
        </motion.div>
      </div>

      {/* ── MARQUEE ── */}
      <div className="absolute bottom-0 left-0 z-30 w-full overflow-hidden border-t-4 border-border bg-main py-3">
        <motion.div
          className="flex whitespace-nowrap"
          animate={{ x: [0, -1500] }}
          transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
        >
          {Array.from({ length: 10 }).map((_, i) => (
            <span
              key={i}
              className="mx-8 flex items-center gap-6 font-heading text-sm font-black uppercase tracking-widest text-main-foreground whitespace-nowrap"
            >
              <span className="flex items-center gap-2">
                <Scale size={16} /> Servicios Legales
              </span>
              <span>•</span>
              <span className="flex items-center gap-2">
                <ScrollText size={16} /> Redacción
              </span>
              <span>•</span>
              <span className="flex items-center gap-2">
                <Shield size={16} /> Notarización
              </span>
              <span>•</span>
              <span className="flex items-center gap-2">
                <Globe size={16} /> Traducciones
              </span>
              <span>•</span>
              <span className="flex items-center gap-2">
                <Printer size={16} /> Impresión
              </span>
              <span>•</span>
              <span className="flex items-center gap-2">
                <Bike size={16} /> Mensajería
              </span>
              <span>•</span>
              <span className="flex items-center gap-2">
                <Camera size={16} /> Fotos 2x2
              </span>
              <span>•</span>
              <span className="flex items-center gap-2">
                <Landmark size={16} /> Certificaciones
              </span>
              <span>•</span>
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
