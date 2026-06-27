import React, { Suspense, useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { NeoCard, NeoCardContent } from "./ui/neo";

/* ── 3D Lady Justice Model ── */
function LadyJusticeModel() {
  const { scene } = useGLTF("/lady_justice.glb", true);
  const groupRef = useRef<any>(null);
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);

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
    groupRef.current.rotation.y += delta * (hovered ? 1.5 : 0.4);
    groupRef.current.position.y = Math.sin(Date.now() * 0.0015) * 0.1;
    if (clicked) {
      groupRef.current.rotation.y += delta * 6;
      if (groupRef.current.rotation.y > Math.PI * 2) {
        setClicked(false);
        groupRef.current.rotation.y = groupRef.current.rotation.y % (Math.PI * 2);
      }
    }
  });

  return (
    <group
      ref={groupRef}
      scale={1.6}
      position={[0, -1, 0]}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      onClick={() => setClicked(true)}
    >
      <primitive object={scene} />
    </group>
  );
}

function LadyJusticeCanvas() {
  return (
    <div className="relative h-72 w-72 cursor-pointer md:h-96 md:w-96 lg:h-[28rem] lg:w-[28rem]">
      <Canvas
        camera={{ position: [0, 1, 5], fov: 40 }}
        style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
      >
        <ambientLight intensity={1.2} />
        <directionalLight position={[5, 5, 5]} intensity={2.5} />
        <directionalLight position={[-3, 2, -5]} intensity={0.8} color="#8888ff" />
        <pointLight position={[0, 2, 2]} intensity={1.5} color="#ffffff" />
        <Suspense fallback={null}>
          <LadyJusticeModel />
        </Suspense>
      </Canvas>
    </div>
  );
}

const AboutSection: React.FC = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
      },
    },
  };

  return (
    <section
      id="sobre-guru"
      className="relative overflow-hidden bg-secondary-background py-24 pb-12"
    >
      <motion.div
        className="relative z-10 mx-auto max-w-6xl px-6"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={containerVariants}
      >
        {/* Accent Line */}
        <motion.div
          variants={itemVariants}
          className="mb-8 h-1 w-12 bg-main shadow-shadow"
        />

        {/* Two-column layout: 3D left, text right */}
        <div className="flex flex-col items-center gap-12 lg:flex-row lg:items-center lg:gap-16">
          {/* 3D Model — Left */}
          <motion.div
            variants={itemVariants}
            className="flex flex-shrink-0 items-center justify-center"
          >
            <LadyJusticeCanvas />
          </motion.div>

          {/* Text — Right */}
          <div className="flex-1 text-center lg:text-left">
            <motion.h2
              className="mb-8 font-heading text-2xl font-extrabold tracking-tighter text-foreground md:text-4xl"
              variants={itemVariants}
            >
              <span className="mb-4 block font-base text-base font-bold tracking-[0.3em] uppercase text-foreground/70 md:text-lg">
                Nuestra Historia
              </span>
              ¿Quiénes{" "}
              <span className="text-main">
                Somos?
              </span>
            </motion.h2>

            <motion.div variants={itemVariants}>
              <NeoCard className="rounded-base md:p-10">
                <NeoCardContent className="p-0">
                  <p className="font-base text-base leading-relaxed text-foreground md:text-lg">
                    <span className="mb-6 block font-heading text-xl font-bold text-foreground md:text-2xl">
                      ¡Somos una empresa de servicios legales automatizados!
                    </span>
                    Con la capacidad de realizar cualquier tipo de documentación legal
                    de manera{" "}
                    <span className="font-semibold text-main">
                      personalizada y actualizada
                    </span>
                    . Nuestra misión es simplificar tus procesos más complejos para
                    que puedas cumplir tus sueños con total seguridad.
                  </p>
                </NeoCardContent>
              </NeoCard>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Decorative sidebar line */}
      <div className="absolute top-1/2 left-0 hidden -translate-y-1/2 opacity-30 lg:block">
        <div className="flex flex-col gap-2 p-4">
          <div className="h-32 w-1 bg-foreground/50" />
          <div className="h-8 w-1 bg-main" />
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
