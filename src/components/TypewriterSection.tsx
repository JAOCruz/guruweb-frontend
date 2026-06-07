import React, { Suspense, useRef, useEffect, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";

/* ── 3D Typewriter Model ── */
function TypewriterModel() {
  const { scene } = useGLTF("/typewriter.glb", true);
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
      scale={0.4}
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
    <div className="relative h-[28rem] w-full md:h-[36rem] lg:h-[42rem]">
      <Canvas
        camera={{ position: [0, 1.5, 10], fov: 55 }}
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

/* ── Typewriter Text Effect ── */
function TypewriterText({ text, speed = 60 }: { text: string; speed?: number }) {
  const [displayed, setDisplayed] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (isInView && !started) {
      setStarted(true);
      let i = 0;
      const interval = setInterval(() => {
        setDisplayed(text.slice(0, i + 1));
        i++;
        if (i >= text.length) clearInterval(interval);
      }, speed);
      return () => clearInterval(interval);
    }
  }, [isInView, started, text, speed]);

  return (
    <div ref={ref} className="font-mono">
      {displayed}
      <span className="animate-pulse">|</span>
    </div>
  );
}

const TypewriterSection: React.FC = () => {
  return (
    <section className="relative overflow-hidden bg-[#0000FF] py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-col items-center gap-12 lg:flex-row lg:items-center lg:gap-16">
          {/* 3D Typewriter — Left */}
          <motion.div
            initial={{ opacity: 0, x: -80 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 1, ease: "circOut" }}
            className="w-full lg:w-1/2"
          >
            <TypewriterCanvas />
          </motion.div>

          {/* Text — Right */}
          <motion.div
            initial={{ opacity: 0, x: 80 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 1, delay: 0.3, ease: "circOut" }}
            className="flex-1 text-center lg:text-left"
          >
            <div className="mb-4 inline-block border-3 border-[#000080] bg-black px-4 py-1.5 text-xs font-black uppercase tracking-widest text-white shadow-[4px_4px_0px_0px_rgba(0,0,128,1)]">
              Redacción Profesional
            </div>

            <h2 className="mb-6 font-[Outfit] text-4xl font-extrabold tracking-tighter text-white md:text-6xl">
              Tus Documentos,
              <br />
              <span className="text-[#00FFFF]">Nuestra Especialidad</span>
            </h2>

            <div className="rounded-none border-4 border-[#000080] bg-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,128,1)] md:p-10">
              <p className="mb-4 font-[Outfit] text-lg leading-relaxed text-slate-200 md:text-xl">
                Desde contratos simples hasta documentos complejos, redactamos
                con precisión legal y lenguaje claro.
              </p>
              <div className="font-[Space_Grotesk] text-sm font-bold tracking-widest text-blue-400 uppercase md:text-base">
                <TypewriterText text="Redacción · Edición · Revisión Legal · Formatos Oficiales" speed={50} />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default TypewriterSection;
