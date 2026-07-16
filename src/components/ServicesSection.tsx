import React from "react";
import { motion } from "framer-motion";

const ServicesSection: React.FC = () => {
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
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  const services = [
    {
      id: 1,
      name: "Digitación de Contratos",
      description:
        "Digitalización profesional de contratos legales con máxima precisión y eficiencia.",
      image: "/digitacion_contratos.png",
    },
    {
      id: 2,
      name: "Abogado Notario",
      description:
        "Servicios de notarización y asesoría legal por abogados certificados.",
      image: "/abogado_notario.png",
    },
    {
      id: 3,
      name: "Solicitud de Certificaciones",
      description:
        "Gestión de certificaciones digitales y legales en instituciones públicas.",
      image: "/solicitud_certificaciones.png",
    },
    {
      id: 4,
      name: "Traducción e Intérprete Judicial",
      description:
        "Servicios de traducción profesional para documentos legales en múltiples idiomas.",
      image: "/traduccion.png",
    },
    {
      id: 5,
      name: "Fotos 2x2",
      description:
        "Servicio de fotografía profesional para documentos oficiales y trámites legales.",
      image: "/fotos_2x2.png",
    },
    {
      id: 6,
      name: "Servicio de Impresión",
      description:
        "Impresión de alta calidad para documentos legales, contratos y certificaciones.",
      image: "/impresion.png",
    },
    {
      id: 7,
      name: "Compra de Impuestos",
      description:
        "Gestión y compra de impuestos internos con asesoría especializada para tus trámites fiscales.",
      image: "/compra_impuestos.png",
    },
    {
      id: 8,
      name: "Artículos / Tienda",
      description:
        "Accede a nuestra tienda virtual con artículos y productos especializados para trámites legales.",
      image: "/articulos_tienda.png",
    },
    {
      id: 9,
      name: "Mensajería Express",
      description:
        "Servicio de mensajería rápida y segura para el depósito y entrega de documentos importantes.",
      image: "/mensajeria.png",
    },
  ];

  const borderClasses = [
    "neon-border-cyan",
    "neon-border-blue",
    "neon-border-purple",
  ];

  return (
    <motion.div
      className="section-base"
      id="servicios"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      variants={containerVariants}
    >
      <div className="mx-auto max-w-7xl">
        <motion.div className="mb-16 text-center opacity-0 animate-fade-up" variants={itemVariants}>
          <h2 className="gradient-text mb-6 text-4xl font-bold md:text-6xl">
            Nuestros Servicios
          </h2>
          <div className="neon-divider mx-auto mb-6 w-24" />
          <p className="mx-auto max-w-2xl text-lg text-gray-300">
            En Gurú Soluciones nos especializamos en una variedad de servicios
            legales para satisfacer todas tus necesidades documentales.
          </p>
        </motion.div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service, index) => (
            <motion.div
              key={service.id}
              className={`glass-panel group overflow-hidden rounded-xl opacity-0 animate-fade-up delay-${(index % 3) * 100}`}
              variants={itemVariants}
              whileHover={{
                y: -8,
                boxShadow: "0 0 40px rgba(6, 182, 212, 0.15)",
                transition: { duration: 0.3 },
              }}
            >
              <div className={`${borderClasses[index % 3]} relative h-full rounded-lg p-6`}>
                <div className="mb-6 flex items-center justify-between">
                  <h3 className="text-2xl font-bold text-white">
                    {service.name}
                  </h3>
                </div>
                <p className="mb-6 text-gray-300">{service.description}</p>
                <div className="mt-auto flex justify-center">
                  <img
                    src={service.image}
                    alt={service.name}
                    className="max-h-[200px] w-auto object-contain transition-all duration-300 group-hover:scale-105 group-hover:drop-shadow-[0_0_10px_rgba(6,182,212,0.4)]"
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        <div className="mt-16 flex justify-center">
          <motion.a
            href="https://wa.me/18298049017"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-neon group inline-flex items-center gap-4 rounded-lg px-8 py-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.5 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              animate={{ x: [0, 5, 0] }}
              transition={{
                repeat: Infinity,
                repeatType: "loop" as const,
                duration: 1.5,
              }}
              className="transition group-hover:translate-x-1"
            >
              <span className="text-4xl"> 👉🏾 </span>
            </motion.div>
            <span className="text-xl">
              Dejale el trabajo sucio al Gurú, haz click aquí ya!
            </span>
          </motion.a>
        </div>
      </div>
    </motion.div>
  );
};

export default ServicesSection;
