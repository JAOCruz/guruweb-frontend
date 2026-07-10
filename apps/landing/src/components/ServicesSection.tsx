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
import { NeoCard, NeoCardContent, NeoBadge, NeoButton } from "./ui/neo";

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
    },
    {
      id: 2,
      name: "Abogado Notario",
      description:
        "Servicios de notarización y asesoría legal por abogados certificados.",
      icon: <UserCheck size={28} />,
    },
    {
      id: 3,
      name: "Solicitud de Certificaciones",
      description:
        "Gestión de certificaciones digitales y legales en instituciones públicas.",
      icon: <ShieldCheck size={28} />,
    },
    {
      id: 4,
      name: "Traducción e Intérprete Judicial",
      description:
        "Servicios de traducción profesional para documentos legales en múltiples idiomas.",
      icon: <Languages size={28} />,
    },
    {
      id: 5,
      name: "Fotos 2x2",
      description:
        "Servicio de fotografía profesional para documentos oficiales y trámites legales.",
      icon: <Camera size={28} />,
    },
    {
      id: 6,
      name: "Servicio de Impresión",
      description:
        "Impresión de alta calidad para documentos legales, contratos y certificaciones.",
      icon: <Printer size={28} />,
    },
    {
      id: 7,
      name: "Compra de Impuestos",
      description:
        "Gestión y compra de impuestos internos con asesoría especializada para tus trámites fiscales.",
      icon: <Landmark size={28} />,
    },
    {
      id: 8,
      name: "Artículos / Tienda",
      description:
        "Accede a nuestra tienda virtual con artículos y productos especializados para trámites legales.",
      icon: <ShoppingBag size={28} />,
    },
    {
      id: 9,
      name: "Mensajería Express",
      description:
        "Servicio de mensajería rápida y segura para el depósito y entrega de documentos importantes.",
      icon: <Send size={28} />,
    },
  ];

  return (
    <section
      id="servicios"
      className="relative overflow-hidden bg-background py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <motion.div
          className="mb-1 text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
        >
          <motion.div variants={itemVariants} className="mb-4 inline-block">
            <NeoBadge variant="main">Especialidades</NeoBadge>
          </motion.div>
          <motion.h2
            className="mb-4 font-heading text-2xl font-extrabold tracking-tighter text-foreground md:text-4xl"
            variants={itemVariants}
          >
            Nuestros{" "}
            <span className="text-main">Servicios</span>
          </motion.h2>
          <motion.p
            className="mx-auto max-w-2xl font-base text-base text-foreground/70 md:text-lg"
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
            <motion.div key={service.id} variants={itemVariants} className="group">
              <NeoCard className="relative flex h-full flex-col transition-all hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none sm:p-8">
                <NeoCardContent className="flex h-full flex-col p-0">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-base border-2 border-border bg-main text-main-foreground shadow-shadow sm:mb-6 sm:h-14 sm:w-14">
                    {service.icon}
                  </div>

                  <h3 className="mb-3 font-heading text-xl font-bold text-foreground transition-colors group-hover:text-main sm:mb-4 sm:text-2xl">
                    {service.name}
                  </h3>

                  <p className="mb-6 flex-grow font-base text-base text-foreground/70 sm:mb-8">
                    {service.description}
                  </p>

                  <div className="flex items-center gap-2 font-base text-xs font-bold tracking-widest text-main uppercase opacity-0 transition-opacity group-hover:opacity-100">
                    Saber más <ArrowRight size={14} />
                  </div>
                </NeoCardContent>
              </NeoCard>
            </motion.div>
          ))}
        </motion.div>

        <div className="mt-20 flex justify-center">
          <NeoButton size="lg" asChild>
            <a
              href="https://wa.me/18298049017"
              target="_blank"
              rel="noopener noreferrer"
              className="font-base text-lg font-bold tracking-widest"
            >
              CONTACTAR AHORA
            </a>
          </NeoButton>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
