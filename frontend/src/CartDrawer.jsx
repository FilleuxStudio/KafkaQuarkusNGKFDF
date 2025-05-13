import React, { useState } from "react";
import "./CartDrawer.css";

const CartDrawer = ({
  isOpen,
  onClose,
  cartItems,
  clearCart,
  removeItemFromCart,
}) => {
  const [submitting, setSubmitting] = useState(false);

  const submitOrders = async () => {
    setSubmitting(true);
    try {
      // Submit each item to the Orders API
      for (const order of cartItems) {
        const response = await fetch("http://localhost:8080/orders", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(order),
        });
        if (!response.ok) {
          throw new Error("Failed to submit order for " + order.product);
        }
      }
      alert("Order submitted successfully!");
      clearCart();
    } catch (error) {
      console.error("Error submitting orders:", error);
      alert("There was an error submitting your order.");
    }
    setSubmitting(false);
  };

  return (
    <div className={`cart-drawer ${isOpen ? "open" : ""}`}>
      <button className="close-button" onClick={onClose}>
        &times;
      </button>
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
                <span className="cart-item-quantity">Qty: {item.quantity}</span>
              </div>
              <button
                className="remove-item-button"
                onClick={() => removeItemFromCart(index)}
                aria-label="Remove item"
              >
                &times;
              </button>
            </li>
          ))}
        </ul>
      )}
      {cartItems.length > 0 && (
        <button className="submit-button" onClick={submitOrders} disabled={submitting}>
          {submitting ? "Submitting..." : "Submit Order"}
        </button>
      )}
    </div>
  );
};

export default CartDrawer;
