import React, { useState, useEffect } from "react";
import { motion, AnimatePresence, easeInOut, spring } from "framer-motion";
import { FiMenu, FiX } from "react-icons/fi";

const NavBar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const navVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: easeInOut,
      },
    },
  };

  const linkVariants = {
    hover: {
      scale: 1.05,
      color: "#ffffff",
      transition: { duration: 0.2 },
    },
  };

  const buttonVariants = {
    hover: {
      scale: 1.05,
      transition: { duration: 0.2 },
    },
    tap: { scale: 0.95 },
  };

  const menuVariants = {
    closed: {
      opacity: 0,
      x: "100%",
      transition: {
        type: spring,
        stiffness: 400,
        damping: 40,
      },
    },
    open: {
      opacity: 1,
      x: 0,
      transition: {
        type: spring,
        stiffness: 400,
        damping: 40,
      },
    },
  };

  return (
    <motion.nav
      className={`fixed top-0 right-0 left-0 z-50 flex items-center justify-between px-6 py-4 md:px-8 md:py-6 transition-all duration-300 ${
        scrolled
          ? "glass-panel-strong border-b border-cyan-500/20 shadow-lg shadow-cyan-500/5"
          : "bg-transparent"
      }`}
      initial="hidden"
      animate="visible"
      variants={navVariants}
    >
      <motion.div
        className="flex items-center"
        whileHover={{ scale: 1.05 }}
        transition={{ type: "spring", stiffness: 400, damping: 10 }}
      >
        <div className="text-3xl font-bold text-white">
          GURÚ
          <div className="text-xs tracking-widest text-cyan-400">SOLUCIONES</div>
        </div>
      </motion.div>

      {/* Desktop Navigation */}
      <div className="hidden items-center gap-8 md:flex">
        <motion.a
          href="#"
          className="relative text-gray-300 transition hover:text-white after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-cyan-400 after:transition-all after:duration-300 hover:after:w-full"
          variants={linkVariants}
          whileHover="hover"
        >
          Inicio
        </motion.a>
        <motion.a
          href="#servicios"
          className="relative text-gray-300 transition hover:text-white after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-cyan-400 after:transition-all after:duration-300 hover:after:w-full"
          variants={linkVariants}
          whileHover="hover"
        >
          Servicios
        </motion.a>
        <motion.a
          href="#sobre-guru"
          className="relative text-gray-300 transition hover:text-white after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-cyan-400 after:transition-all after:duration-300 hover:after:w-full"
          variants={linkVariants}
          whileHover="hover"
        >
          Sobre el Gurú
        </motion.a>
        <motion.a
          href="/login"
          className="relative text-gray-300 transition hover:text-white after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-cyan-400 after:transition-all after:duration-300 hover:after:w-full"
          variants={linkVariants}
          whileHover="hover"
        >
          ¿Trabajas con Nosotros?
        </motion.a>
        <motion.a
          href="https://wa.me/18298049017"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-neon rounded px-6 py-2"
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
        >
          Contáctanos
        </motion.a>
      </div>

      {/* Mobile Menu Button */}
      <div className="md:hidden">
        <motion.button
          onClick={toggleMenu}
          className="rounded-full p-2 text-cyan-400 neon-border-cyan"
          whileTap={{ scale: 0.95 }}
        >
          {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </motion.button>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="glass-panel-strong fixed inset-0 top-16 z-40 flex flex-col items-center pt-10"
            initial="closed"
            animate="open"
            exit="closed"
            variants={menuVariants}
          >
            <div className="flex w-full flex-col items-center gap-6">
              <motion.a
                href="#"
                className="w-full py-4 text-center text-xl font-medium text-white transition hover:text-cyan-400"
                variants={linkVariants}
                whileHover="hover"
                onClick={() => setIsOpen(false)}
              >
                Inicio
              </motion.a>
              <motion.a
                href="#servicios"
                className="w-full py-4 text-center text-xl font-medium text-white transition hover:text-cyan-400"
                variants={linkVariants}
                whileHover="hover"
                onClick={() => setIsOpen(false)}
              >
                Servicios
              </motion.a>
              <motion.a
                href="#sobre-guru"
                className="w-full py-4 text-center text-xl font-medium text-white transition hover:text-cyan-400"
                variants={linkVariants}
                whileHover="hover"
                onClick={() => setIsOpen(false)}
              >
                Sobre el Gurú
              </motion.a>
              <motion.a
                href="/login"
                className="w-full py-4 text-center text-xl font-medium text-white transition hover:text-cyan-400"
                variants={linkVariants}
                whileHover="hover"
                onClick={() => setIsOpen(false)}
              >
                ¿Trabajas con Nosotros?
              </motion.a>
              <motion.a
                href="https://wa.me/18298049017"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-neon mt-6 mb-8 rounded px-8 py-3 text-lg font-semibold"
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
                onClick={() => setIsOpen(false)}
              >
                Contáctanos
              </motion.a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default NavBar;
