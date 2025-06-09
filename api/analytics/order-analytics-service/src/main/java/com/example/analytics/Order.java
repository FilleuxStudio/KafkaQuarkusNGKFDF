package com.example.analytics;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonSetter;
import java.time.Instant;

@JsonIgnoreProperties(ignoreUnknown = true)
public class Order {
    private String id;
    private String product;
    private int quantity;
    private double price;
    private double totalPrice;
    private long timestamp;

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
    
    public long getTimestamp() { return timestamp; }
    
    // SMART SETTER: Handles both long and ISO string timestamps
    @JsonSetter("timestamp")
    public void setTimestamp(Object timestamp) {
        if (timestamp instanceof Long) {
            this.timestamp = (Long) timestamp;
        } else if (timestamp instanceof Integer) {
            this.timestamp = ((Integer) timestamp).longValue();
        } else if (timestamp instanceof String) {
            try {
                // Try parsing as ISO string first
                this.timestamp = Instant.parse((String) timestamp).toEpochMilli();
            } catch (Exception e) {
                try {
                    // If that fails, try parsing as long string
                    this.timestamp = Long.parseLong((String) timestamp);
                } catch (Exception e2) {
                    // Default to current time if all else fails
                    this.timestamp = System.currentTimeMillis();
                }
            }
        } else {
            this.timestamp = System.currentTimeMillis();
        }
    }

    @Override
    public String toString() {
        return "Order{id='" + id + "', product='" + product + "', quantity=" + quantity + 
               ", totalPrice=" + totalPrice + ", timestamp=" + timestamp + "}";
    }
}
