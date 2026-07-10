import React from "react";
import { motion } from "framer-motion";
import { MessageSquare, ArrowRight } from "lucide-react";
import { NeoCard, NeoCardContent, NeoBadge, NeoButton } from "./ui/neo";

const CTASection: React.FC = () => {
  return (
    <section className="relative overflow-hidden bg-secondary-background py-24">
      <div className="relative z-10 mx-auto max-w-5xl px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
        >
          <NeoCard className="group relative overflow-hidden text-center md:p-20">
            <NeoCardContent className="relative z-10 mx-auto max-w-3xl p-0">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="mb-8 inline-flex items-center gap-2"
              >
                <NeoBadge variant="main">
                  <MessageSquare size={14} className="mr-2" />
                  Acción Inmediata
                </NeoBadge>
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="mb-8 font-heading text-2xl leading-[1.1] font-extrabold tracking-tighter text-foreground md:text-4xl"
              >
                Déjanos hacer el <br />
                <span className="border-b-4 border-main pb-2 text-main">
                  trabajo pesado
                </span>{" "}
                por ti
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                className="mb-12 font-base text-base text-foreground/70 md:text-lg"
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
                <NeoButton size="lg" asChild>
                  <a
                    href="https://wa.me/18298049017"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-4 px-12 py-6"
                  >
                    <span className="relative flex items-center gap-3 font-base text-xl font-bold tracking-widest">
                      HABLAR CON UN GURÚ{" "}
                      <ArrowRight className="transition-transform group-hover:translate-x-2" />
                    </span>
                  </a>
                </NeoButton>
              </motion.div>
            </NeoCardContent>
          </NeoCard>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
