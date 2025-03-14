import React from "react";

function ProductCard({ product }) {
  const { name, price, image } = product;

  const handleAddToCart = () => {
    // This is where you'd dispatch an event or call an API
    // to add the item to the cart
    alert(`Added ${name} to cart!`);
  };

  return (
    <div className="product-card">
      <img src={image} alt={name} className="product-image" />
      <h3>{name}</h3>
      <p className="product-price">${price}</p>
      <button onClick={handleAddToCart} className="add-to-cart-button">
        Add to Cart
      </button>
    </div>
  );
}

export default ProductCard;
