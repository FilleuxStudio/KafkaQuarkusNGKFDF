import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

console.log("⏱ VITE_API_BASE =", import.meta.env.VITE_API_BASE);
console.log("⏱ VITE_NOTIF_BASE =", import.meta.env.VITE_NOTIF_BASE);
console.log("⏱ VITE_ANALYTICS_BASE =", import.meta.env.VITE_ANALYTICS_BASE);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
