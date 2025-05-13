package com.filleuxstudio.notification;

import jakarta.annotation.PostConstruct;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import org.eclipse.microprofile.reactive.messaging.Incoming;
import org.jboss.logging.Logger;

import com.google.cloud.firestore.CollectionReference;
import com.google.cloud.firestore.DocumentReference;
import com.google.cloud.firestore.Firestore;
import com.google.api.core.ApiFuture;

@ApplicationScoped
public class NotificationProcessor {

    private static final Logger LOG = Logger.getLogger(NotificationProcessor.class);

    @Inject
    Firestore firestore;

    private CollectionReference notifCollection;

    @PostConstruct
    void init() {
        notifCollection = firestore.collection("notifications");
    }

    @Incoming("orders-in")
    public void consumeOrder(String payload) {
        LOG.infov("Received order event: {0}", payload);
        persist("order", payload);
    }

    @Incoming("inventory-in")
    public void consumeInventory(String payload) {
        LOG.infov("Received inventory event: {0}", payload);
        persist("inventory", payload);
    }

    private void persist(String type, String payload) {
        try {
            NotificationEntity e = new NotificationEntity(type, payload, System.currentTimeMillis());
            ApiFuture<DocumentReference> future = notifCollection.add(e);
            LOG.infov("Stored notification ID={0}", future.get().getId());
        } catch (Exception ex) {
            LOG.error("Failed to store in Firestore", ex);
        }
    }

    public static class NotificationEntity {
        public String type;
        public String payload;
        public long timestamp;
        // Default constructor required by Firestore SDK
        public NotificationEntity() {}
        public NotificationEntity(String type, String payload, long timestamp) {
            this.type = type;
            this.payload = payload;
            this.timestamp = timestamp;
        }
    }
}