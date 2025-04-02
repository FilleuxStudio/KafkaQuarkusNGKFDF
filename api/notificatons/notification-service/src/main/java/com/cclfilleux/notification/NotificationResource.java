package com.cclfilleux.notification;

import jakarta.ws.rs.DELETE;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import java.util.Map;
import jakarta.ws.rs.core.Response;
import org.jboss.logging.Logger;

@Path("/notifications")
public class NotificationResource {

    private static final Logger LOG = Logger.getLogger(NotificationResource.class);
    private final WebPushService webPushService;

    public NotificationResource(WebPushService webPushService) {
        this.webPushService = webPushService;
    }

    @POST
    @Path("/subscribe/{userId}")
    public Response subscribe(@PathParam("userId") String userId, String subscriptionJson) {
        if (subscriptionJson == null || subscriptionJson.isBlank()) {
            LOG.warn("Tentative d'inscription avec un JSON vide.");
            return Response.status(Response.Status.BAD_REQUEST).entity("Subscription JSON is required").build();
        }

        webPushService.registerSubscription(userId, subscriptionJson);
        LOG.info("Utilisateur " + userId + " inscrit aux notifications.");
        return Response.ok().build();
    }

    @GET
    @Path("/subscriptions")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getAllSubscriptions() {
        Map<String, String> subscriptions = webPushService.getAllSubscriptions();
        return Response.ok(subscriptions).build();
    }

    @DELETE
    @Path("/unsubscribe/{userId}")
    public Response unsubscribe(@PathParam("userId") String userId) {
        boolean removed = webPushService.removeSubscription(userId);
        if (removed) {
            LOG.info("Utilisateur " + userId + " désinscrit des notifications.");
            return Response.ok().build();
        } else {
            return Response.status(Response.Status.NOT_FOUND).entity("Utilisateur non trouvé").build();
        }
    }

    @POST
    @Path("/send/{userId}")
    public Response sendNotification(@PathParam("userId") String userId, String message) {
        try {
            webPushService.sendWebPush(userId, message);
            return Response.ok("Notification envoyée à " + userId).build();
        } catch (Exception e) {
            LOG.error("Erreur lors de l'envoi de la notification", e);
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity("Erreur lors de l'envoi").build();
        }
    }
}
