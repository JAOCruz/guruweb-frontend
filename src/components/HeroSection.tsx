import React from "react";
import Starfield from "./Starfield";

const HeroSection: React.FC = () => {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#020617]">
      {/* Starfield */}
      <Starfield />

      {/* Geometric grid */}
      <div className="grid-bg grid-fade absolute inset-0 z-[1]" />

      {/* Ambient radial glow */}
      <div className="absolute inset-0 z-[1] bg-[radial-gradient(ellipse_at_center,rgba(6,182,212,0.06)_0%,transparent_60%)]" />

      {/* Top neon line */}
      <div className="absolute top-0 left-0 right-0 z-[10] h-[1px] bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent" />

      {/* Main content */}
      <div className="relative z-[5] mx-auto flex max-w-5xl flex-col items-center px-6 text-center">
        {/* Badge */}
        <div
          className="animate-fade-up mb-8 inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/5 px-4 py-1.5 text-xs font-medium tracking-widest text-cyan-400 uppercase opacity-0"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-400" />
          Sistema Legal Inteligente v2.0
        </div>

        {/* Mascot */}
        <div className="animate-fade-up delay-100 mb-8 opacity-0">
          <img
            src="/mascot_1.png"
            alt="Gurú Búho"
            className="h-24 w-auto drop-shadow-[0_0_25px_rgba(6,182,212,0.3)] transition-transform duration-500 hover:scale-105 md:h-32"
          />
        </div>

        {/* Headline */}
        <h1 className="animate-fade-up delay-200 mb-6 opacity-0">
          <span className="block text-4xl font-extrabold leading-tight tracking-tight text-white md:text-6xl lg:text-7xl">
            Una Experiencia
          </span>
          <span className="gradient-text mt-2 block text-4xl font-extrabold leading-tight tracking-tight md:text-6xl lg:text-7xl">
            Legal Inteligente
          </span>
        </h1>

        {/* Decorative line */}
        <div className="animate-fade-up delay-300 mb-8 flex w-full max-w-xs items-center gap-4 opacity-0">
          <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-cyan-500/30" />
          <div className="h-1.5 w-1.5 rotate-45 bg-cyan-400/60" />
          <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-cyan-500/30" />
        </div>

        {/* Subtitle */}
        <p
          className="animate-fade-up delay-400 mb-10 max-w-xl text-lg font-light leading-relaxed text-gray-400 md:text-xl opacity-0"
          style={{ fontFamily: "'Outfit', sans-serif" }}
        >
          Tus documentos en manos de expertos. Tecnología de punta al servicio
          de la justicia dominicana.
        </p>

        {/* CTA Row */}
        <div className="animate-fade-up delay-500 flex flex-col items-center gap-4 opacity-0 sm:flex-row">
          <button
            className="btn-neon group flex items-center gap-3"
            onClick={() => {
              document.getElementById("about")?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            <span>Descubre más</span>
            <svg
              className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </button>
          <a
            href="https://wa.me/18095325678"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-gray-500 transition-colors hover:text-cyan-400"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
            Habla con un Gurú ahora
          </a>
        </div>

        {/* Stats row */}
        <div className="animate-fade-up delay-600 mt-16 grid grid-cols-3 gap-8 md:gap-16 opacity-0">
          {[
            { value: "500+", label: "Clientes", color: "text-cyan-400" },
            { value: "1,200+", label: "Casos", color: "text-blue-400" },
            { value: "5+", label: "Años", color: "text-purple-400" },
          ].map((stat) => (
            <div key={stat.label} className="flex flex-col items-center">
              <span className={`text-2xl font-bold ${stat.color} md:text-3xl`}>
                {stat.value}
              </span>
              <span className="mt-1 text-xs tracking-widest text-gray-600 uppercase">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 z-[10] h-32 bg-gradient-to-t from-[#020617] to-transparent" />
    </section>
  );
};

export default HeroSection;
