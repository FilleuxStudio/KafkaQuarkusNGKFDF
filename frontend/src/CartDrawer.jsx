// src/CartDrawer.jsx
import React, { useState } from "react";
import "./CartDrawer.css";

const API_BASE = import.meta.env.VITE_API_BASE;

const CartDrawer = ({
  isOpen,
  onClose,
  cartItems,
  clearCart,
  removeItemFromCart,
  updateItemQuantity, // now expected
}) => {
  const [submitting, setSubmitting] = useState(false);

  const submitOrders = async () => {
    setSubmitting(true);
    try {
      for (const order of cartItems) {
        const res = await fetch(`${API_BASE}/orders`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(order),
        });
        if (!res.ok) {
          throw new Error(`Failed to submit order for ${order.product}`);
        }
      }
      alert("Order submitted successfully!");
      clearCart();
    } catch (err) {
      console.error("Error submitting orders:", err);
      alert("There was an error submitting your order.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={`cart-drawer ${isOpen ? "open" : ""}`}>
      <button className="close-button" onClick={onClose}>&times;</button>
      <h2>Your Cart</h2>

      {cartItems.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <ul>
          {cartItems.map((item, index) => (
            <li key={index}>
              <div className="cart-item-info">
                <span className="cart-item-product">{item.product}</span>
                <span className="cart-item-price">${item.price}</span>
                {/* Quantity controls */}
                <div className="cart-item-quantity-controls">
                  <button
                    onClick={() =>
                      updateItemQuantity(index, item.quantity - 1)
                    }
                    disabled={item.quantity <= 1}
                    aria-label="Decrease quantity"
                  >–</button>
                  <span className="cart-item-quantity">{item.quantity}</span>
                  <button
                    onClick={() =>
                      updateItemQuantity(index, item.quantity + 1)
                    }
                    aria-label="Increase quantity"
                  >+</button>
                </div>
              </div>
              <button
                className="remove-item-button"
                onClick={() => removeItemFromCart(index)}
                aria-label="Remove item"
              >&times;</button>
            </li>
          ))}
        </ul>
      )}

      {cartItems.length > 0 && (
        <button
          className="submit-button"
          onClick={submitOrders}
          disabled={submitting}
        >
          {submitting ? "Submitting..." : "Submit Order"}
        </button>
      )}
    </div>
  );
};

export default CartDrawer;
