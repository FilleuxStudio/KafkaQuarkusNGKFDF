import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
console.log("⏱ VITE_API_BASE =", import.meta.env.VITE_API_BASE);
console.log("⏱ VITE_NOTIF_BASE =", import.meta.env.VITE_NOTIF_BASE);


ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/service-worker.js")
      .then((registration) => {
        console.log("Service Worker enregistré avec succès :", registration);
      })
      .catch((error) => {
        console.error("Erreur lors de l'enregistrement du Service Worker :", error);
      });
  });
}