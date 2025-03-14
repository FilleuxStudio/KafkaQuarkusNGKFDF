import React from "react";
import Header from "./Header";
import Hero from "./Hero";
import ProductList from "./ProductList";
import "./App.css";

function App() {
  return (
    <div className="app-container">
      <Header />
      <Hero />
      <ProductList />
    </div>
  );
}

export default App;
