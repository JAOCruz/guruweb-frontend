import React from "react";
import { motion, easeOut } from "framer-motion";

const LocationSection: React.FC = () => {
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
        ease: easeOut,
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

  const mapVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.8,
        ease: easeOut,
      },
    },
  };

  return (
    <motion.div
      className="section-base"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      variants={containerVariants}
    >
      <div className="mx-auto max-w-7xl">
        <div className="grid items-start gap-16 lg:grid-cols-[1fr,1.5fr]">
          {/* Left side - Text */}
          <motion.div className="lg:pr-8 opacity-0 animate-fade-up" variants={itemVariants}>
            <div className="mb-8 flex items-center gap-2">
              <motion.div
                className="h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]"
                variants={dotVariants}
              ></motion.div>
              <span className="text-sm tracking-wider text-gray-400">
                Ubicación
              </span>
            </div>

            <motion.h2
              className="gradient-text mb-8 text-4xl leading-tight font-bold lg:text-5xl"
              variants={itemVariants}
            >
              ¿Dónde estamos ubicados?
            </motion.h2>

            <div className="neon-divider mb-8 w-16" />

            <motion.p
              className="text-lg leading-relaxed text-gray-300"
              variants={itemVariants}
            >
              Estamos ubicados en la Av. Independencia 1607, Santo Domingo
              10101, La Feria, frente a la OGM. Entrando por el callejón del
              Plaspilito.
            </motion.p>

            {/* Coordinate Overlay */}
            <motion.div
              className="mt-8 glass-panel rounded-lg p-4 opacity-0 animate-fade-up delay-300"
              variants={itemVariants}
            >
              <div className="font-mono text-xs tracking-wider text-cyan-400">
                COORDINADAS
              </div>
              <div className="mt-1 font-mono text-sm text-gray-300">
                18.4505° N, 69.9290° W
              </div>
            </motion.div>
          </motion.div>

          {/* Right side - Map */}
          <motion.div className="relative w-full opacity-0 animate-fade-up delay-200" variants={mapVariants}>
            <div className="glass-panel neon-border-cyan overflow-hidden rounded-2xl p-2">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3784.731960779048!2d-69.9315891239499!3d18.450475282629593!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8ea5635fabab61a7%3A0x1cc6b9e0dfa32f93!2sGuru%20Soluciones!5e0!3m2!1ses-419!2sdo!4v1759434493649!5m2!1ses-419!2sdo"
                width="100%"
                height="400"
                style={{ border: 0, borderRadius: "0.75rem" }}
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="grayscale-0"
              ></iframe>
            </div>
            <motion.div
              className="glass-panel-strong absolute top-6 left-6 rounded-lg px-4 py-3"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.6 }}
            >
              <div className="text-sm font-semibold text-white">
                Gurú Soluciones Guatemala
              </div>
              <div className="mt-1 flex items-center gap-1 text-xs text-gray-400">
                <span className="text-yellow-400 drop-shadow-[0_0_4px_rgba(250,204,21,0.6)]">★</span>
                <span className="font-medium text-gray-300">2.5</span>
                <span className="ml-2 text-cyan-400">30 opiniones</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default LocationSection;
