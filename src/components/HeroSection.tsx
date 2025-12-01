import React from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const HeroSection: React.FC = () => {
  return (
    <motion.div
      className="perspective-container flex flex-col items-center justify-center px-4 py-20 text-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Removed background animation effect */}

      <motion.div
        className="perspective-container relative mb-12 w-full max-w-6xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        whileHover={{ scale: 1.02 }}
      >
        <motion.h1
          className="text-6xl leading-tight font-extrabold tracking-tighter md:text-9xl"
          style={{
            transform: "translateZ(0)",
            transformStyle: "preserve-3d",
          }}
        >
          {/* Top line with neon effect */}
          <motion.span
            className="neon-text block"
            animate={{
              textShadow: [
                "0 0 5px #fff, 0 0 10px #fff, 0 0 15px #0073e6, 0 0 20px #0073e6, 0 0 25px #0073e6, 0 0 30px #0073e6",
                "0 0 10px #fff, 0 0 20px #fff, 0 0 30px #0073e6, 0 0 40px #0073e6, 0 0 50px #0073e6, 0 0 60px #0073e6",
                "0 0 5px #fff, 0 0 10px #fff, 0 0 15px #0073e6, 0 0 20px #0073e6, 0 0 25px #0073e6, 0 0 30px #0073e6",
              ],
              scale: [1, 1.03, 1],
              z: [0, 30, 0],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              repeatType: "mirror" as const,
              ease: "easeInOut",
            }}
          >
            Una Experiencia
          </motion.span>

          {/* Bottom line with neon effect */}
          <motion.span
            className="neon-text mt-4 block"
            animate={{
              textShadow: [
                "0 0 5px #fff, 0 0 10px #fff, 0 0 15px #0073e6, 0 0 20px #0073e6, 0 0 25px #0073e6, 0 0 30px #0073e6",
                "0 0 10px #fff, 0 0 20px #fff, 0 0 30px #0073e6, 0 0 40px #0073e6, 0 0 50px #0073e6, 0 0 60px #0073e6",
                "0 0 5px #fff, 0 0 10px #fff, 0 0 15px #0073e6, 0 0 20px #0073e6, 0 0 25px #0073e6, 0 0 30px #0073e6",
              ],
              scale: [1, 1.03, 1],
              z: [0, 30, 0],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              repeatType: "mirror" as const,
              ease: "easeInOut",
            }}
          >
            Legal Inteligente
          </motion.span>
        </motion.h1>

        {/* Removed glowing background box */}
      </motion.div>

      <motion.p
        className="metallic-3d-text mb-50 text-2xl italic"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut", delay: 0.3 }}
        style={{
          transform: "translateZ(0)",
          transformStyle: "preserve-3d",
        }}
      >
        <motion.span
          animate={{
            rotateX: [0, 2, 0, -2, 0],
            rotateY: [0, -3, 0, 3, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            repeatType: "loop" as const,
            ease: "easeInOut",
          }}
        >
          Tus documentos en manos de expertos
        </motion.span>
      </motion.p>

      <motion.button
        className="group inline-flex items-center gap-4 rounded-lg border-2 border-blue-500 bg-transparent px-6 py-3 text-white transition hover:bg-blue-500"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut", delay: 0.5 }}
        whileHover={{ scale: 1.05, backgroundColor: "rgba(59, 130, 246, 0.2)" }}
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
        <span className="text-xl"> Descubre más!</span>
      </motion.button>
    </motion.div>
  );
};

export default HeroSection;
