package com.example.analytics;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.time.Instant;

@JsonIgnoreProperties(ignoreUnknown = true)
public class Order {
    private String id;
    private String product;
    private int quantity;
    private double price;
    private double totalPrice;
    private Instant timestamp;

    public Order() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    
    public String getProduct() { return product; }
    public void setProduct(String product) { this.product = product; }
    
    public int getQuantity() { return quantity; }
    public void setQuantity(int quantity) { this.quantity = quantity; }
    
    public double getPrice() { return price; }
    public void setPrice(double price) { this.price = price; }
    
    public double getTotalPrice() { return totalPrice; }
    public void setTotalPrice(double totalPrice) { this.totalPrice = totalPrice; }
    
    public Instant getTimestamp() { return timestamp; }
    public void setTimestamp(Instant timestamp) { this.timestamp = timestamp; }

    @Override
    public String toString() {
        return "Order{id='" + id + "', product='" + product + "', quantity=" + quantity + 
               ", totalPrice=" + totalPrice + "}";
    }
}
