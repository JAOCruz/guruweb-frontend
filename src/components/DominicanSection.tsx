import React, { useRef } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

const NB = {
  tag: "border-3 border-[#000080] bg-[#0000FF] text-white px-4 py-1.5 text-xs font-black uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(0,0,128,1)]",
};

const DominicanSection: React.FC = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const springRotateX = useSpring(rotateX, { stiffness: 200, damping: 20 });
  const springRotateY = useSpring(rotateY, { stiffness: 200, damping: 20 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!mapRef.current) return;
    const rect = mapRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const distanceX = (e.clientX - centerX) / (rect.width / 2);
    const distanceY = (e.clientY - centerY) / (rect.height / 2);
    rotateX.set(-distanceY * 15);
    rotateY.set(distanceX * 15);
  };

  const handleMouseLeave = () => {
    rotateX.set(0);
    rotateY.set(0);
  };

  return (
    <section className="relative overflow-hidden bg-[#020617] py-24">
      <div className="relative z-10 mx-auto max-w-7xl px-6">
        <div className="flex flex-col items-center gap-16 md:flex-row md:items-center">
          {/* Interactive Map Part */}
          <motion.div
            ref={mapRef}
            className="w-full max-w-lg cursor-pointer"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            style={{ perspective: "1000px" }}
          >
            <motion.div
              style={{
                rotateX: springRotateX,
                rotateY: springRotateY,
                transformStyle: "preserve-3d",
              }}
              className="group relative"
            >
              <img
                src="/rd_3d_3.png"
                alt="República Dominicana 3D"
                className="relative z-10 h-auto w-full transition-all duration-500"
              />
            </motion.div>
          </motion.div>

          {/* Text Content */}
          <div className="flex-1 space-y-8 text-center md:text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <div className={`mb-6 inline-flex items-center gap-2 ${NB.tag}`}>
                <span className="h-2 w-2 animate-pulse rounded-full bg-white" />
                Sede Central
              </div>

              <h2 className="mb-8 font-[Outfit] text-5xl font-extrabold tracking-tighter text-white md:text-7xl">
                Basados en{" "}
                <span className="text-glow-blue inline-block text-blue-500">
                  República Dominicana
                </span>
              </h2>

              <div className="space-y-6">
                <p className="font-[Outfit] text-xl leading-relaxed text-slate-300 md:text-2xl">
                  Orgullosamente dominicanos, ofrecemos nuestros servicios
                  legales y documentales con la{" "}
                  <span className="font-semibold text-white">
                    calidez y profesionalismo
                  </span>{" "}
                  que nos caracteriza.
                </p>

                <p className="font-[Outfit] text-lg leading-relaxed text-slate-400 md:text-xl">
                  Ubicados estratégicamente en Santo Domingo, atendemos clientes
                  en toda la isla, fusionando tradición legal con tecnología de
                  vanguardia para brindarte soluciones eficientes.
                </p>
              </div>
            </motion.div>

            {/* Tech Stats Indicator */}
            <motion.div
              className="flex justify-center gap-12 pt-8 md:justify-start"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
            >
              <div>
                <div className="font-[Space_Grotesk] text-2xl font-bold tracking-tighter text-blue-400">
                  100%
                </div>
                <div className="font-[Space_Grotesk] text-[10px] tracking-widest text-slate-500 uppercase">
                  Local_Support
                </div>
              </div>
              <div>
                <div className="font-[Space_Grotesk] text-2xl font-bold tracking-tighter text-blue-400">
                  ISO_CERT
                </div>
                <div className="font-[Space_Grotesk] text-[10px] tracking-widest text-slate-500 uppercase">
                  Security_Protocol
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DominicanSection;
