import React from "react";
import { motion } from "framer-motion";

function Hero() {
  return (
    <section className="hero">
      <motion.div 
        className="hero-content"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
      >
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          Think Different.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
        >
          Discover the latest innovations in technology and design.
        </motion.p>
        <motion.button 
          className="hero-button"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.9 }}
          whileHover={{ 
            scale: 1.05,
            boxShadow: "0 12px 40px rgba(0, 102, 204, 0.4)"
          }}
          whileTap={{ scale: 0.95 }}
        >
          Explore Collection
        </motion.button>
      </motion.div>
    </section>
  );
}

export default Hero;
