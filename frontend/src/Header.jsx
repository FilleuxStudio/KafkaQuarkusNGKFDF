// Header.jsx
import React from "react";

function Header({ onCartClick }) {
  return (
    <header className="header">
      <div className="logo">Apple Store</div>
      <nav className="nav">
        <a href="#">Home</a>
        <a href="#">Products</a>
        <a href="#">Support</a>
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            onCartClick();
          }}
        >
          Cart
        </a>
      </nav>
    </header>
  );
}

export default Header;
