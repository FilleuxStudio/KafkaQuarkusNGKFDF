package com.example.analytics;

import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.apache.kafka.streams.KafkaStreams;
import org.apache.kafka.streams.StoreQueryParameters;
import org.apache.kafka.streams.state.ReadOnlyWindowStore;
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
                    long windowStart = currentTime - (2 * 60 * 1000); // Last 2 minutes
                    
                    LOG.infof("🔍 Querying unified analytics store from %d to %d", windowStart, currentTime);
                    
                    // ✅ UPDATED: Query the new unified analytics store
                    ReadOnlyWindowStore<String, ProductAnalytics> analyticsStore = kafkaStreams.store(
                        StoreQueryParameters.fromNameAndType(
                            "unified-product-analytics", 
                            QueryableStoreTypes.windowStore()
                        )
                    );
                    
                    Set<String> processedWindows = new HashSet<>();
                    
                    try {
                        analyticsStore.all().forEachRemaining(keyValue -> {
                            String product = keyValue.key.key();
                            ProductAnalytics analytics = keyValue.value;
                            long windowStartTime = keyValue.key.window().start(); 
                            long windowEndTime = keyValue.key.window().end();
                            
                            String windowId = product + "-" + windowStartTime + "-" + windowEndTime;
                            
                            if (windowEndTime >= windowStart && !processedWindows.contains(windowId)) {
                                processedWindows.add(windowId);
                                
                                // Get both order count AND revenue from unified analytics
                                Long currentCount = orderCounts.getOrDefault(product, 0L);
                                orderCounts.put(product, currentCount + analytics.getOrderCount());
                                totalRevenue.updateAndGet(current -> current + analytics.getTotalRevenue());
                                
                                LOG.infof("📊 Found unified data: %s = %d orders, $%.2f revenue (window: %d-%d)", 
                                    product, analytics.getOrderCount(), analytics.getTotalRevenue(), windowStartTime, windowEndTime);
                            }
                        });
                        
                        storeReady = true;
                        response.put("dataSource", "✅ LIVE Unified Kafka Streams Data");
                        
                    } catch (Exception e) {
                        LOG.errorf(e, "❌ Error querying unified analytics store");
                        response.put("dataSource", "❌ Unified store query failed: " + e.getMessage());
                    }
                    
                } catch (InvalidStateStoreException e) {
                    response.put("dataSource", "⚠️ Unified analytics store initializing...");
                    LOG.warn("Unified analytics store not ready yet");
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
            response.put("windowInfo", "Last 2 minutes (unified analytics)");
            response.put("storeReady", storeReady);
            response.put("totalOrdersFound", orderCounts.values().stream().mapToLong(Long::longValue).sum());
            
            LOG.infof("📈 Unified analytics response: orders=%s, revenue=%.2f, profit=%.2f", 
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
                    // ✅ UPDATED: Debug the new unified analytics store
                    ReadOnlyWindowStore<String, ProductAnalytics> analyticsStore = kafkaStreams.store(
                        StoreQueryParameters.fromNameAndType(
                            "unified-product-analytics", 
                            QueryableStoreTypes.windowStore()
                        )
                    );
                    
                    List<Map<String, Object>> analyticsEntries = new ArrayList<>();
                    analyticsStore.all().forEachRemaining(keyValue -> {
                        Map<String, Object> entry = new HashMap<>();
                        ProductAnalytics analytics = keyValue.value;
                        entry.put("product", keyValue.key.key());
                        entry.put("orderCount", analytics.getOrderCount());
                        entry.put("totalRevenue", analytics.getTotalRevenue());
                        entry.put("windowStart", keyValue.key.window().start());
                        entry.put("windowEnd", keyValue.key.window().end());
                        entry.put("windowStartFormatted", new java.util.Date(keyValue.key.window().start()).toString());
                        entry.put("windowEndFormatted", new java.util.Date(keyValue.key.window().end()).toString());
                        analyticsEntries.add(entry);
                    });
                    
                    debug.put("unifiedAnalyticsEntries", analyticsEntries);
                    debug.put("unifiedAnalyticsSize", analyticsEntries.size());
                    
                } catch (Exception e) {
                    debug.put("unifiedAnalyticsError", e.getMessage());
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
                "Real-time unified analytics active" : "Kafka Streams not ready: " + kafkaStreams.state().name());
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
