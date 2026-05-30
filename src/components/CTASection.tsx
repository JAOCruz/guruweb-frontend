import React from "react";
import { motion } from "framer-motion";
import { MessageSquare, ArrowRight } from "lucide-react";

const NB = {
  btn: "border-4 border-[#000080] bg-[#0000FF] text-white shadow-[6px_6px_0px_0px_rgba(0,0,128,1)] transition-all hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-[3px_3px_0px_0px_rgba(0,0,128,1)] active:translate-x-[6px] active:translate-y-[6px] active:shadow-none",
  tag: "border-3 border-[#000080] bg-[#0000FF] text-white px-4 py-1.5 text-xs font-black uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(0,0,128,1)]",
  card: "border-4 border-[#000080] bg-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,128,1)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,128,1)]",
};

const CTASection: React.FC = () => {
  return (
    <section className="relative overflow-hidden bg-[#020617] py-24">
      <div className="relative z-10 mx-auto max-w-5xl px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className={`group relative overflow-hidden text-center ${NB.card} md:p-20`}
        >
          <div className="relative z-10 mx-auto max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className={`mb-8 inline-flex items-center gap-2 ${NB.tag}`}
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
              <span className="text-glow-blue border-b-4 border-[#000080] pb-2 text-blue-500">
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
                className={`group relative inline-flex items-center gap-4 ${NB.btn} px-12 py-6`}
              >
                <span className="relative flex items-center gap-3 font-[Space_Grotesk] text-xl font-bold tracking-widest text-white">
                  HABLAR CON UN GURÚ{" "}
                  <ArrowRight className="transition-transform group-hover:translate-x-2" />
                </span>
              </a>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
