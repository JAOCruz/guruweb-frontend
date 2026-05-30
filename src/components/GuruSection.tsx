import React from "react";
import { motion } from "framer-motion";

const NB = {
  tag: "border-3 border-[#000080] bg-[#0000FF] text-white px-4 py-1.5 text-xs font-black uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(0,0,128,1)]",
  card: "border-4 border-[#000080] bg-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,128,1)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,128,1)]",
};

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
              <div className={NB.tag}>
                Saber Interno
              </div>
              <h3 className="font-[Outfit] text-4xl leading-tight font-bold text-white md:text-6xl">
                El Búho de la{" "}
                <span className="text-glow-blue text-blue-500">
                  Sabiduría Legal
                </span>
              </h3>
              <div className={NB.card}>
                <p className="font-[Outfit] text-lg leading-relaxed text-slate-300">
                  Nuestro "Búho" representa al sabio interno que todo abogado
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
              <img
                src="/mascot_1.png"
                alt="Gurú Búho con Documentos"
                className="relative z-10 max-h-[400px] w-auto transition-transform duration-500 hover:scale-110"
              />
            </motion.div>
          </div>

          {/* Second Row */}
          <div className="grid items-center gap-12 md:grid-cols-2">
            <motion.div
              className="relative flex justify-center"
              variants={imageVariants}
            >
              <img
                src="/mascot_2.png"
                alt="Gurú Búho Leyendo"
                className="relative z-10 max-h-[400px] w-auto transition-transform duration-500 hover:scale-110"
              />
            </motion.div>

            <motion.div
              className="space-y-8 text-right md:text-left"
              variants={itemVariantsReverse}
            >
              <div className={NB.tag}>
                Excelencia Tech
              </div>
              <h3 className="font-[Outfit] text-4xl leading-tight font-bold text-white md:text-6xl">
                Compromiso con la{" "}
                <span className="text-cyan-400">
                  Precisión
                </span>
              </h3>
              <div className={NB.card}>
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
