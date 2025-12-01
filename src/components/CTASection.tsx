import React from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const CTASection: React.FC = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        delayChildren: 0.2,
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
      },
    },
  };

  // Remove unused variables

  return (
    <motion.div
      className="px-8 py-20"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      variants={containerVariants}
    >
      <div className="mx-auto max-w-5xl">
        <motion.div
          className="relative overflow-hidden rounded-3xl border-2 border-blue-500 bg-gradient-to-br from-blue-950 via-blue-900 to-blue-950 p-16 text-center"
          whileHover={{
            boxShadow:
              "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
          }}
          transition={{ duration: 0.3 }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-400/10 to-transparent"></div>
          <div className="relative z-10">
            <motion.h2
              className="section-title-neon mb-6 text-4xl leading-tight font-bold lg:text-5xl"
              variants={itemVariants}
            >
              Déjanos hacer el
              <br />
              trabajo pesado por ti
            </motion.h2>
            <motion.p
              className="mb-8 text-xl text-gray-300"
              variants={itemVariants}
            >
              Contáctanos ahora y recibe atención inmediata
            </motion.p>
            <motion.a
              href="https://wa.me/18298049017"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-3 rounded-lg border-2 border-blue-500 bg-transparent px-6 py-3 text-white transition hover:bg-blue-500"
              variants={itemVariants}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                className="transition group-hover:translate-x-1"
                animate={{ x: [0, 5, 0] }}
                transition={{
                  repeat: Infinity,
                  duration: 1.5,
                }}
              >
                <ArrowRight className="h-5 w-5" />
              </motion.div>
              <span className="text-lg">Contáctanos</span>
            </motion.a>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default CTASection;
