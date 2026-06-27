import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

const LoadingScreen: React.FC = () => {
  const [loadingText, setLoadingText] = useState("CARGANDO");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const texts = [
      "CARGANDO",
      "PREPARANDO PANEL",
      "CONECTANDO SERVICIOS",
      "LISTO",
    ];
    let index = 0;

    const interval = setInterval(() => {
      setLoadingText(texts[index]);
      index = (index + 1) % texts.length;
    }, 700);

    const progressInterval = setInterval(() => {
      setProgress((prev) => (prev >= 100 ? 100 : prev + 5));
    }, 120);

    return () => {
      clearInterval(interval);
      clearInterval(progressInterval);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background p-6">
      {/* Background grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Central neo-brutalist loader */}
      <div className="relative z-10 flex w-full max-w-md flex-col items-center">
        {/* Main card */}
        <div className="mb-8 flex flex-col items-center rounded-base border-4 border-border bg-main p-8 shadow-shadow">
          <span className="font-heading text-6xl font-black tracking-tighter text-main-foreground md:text-7xl">
            GURÚ
          </span>
          <span className="mt-1 font-base text-sm font-black tracking-[0.5em] text-main-foreground/80 uppercase">
            Soluciones
          </span>
        </div>

        {/* Spinner blocks */}
        <div className="mb-8 grid grid-cols-3 gap-2">
          {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <motion.div
              key={i}
              className="h-4 w-4 rounded-sm border-2 border-border bg-main"
              animate={{
                scale: [1, 1.2, 1],
                backgroundColor: ["#0000FF", "#ffffff", "#0000FF"],
              }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                delay: i * 0.08,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>

        {/* Loading text */}
        <div className="mb-4 flex h-8 items-center justify-center">
          <motion.span
            key={loadingText}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="font-base text-lg font-black uppercase tracking-[0.2em] text-foreground"
          >
            {loadingText}
            <span className="animate-pulse">_</span>
          </motion.span>
        </div>

        {/* Progress bar */}
        <div className="h-4 w-full overflow-hidden rounded-base border-2 border-border bg-secondary-background shadow-[inset_2px_2px_0_0_rgba(0,0,0,0.1)]">
          <motion.div
            className="h-full bg-main"
            initial={{ width: "0%" }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.1 }}
          />
        </div>
        <span className="mt-2 font-mono text-sm font-black text-foreground/60">
          {progress}%
        </span>
      </div>

      {/* Footer */}
      <div className="absolute bottom-8 text-center font-base text-xs font-black tracking-widest text-foreground/40 uppercase">
        <div>GURÚ SOLUCIONES // SISTEMA V2.0</div>
      </div>
    </div>
  );
};

export default LoadingScreen;
