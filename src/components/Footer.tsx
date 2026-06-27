import React from "react";
import { motion } from "framer-motion";
import { Instagram, Mail, Phone, MapPin, ExternalLink } from "lucide-react";
import { NeoCard } from "./ui/neo";

const Footer: React.FC = () => {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      className="relative overflow-hidden border-t-4 border-border bg-background pt-24 pb-12"
    >
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-20 grid gap-16 text-center md:grid-cols-2 md:text-left lg:grid-cols-4">
          {/* Column 1: Brand */}
          <div className="space-y-6">
            <div className="flex flex-col">
              <span className="font-heading text-3xl font-extrabold tracking-tighter text-foreground">
                GURÚ
              </span>
              <span className="font-base text-xs tracking-[0.4em] text-main uppercase">
                Soluciones
              </span>
            </div>
            <p className="mx-auto max-w-xs font-base text-base leading-relaxed text-foreground/70 md:mx-0">
              Tu mejor opción local dentro del mundo legal. Cumpliendo con tus
              necesidades en solicitudes, poderes, contratos y más con precisión
              digital.
            </p>
          </div>

          {/* Column 2: Navigation */}
          <div className="space-y-6">
            <h3 className="font-base text-xs font-bold tracking-[0.3em] text-main uppercase">
              Plataforma
            </h3>
            <ul className="space-y-4">
              {["Inicio", "Servicios", "Sobre Nosotros"].map((link) => (
                <li key={link}>
                  <a
                    href={`#${link.toLowerCase().replace(" ", "-")}`}
                    className="group flex items-center justify-center gap-2 font-base text-foreground/70 transition-colors hover:text-foreground md:justify-start"
                  >
                    <span className="h-[1px] w-0 bg-main transition-all group-hover:w-2" />
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Contact */}
          <div className="space-y-6">
            <h3 className="font-base text-xs font-bold tracking-[0.3em] text-main uppercase">
              Conexión
            </h3>
            <ul className="space-y-4">
              <li>
                <a
                  href="https://wa.me/18298049017"
                  target="_blank"
                  className="flex items-center justify-center gap-3 font-base text-foreground/70 transition-colors hover:text-foreground md:justify-start"
                >
                  <Phone size={16} className="text-main" /> WhatsApp
                </a>
              </li>
              <li>
                <a
                  href="https://www.instagram.com/gurusolucionesrd"
                  target="_blank"
                  className="flex items-center justify-center gap-3 font-base text-foreground/70 transition-colors hover:text-foreground md:justify-start"
                >
                  <Instagram size={16} className="text-main" /> Instagram
                </a>
              </li>
              <li>
                <a
                  href="mailto:gurusoluciones01@gmail.com"
                  className="flex items-center justify-center gap-3 font-base text-foreground/70 transition-colors hover:text-foreground md:justify-start"
                >
                  <Mail size={16} className="text-main" /> Email
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Location Mini Map */}
          <div className="space-y-6">
            <h3 className="font-base text-xs font-bold tracking-[0.3em] text-main uppercase">
              Localización
            </h3>
            <NeoCard className="group relative overflow-hidden p-1">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3784.731960779048!2d-69.9315891239499!3d18.450475282629593!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8ea5635fabab61a7%3A0x1cc6b9e0dfa32f93!2sGuru%20Soluciones!5e0!3m2!1ses-419!2sdo!4v1759434493649!5m2!1ses-419!2sdo"
                width="100%"
                height="100"
                sandbox="allow-scripts allow-same-origin"
                style={{
                  border: 0,
                }}
                allowFullScreen={false}
                loading="lazy"
              ></iframe>
            </NeoCard>
            <p className="flex items-start justify-center gap-2 font-base text-[10px] leading-tight text-foreground/50 md:justify-start">
              <MapPin size={12} className="mt-0.5 shrink-0" />
              Av. Independencia 1607, Santo Domingo 10101, RD.
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col items-center justify-between gap-6 border-t-2 border-border pt-12 md:flex-row">
          <div className="font-base text-[10px] tracking-[0.2em] text-foreground/50 uppercase">
            GURÚ SOLUCIONES © {new Date().getFullYear()} // ALL_RIGHTS_RESERVED
          </div>

          <div className="flex items-center gap-6">
            <a
              href="#"
              className="font-base text-[10px] tracking-widest text-foreground/50 uppercase transition-colors hover:text-main"
            >
              Póliza de Privacidad
            </a>
            <a
              href="#"
              className="flex items-center gap-1 font-base text-[10px] tracking-widest text-foreground/50 uppercase transition-colors hover:text-main"
            >
              Despliegue_System <ExternalLink size={10} />
            </a>
          </div>
        </div>
      </div>
    </motion.footer>
  );
};

export default Footer;
