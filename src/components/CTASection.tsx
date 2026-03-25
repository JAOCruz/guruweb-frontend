import React from "react";
import { motion } from "framer-motion";
import { MessageSquare, ArrowRight } from "lucide-react";

const CTASection: React.FC = () => {
  return (
    <section className="relative overflow-hidden bg-[#020617] py-24">
      {/* Decorative Glows */}
      <div className="pointer-events-none absolute top-0 left-1/4 h-[500px] w-[500px] rounded-full bg-blue-600/10 blur-[120px]" />
      <div className="pointer-events-none absolute right-1/4 bottom-0 h-[500px] w-[500px] rounded-full bg-cyan-600/10 blur-[120px]" />

      <div className="relative z-10 mx-auto max-w-5xl px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="group relative overflow-hidden rounded-[2.5rem] border border-blue-500/20 bg-slate-900/40 p-12 text-center backdrop-blur-2xl md:p-20"
        >
          {/* Animated Background Gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-transparent to-cyan-500/5 opacity-0 transition-opacity duration-1000 group-hover:opacity-100" />

          <div className="relative z-10 mx-auto max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="mb-8 inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 font-[Space_Grotesk] text-xs font-bold tracking-[0.2em] text-blue-400 uppercase"
            >
              <MessageSquare size={14} />
              Acción Inmediata
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="mb-8 font-[Outfit] text-4xl leading-[1.1] font-extrabold tracking-tighter text-white md:text-6xl lg:text-7xl"
            >
              Déjanos hacer el <br />
              <span className="text-glow-blue border-b-4 border-blue-500/20 pb-2 text-blue-500">
                trabajo pesado
              </span>{" "}
              por ti
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="mb-12 font-[Outfit] text-xl text-slate-300 md:text-2xl"
            >
              Contáctanos ahora y recibe atención inmediata por parte de nuestro
              equipo de expertos.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
            >
              <a
                href="https://wa.me/18298049017"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative inline-flex items-center gap-4 bg-transparent px-12 py-6 focus:outline-none"
              >
                {/* Master Button Shape */}
                <div className="absolute inset-0 skew-x-[-12deg] rounded-xl bg-blue-600 shadow-[0_0_30px_rgba(59,130,246,0.5)] transition-all duration-300 group-hover:scale-105 group-hover:shadow-[0_0_50px_rgba(59,130,246,0.8)]" />

                <span className="relative flex items-center gap-3 font-[Space_Grotesk] text-xl font-bold tracking-widest text-white">
                  HABLAR CON UN GURÚ{" "}
                  <ArrowRight className="transition-transform group-hover:translate-x-2" />
                </span>
              </a>
            </motion.div>
          </div>

          {/* HUD Accents */}
          <div className="absolute top-6 left-6 h-12 w-12 rounded-tl-xl border-t-2 border-l-2 border-blue-500/20" />
          <div className="absolute top-6 right-6 h-12 w-12 rounded-tr-xl border-t-2 border-r-2 border-blue-500/20" />
          <div className="absolute bottom-6 left-6 h-12 w-12 rounded-bl-xl border-b-2 border-l-2 border-blue-500/20" />
          <div className="absolute right-6 bottom-6 h-12 w-12 rounded-br-xl border-r-2 border-b-2 border-blue-500/20" />
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
