import React, { Suspense, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import {
  ShieldCheck,
  UserCheck,
  FileText,
  Languages,
  Camera,
  Printer,
  Landmark,
  ShoppingBag,
  Send,
  ArrowRight,
} from "lucide-react";

const NB = {
  btn: "border-4 border-[#000080] bg-[#0000FF] text-white shadow-[6px_6px_0px_0px_rgba(0,0,128,1)] transition-all hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-[3px_3px_0px_0px_rgba(0,0,128,1)] active:translate-x-[6px] active:translate-y-[6px] active:shadow-none",
  tag: "border-3 border-[#000080] bg-[#0000FF] text-white px-4 py-1.5 text-xs font-black uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(0,0,128,1)]",
  card: "border-4 border-[#000080] bg-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,128,1)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,128,1)]",
};

const ServicesSection: React.FC = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
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

  const services = [
    {
      id: 1,
      name: "Digitación de Contratos",
      description:
        "Digitalización profesional de contratos legales con máxima precisión y eficiencia.",
      icon: <FileText size={28} />,
    },
    {
      id: 2,
      name: "Abogado Notario",
      description:
        "Servicios de notarización y asesoría legal por abogados certificados.",
      icon: <UserCheck size={28} />,
    },
    {
      id: 3,
      name: "Solicitud de Certificaciones",
      description:
        "Gestión de certificaciones digitales y legales en instituciones públicas.",
      icon: <ShieldCheck size={28} />,
    },
    {
      id: 4,
      name: "Traducción e Intérprete Judicial",
      description:
        "Servicios de traducción profesional para documentos legales en múltiples idiomas.",
      icon: <Languages size={28} />,
    },
    {
      id: 5,
      name: "Fotos 2x2",
      description:
        "Servicio de fotografía profesional para documentos oficiales y trámites legales.",
      icon: <Camera size={28} />,
    },
    {
      id: 6,
      name: "Servicio de Impresión",
      description:
        "Impresión de alta calidad para documentos legales, contratos y certificaciones.",
      icon: <Printer size={28} />,
    },
    {
      id: 7,
      name: "Compra de Impuestos",
      description:
        "Gestión y compra de impuestos internos con asesoría especializada para tus trámites fiscales.",
      icon: <Landmark size={28} />,
    },
    {
      id: 8,
      name: "Artículos / Tienda",
      description:
        "Accede a nuestra tienda virtual con artículos y productos especializados para trámites legales.",
      icon: <ShoppingBag size={28} />,
    },
    {
      id: 9,
      name: "Mensajería Express",
      description:
        "Servicio de mensajería rápida y segura para el depósito y entrega de documentos importantes.",
      icon: <Send size={28} />,
    },
  ];

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

  return (
    <section
      id="servicios"
      className="relative overflow-hidden bg-[#020617] py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <motion.div
          className="mb-1 text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
        >
          <motion.div
            variants={itemVariants}
            className={`mb-1 inline-block ${NB.tag}`}
          >
            Especialidades
          </motion.div>
          <motion.h2
            className="mb-1 font-[Outfit] text-3xl font-extrabold tracking-tighter text-white sm:text-5xl md:text-7xl"
            variants={itemVariants}
          >
            Nuestos{" "}
            <span className="text-glow-blue text-blue-500">Servicios</span>
          </motion.h2>
          <motion.p
            className="mx-auto max-w-2xl font-[Outfit] text-base text-slate-400 sm:text-xl"
            variants={itemVariants}
          >
            En Gurú Soluciones nos especializamos en una variedad de servicios
            legales para satisfacer todas tus necesidades documentales con
            precisión quirúrgica.
          </motion.p>
        </motion.div>

        {/* ── 3D Typewriter ── */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.8 }}
          className="mx-auto mb-1 w-full max-w-3xl"
        >
          <TypewriterCanvas />
        </motion.div>

        <motion.div
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={containerVariants}
        >
          {services.map((service) => (
            <motion.div
              key={service.id}
              variants={itemVariants}
              className="group relative"
            >
              <div className={`relative flex h-full flex-col ${NB.card} sm:p-8`}>
                <div className="mb-4 flex h-12 w-12 items-center justify-center border-4 border-[#000080] bg-[#0000FF] text-white shadow-[4px_4px_0px_0px_rgba(0,0,128,1)] sm:mb-6 sm:h-14 sm:w-14">
                  {service.icon}
                </div>

                <h3 className="mb-3 font-[Outfit] text-xl font-bold text-white transition-colors group-hover:text-blue-400 sm:mb-4 sm:text-2xl">
                  {service.name}
                </h3>

                <p className="mb-6 flex-grow font-[Outfit] text-sm text-slate-400 sm:mb-8 sm:text-base">
                  {service.description}
                </p>

                <div className="flex items-center gap-2 font-[Space_Grotesk] text-xs font-bold tracking-widest text-blue-400 uppercase opacity-0 transition-opacity group-hover:opacity-100">
                  Saber más <ArrowRight size={14} />
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <div className="mt-20 flex justify-center">
          <a
            href="https://wa.me/18298049017"
            target="_blank"
            rel="noopener noreferrer"
            className={`${NB.btn} px-10 py-5 font-[Space_Grotesk] text-lg font-bold tracking-widest`}
          >
            CONTACTAR AHORA
          </a>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
