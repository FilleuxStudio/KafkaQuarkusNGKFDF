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

  const subscribeToNotifications = async () => {
    if (!("Notification" in window) || !("serviceWorker" in navigator)) {
        alert("Les notifications push ne sont pas supportées par ce navigateur.");
        return;
    }

    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
        alert("Permission refusée pour les notifications.");
        return;
    }

    const registration = await navigator.serviceWorker.ready;

    // Vérifier s'il existe déjà une souscription
    const existingSubscription = await registration.pushManager.getSubscription();
    if (existingSubscription) {
        alert("Déjà inscrit aux notifications !");
        setIsSubscribed(true);
        return;
    }

    const applicationServerKey = urlBase64ToUint8Array(
        "BN1TuOmqY4c7UGurRIxzs2RJ31fwQ_02JAzuMHLrqY5izRkftHUlh9MWmbEui9IfIrBWwjdpVaKP3fHee8PiYQU"
    );

    const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey,
    });

    console.log("Subscription :", JSON.stringify(subscription));

    const response = await fetch(`${NOTIF_BASE}/notifications/subscribe/123`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subscription),
    });

    if (response.ok) {
        setIsSubscribed(true);
        alert("Inscription réussie aux notifications !");
    } else {
        alert("Erreur lors de l'inscription.");
    }
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
                  <h2 className="section-title">Featured Products</h2>
                  <ProductList onAddToCart={addToCart} />
                </section>
                
                {/* PRESERVED: All your notification functionality */}
                <div>
                  <h1>Notifications Push avec Quarkus</h1>
                  <button onClick={subscribeToNotifications} disabled={isSubscribed}>
                      {isSubscribed ? "Déjà inscrit" : "S'inscrire aux notifications"}
                  </button>
                </div>
                <NotificationComponent />
              </>
            } 
          />
          <Route 
            path="/analytics" 
            element={<AnalyticsDashboard />} 
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
