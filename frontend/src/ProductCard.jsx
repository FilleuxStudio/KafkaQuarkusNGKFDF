import React, { useState } from "react";
import { motion } from "framer-motion";

function ProductCard({ product, onAddToCart, onProductClick, index }) {
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const handleAddToCart = async (e) => {
    e.stopPropagation(); // Prevent card click when clicking button
    
    const order = {
      product: product.name,
      quantity: 1,
      price: product.price,
    };
    
    try {
      setIsAddingToCart(true);
      await onAddToCart(order);
      
      // Visual feedback for successful order
      const successDiv = document.createElement('div');
      successDiv.textContent = `✅ ${product.name} added to cart! Stock updating...`;
      successDiv.style.cssText = `
        position: fixed;
        top: 2rem;
        right: 2rem;
        background: linear-gradient(135deg, #4CAF50, #45a049);
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 12px;
        box-shadow: 0 8px 30px rgba(76, 175, 80, 0.3);
        z-index: 10000;
        font-family: inherit;
        font-weight: 600;
        animation: slideIn 0.3s ease;
        max-width: 300px;
      `;
      document.body.appendChild(successDiv);
      setTimeout(() => successDiv.remove(), 3000);
      
    } catch (error) {
      console.error('Error adding to cart:', error);
      
      // Error feedback
      const errorDiv = document.createElement('div');
      errorDiv.textContent = 'Failed to add to cart. Please try again.';
      errorDiv.style.cssText = `
        position: fixed;
        top: 2rem;
        right: 2rem;
        background: linear-gradient(135deg, #ff4444, #ff6b6b);
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 12px;
        box-shadow: 0 8px 30px rgba(255, 68, 68, 0.3);
        z-index: 10000;
        font-family: inherit;
        font-weight: 600;
        animation: slideIn 0.3s ease;
      `;
      document.body.appendChild(errorDiv);
      setTimeout(() => errorDiv.remove(), 3000);
    } finally {
      setIsAddingToCart(false);
    }
  };

  const isOutOfStock = product.stock !== undefined && product.stock <= 0;
  const isLowStock = product.stock !== undefined && product.stock > 0 && product.stock <= 5;

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
      onClick={() => onProductClick(product)} // ✅ Click handler for modal
      style={{
        opacity: isOutOfStock ? 0.6 : 1,
        position: 'relative',
        cursor: 'pointer' // ✅ Show it's clickable
      }}
    >
      {/* Click hint overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'rgba(0, 102, 204, 0.9)',
          color: 'white',
          padding: '0.5rem 1rem',
          borderRadius: '20px',
          fontSize: '0.8rem',
          fontWeight: '600',
          zIndex: 3,
          pointerEvents: 'none',
          backdropFilter: 'blur(10px)'
        }}
      >
        👆 Click to view details
      </motion.div>

      {/* Stock Status Badge */}
      {product.stock !== undefined && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.1 + 0.2 }}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: isOutOfStock ? '#f44336' : isLowStock ? '#ff9800' : '#4CAF50',
            color: 'white',
            padding: '0.25rem 0.75rem',
            borderRadius: '12px',
            fontSize: '0.75rem',
            fontWeight: '600',
            zIndex: 2,
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
          }}
        >
          {isOutOfStock ? 'Out of Stock' : isLowStock ? `${product.stock} left` : `${product.stock} in stock`}
        </motion.div>
      )}

      {/* Processing Indicator */}
      {isAddingToCart && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          style={{
            position: 'absolute',
            top: '1rem',
            left: '1rem',
            background: 'var(--apple-blue)',
            color: 'white',
            padding: '0.25rem 0.75rem',
            borderRadius: '12px',
            fontSize: '0.75rem',
            fontWeight: '600',
            zIndex: 2,
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
          }}
        >
          <span style={{ 
            animation: 'spin 1s linear infinite',
            display: 'inline-block',
            marginRight: '0.25rem'
          }}>
            🔄
          </span>
          Processing...
        </motion.div>
      )}

      <motion.div
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.3 }}
      >
        <img 
          src={product.image} 
          alt={product.name} 
          className="product-image"
          loading="lazy"
          style={{
            filter: isOutOfStock ? 'grayscale(100%)' : 'none',
            transition: 'filter 0.3s ease'
          }}
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

      {/* Stock Display */}
      {product.stock !== undefined && (
        <motion.p 
          style={{
            fontSize: '0.8rem',
            color: isOutOfStock ? '#f44336' : isLowStock ? '#ff9800' : '#4CAF50',
            marginTop: '0.5rem',
            fontWeight: '600'
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: index * 0.1 + 0.45 }}
        >
          {isOutOfStock ? 'Out of stock' : `${product.stock} available`}
        </motion.p>
      )}
      
      <motion.button 
        onClick={handleAddToCart}  // ✅ Separate handler with stopPropagation
        className="add-to-cart-button"
        disabled={isOutOfStock || isAddingToCart}
        whileHover={!isOutOfStock && !isAddingToCart ? { 
          scale: 1.02,
          boxShadow: "0 8px 25px rgba(0, 0, 0, 0.3)"
        } : {}}
        whileTap={!isOutOfStock && !isAddingToCart ? { scale: 0.98 } : {}}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: index * 0.1 + 0.5 }}
        style={{
          opacity: (isOutOfStock || isAddingToCart) ? 0.7 : 1,
          cursor: (isOutOfStock || isAddingToCart) ? 'not-allowed' : 'pointer',
          background: isOutOfStock ? 'var(--apple-text-gray)' : isAddingToCart ? 'var(--apple-blue)' : undefined,
          position: 'relative',
          zIndex: 4 // ✅ Higher z-index so button clicks work
        }}
      >
        {isAddingToCart ? (
          <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            <span style={{ 
              animation: 'spin 1s linear infinite',
              display: 'inline-block'
            }}>
              🔄
            </span>
            Adding...
          </span>
        ) : isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
      </motion.button>
      
      {/* CSS Animation */}
      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </motion.div>
  );
}

export default ProductCard;
