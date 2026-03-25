import React, { useRef } from "react";
import { motion } from "framer-motion";
import { Play } from "lucide-react";

const VideoSection: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);

  return (
    <section className="relative overflow-hidden bg-[#020617] py-24">
      {/* Background Glow */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 h-[500px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600/10 blur-[120px]" />

      <div className="relative z-10 mx-auto max-w-4xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="group relative"
        >
          {/* Cyber Frame */}
          <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-blue-600 to-cyan-500 opacity-25 blur transition duration-1000 group-hover:opacity-50 group-hover:duration-200" />

          <div className="relative overflow-hidden rounded-2xl border border-blue-500/30 bg-black shadow-2xl">
            <video
              ref={videoRef}
              className="aspect-video w-full object-cover"
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

            {/* Video HUD Overlay */}
            <div className="pointer-events-none absolute inset-0 border-[20px] border-transparent border-t-blue-500/5 border-l-blue-500/5" />
            <div className="absolute right-6 bottom-4 flex items-center gap-2 font-mono text-[10px] tracking-widest text-blue-400/50">
              <span className="h-2 w-2 animate-pulse rounded-full bg-blue-500" />
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
          <h3 className="font-[Outfit] text-2xl leading-tight font-medium text-slate-200 italic md:text-4xl">
            El GRUPO UNIFICADO DE REDACCIÓN UNIVERSAL{" "}
            <span className="font-bold text-white">(G.U.R.U.)</span>,
            <span className="mt-4 block font-bold text-blue-400 not-italic drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]">
              Será tu aliado estratégico al garantizar resultados impecables!
            </span>
          </h3>

          <div className="mt-12 flex justify-center">
            <motion.a
              href="https://wa.me/18298049017"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="group relative flex items-center gap-6 bg-transparent px-8 py-4 focus:outline-none"
            >
              {/* Button Shape */}
              <div className="absolute inset-0 skew-x-[-12deg] rounded-xl border border-blue-500/50 bg-blue-600/10 transition-all duration-300 group-hover:bg-blue-600 group-hover:shadow-[0_0_30px_rgba(59,130,246,0.5)]" />

              <div className="relative flex items-center gap-4 text-white">
                <div className="rounded-lg bg-blue-500 p-2 transition-colors group-hover:bg-white group-hover:text-blue-600">
                  <Play size={20} fill="currentColor" />
                </div>
                <span className="font-[Space_Grotesk] text-lg font-bold tracking-wide">
                  Déjale el trabajo sucio al Gurú, haz click aquí ya!
                </span>
              </div>
            </motion.a>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default VideoSection;
