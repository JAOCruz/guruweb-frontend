import { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { Type, Scroll, Users, Sparkles, Crown } from "lucide-react";

const slides = [
  {
    icon: Type,
    title: "El oficio original",
    text: "Antes la mecanografía no era solo un oficio... era el pilar fundamental que dio forma a los 'paralegales callejeros' de la República Dominicana. Aquella mano de obra independiente —digitadores, escribientes, visionarios de la palabra— nació del pulso diario en los tribunales y destacamentos. Fue, en esencia, un séptimo arte forjado entre la necesidad y la técnica.",
    year: "1990s",
  },
  {
    icon: Scroll,
    title: "El puente entre eras",
    text: "Nosotros somos el puente entre esas dos eras. Somos la herencia de quienes aprendieron a trabajar codo a codo con la justicia, sobrellevando el hambre y la incertidumbre para convertir la adaptación en nuestra mayor ventaja competitiva.",
    year: "Herencia",
  },
  {
    icon: Crown,
    title: "Leandro Solís Gerónimo",
    text: "Hoy, ese legado vive en mí. Mi nombre es Leandro Solís Gerónimo, el CEO de nuestra historia, la cual no comenzó en una oficina, sino en el bullicio de los centros de internet desde que tenía 8 años de edad. Crecí viendo cómo cada cambio de ley se transformaba en una oportunidad, pasando de la cinta entintada de una máquina de escribir a la precisión infinita que tiene hoy la Inteligencia Artificial.",
    year: "CEO",
  },
  {
    icon: Users,
    title: "Equipo humano de alto nivel",
    text: "Nos caracteriza la garantía de ser un equipo humano de alto nivel y una red de trabajo. No solo digitamos documentos; redactamos el futuro de un sector laboral que aprendió a reinventarse.",
    year: "Hoy",
  },
  {
    icon: Sparkles,
    title: "Gurú Soluciones",
    text: "Aquel hombre que llegó a la capital en los 90, sin más equipaje que su cansancio y su actitud, hoy mira hacia atrás y ve una realidad distinta. Su hijo no solo heredó su tenacidad; ha transformado aquel pequeño esfuerzo en lo que hoy es Guru Soluciones!!",
    year: "Futuro",
  },
];

export default function HistorySection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const rawLineHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);
  const lineHeight = useSpring(rawLineHeight, { stiffness: 50, damping: 20 });

  const glowX = useTransform(scrollYProgress, [0, 1], ["-20%", "120%"]);

  return (
    <section
      ref={containerRef}
      className="relative overflow-hidden bg-[#0000FF] py-16 md:py-24"
    >
      {/* Animated background gradient */}
      <motion.div
        style={{ x: glowX }}
        className="pointer-events-none absolute -top-1/2 -left-1/4 h-[200%] w-[80%] bg-gradient-to-r from-transparent via-white/10 to-transparent blur-3xl"
      />

      {/* Dotted pattern */}
      <div className="pointer-events-none absolute inset-0 opacity-10">
        <div
          className="h-full w-full"
          style={{
            backgroundImage:
              "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16 text-center"
        >
          <h2 className="text-4xl font-black uppercase italic text-white md:text-6xl">
            Historia — Quienes Somos
          </h2>
          <p className="mt-3 text-sm text-white/80 md:text-base">
            Un recorrido por nuestras raíces y nuestra visión
          </p>
        </motion.div>

        {/* Timeline */}
        <div className="relative">
          {/* Background line */}
          <div className="absolute left-6 top-0 bottom-0 w-1 bg-[#000080]/50 md:left-1/2 md:-translate-x-1/2" />
          {/* Animated glowing line */}
          <motion.div
            style={{ height: lineHeight }}
            className="absolute left-6 top-0 w-1 origin-top bg-gradient-to-b from-white via-[#6ADCA8] to-white shadow-[0_0_20px_rgba(255,255,255,0.6)] md:left-1/2 md:-translate-x-1/2"
          />

          {slides.map((slide, index) => {
            const Icon = slide.icon;
            const isEven = index % 2 === 0;

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 80, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.7, delay: index * 0.08, ease: "easeOut" }}
                className={`relative mb-16 flex items-start gap-6 md:gap-0 ${
                  isEven ? "md:flex-row" : "md:flex-row-reverse"
                }`}
              >
                {/* Icon node on timeline */}
                <motion.div
                  whileInView={{ scale: [0.5, 1.2, 1] }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="absolute left-6 top-0 z-10 flex h-14 w-14 -translate-x-1/2 items-center justify-center rounded-full border-4 border-[#000080] bg-white text-[#0000FF] shadow-[4px_4px_0px_0px_rgba(0,0,128,1)] md:left-1/2"
                >
                  <Icon size={24} />
                </motion.div>

                {/* Content card */}
                <motion.div
                  whileHover={{ scale: 1.02, rotate: isEven ? -1 : 1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className={`ml-16 w-full md:ml-0 md:w-[45%] ${
                    isEven ? "md:pr-16 md:text-right" : "md:pl-16 md:text-left"
                  }`}
                >
                  <div className="group relative overflow-hidden border-4 border-[#000080] bg-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,128,1)] transition-shadow duration-300 hover:shadow-[8px_8px_0px_0px_rgba(0,0,128,1)]">
                    {/* Hover glow effect */}
                    <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 group-hover:translate-x-full" />

                    <motion.span
                      initial={{ opacity: 0, x: isEven ? 20 : -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.2 + index * 0.08 }}
                      className="mb-2 inline-block rounded bg-[#000080] px-3 py-1 text-xs font-bold text-white"
                    >
                      {slide.year}
                    </motion.span>
                    <h3 className="mb-3 text-xl font-black uppercase italic text-white md:text-2xl">
                      {slide.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-slate-300 md:text-base">
                      {slide.text}
                    </p>
                  </div>
                </motion.div>

                {/* Empty space for the other side */}
                <div className="hidden md:block md:w-[45%]" />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
