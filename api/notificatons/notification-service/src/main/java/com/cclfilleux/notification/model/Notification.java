package com.cclfilleux.notification.model;

import java.time.LocalDateTime;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

public class Notification {

    private String id;
    private String message;
    private NotificationType type;
    private LocalDateTime timestamp;
    private String recipient;
    
    public Notification() {
    }

    public Notification(String id, String message, Notification.NotificationType type, LocalDateTime timestamp,
            String recipient) {
        this.id = id;
        this.message = message;
        this.type = type;
        this.timestamp = LocalDateTime.now();
        this.recipient = recipient;
    }

     public Notification(String message, NotificationType type, String recipient) {
        this.message = message;
        this.type = type;
        this.recipient = recipient;
        this.timestamp = LocalDateTime.now();
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public NotificationType getType() {
        return type;
    }

    public void setType(NotificationType type) {
        this.type = type;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public String getRecipient() {
        return recipient;
    }

    public void setRecipient(String recipient) {
        this.recipient = recipient;
    }

    public enum NotificationType {
        STOCK_ALERT, ORDER_CONFIRMATION, SHIPMENT_UPDATE
    }

    public String toJson() {
        try {
            return new ObjectMapper().writeValueAsString(this);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Erreur de sérialisation JSON", e);
        }
    }
    
}
