import React, { useState } from "react";
import { motion, AnimatePresence, easeInOut, spring } from "framer-motion";
import { FiMenu, FiX } from "react-icons/fi";

const NavBar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

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
      borderColor: "#3b82f6",
      backgroundColor: "rgba(59, 130, 246, 0.1)",
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
      className="fixed top-0 right-0 left-0 z-50 flex items-center justify-between bg-black/80 px-6 py-4 backdrop-blur-sm md:px-8 md:py-6"
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
          <div className="text-xs tracking-widest">SOLUCIONES</div>
        </div>
      </motion.div>

      {/* Desktop Navigation */}
      <div className="hidden items-center gap-8 md:flex">
        <motion.a
          href="#"
          className="text-gray-300 transition hover:text-white"
          variants={linkVariants}
          whileHover="hover"
        >
          Inicio
        </motion.a>
        <motion.a
          href="#servicios"
          className="text-gray-300 transition hover:text-white"
          variants={linkVariants}
          whileHover="hover"
        >
          Servicios
        </motion.a>
        <motion.a
          href="#sobre-guru"
          className="text-gray-300 transition hover:text-white"
          variants={linkVariants}
          whileHover="hover"
        >
          Sobre el Gurú
        </motion.a>
        <motion.a
          href="/login"
          className="text-gray-300 transition hover:text-white"
          variants={linkVariants}
          whileHover="hover"
        >
          ¿Trabajas con Nosotros?
        </motion.a>
        <motion.a
          href="https://wa.me/18298049017"
          target="_blank"
          rel="noopener noreferrer"
          className="rounded border-2 border-blue-500 px-6 py-2 text-white transition hover:bg-blue-500"
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
          className="rounded-full bg-blue-900/30 p-2 text-white"
          whileTap={{ scale: 0.95 }}
        >
          {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </motion.button>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 top-16 z-40 flex flex-col items-center bg-black pt-10"
            initial="closed"
            animate="open"
            exit="closed"
            variants={menuVariants}
          >
            <div className="flex w-full flex-col items-center gap-6 bg-gradient-to-b from-blue-950 to-black">
              <motion.a
                href="#"
                className="w-full py-4 text-center text-xl font-medium text-white transition hover:text-blue-300"
                variants={linkVariants}
                whileHover="hover"
                onClick={() => setIsOpen(false)}
              >
                Inicio
              </motion.a>
              <motion.a
                href="#servicios"
                className="w-full py-4 text-center text-xl font-medium text-white transition hover:text-blue-300"
                variants={linkVariants}
                whileHover="hover"
                onClick={() => setIsOpen(false)}
              >
                Servicios
              </motion.a>
              <motion.a
                href="#sobre-guru"
                className="w-full py-4 text-center text-xl font-medium text-white transition hover:text-blue-300"
                variants={linkVariants}
                whileHover="hover"
                onClick={() => setIsOpen(false)}
              >
                Sobre el Gurú
              </motion.a>
              <motion.a
                href="/login"
                className="w-full py-4 text-center text-xl font-medium text-white transition hover:text-blue-300"
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
                className="mt-6 mb-8 rounded border-2 border-blue-500 bg-blue-900/30 px-8 py-3 text-lg font-semibold text-white transition hover:bg-blue-500"
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
