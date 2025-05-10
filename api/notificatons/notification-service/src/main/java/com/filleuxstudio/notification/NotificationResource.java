package com.filleuxstudio.notification;

import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;

import org.eclipse.microprofile.reactive.messaging.Channel;
import io.smallrye.mutiny.Multi;

@Path("/notifications")
public class NotificationResource {

    @Channel("orders-in")
    Multi<String> ordersStream;

    @Channel("inventory-in")
    Multi<String> inventoryStream;

    @GET
    @Path("/stream")
    @Produces(MediaType.SERVER_SENT_EVENTS)
    public Multi<String> streamNotifications() {
        // Merge both streams into one SSE feed
        return Multi.createBy()
                    .merging()
                    .streams(ordersStream, inventoryStream);
    }
}