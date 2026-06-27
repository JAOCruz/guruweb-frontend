import { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { Type, Scroll, Users, Sparkles, Crown } from "lucide-react";
import { NeoCard, NeoCardContent, NeoBadge } from "./ui/neo";

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

  return (
    <section
      ref={containerRef}
      className="relative overflow-hidden bg-background py-16 md:py-24"
    >
      {/* Dotted pattern */}
      <div className="pointer-events-none absolute inset-0 opacity-10">
        <div
          className="h-full w-full"
          style={{
            backgroundImage:
              "radial-gradient(circle at 2px 2px, var(--foreground) 1px, transparent 0)",
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
          <div className="mb-4 inline-block">
            <NeoBadge variant="main">Historia</NeoBadge>
          </div>
          <h2 className="font-heading text-2xl font-black uppercase italic tracking-tighter text-foreground md:text-4xl">
            Quienes Somos
          </h2>
          <p className="mt-3 font-base text-base text-foreground/70 md:text-lg">
            Un recorrido por nuestras raíces y nuestra visión
          </p>
        </motion.div>

        {/* Timeline */}
        <div className="relative">
          {/* Background line */}
          <div className="absolute left-6 top-0 bottom-0 w-1 bg-border/50 md:left-1/2 md:-translate-x-1/2" />
          {/* Animated glowing line */}
          <motion.div
            style={{ height: lineHeight }}
            className="absolute left-6 top-0 w-1 origin-top bg-main md:left-1/2 md:-translate-x-1/2"
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
                  className="absolute left-6 top-0 z-10 flex h-14 w-14 -translate-x-1/2 items-center justify-center rounded-full border-4 border-border bg-main text-main-foreground shadow-shadow md:left-1/2"
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
                  <NeoCard className="group relative overflow-hidden transition-all hover:shadow-none">
                    <NeoCardContent className="p-0">
                      <NeoBadge variant="neutral" className="mb-3">
                        {slide.year}
                      </NeoBadge>
                      <h3 className="mb-3 font-heading text-xl font-black uppercase italic text-foreground md:text-2xl">
                        {slide.title}
                      </h3>
                      <p className="font-base text-base leading-relaxed text-foreground/70 md:text-lg">
                        {slide.text}
                      </p>
                    </NeoCardContent>
                  </NeoCard>
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
