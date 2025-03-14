import React from "react";
import { products } from "./products";
import ProductCard from "./ProductCard";

function ProductList({ onAddToCart }) {
  return (
    <section className="product-section">
      <h2 className="section-title">Our Products</h2>
      <div className="product-list">
        {products.map((item) => (
          <ProductCard key={item.id} product={item} onAddToCart={onAddToCart} />
        ))}
      </div>
    </section>
  );
}

export default ProductList;
