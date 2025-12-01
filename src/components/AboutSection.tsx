import React from "react";
import { motion } from "framer-motion";

const AboutSection: React.FC = () => {
  const containerVariants = {
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

  const itemVariants = {
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

  const dotVariants = {
    hidden: { scale: 0 },
    visible: {
      scale: [0, 1.2, 1],
      transition: { duration: 0.8, times: [0, 0.6, 1] },
    },
  };

  const pulseAnimation = {
    scale: [1, 1.1, 1],
    opacity: [0.7, 1, 0.7],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut",
    },
  };

  return (
    <motion.div
      className="px-8 py-20"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      variants={containerVariants}
    >
      <div className="mx-auto max-w-4xl text-center">
        <motion.div
          className="mb-8 flex items-center justify-center gap-2"
          variants={itemVariants}
        ></motion.div>

        <motion.h2
          className="section-title-neon mb-12 text-6xl font-bold"
          variants={itemVariants}
        >
          ¿Quienes Somos?
        </motion.h2>

        <motion.p
          className="text-lg leading-relaxed text-gray-300"
          variants={itemVariants}
        >
          <span className="text-3xl font-bold text-white">
            ¡Somos una empresa de servicios legales automatizados!
          </span>{" "}
          <br />
          Tenemos la capacidad de realizar cualquier tipo de documentación legal
          de manera personalizada y actualizada. Nuestra misión es simplificar
          tus procesos más complejos para que puedas cumplir tus sueños.
        </motion.p>
      </div>
    </motion.div>
  );
};

export default AboutSection;
