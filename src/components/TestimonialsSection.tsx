import React from "react";
import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const TestimonialsSection: React.FC = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
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

  const testimonials = [
    {
      id: 1,
      rating: 5,
      text: "Son muy profesionales, una vez me estaban por cerrar procuraduria y esa gente me ayudaron muy amablemente a crear el documento sin errores y bastantee rapidos, excelentee atencion",
      author: "Cliente Satisfecho",
    },
    {
      id: 2,
      rating: 5,
      text: "Recuerdo una vez estaba haciendo una maestria en italia, ellos me ayudaron a traducir y apoatillar los documentos por ahi mismo, no tuve que hablar mucho, excelentee manejoo",
      author: "Usuario de Redacción",
    },
    {
      id: 3,
      rating: 5,
      text: "Estaba cerca de la feria, me dijeron que vaya donde un tal guru que me ayuda con la correccion de documentos con maquina de escribir... que mayimbe mano!",
      author: "Profesional Legal",
    },
    {
      id: 4,
      rating: 5,
      text: "Soy abogado de muchos años en el oficio, te cuento es bastante comodo mandar a pedir una certificacion de estatus juridico o la redaccion de expedientes con ellos, no tengo que moverme de mi casa para nada compadre, bendiciones de lo alto para su negocioo!",
      author: "Familia Unida",
    },
  ];

  return (
    <section className="relative overflow-hidden bg-[#020617] py-24">
      {/* Decorative vertical lines */}
      <div className="pointer-events-none absolute top-0 right-10 h-full w-[1px] bg-gradient-to-b from-transparent via-blue-500/20 to-transparent" />
      <div className="pointer-events-none absolute top-0 left-10 h-full w-[1px] bg-gradient-to-b from-transparent via-blue-500/20 to-transparent" />

      <div className="mx-auto max-w-7xl px-6">
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
            Feedback
          </motion.div>
          <motion.h2
            className="mb-6 font-[Outfit] text-5xl font-extrabold tracking-tighter text-white md:text-7xl"
            variants={itemVariants}
          >
            Lo que dicen{" "}
            <span className="text-glow-blue text-blue-500">
              nuestros clientes
            </span>
          </motion.h2>
        </motion.div>

        <motion.div
          className="grid gap-8 md:grid-cols-2"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={containerVariants}
        >
          {testimonials.map((testimonial) => (
            <motion.div
              key={testimonial.id}
              variants={itemVariants}
              whileHover={{ y: -5 }}
              className="group relative overflow-hidden rounded-3xl border border-white/5 bg-slate-900/40 p-10 shadow-2xl backdrop-blur-xl"
            >
              {/* Massive Quote Icon Background */}
              <Quote
                size={120}
                className="absolute -top-10 -right-10 rotate-12 text-blue-500/5"
              />

              <div className="relative z-10">
                <div className="mb-6 flex gap-1">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      size={18}
                      className="fill-blue-500 text-blue-400 drop-shadow-[0_0_8px_rgba(59,130,246,0.6)]"
                    />
                  ))}
                </div>

                <p className="mb-8 font-[Outfit] text-xl leading-relaxed text-slate-200 italic md:text-2xl">
                  "{testimonial.text}"
                </p>

                <div className="flex items-center gap-4">
                  <div className="h-[1px] w-10 bg-blue-500/50" />
                  <span className="font-[Space_Grotesk] text-xs font-bold tracking-widest text-blue-400 uppercase">
                    {testimonial.author}
                  </span>
                </div>
              </div>

              {/* Hover Accent */}
              <div className="absolute bottom-0 left-0 h-1 w-full origin-left scale-x-0 transform bg-gradient-to-r from-blue-600 to-cyan-400 transition-transform duration-500 group-hover:scale-x-100" />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
