// App.jsx
import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./Header";
import Hero from "./Hero";
import ProductList from "./ProductList";
import AnalyticsDashboard from "./AnalyticsDashboard";
import CartDrawer from "./CartDrawer";
import Toast from "./Toast";
import NotificationComponent from './NotificationComponent';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import "./App.css";
import StockManagement from "./StockManagement";

const API_BASE    = import.meta.env.VITE_API_BASE;
const NOTIF_BASE  = import.meta.env.VITE_NOTIF_BASE;

function App() {
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);

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

  const updateItemQuantity = (index, newQuantity) => {
     setCart(prev =>
       prev.map((item, i) =>
         i === index
           ? { ...item, quantity: Math.max(1, newQuantity) }
           : item
      )
     );
   };

  const urlBase64ToUint8Array = (base64String) => {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, "+")
        .replace(/_/g, "/");

    const rawData = window.atob(base64);
    return new Uint8Array([...rawData].map((char) => char.charCodeAt(0)));
  };



  return (
    <Router>
      <div className="app-container">
        <Header onCartClick={openCart} />
        
        <Routes>
          <Route 
            path="/" 
            element={
              <>
                <Hero />
                <section className="product-section">
                  <ProductList onAddToCart={addToCart} />
                </section>
              </>
            } 
          />
          <Route 
            path="/analytics" 
            element={<AnalyticsDashboard />} 
          />
          <Route
            path="/stock-management"
            element={<StockManagement />}
          />
        </Routes>

        <CartDrawer
          isOpen={isCartOpen}
          onClose={closeCart}
          cartItems={cart}
          clearCart={clearCart}
          removeItemFromCart={removeItemFromCart}
          updateItemQuantity={updateItemQuantity}
        />
        
        <Toast message={toastMessage} />
        
        {/* PRESERVED: Toast notifications */}
        <ToastContainer />
      </div>
    </Router>
  );
}

export default App;
