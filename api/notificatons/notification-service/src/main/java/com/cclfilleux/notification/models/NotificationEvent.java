package com.cclfilleux.notification.models;

import com.fasterxml.jackson.annotation.JsonProperty;

public class NotificationEvent {
    @JsonProperty("user_id")
    private String userId;
    
    @JsonProperty("message_type")
    private String messageType;
    
    @JsonProperty("message")
    private String message;

    public String getUserId() {
        return userId;
    }
    public void setUserId(String userId) {
        this.userId = userId;
    }
    public String getMessageType() {
        return messageType;
    }
    public void setMessageType(String messageType) {
        this.messageType = messageType;
    }
    public String getMessage() {
        return message;
    }
    public void setMessage(String message) {
        this.message = message;
    }
}
