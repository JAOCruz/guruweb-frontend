import { motion } from "framer-motion";
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
  return (
    <section className="relative overflow-hidden bg-[#0000FF] py-16 md:py-24">
      {/* Background pattern */}
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
          className="mb-12 text-center"
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
          {/* Vertical line */}
          <div className="absolute left-6 top-0 bottom-0 w-1 bg-[#000080] md:left-1/2 md:-translate-x-1/2" />

          {slides.map((slide, index) => {
            const Icon = slide.icon;
            const isEven = index % 2 === 0;

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className={`relative mb-12 flex items-start gap-6 md:gap-0 ${
                  isEven ? "md:flex-row" : "md:flex-row-reverse"
                }`}
              >
                {/* Icon node on timeline */}
                <div className="absolute left-6 top-0 z-10 flex h-12 w-12 -translate-x-1/2 items-center justify-center rounded-full border-4 border-[#000080] bg-white text-[#0000FF] shadow-[4px_4px_0px_0px_rgba(0,0,128,1)] md:left-1/2">
                  <Icon size={20} />
                </div>

                {/* Content card */}
                <div
                  className={`ml-16 w-full md:ml-0 md:w-[45%] ${
                    isEven ? "md:pr-12 md:text-right" : "md:pl-12 md:text-left"
                  }`}
                >
                  <div className="border-4 border-[#000080] bg-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,128,1)]">
                    <span className="mb-2 inline-block rounded bg-[#000080] px-2 py-1 text-xs font-bold text-white">
                      {slide.year}
                    </span>
                    <h3 className="mb-3 text-xl font-black uppercase italic text-white md:text-2xl">
                      {slide.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-slate-300 md:text-base">
                      {slide.text}
                    </p>
                  </div>
                </div>

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
