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

  return (
    <motion.div
      className="section-base relative overflow-hidden"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      variants={containerVariants}
    >
      {/* Geometric Background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 h-px w-1/2 bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />
        <div className="absolute bottom-0 left-1/4 h-px w-1/2 bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />
        <div className="absolute top-1/4 left-0 h-1/2 w-px bg-gradient-to-b from-transparent via-cyan-500/20 to-transparent" />
        <div className="absolute top-1/4 right-0 h-1/2 w-px bg-gradient-to-b from-transparent via-purple-500/20 to-transparent" />
        <div className="absolute top-1/2 left-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-500/5 blur-3xl" />
        <div className="absolute top-1/3 left-1/3 h-48 w-48 rounded-full bg-purple-500/5 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-5xl">
        <motion.div
          className="glass-panel-strong neon-border-cyan rounded-3xl p-12 text-center md:p-20 opacity-0 animate-fade-up"
          whileHover={{
            boxShadow: "0 0 60px rgba(6, 182, 212, 0.1)",
          }}
          transition={{ duration: 0.3 }}
        >
          <div className="relative z-10">
            <motion.h2
              className="mb-6 text-4xl leading-tight font-black md:text-6xl lg:text-7xl"
              variants={itemVariants}
            >
              <span className="gradient-text">
                Déjanos hacer el
                <br />
                trabajo pesado por ti
              </span>
            </motion.h2>
            <motion.p
              className="mb-10 text-xl text-gray-300"
              variants={itemVariants}
            >
              Contáctanos ahora y recibe atención inmediata
            </motion.p>
            <motion.a
              href="https://wa.me/18298049017"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-neon group inline-flex items-center gap-3 rounded-lg px-10 py-4 text-lg"
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
                <ArrowRight className="h-6 w-6" />
              </motion.div>
              <span className="text-lg font-semibold">Contáctanos</span>
            </motion.a>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default CTASection;
