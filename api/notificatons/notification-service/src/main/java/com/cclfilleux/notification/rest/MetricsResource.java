package com.cclfilleux.notification.rest;

import org.checkerframework.checker.units.qual.Time;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;

@Path("/metrics")
@Produces(MediaType.APPLICATION_JSON)
public class MetricsResource {

    @GET
    @Path("/notifications-count")
    @Time
    public String getNotificationsCount() {
        return "{\"metrics\": \"Endpoint pour Grafana\"}";
    }
}