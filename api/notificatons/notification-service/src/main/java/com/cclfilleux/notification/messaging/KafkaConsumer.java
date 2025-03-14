package com.cclfilleux.notification.messaging;

import com.cclfilleux.notification.model.Notification;
import com.cclfilleux.notification.service.NotificationService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.eclipse.microprofile.reactive.messaging.Incoming;

@ApplicationScoped
public class KafkaConsumer {

    @Inject
    NotificationService notificationService;
    
    @Inject
    ObjectMapper objectMapper;

    @Incoming("notifications")
    public void consume(String message) throws JsonProcessingException {
        Notification notification = objectMapper.readValue(message, Notification.class);
        notificationService.processNotification(notification);
    }
}