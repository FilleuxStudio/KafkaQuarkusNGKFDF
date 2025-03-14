package com.cclfilleux.notification.rest;

import com.cclfilleux.notification.model.Notification;
import com.cclfilleux.notification.service.FirebaseService;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.Response;
import java.util.List;
import java.util.concurrent.ExecutionException;

@Path("/notifications")
@Produces("application/json")
public class NotificationResource {

    @Inject
    FirebaseService firebaseService;

    @POST
    @Consumes("application/json")
    public Response createNotification(Notification notification) {
        try {
            firebaseService.saveNotification(notification);
            return Response.status(Response.Status.CREATED).entity(notification).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(e.getMessage()).build();
        }
    }

    @DELETE
    @Path("/{id}")
    public Response deleteNotification(@PathParam("id") String id) {
        try {
            firebaseService.deleteNotification(id);
            return Response.noContent().build();
        } catch (Exception e) {
            return Response.status(Response.Status.NOT_FOUND).entity("Notification non trouvée").build();
        }
    }

    @GET
    @Path("/{id}")
    public Response getNotification(@PathParam("id") String id) {
        try {
            Notification notification = firebaseService.getNotificationById(id);
            if(notification != null) {
                return Response.ok(notification).build();
            }
            return Response.status(Response.Status.NOT_FOUND).build();
        } catch (InterruptedException | ExecutionException e) {
            return Response.serverError().entity(e.getMessage()).build();
        }
    }

    @GET
    public Response getAllNotifications() {
        try {
            List<Notification> notifications = firebaseService.getAllNotifications();
            return Response.ok(notifications).build();
        } catch (InterruptedException | ExecutionException e) {
            return Response.serverError().entity(e.getMessage()).build();
        }
    }
}