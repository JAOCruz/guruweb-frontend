import React, { Suspense, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import {
  Scale,
  ScrollText,
  Shield,
  Globe,
  Printer,
  Bike,
  Camera,
  Landmark,
} from "lucide-react";

/* ── 3D Typewriter Model ── */
function TypewriterModel() {
  const { scene } = useGLTF("/decorative_typewriter2.glb", true);
  const groupRef = useRef<any>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y += delta * (hovered ? 1.2 : 0.3);
    groupRef.current.position.y = Math.sin(Date.now() * 0.001) * 0.08;
  });

  return (
    <group
      ref={groupRef}
      scale={1.2}
      position={[0, -0.3, 0]}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <primitive object={scene} />
    </group>
  );
}

function TypewriterCanvas() {
  return (
    <div className="relative h-[28rem] w-full md:h-[36rem] lg:h-[44rem]">
      <Canvas
        camera={{ position: [0, 1.5, 10], fov: 75 }}
        style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
      >
        <ambientLight intensity={1.0} />
        <directionalLight position={[5, 5, 5]} intensity={2.0} />
        <directionalLight position={[-3, 2, -5]} intensity={0.6} color="#8888ff" />
        <pointLight position={[0, 2, 2]} intensity={1.2} color="#ffffff" />
        <Suspense fallback={null}>
          <TypewriterModel />
        </Suspense>
      </Canvas>
    </div>
  );
}

const serviceMarks = [
  { name: "Servicios Legales", icon: Scale },
  { name: "Redacción", icon: ScrollText },
  { name: "Notarización", icon: Shield },
  { name: "Traducciones", icon: Globe },
  { name: "Impresión", icon: Printer },
  { name: "Mensajería", icon: Bike },
  { name: "Fotos 2x2", icon: Camera },
  { name: "Certificaciones", icon: Landmark },
];

const TypewriterSection: React.FC = () => {
  return (
    <section className="relative overflow-hidden bg-secondary-background py-16 md:py-24">
      {/* Service marks watermark background */}
      <div className="pointer-events-none absolute inset-0 z-0 opacity-[0.08]">
        <div className="grid h-full w-full auto-rows-fr grid-cols-2 gap-3 p-3 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 48 }).map((_, i) => {
            const mark = serviceMarks[i % serviceMarks.length];
            const Icon = mark.icon;
            const cols = 4;
            const row = Math.floor(i / cols);
            const col = i % cols;
            const rotations = [-4, 2, -2, 4, 3, -3, 0, 5];
            const angle = rotations[(row + col) % rotations.length];
            return (
              <div
                key={i}
                className="flex items-center justify-center gap-2 text-foreground"
                style={{ transform: `rotate(${angle}deg)` }}
              >
                <Icon size={28} />
                <span className="whitespace-nowrap font-heading text-xl font-black uppercase tracking-widest md:text-2xl lg:text-3xl">
                  {mark.name}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Subtle vignette to keep focus on typewriter */}
      <div className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(circle_at_center,_transparent_40%,_var(--background)_90%)]" />

      <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.8 }}
        >
          <TypewriterCanvas />
        </motion.div>
      </div>
    </section>
  );
};

export default TypewriterSection;
