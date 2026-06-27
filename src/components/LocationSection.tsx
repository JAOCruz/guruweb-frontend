import React from "react";
import { motion } from "framer-motion";
import { MapPin } from "lucide-react";
import { NeoCard, NeoCardContent, NeoBadge } from "./ui/neo";

const LocationSection: React.FC = () => {
  return (
    <section className="relative overflow-hidden bg-secondary-background py-24">
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
            <div className="mb-4 inline-flex items-center gap-2">
              <NeoBadge variant="main">
                <MapPin size={14} className="mr-2" />
                Geolocalización
              </NeoBadge>
            </div>

            <h2 className="font-heading text-2xl leading-tight font-extrabold tracking-tighter text-foreground md:text-4xl">
              ¿Dónde estamos{" "}
              <span className="text-main">ubicados?</span>
            </h2>

            <NeoCard className="rounded-base p-8">
              <NeoCardContent className="p-0">
                <p className="font-base text-base leading-relaxed text-foreground md:text-lg">
                  Estamos ubicados en la{" "}
                  <span className="font-semibold text-foreground">
                    Av. Independencia 1607
                  </span>
                  , Santo Domingo 10101, La Feria, frente a la OGM.
                  <br />
                  <br />
                  <span className="font-base text-sm font-bold tracking-widest text-main uppercase">
                    Referencia:
                  </span>
                  <br />
                  Entrando por el callejón del Plaspilito.
                </p>
              </NeoCardContent>
            </NeoCard>
          </motion.div>

          {/* Right side - Map */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="group relative"
          >
            <div className="relative overflow-hidden border-4 border-border bg-background shadow-shadow">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3784.731960779048!2d-69.9315891239499!3d18.450475282629593!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8ea5635fabab61a7%3A0x1cc6b9e0dfa32f93!2sGuru%20Soluciones!5e0!3m2!1ses-419!2sdo!4v1759434493649!5m2!1ses-419!2sdo"
                width="100%"
                height="500"
                sandbox="allow-scripts allow-same-origin"
                style={{
                  border: 0,
                }}
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="opacity-90 transition-opacity duration-500 group-hover:opacity-100"
              ></iframe>

              {/* Location Overlay */}
              <div className="absolute bottom-8 left-8">
                <NeoCard className="p-4">
                  <NeoCardContent className="p-0">
                    <div className="mb-1 font-base text-xs font-bold tracking-widest text-main uppercase">
                      Punto de Acceso
                    </div>
                    <div className="font-heading text-lg font-bold text-foreground">
                      Gurú Soluciones RD
                    </div>
                  </NeoCardContent>
                </NeoCard>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default LocationSection;
