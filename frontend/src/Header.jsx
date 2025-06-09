import React from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";

function Header({ onCartClick }) {
  const location = useLocation();

  return (
    <motion.header 
      className="header"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
        <motion.div 
          className="logo"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          🍎 Apple Store
        </motion.div>
      </Link>
      <nav className="nav">
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Link 
            to="/" 
            className={location.pathname === '/' ? 'active' : ''}
            style={{ textDecoration: 'none' }}
          >
            Home
          </Link>
        </motion.div>
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Link 
            to="/analytics" 
            className={location.pathname === '/analytics' ? 'active' : ''}
            style={{ textDecoration: 'none' }}
          >
            Analytics
          </Link>
        </motion.div>
        <motion.a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            onCartClick();
          }}
          style={{ textDecoration: 'none', color: 'inherit' }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          🛒 Cart
        </motion.a>
      </nav>
    </motion.header>
  );
}

export default Header;
