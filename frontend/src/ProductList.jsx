import React, { useState } from "react";
import { motion } from "framer-motion";
import { useFirebaseProducts } from "./hooks/useFirebaseProducts";
import ProductCard from "./ProductCard";
import ProductModal from "./ProductModal";

function ProductList({ onAddToCart }) {
  const { products, loading, error, dataSource, refetch } = useFirebaseProducts();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // ✅ SIMPLIFIED: Just pass onAddToCart directly - no auto-refresh
  const handleProductClick = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedProduct(null), 200); // Reduced delay for snappier feel
  };

  if (loading) {
    return (
      <section className="product-section">
        <motion.h2 
          className="section-title"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Featured Products
        </motion.h2>
        
        <div className="product-list">
          {[...Array(6)].map((_, index) => (
            <motion.div 
              key={index}
              className="product-card"
              style={{
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
                borderRadius: '24px',
                padding: '2rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '400px'
              }}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <div style={{
                width: '200px',
                height: '200px',
                background: 'linear-gradient(135deg, var(--apple-gray) 0%, var(--apple-blue) 100%)',
                borderRadius: '16px',
                marginBottom: '1rem',
                animation: 'pulse 2s infinite'
              }}></div>
              <div style={{
                width: '150px',
                height: '20px',
                background: 'var(--apple-gray)',
                borderRadius: '10px',
                marginBottom: '0.5rem'
              }}></div>
              <div style={{
                width: '100px',
                height: '16px',
                background: 'var(--apple-text-gray)',
                borderRadius: '8px'
              }}></div>
            </motion.div>
          ))}
        </div>
        
        <style jsx>{`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
          }
        `}</style>
      </section>
    );
  }

  return (
    <>
      <section className="product-section">
        <motion.h2 
          className="section-title"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          Featured Products
          <span style={{
            fontSize: '0.5em',
            color: dataSource === 'firebase' ? '#4CAF50' : '#ff9800',
            marginLeft: '1rem',
            opacity: 0.7
          }}>
          </span>
        </motion.h2>
        
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              background: 'rgba(255, 152, 0, 0.1)',
              border: '2px solid #ff9800',
              borderRadius: '16px',
              padding: '1rem',
              marginBottom: '2rem',
              textAlign: 'center',
              color: '#e65100'
            }}
          >
            <p>⚠️ Using catalog products (Firebase: {error})</p>
            <button
              onClick={refetch}
              style={{
                background: 'var(--apple-blue)',
                color: 'white',
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                cursor: 'pointer',
                marginTop: '0.5rem'
              }}
            >
              🔄 Retry Firebase
            </button>
          </motion.div>
        )}
        
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
              onAddToCart={onAddToCart} // ✅ SIMPLIFIED: Direct onAddToCart - no refresh
              onProductClick={handleProductClick}
              index={index}
            />
          ))}
        </motion.div>
      </section>

      {/* Product Modal with Lighter Animations */}
      <ProductModal
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onAddToCart={onAddToCart} // ✅ SIMPLIFIED: Direct onAddToCart - no refresh
      />
    </>
  );
}

export default ProductList;
