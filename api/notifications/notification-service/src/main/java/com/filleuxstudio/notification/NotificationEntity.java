package com.filleuxstudio.notification;

public class NotificationEntity {
    private String id;  // Ajout du champ id
    private String type;
    private String payload;
    private long timestamp;

    // Constructeur complet avec id
    public NotificationEntity(String id, String type, String payload, long timestamp) {
        this.id = id;
        this.type = type;
        this.payload = payload;
        this.timestamp = timestamp;
    }

    // Constructeur sans id (pour Firestore)
    public NotificationEntity(String type, String payload, long timestamp) {
        this(null, type, payload, timestamp);
    }

    // Constructeur vide obligatoire
    public NotificationEntity() {}

    // Getters/setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public String getPayload() { return payload; }
    public void setPayload(String payload) { this.payload = payload; }
    public long getTimestamp() { return timestamp; }
    public void setTimestamp(long timestamp) { this.timestamp = timestamp; }
}