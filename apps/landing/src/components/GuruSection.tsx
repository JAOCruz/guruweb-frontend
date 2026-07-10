import React from "react";
import { motion } from "framer-motion";
import { NeoBadge, NeoCard, NeoCardContent } from "./ui/neo";

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
      className="relative overflow-hidden bg-secondary-background py-24"
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
              <NeoBadge variant="main">Saber Interno</NeoBadge>
              <h3 className="font-heading text-2xl leading-tight font-bold text-foreground md:text-4xl">
                El Búho de la{" "}
                <span className="text-main">
                  Sabiduría Legal
                </span>
              </h3>
              <NeoCard>
                <NeoCardContent className="p-0">
                  <p className="font-base text-base leading-relaxed text-foreground/70 md:text-lg">
                    Nuestro "Búho" representa al sabio interno que todo abogado
                    tiene en su interior. Este personaje es quien te atenderá en
                    cada interacción, con la capacidad de manejar temas en
                    lineamientos de procedimientos civiles locales, leyes y
                    contratos legales en general.
                  </p>
                </NeoCardContent>
              </NeoCard>
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
              <NeoBadge variant="main">Excelencia Tech</NeoBadge>
              <h3 className="font-heading text-2xl leading-tight font-bold text-foreground md:text-4xl">
                Compromiso con la{" "}
                <span className="text-main">
                  Precisión
                </span>
              </h3>
              <NeoCard>
                <NeoCardContent className="p-0">
                  <p className="font-base text-base leading-relaxed text-foreground/70 md:text-lg">
                    Nuestro equipo pasa día y noche aprendiendo de cada
                    experiencia para ofrecer un servicio de calidad. Revisamos
                    meticulosamente la legibilidad de los datos mediante
                    tecnología de la más alta calidad. ¡Tu aliado tech-legal para
                    navegar el sistema con flow y precisión!
                  </p>
                </NeoCardContent>
              </NeoCard>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default GuruSection;
