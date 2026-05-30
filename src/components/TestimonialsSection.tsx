import React from "react";
import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const NB = {
  tag: "border-3 border-[#000080] bg-[#0000FF] text-white px-4 py-1.5 text-xs font-black uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(0,0,128,1)]",
  card: "border-4 border-[#000080] bg-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,128,1)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,128,1)]",
};

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
            className={`mb-4 inline-block ${NB.tag}`}
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
              className={`group relative overflow-hidden ${NB.card} p-10`}
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
                      className="fill-blue-500 text-blue-400"
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
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
