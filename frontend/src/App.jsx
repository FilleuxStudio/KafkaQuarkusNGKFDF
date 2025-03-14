// App.jsx
import React, { useState } from "react";
import Header from "./Header";
import Hero from "./Hero";
import ProductList from "./ProductList";
import CartDrawer from "./CartDrawer";
import Toast from "./Toast";
import "./App.css";

function App() {
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const addToCart = (order) => {
    setCart((prevCart) => [...prevCart, order]);
    setToastMessage(`${order.product} added to cart!`);
    setTimeout(() => setToastMessage(""), 3000);
  };

  const removeItemFromCart = (index) => {
    setCart((prevCart) => prevCart.filter((_, i) => i !== index));
  };

  const openCart = () => {
    setIsCartOpen(true);
  };

  const closeCart = () => {
    setIsCartOpen(false);
  };

  const clearCart = () => {
    setCart([]);
  };

  return (
    <div className="app-container">
      <Header onCartClick={openCart} />
      <Hero />
      <ProductList onAddToCart={addToCart} />
      <CartDrawer
        isOpen={isCartOpen}
        onClose={closeCart}
        cartItems={cart}
        clearCart={clearCart}
        removeItemFromCart={removeItemFromCart}
      />
      <Toast message={toastMessage} />
    </div>
  );
}

export default App;
