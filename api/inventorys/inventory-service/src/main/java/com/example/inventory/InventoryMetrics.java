package com.example.inventory;

import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

@ApplicationScoped
public class InventoryMetrics {
    
    private final Counter ordersProcessedCounter;
    private final Counter stockUpdatesCounter;
    private final Counter lowStockAlertsCounter;

    @Inject
    public InventoryMetrics(MeterRegistry registry) {
        this.ordersProcessedCounter = Counter.builder("inventory.orders.processed")
            .description("Number of orders processed")
            .register(registry);
            
        this.stockUpdatesCounter = Counter.builder("inventory.stock.updates")
            .description("Number of stock updates")
            .register(registry);
            
        this.lowStockAlertsCounter = Counter.builder("inventory.stock.low.alerts")
            .description("Number of low stock alerts")
            .register(registry);
    }

    public void incrementOrdersProcessed() {
        ordersProcessedCounter.increment();
    }

    public void incrementStockUpdates() {
        stockUpdatesCounter.increment();
    }

    public void incrementLowStockAlerts() {
        lowStockAlertsCounter.increment();
    }
} 