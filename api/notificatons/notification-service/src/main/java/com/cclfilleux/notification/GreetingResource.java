package com.cclfilleux.notification;

import com.cclfilleux.notification.model.Notification;
import com.cclfilleux.notification.model.Notification.NotificationType;
import com.cclfilleux.notification.service.WebPushService;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.reactive.messaging.Channel;
import org.eclipse.microprofile.reactive.messaging.Emitter;
import org.reactivestreams.Publisher;

@Path("/notifications-ui")
public class GreetingResource {

    @Inject
    @Channel("notifications-stream")
    Publisher<String> notifications;

    @Inject
    @Channel("notifications")
    Emitter<Notification> notificationEmitter;

    @Inject
    WebPushService webPushService;

    @GET
    @Produces(MediaType.TEXT_HTML)
    public String getNotificationUI() {
        return """
            <html>
                <head>
                    <title>Système de Notifications</title>
                </head>
                <body>
                    <h1>Système de Notifications</h1>
                    <form action="/notifications-ui" method="post">
                        <input type="text" name="message" required placeholder="Message">
                        <select name="type" required>
                            <option value="STOCK_ALERT">Alerte Stock</option>
                            <option value="ORDER_CONFIRMATION">Confirmation Commande</option>
                            <option value="SHIPMENT_UPDATE">Mise à jour livraison</option>
                        </select>
                        <input type="email" name="recipient" required placeholder="Destinataire">
                        <button type="submit">Envoyer</button>
                    </form>
                    <div id="notifications" style="border:1px solid #ccc;padding:10px;margin-top:20px;"></div>
                    <script>
                        const eventSource = new EventSource('/notifications-ui/stream');
                        eventSource.onmessage = (e) => {
                            const div = document.getElementById('notifications');
                            div.innerHTML += '<p>' + e.data + '</p>';
                            div.scrollTop = div.scrollHeight;
                        };
                    </script>
                </body>
            </html>
            """;
    }

    @POST
    @Consumes(MediaType.APPLICATION_FORM_URLENCODED)
    public Response sendNotification(
        @FormParam("message") String message,
        @FormParam("type") String type,
        @FormParam("recipient") String recipient
    ) {
        try {
            Notification notification = new Notification(
                message,
                NotificationType.valueOf(type),
                recipient
            );
            
            notificationEmitter.send(notification);
            return Response.ok().build();
        } catch (IllegalArgumentException e) {
            return Response.status(400)
                .entity("Type de notification invalide: " + type)
                .build();
        }
    }


    @GET
    @Path("/stream")
    @Produces(MediaType.SERVER_SENT_EVENTS)
    public Publisher<String> streamNotifications() {
        return notifications;
    }
}