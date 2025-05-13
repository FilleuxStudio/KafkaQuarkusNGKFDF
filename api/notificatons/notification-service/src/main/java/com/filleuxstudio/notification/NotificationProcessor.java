package com.filleuxstudio.notification;

import jakarta.annotation.PostConstruct;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.eclipse.microprofile.reactive.messaging.Incoming;
import org.eclipse.microprofile.reactive.messaging.Emitter;
import org.eclipse.microprofile.reactive.messaging.Channel;
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

    @Inject
    @Channel("sse-notifications") // canal émis en SSE
    Emitter<String> emitter;

    private CollectionReference notifCollection;

    @PostConstruct
    void init() {
        notifCollection = firestore.collection("notifications");
    }

    @Incoming("orders-in")
    public void consumeOrder(String payload) {
        process("order", payload);
    }

    @Incoming("inventory-in")
    public void consumeInventory(String payload) {
        process("inventory", payload);
    }

    private void process(String type, String payload) {
        try {
            NotificationEntity e = new NotificationEntity(type, payload, System.currentTimeMillis());
            ApiFuture<DocumentReference> future = notifCollection.add(e);
            String id = future.get().getId();
            LOG.infov("Stored notification ID={0}", id);

            // Envoie vers SSE
            String json = String.format("{\"type\": \"%s\", \"payload\": \"%s\"}", type, payload);
            emitter.send(json);

        } catch (Exception ex) {
            LOG.error("Failed to process message", ex);
        }
    }

    public static class NotificationEntity {
        public String type;
        public String payload;
        public long timestamp;

        public NotificationEntity() {}
        public NotificationEntity(String type, String payload, long timestamp) {
            this.type = type;
            this.payload = payload;
            this.timestamp = timestamp;
        }
    }
}
