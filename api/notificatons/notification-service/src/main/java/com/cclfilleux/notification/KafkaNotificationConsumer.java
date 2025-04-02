package com.cclfilleux.notification;

import org.eclipse.microprofile.reactive.messaging.Incoming;
import jakarta.enterprise.context.ApplicationScoped;
import com.cclfilleux.notification.models.NotificationEvent;

@ApplicationScoped
public class KafkaNotificationConsumer {

    private final WebPushService webPushService;

    public KafkaNotificationConsumer(WebPushService webPushService) {
        this.webPushService = webPushService;
    }

    @Incoming("notifications")
    public void processNotification(NotificationEvent event) {
        webPushService.sendWebPush(
            event.getUserId(), 
            event.getMessage()
        );
    }
}