import React, { useRef } from "react";
import { motion } from "framer-motion";

const VideoSection: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);

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
      className="section-base"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      variants={containerVariants}
    >
      <div className="mx-auto max-w-3xl">
        <motion.div
          className="glass-panel neon-border-blue overflow-hidden rounded-xl p-2 opacity-0 animate-fade-up"
          variants={itemVariants}
          whileHover={{
            boxShadow: "0 0 30px rgba(59, 130, 246, 0.2), 0 0 60px rgba(6, 182, 212, 0.1)",
            scale: 1.01,
          }}
        >
          <video
            ref={videoRef}
            className="w-full rounded-lg object-cover"
            autoPlay
            loop
            muted
            playsInline
            disablePictureInPicture
            disableRemotePlayback
            style={{
              filter: "contrast(1.05) brightness(1.05)",
            }}
          >
            <source src="/1.mp4" type="video/mp4" />
            Tu navegador no soporta videos HTML5.
          </video>
        </motion.div>

        <motion.div className="mt-10 text-center opacity-0 animate-fade-up delay-200" variants={itemVariants}>
          <p className="text-xl font-medium text-gray-300 italic md:text-2xl">
            El GRUPO UNIFICADO DE REDACCIÓN UNIVERSAL (G.U.R.U.),
            <span className="gradient-text mt-2 block font-bold not-italic">
              Será tu aliado estratégico al garantizar resultados impecables!
            </span>
          </p>

          <div className="mt-10 flex justify-center">
            <motion.a
              href="https://wa.me/18298049017"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-neon group inline-flex items-center gap-4 rounded-lg px-8 py-4"
              variants={itemVariants}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                animate={{ x: [0, 5, 0] }}
                transition={{
                  repeat: Infinity,
                  repeatType: "loop" as const,
                  duration: 1.5,
                }}
                className="transition group-hover:translate-x-1"
              >
                <span className="text-4xl"> 👉🏾 </span>
              </motion.div>
              <span className="text-xl">
                Dejale el trabajo sucio al Gurú, haz click aquí ya!
              </span>
            </motion.a>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default VideoSection;
