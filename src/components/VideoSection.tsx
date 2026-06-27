import React, { useRef } from "react";
import { motion } from "framer-motion";
import { Play } from "lucide-react";
import { NeoButton } from "./ui/neo";

const VideoSection: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);

  return (
    <section className="relative overflow-hidden bg-background py-24">
      <div className="relative z-10 mx-auto max-w-7xl px-6">
        <motion.div
          className="mb-8 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="font-heading text-2xl leading-tight font-medium text-foreground italic md:text-4xl">
            El GRUPO UNIFICADO DE REDACCIÓN UNIVERSAL{" "}
            <span className="font-bold text-main">(G.U.R.U.)</span>
          </h3>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="group relative"
        >
          <div className="relative overflow-hidden border-4 border-border bg-secondary-background shadow-shadow">
            <video
              ref={videoRef}
              className="h-auto max-h-[85vh] w-full object-contain"
              autoPlay
              loop
              muted
              playsInline
              disablePictureInPicture
              disableRemotePlayback
            >
              <source src="/1.mp4" type="video/mp4" />
              Tu navegador no soporta videos HTML5.
            </video>

            {/* Video Status Overlay */}
            <div className="pointer-events-none absolute inset-0 border-[20px] border-transparent border-t-main/10 border-l-main/10" />
            <div className="absolute right-6 bottom-4 flex items-center gap-2 font-base text-[10px] tracking-widest text-main/70">
              <span className="h-2 w-2 animate-pulse rounded-full bg-main" />
              LIVE_STREAM_DECODING
            </div>
          </div>
        </motion.div>

        <motion.div
          className="mt-12 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
        >
          <h4 className="font-heading text-xl leading-tight font-bold text-main not-italic md:text-3xl">
            Será tu aliado estratégico al garantizar resultados impecables!
          </h4>

          <div className="mt-12 flex justify-center">
            <NeoButton size="lg" asChild>
              <a
                href="https://wa.me/18298049017"
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-4 px-8 py-4"
              >
                <div className="rounded-base border-2 border-border bg-main-foreground p-2 text-main">
                  <Play size={20} fill="currentColor" />
                </div>
                <span className="font-base text-lg font-bold tracking-wide">
                  Déjale el trabajo sucio al Gurú, haz click aquí ya!
                </span>
              </a>
            </NeoButton>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default VideoSection;
