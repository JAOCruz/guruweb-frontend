import React, { Suspense, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";

/* ── 3D Decorative Typewriter Model (colored version) ── */
function TypewriterModel() {
  const { scene } = useGLTF("/decorative_typewriter2.glb", true);
  const groupRef = useRef<any>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y += delta * (hovered ? 1.0 : 0.25);
    groupRef.current.position.y = Math.sin(Date.now() * 0.001) * 0.08;
  });

  return (
    <group
      ref={groupRef}
      scale={1.4}
      position={[0, -0.4, 0]}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <primitive object={scene} />
    </group>
  );
}

function TypewriterCanvas() {
  return (
    <div className="relative h-[24rem] w-full md:h-[32rem] lg:h-[40rem]">
      <Canvas
        camera={{ position: [0, 1.5, 8], fov: 55 }}
        style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
      >
        <ambientLight intensity={1.2} />
        <directionalLight position={[5, 5, 5]} intensity={2.0} />
        <directionalLight position={[-3, 2, -5]} intensity={0.8} color="#8888ff" />
        <pointLight position={[0, 2, 2]} intensity={1.5} color="#ffffff" />
        <Suspense fallback={null}>
          <TypewriterModel />
        </Suspense>
      </Canvas>
    </div>
  );
}

const TypewriterSection: React.FC = () => {
  return (
    <section className="relative overflow-hidden bg-[#020617] py-16 md:py-24">
      {/* Subtle radial glow behind the model */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(30,64,175,0.25)_0%,_transparent_70%)]" />

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
