package com.example.analytics;

import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.apache.kafka.streams.KafkaStreams;
import org.apache.kafka.streams.StoreQueryParameters;
import org.apache.kafka.streams.state.ReadOnlyWindowStore;
import org.apache.kafka.streams.state.WindowStoreIterator;
import org.apache.kafka.streams.state.QueryableStoreTypes;
import org.apache.kafka.streams.errors.InvalidStateStoreException;
import org.jboss.logging.Logger;
import java.util.HashMap;
import java.util.Map;
import java.util.List;
import java.util.ArrayList;
import java.util.Set;
import java.util.HashSet;
import java.util.concurrent.atomic.AtomicReference;
import java.time.Instant;

@Path("/analytics")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class AnalyticsResource {

    private static final Logger LOG = Logger.getLogger(AnalyticsResource.class);

    @Inject
    KafkaStreams kafkaStreams;
    
    @Inject
    AlertManager alertManager;

    @GET
    @Path("/status")
    public Response getStatus() {
        Map<String, Object> status = new HashMap<>();
        status.put("service", "order-analytics-service");
        status.put("status", "running");
        status.put("kafkaStreamsState", kafkaStreams.state().name());
        status.put("timestamp", System.currentTimeMillis());
        return Response.ok(status).build();
    }

    @GET
    @Path("/live-data")
    public Response getLiveData() {
        try {
            Map<String, Object> response = new HashMap<>();
            Map<String, Long> orderCounts = new HashMap<>();
            AtomicReference<Double> totalRevenue = new AtomicReference<>(0.0);
            boolean storeReady = false;
            
            if (kafkaStreams.state() == KafkaStreams.State.RUNNING) {
                try {
                    long currentTime = System.currentTimeMillis();
                    // FIXED: Query only recent non-overlapping windows
                    long windowStart = currentTime - (2 * 60 * 1000); // Last 2 minutes instead of 5
                    
                    LOG.infof("🔍 Querying state stores from %d to %d", windowStart, currentTime);
                    
                    ReadOnlyWindowStore<String, Long> orderStore = kafkaStreams.store(
                        StoreQueryParameters.fromNameAndType(
                            "product-order-counts", 
                            QueryableStoreTypes.windowStore()
                        )
                    );
                    
                    ReadOnlyWindowStore<String, Double> revenueStore = kafkaStreams.store(
                        StoreQueryParameters.fromNameAndType(
                            "product-revenue-analytics", 
                            QueryableStoreTypes.windowStore()
                        )
                    );
                    
                    // FIXED: Track which windows we've already processed to avoid duplicates
                    Set<String> processedWindows = new HashSet<>();
                    
                    try {
                        orderStore.all().forEachRemaining(keyValue -> {
                            String product = keyValue.key.key();
                            long windowStartTime = keyValue.key.window().start(); 
                            long windowEndTime = keyValue.key.window().end();
                            
                            // Create unique window identifier
                            String windowId = product + "-" + windowStartTime + "-" + windowEndTime;
                            
                            // Only include recent, non-duplicate windows
                            if (windowEndTime >= windowStart && !processedWindows.contains(windowId)) {
                                processedWindows.add(windowId);
                                Long currentCount = orderCounts.getOrDefault(product, 0L);
                                orderCounts.put(product, currentCount + keyValue.value);
                                LOG.infof("📊 Found orders: %s = %d (window: %d-%d)", 
                                    product, keyValue.value, windowStartTime, windowEndTime);
                            }
                        });
                        
                        Set<String> processedRevenueWindows = new HashSet<>();
                        revenueStore.all().forEachRemaining(keyValue -> {
                            String product = keyValue.key.key();
                            long windowStartTime = keyValue.key.window().start();
                            long windowEndTime = keyValue.key.window().end();
                            
                            String windowId = product + "-" + windowStartTime + "-" + windowEndTime;
                            
                            if (windowEndTime >= windowStart && !processedRevenueWindows.contains(windowId)) {
                                processedRevenueWindows.add(windowId);
                                totalRevenue.updateAndGet(current -> current + keyValue.value);
                                LOG.infof("💰 Found revenue: %.2f (window: %d-%d)", 
                                    keyValue.value, windowStartTime, windowEndTime);
                            }
                        });
                        
                        storeReady = true;
                        response.put("dataSource", "✅ LIVE Kafka Streams Data (De-duplicated)");
                        
                    } catch (Exception e) {
                        LOG.errorf(e, "❌ Error querying state stores");
                        response.put("dataSource", "❌ State store query failed: " + e.getMessage());
                    }
                    
                } catch (InvalidStateStoreException e) {
                    response.put("dataSource", "⚠️ State stores initializing...");
                    LOG.warn("State stores not ready yet");
                }
            } else {
                response.put("dataSource", "❌ Kafka Streams not running - State: " + kafkaStreams.state().name());
            }
            
            double revenueValue = totalRevenue.get();
            double profit = revenueValue;
            
            response.put("orderCounts", orderCounts);
            response.put("totalRevenue", Math.round(revenueValue * 100.0) / 100.0);
            response.put("profit", Math.round(profit * 100.0) / 100.0);
            response.put("isLive", kafkaStreams.state() == KafkaStreams.State.RUNNING && storeReady);
            response.put("timestamp", System.currentTimeMillis());
            response.put("windowInfo", "Last 2 minutes (de-duplicated)");
            response.put("storeReady", storeReady);
            response.put("totalOrdersFound", orderCounts.values().stream().mapToLong(Long::longValue).sum());
            
            LOG.infof("📈 De-duplicated live data: orders=%s, revenue=%.2f, profit=%.2f", 
                orderCounts, revenueValue, profit);
            
            return Response.ok(response).build();
            
        } catch (Exception e) {
            LOG.error("Error getting live data", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to fetch live data: " + e.getMessage());
            errorResponse.put("dataSource", "❌ Error occurred");
            errorResponse.put("isLive", false);
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(errorResponse).build();
        }
    }

    @GET
    @Path("/debug/state-stores")
    public Response debugStateStores() {
        try {
            Map<String, Object> debug = new HashMap<>();
            
            if (kafkaStreams.state() == KafkaStreams.State.RUNNING) {
                try {
                    ReadOnlyWindowStore<String, Long> orderStore = kafkaStreams.store(
                        StoreQueryParameters.fromNameAndType(
                            "product-order-counts", 
                            QueryableStoreTypes.windowStore()
                        )
                    );
                    
                    List<Map<String, Object>> orderEntries = new ArrayList<>();
                    orderStore.all().forEachRemaining(keyValue -> {
                        Map<String, Object> entry = new HashMap<>();
                        entry.put("product", keyValue.key.key());
                        entry.put("count", keyValue.value);
                        entry.put("windowStart", keyValue.key.window().start());
                        entry.put("windowEnd", keyValue.key.window().end());
                        entry.put("windowStartFormatted", new java.util.Date(keyValue.key.window().start()).toString());
                        entry.put("windowEndFormatted", new java.util.Date(keyValue.key.window().end()).toString());
                        orderEntries.add(entry);
                    });
                    
                    debug.put("orderStoreEntries", orderEntries);
                    debug.put("orderStoreSize", orderEntries.size());
                    
                } catch (Exception e) {
                    debug.put("orderStoreError", e.getMessage());
                }
                
                try {
                    ReadOnlyWindowStore<String, Double> revenueStore = kafkaStreams.store(
                        StoreQueryParameters.fromNameAndType(
                            "product-revenue-analytics", 
                            QueryableStoreTypes.windowStore()
                        )
                    );
                    
                    List<Map<String, Object>> revenueEntries = new ArrayList<>();
                    revenueStore.all().forEachRemaining(keyValue -> {
                        Map<String, Object> entry = new HashMap<>();
                        entry.put("product", keyValue.key.key());
                        entry.put("revenue", keyValue.value);
                        entry.put("windowStart", keyValue.key.window().start());
                        entry.put("windowEnd", keyValue.key.window().end());
                        entry.put("windowStartFormatted", new java.util.Date(keyValue.key.window().start()).toString());
                        entry.put("windowEndFormatted", new java.util.Date(keyValue.key.window().end()).toString());
                        revenueEntries.add(entry);
                    });
                    
                    debug.put("revenueStoreEntries", revenueEntries);
                    debug.put("revenueStoreSize", revenueEntries.size());
                    
                } catch (Exception e) {
                    debug.put("revenueStoreError", e.getMessage());
                }
            }
            
            debug.put("kafkaStreamsState", kafkaStreams.state().name());
            debug.put("timestamp", System.currentTimeMillis());
            
            return Response.ok(debug).build();
            
        } catch (Exception e) {
            LOG.error("Error in debug endpoint", e);
            return Response.serverError().entity("Debug failed: " + e.getMessage()).build();
        }
    }

    @GET
    @Path("/realtime-stats")
    public Response getRealTimeStats() {
        try {
            Map<String, Object> stats = new HashMap<>();
            stats.put("timestamp", System.currentTimeMillis());
            stats.put("status", kafkaStreams.state() == KafkaStreams.State.RUNNING ? "live" : "not_ready");
            stats.put("message", kafkaStreams.state() == KafkaStreams.State.RUNNING ? 
                "Real-time analytics active" : "Kafka Streams not ready: " + kafkaStreams.state().name());
            stats.put("kafkaStreamsState", kafkaStreams.state().name());
            stats.put("isProcessing", kafkaStreams.state() == KafkaStreams.State.RUNNING);
            
            return Response.ok(stats).build();
        } catch (Exception e) {
            LOG.error("Error getting real-time stats", e);
            return Response.serverError().entity("Failed to get stats: " + e.getMessage()).build();
        }
    }

    @GET
    @Path("/alerts")
    public Response getActiveAlerts() {
        try {
            Map<String, Object> response = new HashMap<>();
            List<AlertManager.Alert> alerts = alertManager.getRecentAlerts();
            
            response.put("alerts", alerts);
            response.put("alertCount", alerts.size());
            response.put("hasActiveAlerts", !alerts.isEmpty());
            response.put("timestamp", System.currentTimeMillis());
            
            return Response.ok(response).build();
        } catch (Exception e) {
            LOG.error("Error getting alerts", e);
            return Response.serverError().entity("Failed to get alerts: " + e.getMessage()).build();
        }
    }
}
