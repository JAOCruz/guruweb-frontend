import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
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
    offset: ["start start", "end end"],
  });

  const x = useTransform(scrollYProgress, [0, 1], ["0%", "-80%"]);
  const progressWidth = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <section
      ref={containerRef}
      className="relative bg-[#020617]"
      style={{ height: `${slides.length * 100}vh` }}
    >
      {/* Sticky viewport */}
      <div className="sticky top-0 flex h-screen flex-col overflow-hidden">
        {/* Header */}
        <div className="z-20 px-6 pt-16 pb-6 md:px-12">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-[Outfit] text-4xl font-bold uppercase italic text-white md:text-6xl"
          >
            Historia —{" "}
            <span className="text-[#6ADCA8]">Quienes Somos</span>
          </motion.h2>
          <p className="mt-2 max-w-2xl text-sm text-slate-400 md:text-base">
            Desplázate para recorrer nuestra historia
          </p>
        </div>

        {/* Horizontal track */}
        <div className="relative flex flex-1 items-center">
          <motion.div
            style={{ x }}
            className="flex h-full items-stretch gap-8 px-6 md:px-12"
          >
            {slides.map((slide, index) => {
              const Icon = slide.icon;
              return (
                <motion.div
                  key={index}
                  className="relative flex h-full w-[85vw] flex-shrink-0 flex-col justify-center md:w-[60vw]"
                >
                  {/* Background card */}
                  <div className="relative overflow-hidden rounded-3xl border border-slate-700/50 bg-gradient-to-br from-[#0F172A] to-[#1E293B] p-8 shadow-2xl md:p-12">
                    {/* Decorative glow */}
                    <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#6ADCA8]/10 blur-3xl" />
                    <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-[#0000FF]/10 blur-3xl" />

                    {/* Year badge */}
                    <div className="mb-6 inline-flex items-center gap-3 rounded-full border border-[#6ADCA8]/30 bg-[#6ADCA8]/10 px-4 py-2 text-[#6ADCA8]">
                      <Icon size={18} />
                      <span className="font-[Space_Grotesk] text-sm font-bold tracking-widest">
                        {slide.year}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="mb-6 font-[Outfit] text-2xl font-bold text-white md:text-4xl">
                      {slide.title}
                    </h3>

                    {/* Text */}
                    <p className="font-[Space_Grotesk] text-base leading-relaxed text-slate-300 md:text-lg">
                      {slide.text}
                    </p>

                    {/* Slide number */}
                    <div className="absolute right-6 bottom-6 font-[Space_Grotesk] text-6xl font-black text-slate-800 md:text-8xl">
                      0{index + 1}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>

        {/* Progress bar */}
        <div className="z-20 h-1 w-full bg-slate-800">
          <motion.div
            style={{ width: progressWidth }}
            className="h-full bg-gradient-to-r from-[#0000FF] to-[#6ADCA8]"
          />
        </div>

        {/* Scroll hint */}
        <div className="z-20 px-6 py-4 text-center text-xs text-slate-500 md:px-12">
          Sigue bajando para continuar la historia →
        </div>
      </div>
    </section>
  );
}
