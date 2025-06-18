import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

function ProductModal({ product, isOpen, onClose, onAddToCart }) {
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [quantity, setQuantity] = useState(1);

  if (!product) return null;

  const isOutOfStock = product.stock !== undefined && product.stock <= 0;
  const isLowStock = product.stock !== undefined && product.stock > 0 && product.stock <= 5;

  const handleAddToCart = async () => {
    const order = {
      product: product.name,
      quantity: quantity,
      price: product.price,
    };
    
    try {
      setIsAddingToCart(true);
      await onAddToCart(order);
      
      // Success feedback
      const successDiv = document.createElement('div');
      successDiv.textContent = `✅ ${quantity}x ${product.name} added to cart!`;
      successDiv.style.cssText = `
        position: fixed;
        top: 2rem;
        right: 2rem;
        background: linear-gradient(135deg, #4CAF50, #45a049);
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 16px;
        box-shadow: 0 8px 25px rgba(76, 175, 80, 0.3);
        z-index: 10001;
        font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif;
        font-weight: 600;
        animation: slideIn 0.3s ease;
        max-width: 350px;
      `;
      document.body.appendChild(successDiv);
      setTimeout(() => successDiv.remove(), 2500);
      
      // Close modal after successful add
      setTimeout(() => onClose(), 800);
      
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setIsAddingToCart(false);
    }
  };

  const getPlaceholderDescription = () => {
    const placeholders = [
      `Experience the pinnacle of ${product.name} innovation. Crafted with precision and designed for perfection.`,
      `Discover the future with ${product.name}. Where cutting-edge technology meets elegant design.`,
      `${product.name} redefines excellence. Premium quality that transforms your everyday experience.`,
      `Unleash the power of ${product.name}. Innovation that inspires, design that captivates.`,
      `${product.name} - where form meets function in perfect harmony. Elevate your digital lifestyle.`
    ];
    return placeholders[Math.floor(Math.random() * placeholders.length)];
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* ✅ LIGHTER: Reduced backdrop blur for better performance */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }} // ✅ Faster, simpler easing
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.5)', // ✅ Reduced opacity for less heavy feel
              backdropFilter: 'blur(5px)', // ✅ LIGHTER: Reduced from 10px to 5px
              WebkitBackdropFilter: 'blur(5px)',
              zIndex: 10000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '2rem'
            }}
            onClick={onClose}
          >
            {/* ✅ LIGHTER: Simplified modal animation */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }} // ✅ LIGHTER: Reduced scale change
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ 
                duration: 0.25, // ✅ LIGHTER: Faster duration
                ease: "easeOut" // ✅ LIGHTER: Simple easing instead of spring
              }}
              style={{
                background: 'rgba(255, 255, 255, 0.98)',
                backdropFilter: 'blur(20px)', // ✅ Keep this for the modal itself
                WebkitBackdropFilter: 'blur(20px)',
                borderRadius: '32px',
                maxWidth: '900px',
                width: '100%',
                maxHeight: '90vh',
                overflow: 'hidden',
                boxShadow: '0 20px 80px rgba(0, 0, 0, 0.25)', // ✅ LIGHTER: Reduced shadow
                border: '1px solid rgba(255, 255, 255, 0.4)',
                position: 'relative'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* ✅ REMOVED: Heavy glassmorphism overlay for better performance */}

              {/* Close Button */}
              <motion.button
                whileHover={{ scale: 1.05 }} // ✅ LIGHTER: Reduced hover scale
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                style={{
                  position: 'absolute',
                  top: '1.5rem',
                  right: '1.5rem',
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  background: 'rgba(0, 0, 0, 0.1)',
                  border: 'none',
                  cursor: 'pointer',
                  zIndex: 10002,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                  color: 'var(--apple-black)',
                  transition: 'all 0.2s ease' // ✅ LIGHTER: Faster transition
                }}
              >
                ✕
              </motion.button>

              {/* Stock Badge */}
              {product.stock !== undefined && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }} // ✅ LIGHTER: Reduced delay
                  style={{
                    position: 'absolute',
                    top: '1.5rem',
                    left: '1.5rem',
                    background: isOutOfStock ? '#f44336' : isLowStock ? '#ff9800' : '#4CAF50',
                    color: 'white',
                    padding: '0.5rem 1rem',
                    borderRadius: '20px',
                    fontSize: '0.85rem',
                    fontWeight: '700',
                    zIndex: 10002,
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
                    letterSpacing: '-0.01em'
                  }}
                >
                  {isOutOfStock ? '❌ Out of Stock' : isLowStock ? `⚠️ ${product.stock} left` : `✅ ${product.stock} in stock`}
                </motion.div>
              )}

              {/* Content */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                minHeight: '600px',
                position: 'relative',
                zIndex: 2
              }}>
                {/* Left Side - Image */}
                <div style={{
                  padding: '3rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'linear-gradient(135deg, rgba(245, 245, 247, 0.8) 0%, rgba(255, 255, 255, 0.9) 100%)',
                  position: 'relative'
                }}>
                  <motion.div
                    initial={{ opacity: 0 }} // ✅ LIGHTER: Removed complex transforms
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.15, duration: 0.3 }} // ✅ LIGHTER: Faster
                    style={{
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative'
                    }}
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      style={{
                        maxWidth: '100%',
                        maxHeight: '400px',
                        objectFit: 'contain',
                        borderRadius: '20px',
                        boxShadow: '0 15px 40px rgba(0, 0, 0, 0.12)', // ✅ LIGHTER: Reduced shadow
                        filter: isOutOfStock ? 'grayscale(100%)' : 'none',
                        transition: 'all 0.3s ease'
                      }}
                    />
                    
                    {/* ✅ REMOVED: Floating animation elements for better performance */}
                  </motion.div>
                </div>

                {/* Right Side - Details */}
                <div style={{
                  padding: '4rem 3rem 3rem 2rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  background: 'rgba(255, 255, 255, 0.95)'
                }}>
                  <motion.div
                    initial={{ opacity: 0, x: 20 }} // ✅ LIGHTER: Reduced x movement
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2, duration: 0.3 }} // ✅ LIGHTER: Faster
                  >
                    {/* Product Name */}
                    <h2 style={{
                      fontSize: '2.5rem',
                      fontWeight: '800',
                      background: 'linear-gradient(135deg, var(--apple-black) 0%, var(--apple-gray) 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                      letterSpacing: '-0.03em',
                      marginBottom: '1rem',
                      lineHeight: '1.1'
                    }}>
                      {product.name}
                    </h2>

                    {/* Price */}
                    <div style={{
                      fontSize: '2rem',
                      fontWeight: '700',
                      color: 'var(--apple-blue)',
                      marginBottom: '2rem',
                      letterSpacing: '-0.02em'
                    }}>
                      ${product.price.toLocaleString()}
                    </div>

                    {/* Description */}
                    <div style={{ marginBottom: '2.5rem' }}>
                      <h4 style={{
                        fontSize: '1.1rem',
                        fontWeight: '600',
                        color: 'var(--apple-black)',
                        marginBottom: '0.75rem',
                        letterSpacing: '-0.01em'
                      }}>
                        About this product
                      </h4>
                      <p style={{
                        fontSize: '1rem',
                        lineHeight: '1.6',
                        color: 'var(--apple-text-gray)',
                        letterSpacing: '-0.01em',
                        fontStyle: !product.description ? 'italic' : 'normal',
                        opacity: !product.description ? 0.8 : 1
                      }}>
                        {product.description || getPlaceholderDescription()}
                      </p>
                    </div>

                    {/* Quantity Selector */}
                    <div style={{ marginBottom: '2rem' }}>
                      <h4 style={{
                        fontSize: '1rem',
                        fontWeight: '600',
                        color: 'var(--apple-black)',
                        marginBottom: '0.75rem',
                        letterSpacing: '-0.01em'
                      }}>
                        Quantity
                      </h4>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem'
                      }}>
                        <button
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          disabled={quantity <= 1}
                          style={{
                            width: '44px',
                            height: '44px',
                            borderRadius: '12px',
                            border: '2px solid rgba(0, 0, 0, 0.1)',
                            background: 'rgba(255, 255, 255, 0.8)',
                            cursor: quantity <= 1 ? 'not-allowed' : 'pointer',
                            fontSize: '1.2rem',
                            fontWeight: '600',
                            color: 'var(--apple-black)',
                            opacity: quantity <= 1 ? 0.5 : 1,
                            transition: 'all 0.2s ease' // ✅ LIGHTER: Faster transition
                          }}
                        >
                          −
                        </button>
                        <span style={{
                          fontSize: '1.5rem',
                          fontWeight: '700',
                          color: 'var(--apple-black)',
                          minWidth: '3rem',
                          textAlign: 'center'
                        }}>
                          {quantity}
                        </span>
                        <button
                          onClick={() => setQuantity(quantity + 1)}
                          disabled={isOutOfStock || (product.stock && quantity >= product.stock)}
                          style={{
                            width: '44px',
                            height: '44px',
                            borderRadius: '12px',
                            border: '2px solid rgba(0, 0, 0, 0.1)',
                            background: 'rgba(255, 255, 255, 0.8)',
                            cursor: (isOutOfStock || (product.stock && quantity >= product.stock)) ? 'not-allowed' : 'pointer',
                            fontSize: '1.2rem',
                            fontWeight: '600',
                            color: 'var(--apple-black)',
                            opacity: (isOutOfStock || (product.stock && quantity >= product.stock)) ? 0.5 : 1,
                            transition: 'all 0.2s ease' // ✅ LIGHTER: Faster transition
                          }}
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Add to Cart Button */}
                    <motion.button
                      onClick={handleAddToCart}
                      disabled={isOutOfStock || isAddingToCart}
                      whileHover={!isOutOfStock && !isAddingToCart ? { 
                        scale: 1.01, // ✅ LIGHTER: Reduced hover scale
                        boxShadow: "0 10px 30px rgba(0, 102, 204, 0.3)" // ✅ LIGHTER: Reduced shadow
                      } : {}}
                      whileTap={!isOutOfStock && !isAddingToCart ? { scale: 0.99 } : {}}
                      style={{
                        width: '100%',
                        background: isOutOfStock ? 'var(--apple-text-gray)' : isAddingToCart ? 'var(--apple-blue)' : 'linear-gradient(135deg, var(--apple-blue) 0%, #0052a3 100%)',
                        color: 'white',
                        border: 'none',
                        padding: '1.25rem 2rem',
                        fontSize: '1.1rem',
                        fontWeight: '700',
                        borderRadius: '16px',
                        cursor: (isOutOfStock || isAddingToCart) ? 'not-allowed' : 'pointer',
                        transition: 'all 0.2s ease', // ✅ LIGHTER: Faster transition
                        boxShadow: '0 6px 20px rgba(0, 102, 204, 0.25)', // ✅ LIGHTER: Reduced shadow
                        letterSpacing: '-0.01em',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.75rem',
                        opacity: (isOutOfStock || isAddingToCart) ? 0.7 : 1
                      }}
                    >
                      {isAddingToCart ? (
                        <>
                          <span style={{ 
                            animation: 'spin 1s linear infinite',
                            display: 'inline-block'
                          }}>
                            🔄
                          </span>
                          Adding to Cart...
                        </>
                      ) : isOutOfStock ? (
                        '❌ Out of Stock'
                      ) : (
                        <>
                          🛒 Add {quantity > 1 ? `${quantity} ` : ''}to Cart
                        </>
                      )}
                    </motion.button>

                    {/* Total Price */}
                    {quantity > 1 && !isOutOfStock && (
                      <div style={{
                        marginTop: '1rem',
                        textAlign: 'center',
                        fontSize: '1rem',
                        color: 'var(--apple-text-gray)',
                        letterSpacing: '-0.01em'
                      }}>
                        Total: <span style={{ fontWeight: '700', color: 'var(--apple-blue)' }}>
                          ${(product.price * quantity).toLocaleString()}
                        </span>
                      </div>
                    )}
                  </motion.div>
                </div>
              </div>

              {/* CSS Animations */}
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
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default ProductModal;
