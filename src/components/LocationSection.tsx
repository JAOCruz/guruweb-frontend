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
      className="px-8 py-20"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      variants={containerVariants}
    >
      <div className="mx-auto max-w-7xl">
        <div className="grid items-start gap-16 lg:grid-cols-[1fr,1.5fr]">
          {/* Left side - Text */}
          <motion.div className="lg:pr-8" variants={itemVariants}>
            <div className="mb-8 flex items-center gap-2">
              <motion.div
                className="h-2 w-2 rounded-full bg-blue-400"
                variants={dotVariants}
              ></motion.div>
              <span className="text-sm tracking-wider text-gray-400">
                Ubicación
              </span>
            </div>

            <motion.h2
              className="section-title-neon mb-8 text-4xl leading-tight font-bold lg:text-5xl"
              variants={itemVariants}
            >
              ¿Dónde estamos ubicados?
            </motion.h2>

            <motion.p
              className="text-lg leading-relaxed text-gray-300"
              variants={itemVariants}
            >
              Estamos ubicados en la Av. Independencia 1607, Santo Domingo
              10101, La Feria, frente a la OGM. Entrando por el callejón del
              Plaspilito.
            </motion.p>
          </motion.div>

          {/* Right side - Map */}
          <motion.div className="relative w-full" variants={mapVariants}>
            <div className="overflow-hidden rounded-2xl border-4 border-gray-800 shadow-2xl">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3784.731960779048!2d-69.9315891239499!3d18.450475282629593!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8ea5635fabab61a7%3A0x1cc6b9e0dfa32f93!2sGuru%20Soluciones!5e0!3m2!1ses-419!2sdo!4v1759434493649!5m2!1ses-419!2sdo"
                width="100%"
                height="400"
                style={{ border: 0 }}
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="grayscale-0"
              ></iframe>
            </div>
            <motion.div
              className="absolute top-4 left-4 rounded-lg bg-white/95 px-4 py-3 shadow-lg backdrop-blur-sm"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.6 }}
            >
              <div className="text-sm font-semibold text-gray-800">
                Gurú Soluciones Guatemala
              </div>
              <div className="mt-1 flex items-center gap-1 text-xs text-gray-600">
                <span className="text-yellow-500">★</span>
                <span className="font-medium">2.5</span>
                <span className="ml-2 text-blue-600">30 opiniones</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default LocationSection;
