import React from "react";
import { motion } from "framer-motion";

const TestimonialsSection: React.FC = () => {
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

  const testimonials = [
    {
      id: 1,
      rating: 5,
      text: "Mi compañero y yo quedamos muy a gusto con sus servicios. ¡Gracias!",
    },
    {
      id: 2,
      rating: 5,
      text: "El equipo de Guru es muy eficiente, me recibieron rápido y sin errores.",
    },
    {
      id: 3,
      rating: 5,
      text: "Me adscriben consiste mucho enviar el digite los contratos, sin embargo, cuando recibí el servicio de Guru Soluciones quedé completado de que el documento estaba perfecto.",
    },
    {
      id: 4,
      rating: 5,
      text: "Tenía un dejo con mi hijo y su última instancia me fijo que fallaba el permiso, pero gracias a Dios en Guru me mandaron rápido logrando irme de viaje.",
    },
  ];

  return (
    <motion.div
      className="section-base"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      variants={containerVariants}
    >
      <div className="mx-auto max-w-7xl">
        <motion.div className="mb-12 text-center opacity-0 animate-fade-up" variants={itemVariants}>
          <div className="mb-4 flex items-center justify-center gap-2">
            <div className="h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]"></div>
            <span className="text-sm tracking-wider text-gray-400">
              Testimonios
            </span>
          </div>
          <h2 className="gradient-text mb-4 text-4xl font-bold">
            Lo que dicen nuestros clientes
          </h2>
          <div className="neon-divider mx-auto mb-4 w-24" />
          <p className="mx-auto max-w-2xl text-lg text-gray-300">
            Descubre por qué nuestros clientes confían en nosotros para sus
            necesidades legales
          </p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              className={`glass-panel rounded-2xl p-8 text-left opacity-0 animate-fade-up delay-${index * 100}`}
              variants={itemVariants}
              whileHover={{
                y: -5,
                boxShadow: "0 0 30px rgba(6, 182, 212, 0.15)",
                transition: { duration: 0.3 },
              }}
            >
              <div className="mb-4 flex gap-1">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <span key={i} className="text-xl text-yellow-400 drop-shadow-[0_0_6px_rgba(250,204,21,0.6)]">
                    ★
                  </span>
                ))}
              </div>
              <p className="leading-relaxed text-gray-300">
                {testimonial.text}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default TestimonialsSection;
