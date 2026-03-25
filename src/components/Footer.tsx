import React from "react";
import { motion } from "framer-motion";
import { Instagram, Mail, Phone, MapPin, ExternalLink } from "lucide-react";

const Footer: React.FC = () => {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      className="relative overflow-hidden border-t border-blue-500/10 bg-[#020617] pt-24 pb-12"
    >
      {/* Background Decor */}
      <div className="absolute top-0 left-1/2 h-[1px] w-full -translate-x-1/2 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent shadow-[0_0_20px_rgba(59,130,246,0.5)]" />

      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-20 grid gap-16 text-center md:grid-cols-2 md:text-left lg:grid-cols-4">
          {/* Column 1: Brand */}
          <div className="space-y-6">
            <div className="flex flex-col">
              <span className="font-[Outfit] text-3xl font-extrabold tracking-tighter text-white">
                GURÚ
              </span>
              <span className="font-[Space_Grotesk] text-xs tracking-[0.4em] text-blue-400 uppercase">
                Soluciones
              </span>
            </div>
            <p className="mx-auto max-w-xs font-[Outfit] text-sm leading-relaxed text-slate-400 md:mx-0">
              Tu mejor opción local dentro del mundo legal. Cumpliendo con tus
              necesidades en solicitudes, poderes, contratos y más con precisión
              digital.
            </p>
          </div>

          {/* Column 2: Navigation */}
          <div className="space-y-6">
            <h3 className="font-[Space_Grotesk] text-xs font-bold tracking-[0.3em] text-blue-500 uppercase">
              Plataforma
            </h3>
            <ul className="space-y-4">
              {["Inicio", "Servicios", "Sobre Nosotros"].map((link) => (
                <li key={link}>
                  <a
                    href={`#${link.toLowerCase().replace(" ", "-")}`}
                    className="group flex items-center justify-center gap-2 font-[Outfit] text-slate-400 transition-colors hover:text-white md:justify-start"
                  >
                    <span className="h-[1px] w-0 bg-blue-500 transition-all group-hover:w-2" />
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Contact */}
          <div className="space-y-6">
            <h3 className="font-[Space_Grotesk] text-xs font-bold tracking-[0.3em] text-blue-500 uppercase">
              Conexión
            </h3>
            <ul className="space-y-4">
              <li>
                <a
                  href="https://wa.me/18298049017"
                  target="_blank"
                  className="flex items-center justify-center gap-3 font-[Outfit] text-slate-400 transition-colors hover:text-white md:justify-start"
                >
                  <Phone size={16} className="text-blue-500" /> WhatsApp
                </a>
              </li>
              <li>
                <a
                  href="https://www.instagram.com/gurusolucionesrd"
                  target="_blank"
                  className="flex items-center justify-center gap-3 font-[Outfit] text-slate-400 transition-colors hover:text-white md:justify-start"
                >
                  <Instagram size={16} className="text-blue-500" /> Instagram
                </a>
              </li>
              <li>
                <a
                  href="mailto:gurusoluciones01@gmail.com"
                  className="flex items-center justify-center gap-3 font-[Outfit] text-slate-400 transition-colors hover:text-white md:justify-start"
                >
                  <Mail size={16} className="text-blue-500" /> Email
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Location Mini Map */}
          <div className="space-y-6">
            <h3 className="font-[Space_Grotesk] text-xs font-bold tracking-[0.3em] text-blue-500 uppercase">
              Localización
            </h3>
            <div className="group relative overflow-hidden rounded-xl border border-white/5 bg-slate-900/40 p-1">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3784.731960779048!2d-69.9315891239499!3d18.450475282629593!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8ea5635fabab61a7%3A0x1cc6b9e0dfa32f93!2sGuru%20Soluciones!5e0!3m2!1ses-419!2sdo!4v1759434493649!5m2!1ses-419!2sdo"
                width="100%"
                height="100"
                style={{
                  border: 0,
                  filter: "invert(90%) hue-rotate(180deg) brightness(0.8)",
                }}
                allowFullScreen={false}
                loading="lazy"
              ></iframe>
              <div className="pointer-events-none absolute inset-0 bg-blue-500/5" />
            </div>
            <p className="flex items-start justify-center gap-2 font-[Outfit] text-[10px] leading-tight text-slate-500 md:justify-start">
              <MapPin size={12} className="mt-0.5 shrink-0" />
              Av. Independencia 1607, Santo Domingo 10101, RD.
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col items-center justify-between gap-6 border-t border-white/5 pt-12 md:flex-row">
          <div className="font-[Space_Grotesk] text-[10px] tracking-[0.2em] text-slate-500 uppercase">
            GURÚ SOLUCIONES © {new Date().getFullYear()} // ALL_RIGHTS_RESERVED
          </div>

          <div className="flex items-center gap-6">
            <a
              href="#"
              className="font-[Space_Grotesk] text-[10px] tracking-widest text-slate-500 uppercase transition-colors hover:text-blue-400"
            >
              Póliza de Privacidad
            </a>
            <a
              href="#"
              className="flex items-center gap-1 font-[Space_Grotesk] text-[10px] tracking-widest text-slate-500 uppercase transition-colors hover:text-blue-400"
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
