import React from "react";
import { motion } from "framer-motion";
import { MapPin } from "lucide-react";

const LocationSection: React.FC = () => {
  return (
    <section className="relative overflow-hidden bg-[#020617] py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid items-center gap-16 lg:grid-cols-[1fr,1.5fr]">
          {/* Left side - Text */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 font-[Space_Grotesk] text-xs font-bold tracking-[0.2em] text-blue-400 uppercase">
              <MapPin size={14} />
              Geolocalización
            </div>

            <h2 className="font-[Outfit] text-5xl leading-tight font-extrabold tracking-tighter text-white md:text-6xl">
              ¿Dónde estamos{" "}
              <span className="text-glow-blue text-blue-500">ubicados?</span>
            </h2>

            <div className="relative rounded-3xl border border-white/5 bg-slate-900/40 p-8 backdrop-blur-xl">
              <p className="font-[Outfit] text-xl leading-relaxed text-slate-300">
                Estamos ubicados en la{" "}
                <span className="font-semibold text-white">
                  Av. Independencia 1607
                </span>
                , Santo Domingo 10101, La Feria, frente a la OGM.
                <br />
                <br />
                <span className="font-[Space_Grotesk] text-sm tracking-widest text-blue-400 uppercase">
                  Referencia:
                </span>
                <br />
                Entrando por el callejón del Plaspilito.
              </p>
            </div>
          </motion.div>

          {/* Right side - Map */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="group relative"
          >
            {/* Cyber Frame for Map */}
            <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-blue-600 to-cyan-400 opacity-20 blur transition duration-1000 group-hover:opacity-40" />

            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black shadow-2xl">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3784.731960779048!2d-69.9315891239499!3d18.450475282629593!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8ea5635fabab61a7%3A0x1cc6b9e0dfa32f93!2sGuru%20Soluciones!5e0!3m2!1ses-419!2sdo!4v1759434493649!5m2!1ses-419!2sdo"
                width="100%"
                height="500"
                style={{
                  border: 0,
                  filter:
                    "invert(90%) hue-rotate(180deg) brightness(0.9) contrast(1.1)",
                }}
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="opacity-70 transition-opacity duration-500 group-hover:opacity-100"
              ></iframe>

              {/* HUD Overlay */}
              <div className="absolute bottom-8 left-8 rounded-xl border border-blue-500/20 bg-[#020617]/80 p-4 shadow-2xl backdrop-blur-md">
                <div className="mb-1 font-[Space_Grotesk] text-xs font-bold tracking-widest text-blue-400 uppercase">
                  Punto de Acceso
                </div>
                <div className="font-[Outfit] text-lg font-bold text-white">
                  Gurú Soluciones RD
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default LocationSection;
