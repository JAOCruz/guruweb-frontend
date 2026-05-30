import React, { useState } from "react";
import { motion, AnimatePresence, easeInOut, spring } from "framer-motion";
import { FiMenu, FiX } from "react-icons/fi";

const NB = {
  btn: "border-4 border-[#000080] bg-[#0000FF] text-white shadow-[6px_6px_0px_0px_rgba(0,0,128,1)] transition-all hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-[3px_3px_0px_0px_rgba(0,0,128,1)] active:translate-x-[6px] active:translate-y-[6px] active:shadow-none",
  navLink: "border-3 border-[#000080] bg-black px-4 py-2 font-[Outfit] text-sm font-medium text-white shadow-[4px_4px_0px_0px_rgba(0,0,128,1)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,128,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none",
  mobileLink: "w-full border-4 border-[#000080] bg-black py-4 text-center font-[Outfit] text-xl font-medium text-white shadow-[4px_4px_0px_0px_rgba(0,0,128,1)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,128,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none",
};

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
      className="fixed top-0 right-0 left-0 z-50 flex items-center justify-between bg-black px-6 py-4 md:px-8 md:py-6"
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
      <div className="hidden items-center gap-4 md:flex">
        <motion.a
          href="#"
          className={NB.navLink}
          variants={linkVariants}
          whileHover="hover"
        >
          Inicio
        </motion.a>
        <motion.a
          href="#servicios"
          className={NB.navLink}
          variants={linkVariants}
          whileHover="hover"
        >
          Servicios
        </motion.a>
        <motion.a
          href="#sobre-guru"
          className={NB.navLink}
          variants={linkVariants}
          whileHover="hover"
        >
          Sobre el Gurú
        </motion.a>
        <motion.a
          href="/login"
          className={NB.navLink}
          variants={linkVariants}
          whileHover="hover"
        >
          ¿Trabajas con Nosotros?
        </motion.a>
        <motion.a
          href="https://wa.me/18298049017"
          target="_blank"
          rel="noopener noreferrer"
          className={NB.btn}
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
          className="border-4 border-[#000080] bg-[#0000FF] p-2 text-white shadow-[4px_4px_0px_0px_rgba(0,0,128,1)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,128,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none"
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
            <div className="flex w-full flex-col items-center gap-3 px-6">
              <motion.a
                href="#"
                className={NB.mobileLink}
                variants={linkVariants}
                whileHover="hover"
                onClick={() => setIsOpen(false)}
              >
                Inicio
              </motion.a>
              <motion.a
                href="#servicios"
                className={NB.mobileLink}
                variants={linkVariants}
                whileHover="hover"
                onClick={() => setIsOpen(false)}
              >
                Servicios
              </motion.a>
              <motion.a
                href="#sobre-guru"
                className={NB.mobileLink}
                variants={linkVariants}
                whileHover="hover"
                onClick={() => setIsOpen(false)}
              >
                Sobre el Gurú
              </motion.a>
              <motion.a
                href="/login"
                className={NB.mobileLink}
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
                className={`mt-6 mb-8 ${NB.btn} px-8 py-3 text-lg`}
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
