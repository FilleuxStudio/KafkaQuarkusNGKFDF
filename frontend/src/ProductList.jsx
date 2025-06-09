import React from "react";
import { motion } from "framer-motion";
import { products } from "./products";
import ProductCard from "./ProductCard";

function ProductList({ onAddToCart }) {
  return (
    <section className="product-section">
      <motion.h2 
        className="section-title"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        Featured Products
      </motion.h2>
      <motion.div 
        className="product-list"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        viewport={{ once: true }}
      >
        {products.map((item, index) => (
          <ProductCard 
            key={item.id} 
            product={item} 
            onAddToCart={onAddToCart}
            index={index}
          />
        ))}
      </motion.div>
    </section>
  );
}

export default ProductList;
