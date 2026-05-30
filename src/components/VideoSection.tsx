import React, { useRef } from "react";
import { motion } from "framer-motion";
import { Play } from "lucide-react";

const NB = {
  btn: "border-4 border-[#000080] bg-[#0000FF] text-white shadow-[6px_6px_0px_0px_rgba(0,0,128,1)] transition-all hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-[3px_3px_0px_0px_rgba(0,0,128,1)] active:translate-x-[6px] active:translate-y-[6px] active:shadow-none",
};

const VideoSection: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);

  return (
    <section className="relative overflow-hidden bg-[#020617] py-24">
      <div className="relative z-10 mx-auto max-w-4xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="group relative"
        >
          <div className="relative overflow-hidden border-4 border-[#000080] bg-black shadow-[6px_6px_0px_0px_rgba(0,0,128,1)]">
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
            <span className="mt-4 block font-bold text-blue-400 not-italic">
              Será tu aliado estratégico al garantizar resultados impecables!
            </span>
          </h3>

          <div className="mt-12 flex justify-center">
            <a
              href="https://wa.me/18298049017"
              target="_blank"
              rel="noopener noreferrer"
              className={`group relative inline-flex items-center gap-4 ${NB.btn} px-8 py-4`}
            >
              <div className="border-2 border-[#000080] bg-white p-2 text-[#0000FF]">
                <Play size={20} fill="currentColor" />
              </div>
              <span className="font-[Space_Grotesk] text-lg font-bold tracking-wide">
                Déjale el trabajo sucio al Gurú, haz click aquí ya!
              </span>
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default VideoSection;
