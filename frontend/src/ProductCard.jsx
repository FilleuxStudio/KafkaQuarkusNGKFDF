// ProductCard.jsx
import React from "react";

function ProductCard({ product, onAddToCart }) {
  const handleAddToCart = () => {
    // Create an order object (you can expand this if needed)
    const order = {
      product: product.name,
      quantity: 1,
      price: product.price,
    };
    onAddToCart(order);
  };

  return (
    <div className="product-card">
      <img src={product.image} alt={product.name} className="product-image" />
      <h3>{product.name}</h3>
      <p className="product-price">${product.price}</p>
      <button onClick={handleAddToCart} className="add-to-cart-button">
        Add to Cart
      </button>
    </div>
  );
}

export default ProductCard;
