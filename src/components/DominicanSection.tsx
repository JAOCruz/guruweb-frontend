import React, { useRef } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { NeoBadge, NeoCard, NeoCardContent } from "./ui/neo";

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
    <section className="relative overflow-hidden bg-background py-24">
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
              <div className="mb-6 inline-flex items-center gap-2">
                <NeoBadge variant="main">
                  <span className="mr-2 h-2 w-2 animate-pulse rounded-full bg-main-foreground" />
                  Sede Central
                </NeoBadge>
              </div>

              <h2 className="mb-8 font-heading text-2xl font-extrabold tracking-tighter text-foreground md:text-4xl">
                Basados en{" "}
                <span className="inline-block text-main">
                  República Dominicana
                </span>
              </h2>

              <div className="space-y-6">
                <p className="font-base text-base leading-relaxed text-foreground md:text-lg">
                  Orgullosamente dominicanos, ofrecemos nuestros servicios
                  legales y documentales con la{" "}
                  <span className="font-semibold text-foreground">
                    calidez y profesionalismo
                  </span>{" "}
                  que nos caracteriza.
                </p>

                <p className="font-base text-base leading-relaxed text-foreground/70 md:text-lg">
                  Ubicados estratégicamente en Santo Domingo, atendemos clientes
                  en toda la isla, fusionando tradición legal con tecnología de
                  vanguardia para brindarte soluciones eficientes.
                </p>
              </div>
            </motion.div>

            {/* Stats Indicator */}
            <motion.div
              className="flex justify-center gap-12 pt-8 md:justify-start"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
            >
              <NeoCard className="min-w-[120px] text-center">
                <NeoCardContent className="p-0">
                  <div className="font-heading text-2xl font-bold tracking-tighter text-main">
                    100%
                  </div>
                  <div className="font-base text-[10px] tracking-widest text-foreground/50 uppercase">
                    Local_Support
                  </div>
                </NeoCardContent>
              </NeoCard>
              <NeoCard className="min-w-[120px] text-center">
                <NeoCardContent className="p-0">
                  <div className="font-heading text-2xl font-bold tracking-tighter text-main">
                    ISO_CERT
                  </div>
                  <div className="font-base text-[10px] tracking-widest text-foreground/50 uppercase">
                    Security_Protocol
                  </div>
                </NeoCardContent>
              </NeoCard>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DominicanSection;
