import React from "react";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  UserCheck,
  FileText,
  Languages,
  Camera,
  Printer,
  Landmark,
  ShoppingBag,
  Send,
  ArrowRight,
} from "lucide-react";

const ServicesSection: React.FC = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };

  const services = [
    {
      id: 1,
      name: "Digitación de Contratos",
      description:
        "Digitalización profesional de contratos legales con máxima precisión y eficiencia.",
      icon: <FileText size={28} />,
      color: "from-blue-500 to-cyan-400",
    },
    {
      id: 2,
      name: "Abogado Notario",
      description:
        "Servicios de notarización y asesoría legal por abogados certificados.",
      icon: <UserCheck size={28} />,
      color: "from-purple-500 to-blue-400",
    },
    {
      id: 3,
      name: "Solicitud de Certificaciones",
      description:
        "Gestión de certificaciones digitales y legales en instituciones públicas.",
      icon: <ShieldCheck size={28} />,
      color: "from-cyan-500 to-blue-400",
    },
    {
      id: 4,
      name: "Traducción e Intérprete Judicial",
      description:
        "Servicios de traducción profesional para documentos legales en múltiples idiomas.",
      icon: <Languages size={28} />,
      color: "from-blue-600 to-indigo-500",
    },
    {
      id: 5,
      name: "Fotos 2x2",
      description:
        "Servicio de fotografía profesional para documentos oficiales y trámites legales.",
      icon: <Camera size={28} />,
      color: "from-indigo-500 to-purple-500",
    },
    {
      id: 6,
      name: "Servicio de Impresión",
      description:
        "Impresión de alta calidad para documentos legales, contratos y certificaciones.",
      icon: <Printer size={28} />,
      color: "from-blue-400 to-cyan-300",
    },
    {
      id: 7,
      name: "Compra de Impuestos",
      description:
        "Gestión y compra de impuestos internos con asesoría especializada para tus trámites fiscales.",
      icon: <Landmark size={28} />,
      color: "from-cyan-400 to-blue-500",
    },
    {
      id: 8,
      name: "Artículos / Tienda",
      description:
        "Accede a nuestra tienda virtual con artículos y productos especializados para trámites legales.",
      icon: <ShoppingBag size={28} />,
      color: "from-purple-400 to-indigo-500",
    },
    {
      id: 9,
      name: "Mensajería Express",
      description:
        "Servicio de mensajería rápida y segura para el depósito y entrega de documentos importantes.",
      icon: <Send size={28} />,
      color: "from-blue-500 to-indigo-400",
    },
  ];

  return (
    <section
      id="servicios"
      className="relative overflow-hidden bg-[#020617] py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <motion.div
          className="mb-20 text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
        >
          <motion.div
            variants={itemVariants}
            className="mb-4 inline-block rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 font-[Space_Grotesk] text-xs font-bold tracking-[0.2em] text-blue-400 uppercase"
          >
            Especialidades
          </motion.div>
          <motion.h2
            className="mb-6 font-[Outfit] text-3xl font-extrabold tracking-tighter text-white sm:text-5xl md:text-7xl"
            variants={itemVariants}
          >
            Nuestros{" "}
            <span className="text-glow-blue text-blue-500">Servicios</span>
          </motion.h2>
          <motion.p
            className="mx-auto max-w-2xl font-[Outfit] text-base text-slate-400 sm:text-xl"
            variants={itemVariants}
          >
            En Gurú Soluciones nos especializamos en una variedad de servicios
            legales para satisfacer todas tus necesidades documentales con
            precisión quirúrgica.
          </motion.p>
        </motion.div>

        <motion.div
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={containerVariants}
        >
          {services.map((service) => (
            <motion.div
              key={service.id}
              variants={itemVariants}
              whileHover={{ y: -5 }}
              className="group relative"
            >
              {/* Card Glow Background */}
              <div
                className={`absolute -inset-0.5 bg-gradient-to-r ${service.color} rounded-2xl opacity-0 blur transition duration-500 group-hover:opacity-20`}
              />

              <div className="relative flex h-full flex-col rounded-2xl border border-white/5 bg-slate-900/40 p-5 backdrop-blur-sm sm:p-8">
                <div
                  className={`h-12 w-12 rounded-xl bg-gradient-to-br ${service.color} mb-4 flex items-center justify-center text-white shadow-lg shadow-blue-500/10 sm:mb-6 sm:h-14 sm:w-14`}
                >
                  {service.icon}
                </div>

                <h3 className="mb-3 font-[Outfit] text-xl font-bold text-white transition-colors group-hover:text-blue-400 sm:mb-4 sm:text-2xl">
                  {service.name}
                </h3>

                <p className="mb-6 flex-grow font-[Outfit] text-sm text-slate-400 sm:mb-8 sm:text-base">
                  {service.description}
                </p>

                <div className="flex items-center gap-2 font-[Space_Grotesk] text-xs font-bold tracking-widest text-blue-400 uppercase opacity-0 transition-opacity group-hover:opacity-100">
                  Saber más <ArrowRight size={14} />
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <div className="mt-20 flex justify-center">
          <motion.a
            href="https://wa.me/18298049017"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="group relative bg-transparent px-10 py-5 focus:outline-none"
          >
            <div className="absolute inset-0 skew-x-[-12deg] rounded-xl border border-blue-500/50 bg-blue-600/10 transition-all duration-300 group-hover:bg-blue-600 group-hover:shadow-[0_0_30px_rgba(59,130,246,0.5)]" />
            <span className="relative font-[Space_Grotesk] text-lg font-bold tracking-widest text-white">
              CONTACTAR AHORA
            </span>
          </motion.a>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
