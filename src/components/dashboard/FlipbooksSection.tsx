import React, { useState } from "react";
import { motion } from "framer-motion";

type Flipbook = {
  id: string;
  title: string;
  description: string;
  url: string;
};

const FLIPBOOKS: Flipbook[] = [
  {
    id: "mensajeria",
    title: "La Guía del Gurú",
    description:
      "Consulta nuestro catálogo de servicios de mensajería express para envíos y depósitos de documentos.",
    url: "https://heyzine.com/flip-book/c52e2666f2.html",
  },
  {
    id: "compra-impuestos",
    title: "Catálogo de Productos",
    description:
      "Revisa la guía completa para gestionar la compra de impuestos e impuestos internos con Gurú.",
    url: "https://heyzine.com/flip-book/535fa28ba2.html",
  },
];

const FlipbooksSection: React.FC = () => {
  const [selectedFlipbook, setSelectedFlipbook] = useState<Flipbook>(
    FLIPBOOKS[0],
  );

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-blue-900/30 bg-gray-900/80 p-6 backdrop-blur-sm">
        <div className="mb-6">
          <h1 className="text-3xl font-semibold text-white">
            Biblioteca de Flipbooks
          </h1>
          <p className="mt-2 text-gray-300">
            Selecciona el flipbook que deseas consultar para verlo directamente
            en el panel. Todos los usuarios, incluyendo administradores, pueden
            acceder a estos recursos.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {FLIPBOOKS.map((flipbook) => {
            const isActive = flipbook.id === selectedFlipbook.id;
            return (
              <motion.button
                key={flipbook.id}
                onClick={() => setSelectedFlipbook(flipbook)}
                className={`flex h-full flex-col rounded-xl border p-4 text-left transition-all ${
                  isActive
                    ? "border-blue-500 bg-blue-900/40 shadow-lg"
                    : "border-blue-900/40 bg-black/20 hover:border-blue-500/60 hover:bg-blue-900/20"
                }`}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                type="button"
              >
                <h2 className="mb-3 text-lg font-semibold text-white">
                  {flipbook.title}
                </h2>
                <p className="text-sm text-gray-300">{flipbook.description}</p>
              </motion.button>
            );
          })}
        </div>
      </div>

      <div className="rounded-lg border border-blue-900/30 bg-gray-900/80 p-6 backdrop-blur-sm">
        <h2 className="mb-4 text-2xl font-semibold text-white">
          {selectedFlipbook.title}
        </h2>
        <div className="aspect-video w-full overflow-hidden rounded-xl border border-blue-900/40 bg-black/40">
          <iframe
            key={selectedFlipbook.id}
            src={selectedFlipbook.url}
            title={selectedFlipbook.title}
            allow="clipboard-write"
            allowFullScreen
            scrolling="no"
            className="h-full w-full"
          ></iframe>
        </div>
      </div>
    </div>
  );
};

export default FlipbooksSection;
