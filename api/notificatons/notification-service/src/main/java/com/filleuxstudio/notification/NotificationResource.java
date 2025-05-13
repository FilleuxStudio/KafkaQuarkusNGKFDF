package com.filleuxstudio.notification;

import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import org.eclipse.microprofile.reactive.messaging.Channel;
import io.smallrye.mutiny.Multi;

@Path("/notifications")
public class NotificationResource {

    @Channel("sse-notifications")
    Multi<String> stream; // Reçoit depuis Emitter

    @GET
    @Path("/stream")
    @Produces(MediaType.SERVER_SENT_EVENTS)
    public Multi<String> streamNotifications() {
        return stream;
    }
}
