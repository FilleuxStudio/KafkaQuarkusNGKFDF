// Toast.jsx
import React from "react";
import "./Toast.css";

const Toast = ({ message }) => {
  if (!message) return null;
  return <div className="toast">{message}</div>;
};

export default Toast;
