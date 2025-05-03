// src/App.jsx
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
  const [isSubscribed, setIsSubscribed] = useState(false);

  // Add to cart (initial quantity = 1)
  const addToCart = (order) => {
    setCart((prev) => [...prev, { ...order, quantity: 1 }]);
    setToastMessage(`${order.product} added to cart!`);
    setTimeout(() => setToastMessage(""), 3000);
  };

  // Remove an item entirely
  const removeItemFromCart = (index) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  };

  // **NEW**: update just the quantity for a given index
  const updateItemQuantity = (index, quantity) => {
    setCart((prev) =>
      prev.map((item, i) =>
        i === index
          ? { ...item, quantity: Math.max(1, quantity) }
          : item
      )
    );
  };

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);
  const clearCart = () => setCart([]);

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

    const response = await fetch("http://localhost:8080/notifications/subscribe/123", {
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
      updateItemQuantity={updateItemQuantity}  // pass it in
    />
    <Toast message={toastMessage} />
    {/* ... notifications UI ... */}
  </div>
);
}

export default App;