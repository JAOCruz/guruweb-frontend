import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { NeoButton } from "./ui/neo";

const navLinks = [
  { name: "Inicio", href: "#" },
  { name: "Servicios", href: "#servicios" },
  { name: "Sobre el Gurú", href: "#sobre-guru" },
  { name: "¿Trabajas con Nosotros?", href: "/login" },
];

const NavBar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  const navVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeInOut" as const },
    },
  };

  const menuVariants = {
    closed: { opacity: 0, x: "100%", transition: { duration: 0.3 } },
    open: { opacity: 1, x: 0, transition: { duration: 0.3 } },
  };

  return (
    <motion.nav
      className="fixed top-0 right-0 left-0 z-50 border-b-4 border-border bg-background px-6 py-4 md:px-8 md:py-6"
      initial="hidden"
      animate="visible"
      variants={navVariants}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <motion.div
          className="flex items-center"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          <div className="font-heading text-3xl font-extrabold tracking-tighter text-foreground">
            GURÚ
            <div className="font-base text-xs tracking-widest text-foreground/70">
              SOLUCIONES
            </div>
          </div>
        </motion.div>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-4 md:flex">
          {navLinks.map((item) => (
            <motion.a
              key={item.name}
              href={item.href}
              className="rounded-base border-2 border-border bg-secondary-background px-4 py-2 font-base text-sm font-medium text-foreground shadow-shadow transition-all hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none active:translate-x-boxShadowX active:translate-y-boxShadowY active:shadow-none"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {item.name}
            </motion.a>
          ))}
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <NeoButton asChild>
              <a
                href="https://wa.me/18298049017"
                target="_blank"
                rel="noopener noreferrer"
              >
                Contáctanos
              </a>
            </NeoButton>
          </motion.div>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <NeoButton size="icon" onClick={toggleMenu} aria-label="Toggle menu">
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </NeoButton>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 top-16 z-40 flex flex-col items-center border-b-4 border-border bg-background pt-10"
            initial="closed"
            animate="open"
            exit="closed"
            variants={menuVariants}
          >
            <div className="flex w-full flex-col items-center gap-3 px-6">
              {navLinks.map((item) => (
                <motion.a
                  key={item.name}
                  href={item.href}
                  className="w-full rounded-base border-4 border-border bg-secondary-background py-4 text-center font-base text-xl font-medium text-foreground shadow-shadow transition-all hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none active:translate-x-boxShadowX active:translate-y-boxShadowY active:shadow-none"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setIsOpen(false)}
                >
                  {item.name}
                </motion.a>
              ))}
              <motion.div
                className="mt-6 mb-8 w-full px-6"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <NeoButton className="w-full" size="lg" asChild>
                  <a
                    href="https://wa.me/18298049017"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setIsOpen(false)}
                  >
                    Contáctanos
                  </a>
                </NeoButton>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default NavBar;
