import React from "react";
import { motion } from "framer-motion";

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
        ease: [0.16, 1, 0.3, 1], // easeOutQuart
      },
    },
  };

  return (
    <section
      id="sobre-guru"
      className="relative overflow-hidden bg-[#020617] py-24"
    >
      {/* Background elements to match Hero */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(30,58,138,0.2),_transparent_70%)]" />

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
            className="mb-8 h-1 w-12 rounded-full bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.6)]"
          />

          <motion.h2
            className="mb-12 font-[Outfit] text-5xl font-extrabold tracking-tighter text-white md:text-7xl"
            variants={itemVariants}
          >
            <span className="mb-4 block font-[Space_Grotesk] text-2xl tracking-[0.3em] uppercase opacity-50 md:text-3xl">
              Nuestra Historia
            </span>
            ¿Quiénes{" "}
            <span className="text-blue-500 drop-shadow-[0_0_15px_rgba(59,130,246,0.4)]">
              Somos?
            </span>
          </motion.h2>

          <motion.div
            className="relative rounded-3xl border border-blue-500/10 bg-blue-950/20 p-8 shadow-2xl backdrop-blur-xl md:p-12"
            variants={itemVariants}
          >
            {/* Corner Accents */}
            <div className="absolute top-0 left-0 h-8 w-8 rounded-tl-2xl border-t-2 border-l-2 border-blue-500/30" />
            <div className="absolute right-0 bottom-0 h-8 w-8 rounded-br-2xl border-r-2 border-b-2 border-blue-500/30" />

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
