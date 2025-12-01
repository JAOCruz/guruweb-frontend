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
      className="px-8 py-1"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      variants={containerVariants}
    >
      <div className="mx-auto max-w-2xl">
        <motion.div
          className="overflow-hidden rounded-xl border-2 border-blue-500 bg-black/40 backdrop-blur-sm"
          variants={itemVariants}
          whileHover={{
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.3)",
            scale: 1.01,
          }}
        >
          <video
            ref={videoRef}
            className="w-full rounded-lg object-cover shadow-inner"
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

        <motion.div className="mt-6 text-center" variants={itemVariants}>
          <p className="text-xl font-medium text-gray-200 italic md:text-2xl">
            El GRUPO UNIFICADO DE REDACCIÓN UNIVERSAL (G.U.R.U.),
            <span className="section-title-neon mt-2 block font-bold">
              Será tu aliado estratégico al garantizar resultados impecables!
            </span>
          </p>

          <div className="mt-10 flex justify-center">
            <motion.a
              href="https://wa.me/18298049017"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-4 rounded-lg border-2 border-blue-500 bg-transparent px-6 py-3 text-white transition hover:bg-blue-500"
              variants={itemVariants}
              whileHover={{
                scale: 1.05,
                backgroundColor: "rgba(59, 130, 246, 0.2)",
              }}
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
                <span className="text-5xl"> 👉🏾 </span>
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
