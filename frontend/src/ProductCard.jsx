import React from "react";
import { motion } from "framer-motion";

function ProductCard({ product, onAddToCart, index }) {
  const handleAddToCart = () => {
    const order = {
      product: product.name,
      quantity: 1,
      price: product.price,
    };
    onAddToCart(order);
  };

  return (
    <motion.div 
      className="product-card"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.6, 
        delay: index * 0.1,
        ease: "easeOut" 
      }}
      whileHover={{ 
        y: -8,
        scale: 1.02,
        transition: { duration: 0.3 }
      }}
      whileTap={{ scale: 0.98 }}
    >
      <motion.div
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.3 }}
      >
        <img 
          src={product.image} 
          alt={product.name} 
          className="product-image"
          loading="lazy"
        />
      </motion.div>
      
      <motion.h3
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: index * 0.1 + 0.3 }}
      >
        {product.name}
      </motion.h3>
      
      <motion.p 
        className="product-price"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: index * 0.1 + 0.4 }}
      >
        ${product.price.toLocaleString()}
      </motion.p>
      
      <motion.button 
        onClick={handleAddToCart} 
        className="add-to-cart-button"
        whileHover={{ 
          scale: 1.02,
          boxShadow: "0 8px 25px rgba(0, 0, 0, 0.3)"
        }}
        whileTap={{ scale: 0.98 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: index * 0.1 + 0.5 }}
      >
        Add to Cart
      </motion.button>
    </motion.div>
  );
}

export default ProductCard;
