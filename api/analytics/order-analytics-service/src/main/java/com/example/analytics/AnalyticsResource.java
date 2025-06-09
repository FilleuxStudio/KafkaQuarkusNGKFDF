package com.example.analytics;

import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.apache.kafka.streams.KafkaStreams;
import org.jboss.logging.Logger;
import java.util.HashMap;
import java.util.Map;

@Path("/analytics")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class AnalyticsResource {

    private static final Logger LOG = Logger.getLogger(AnalyticsResource.class);

    @Inject
    KafkaStreams kafkaStreams;

    @GET
    @Path("/status")
    public Response getStatus() {
        Map<String, Object> status = new HashMap<>();
        status.put("service", "order-analytics-service");
        status.put("status", "running");
        status.put("kafkaStreamsState", kafkaStreams.state().name());
        return Response.ok(status).build();
    }

    @GET
    @Path("/health")
    public Response getHealth() {
        boolean isHealthy = kafkaStreams.state() == KafkaStreams.State.RUNNING;
        Map<String, Object> health = new HashMap<>();
        health.put("healthy", isHealthy);
        health.put("state", kafkaStreams.state().name());
        
        if (isHealthy) {
            return Response.ok(health).build();
        } else {
            return Response.serverError().entity(health).build();
        }
    }

    @GET
    @Path("/summary")
    public Response getSummary() {
        try {
            Map<String, Object> summary = new HashMap<>();
            summary.put("message", "Analytics service is processing order streams");
            summary.put("topics", new String[]{"orders", "order-analytics", "revenue-analytics"});
            summary.put("windowSize", "5 minutes");
            summary.put("features", new String[]{
                "Product order count analytics",
                "Revenue analytics per product", 
                "High volume alerts",
                "Real-time stream processing"
            });
            
            return Response.ok(summary).build();
        } catch (Exception e) {
            LOG.error("Error getting analytics summary", e);
            return Response.serverError().build();
        }
    }
}
