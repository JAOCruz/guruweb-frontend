import React from "react";
import { motion } from "framer-motion";

const GuruSection: React.FC = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -30 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };

  const itemVariantsReverse = {
    hidden: { opacity: 0, x: 30 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };

  const imageVariants = {
    hidden: { opacity: 0, scale: 0.8, rotate: -5 },
    visible: {
      opacity: 1,
      scale: 1,
      rotate: 0,
      transition: {
        duration: 1,
        ease: "easeOut",
      },
    },
  };

  return (
    <section
      id="sobre-guru"
      className="relative overflow-hidden bg-[#020617] py-24"
    >
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          className="flex flex-col gap-24"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={containerVariants}
        >
          {/* First Row */}
          <div className="grid items-center gap-12 md:grid-cols-2">
            <motion.div
              className="order-2 space-y-8 md:order-1"
              variants={itemVariants}
            >
              <div className="inline-block rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 font-[Space_Grotesk] text-xs font-bold tracking-[0.2em] text-blue-400 uppercase">
                Saber Interno
              </div>
              <h3 className="font-[Outfit] text-4xl leading-tight font-bold text-white md:text-6xl">
                El Búho de la{" "}
                <span className="text-glow-blue text-blue-500">
                  Sabiduría Legal
                </span>
              </h3>
              <div className="relative rounded-2xl border border-white/5 bg-white/5 p-6 backdrop-blur-md">
                <p className="font-[Outfit] text-lg leading-relaxed text-slate-300">
                  Nuestro “Búho” representa al sabio interno que todo abogado
                  tiene en su interior. Este personaje es quien te atenderá en
                  cada interacción, con la capacidad de manejar temas en
                  lineamientos de procedimientos civiles locales, leyes y
                  contratos legales en general.
                </p>
              </div>
            </motion.div>

            <motion.div
              className="relative order-1 flex justify-center md:order-2"
              variants={imageVariants}
            >
              {/* Decorative Glow */}
              <div className="absolute inset-0 rounded-full bg-blue-500/20 blur-[80px]" />
              <img
                src="/mascot_1.png"
                alt="Gurú Búho con Documentos"
                className="relative z-10 max-h-[400px] w-auto drop-shadow-[0_0_30px_rgba(59,130,246,0.5)] transition-transform duration-500 hover:scale-110"
              />
            </motion.div>
          </div>

          {/* Second Row */}
          <div className="grid items-center gap-12 md:grid-cols-2">
            <motion.div
              className="relative flex justify-center"
              variants={imageVariants}
            >
              <div className="absolute inset-0 rounded-full bg-cyan-500/10 blur-[80px]" />
              <img
                src="/mascot_2.png"
                alt="Gurú Búho Leyendo"
                className="relative z-10 max-h-[400px] w-auto drop-shadow-[0_0_30px_rgba(34,211,238,0.5)] transition-transform duration-500 hover:scale-110"
              />
            </motion.div>

            <motion.div
              className="space-y-8 text-right md:text-left"
              variants={itemVariantsReverse}
            >
              <div className="inline-block rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-1.5 font-[Space_Grotesk] text-xs font-bold tracking-[0.2em] text-cyan-400 uppercase">
                Excelencia Tech
              </div>
              <h3 className="font-[Outfit] text-4xl leading-tight font-bold text-white md:text-6xl">
                Compromiso con la{" "}
                <span className="text-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.4)]">
                  Precisión
                </span>
              </h3>
              <div className="relative rounded-2xl border border-white/5 bg-white/5 p-6 backdrop-blur-md">
                <p className="font-[Outfit] text-lg leading-relaxed text-slate-300">
                  Nuestro equipo pasa día y noche aprendiendo de cada
                  experiencia para ofrecer un servicio de calidad. Revisamos
                  meticulosamente la legibilidad de los datos mediante
                  tecnología de la más alta calidad. ¡Tu aliado tech-legal para
                  navegar el sistema con flow y precisión!
                </p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default GuruSection;
