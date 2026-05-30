import React from "react";
import { motion } from "framer-motion";

const NB = {
  card: "border-4 border-[#000080] bg-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,128,1)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,128,1)]",
};

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
      className="relative overflow-hidden bg-[#020617] py-24"
    >
      <motion.div
        className="relative z-10 mx-auto max-w-5xl px-6"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={containerVariants}
      >
        <div className="flex flex-col items-center text-center">
          {/* Accent Line */}
          <motion.div
            variants={itemVariants}
            className="mb-8 h-1 w-12 bg-[#0000FF] shadow-[4px_4px_0px_0px_rgba(0,0,128,1)]"
          />

          <motion.h2
            className="mb-12 font-[Outfit] text-5xl font-extrabold tracking-tighter text-white md:text-7xl"
            variants={itemVariants}
          >
            <span className="mb-4 block font-[Space_Grotesk] text-2xl tracking-[0.3em] uppercase opacity-50 md:text-3xl">
              Nuestra Historia
            </span>
            ¿Quiénes{" "}
            <span className="text-blue-500">
              Somos?
            </span>
          </motion.h2>

          <motion.div
            className={`relative rounded-none ${NB.card} md:p-12`}
            variants={itemVariants}
          >
            <p className="font-[Outfit] text-xl leading-relaxed text-slate-200 md:text-3xl">
              <span className="mb-6 block bg-gradient-to-r from-white to-blue-200 bg-clip-text text-3xl font-bold text-transparent md:text-5xl">
                ¡Somos una empresa de servicios legales automatizados!
              </span>
              Con la capacidad de realizar cualquier tipo de documentación legal
              de manera{" "}
              <span className="font-semibold text-blue-400">
                personalizada y actualizada
              </span>
              . Nuestra misión es simplificar tus procesos más complejos para
              que puedas cumplir tus sueños con total seguridad.
            </p>
          </motion.div>
        </div>
      </motion.div>

      {/* Cyber HUD elements */}
      <div className="absolute top-1/2 left-0 hidden -translate-y-1/2 opacity-20 lg:block">
        <div className="flex flex-col gap-2 p-4">
          <div className="h-32 w-1 bg-blue-500/50" />
          <div className="h-8 w-1 bg-blue-500" />
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
