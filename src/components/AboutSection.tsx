import React from "react";
import { motion, type Variants } from "framer-motion";

const AboutSection: React.FC = () => {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        delayChildren: 0.3,
        when: "beforeChildren",
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  return (
    <motion.div
      className="section-base"
      id="about"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      variants={containerVariants}
    >
      <div className="mx-auto max-w-4xl">
        <motion.div
          className="glass-panel-strong neon-border-cyan rounded-2xl p-10 text-center md:p-16 opacity-0 animate-fade-up"
          variants={itemVariants}
        >
          <motion.h2
            className="gradient-text mb-8 text-5xl font-bold md:text-6xl"
            variants={itemVariants}
          >
            ¿Quienes Somos?
          </motion.h2>

          <div className="neon-divider mx-auto mb-8 w-24" />

          <motion.p
            className="text-lg leading-relaxed text-gray-300"
            variants={itemVariants}
          >
            <span className="text-2xl font-bold text-white">
              ¡Somos una empresa de servicios legales automatizados!
            </span>{" "}
            <br />
            <br />
            Tenemos la capacidad de realizar cualquier tipo de documentación legal
            de manera personalizada y actualizada. Nuestra misión es simplificar
            tus procesos más complejos para que puedas cumplir tus sueños.
          </motion.p>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default AboutSection;
