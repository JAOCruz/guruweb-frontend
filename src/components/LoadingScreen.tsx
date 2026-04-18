import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

const LoadingScreen: React.FC = () => {
  const [loadingText, setLoadingText] = useState("INITIALIZING_SYSTEM");

  useEffect(() => {
    const texts = [
      "ESTABLISHING_SECURE_CONNECTION",
      "DECRYPTING_USER_DATA",
      "LOADING_ASSETS",
      "SYSTEM_READY",
    ];
    let index = 0;

    const interval = setInterval(() => {
      setLoadingText(texts[index]);
      index = (index + 1) % texts.length;
    }, 800);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#020617] text-white">
      {/* Background Effects */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-[#020617] to-[#020617]" />
      <div className="scanlines absolute inset-0 z-10 opacity-20" />

      {/* Central Loader */}
      <div className="relative z-20 flex flex-col items-center">
        {/* Pulsing Logo (CSS-based) */}
        <style>{`
          @keyframes pulse-scale { 0%, 100% { transform: scale(0.95); opacity: 0.8; } 50% { transform: scale(1); opacity: 1; } }
          .logo-pulse { animation: pulse-scale 2s ease-in-out infinite; will-change: transform; }
        `}</style>
        <div className="logo-pulse mb-12 flex flex-col items-center leading-tight">
          <span className="font-[Outfit] text-5xl font-extrabold tracking-tighter text-white drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]">
            GURÚ
          </span>
          <span className="font-[Space_Grotesk] text-xs tracking-[0.5em] text-blue-400 uppercase">
            Soluciones
          </span>
        </div>

        {/* Cyber Spinner (CSS-based for better performance) */}
        <style>{`
          @keyframes spin-cw { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
          @keyframes spin-ccw { from { transform: rotate(0deg); } to { transform: rotate(-360deg); } }
          .spinner-outer { animation: spin-cw 2s linear infinite; will-change: transform; }
          .spinner-inner { animation: spin-ccw 3s linear infinite; will-change: transform; }
        `}</style>
        <div className="relative mb-8 h-24 w-24">
          {/* Outer Ring */}
          <div className="spinner-outer absolute inset-0 rounded-full border-2 border-transparent border-t-blue-500 border-r-blue-500/30" />
          {/* Inner Ring (Reverse) */}
          <div className="spinner-inner absolute inset-2 rounded-full border-2 border-transparent border-b-cyan-400 border-l-cyan-400/30" />
          {/* Center Dot */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-2 w-2 animate-pulse rounded-full bg-blue-500 shadow-[0_0_10px_#3b82f6]" />
          </div>
        </div>

        {/* Dynamic Loading Text */}
        <div className="flex h-16 flex-col items-center gap-2">
          <motion.div
            key={loadingText}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="font-[Space_Grotesk] text-sm tracking-[0.2em] text-blue-300"
          >
            {loadingText}
            <span className="animate-pulse">_</span>
          </motion.div>

          {/* Progress Bar */}
          <style>{`
            @keyframes progress-slide { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
            .progress-bar { animation: progress-slide 1.5s ease-in-out infinite; will-change: transform; }
          `}</style>
          <div className="mt-2 h-1 w-48 overflow-hidden rounded-full bg-blue-900/30">
            <div className="progress-bar h-full bg-gradient-to-r from-blue-500 to-cyan-400" />
          </div>
        </div>
      </div>

      {/* Footer System Info */}
      <div className="absolute bottom-12 text-center font-mono text-[10px] tracking-widest text-blue-500/40">
        <div>SYSTEM_V.2.0.4 // SECURE_BOOT</div>
        <div className="mt-1">© GURÚ SOLUCIONES</div>
      </div>
    </div>
  );
};

export default LoadingScreen;
