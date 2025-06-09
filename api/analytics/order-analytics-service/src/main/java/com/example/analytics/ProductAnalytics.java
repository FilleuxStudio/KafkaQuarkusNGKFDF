package com.example.analytics;

public class ProductAnalytics {
    private String product;
    private long orderCount;
    private double totalRevenue;
    private long windowStart;
    private long windowEnd;

    public ProductAnalytics() {}

    public ProductAnalytics(String product, long orderCount, double totalRevenue, 
                           long windowStart, long windowEnd) {
        this.product = product;
        this.orderCount = orderCount;
        this.totalRevenue = totalRevenue;
        this.windowStart = windowStart;
        this.windowEnd = windowEnd;
    }

    public String getProduct() { return product; }
    public void setProduct(String product) { this.product = product; }
    
    public long getOrderCount() { return orderCount; }
    public void setOrderCount(long orderCount) { this.orderCount = orderCount; }
    
    public double getTotalRevenue() { return totalRevenue; }
    public void setTotalRevenue(double totalRevenue) { this.totalRevenue = totalRevenue; }
    
    public long getWindowStart() { return windowStart; }
    public void setWindowStart(long windowStart) { this.windowStart = windowStart; }
    
    public long getWindowEnd() { return windowEnd; }
    public void setWindowEnd(long windowEnd) { this.windowEnd = windowEnd; }
}
