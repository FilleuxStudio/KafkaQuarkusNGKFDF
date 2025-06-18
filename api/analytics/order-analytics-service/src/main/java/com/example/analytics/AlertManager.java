package com.example.analytics;

import jakarta.enterprise.context.ApplicationScoped;
import java.util.concurrent.ConcurrentLinkedQueue;
import java.util.List;
import java.util.ArrayList;
import org.jboss.logging.Logger;

@ApplicationScoped
public class AlertManager {
    
    private static final Logger LOG = Logger.getLogger(AlertManager.class);
    private final ConcurrentLinkedQueue<Alert> recentAlerts = new ConcurrentLinkedQueue<>();
    private static final int MAX_ALERTS = 100;
    
    public void addAlert(String product, long orderCount, long windowStart, long windowEnd) {
        Alert alert = new Alert(
            product, 
            orderCount, 
            windowStart, 
            windowEnd, 
            System.currentTimeMillis(),
            "HIGH_VOLUME",
            String.format("Product %s has %d orders in 2 minutes!", product, orderCount)
        );
        
        recentAlerts.offer(alert);
        
        // Keep only recent alerts
        while (recentAlerts.size() > MAX_ALERTS) {
            recentAlerts.poll();
        }
        
        LOG.warnf("🚨 ALERT TRIGGERED: %s", alert.getMessage());
    }
    
    public List<Alert> getRecentAlerts() {
        return new ArrayList<>(recentAlerts);
    }
    
    public static class Alert {
        private String product;
        private long orderCount;
        private long windowStart;
        private long windowEnd;
        private long timestamp;
        private String type;
        private String message;
        
        public Alert(String product, long orderCount, long windowStart, long windowEnd, 
                    long timestamp, String type, String message) {
            this.product = product;
            this.orderCount = orderCount;
            this.windowStart = windowStart;
            this.windowEnd = windowEnd;
            this.timestamp = timestamp;
            this.type = type;
            this.message = message;
        }
        
        // Getters
        public String getProduct() { return product; }
        public long getOrderCount() { return orderCount; }
        public long getWindowStart() { return windowStart; }
        public long getWindowEnd() { return windowEnd; }
        public long getTimestamp() { return timestamp; }
        public String getType() { return type; }
        public String getMessage() { return message; }
    }
}
