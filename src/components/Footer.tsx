import React from "react";
import { motion } from "framer-motion";

const Footer: React.FC = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <motion.footer
      className="bg-black px-8 py-16 text-white"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      variants={containerVariants}
    >
      <div className="mx-auto grid max-w-7xl gap-12 md:grid-cols-2 lg:grid-cols-4">
        {/* Column 1: Company Info */}
        <motion.div variants={itemVariants}>
          <div className="mb-4 text-3xl font-bold">
            GURÚ
            <div className="text-sm tracking-widest">SOLUCIONES</div>
          </div>
          <p className="text-sm leading-relaxed text-gray-400">
            Tu mejor opción local dentro del mundo legal. Cumpliendo con tus
            necesidades en solicitudes, poderes, contratos y más.
          </p>
        </motion.div>

        {/* Column 2: General Links */}
        <motion.div variants={itemVariants}>
          <h3 className="mb-6 text-lg font-semibold">General</h3>
          <ul className="flex flex-col gap-3">
            <li>
              <a href="#" className="text-gray-400 transition hover:text-white">
                Inicio
              </a>
            </li>
            <li>
              <a href="#" className="text-gray-400 transition hover:text-white">
                Servicios
              </a>
            </li>
            <li>
              <a href="#" className="text-gray-400 transition hover:text-white">
                Sobre Nosotros
              </a>
            </li>
          </ul>
        </motion.div>

        {/* Column 3: Social Links */}
        <motion.div variants={itemVariants}>
          <h3 className="mb-6 text-lg font-semibold">Social</h3>
          <ul className="flex flex-col gap-3">
            <li>
              <a
                href="https://wa.me/18298049017"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 transition hover:text-white"
              >
                WhatsApp
              </a>
            </li>
            <li>
              <a
                href="https://www.instagram.com/gurusolucionesrd"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 transition hover:text-white"
              >
                Instagram
              </a>
            </li>
            <li>
              <a
                href="mailto:gurusoluciones01@gmail.com"
                className="text-gray-400 transition hover:text-white"
              >
                Email
              </a>
            </li>
          </ul>
        </motion.div>

        {/* Column 4: Map */}
        <motion.div variants={itemVariants}>
          <h3 className="mb-4 text-lg font-semibold">
            Av. Independencia 1607, Santo Domingo 10101
          </h3>
          <div className="overflow-hidden rounded-lg border border-gray-800">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3784.731960779048!2d-69.9315891239499!3d18.450475282629593!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8ea5635fabab61a7%3A0x1cc6b9e0dfa32f93!2sGuru%20Soluciones!5e0!3m2!1ses-419!2sdo!4v1759434493649!5m2!1ses-419!2sdo"
              width="100%"
              height="150"
              style={{ border: 0 }}
              allowFullScreen={false}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="grayscale"
            ></iframe>
          </div>
        </motion.div>

        {/* Copyright */}
        <motion.div
          className="col-span-full mt-8 border-t border-gray-800 pt-8 text-center text-sm text-gray-500"
          variants={itemVariants}
        >
          Gurú Soluciones © {new Date().getFullYear()}
        </motion.div>
      </div>
    </motion.footer>
  );
};

export default Footer;
