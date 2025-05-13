package com.filleuxstudio.notification;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import org.eclipse.microprofile.reactive.messaging.Incoming;
import org.eclipse.microprofile.reactive.messaging.Channel;
import org.eclipse.microprofile.reactive.messaging.Emitter;
import io.smallrye.common.annotation.Blocking;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;

import org.jboss.logging.Logger;



@ApplicationScoped
public class NotificationProcessor {
        private static final Logger LOG = Logger.getLogger(NotificationProcessor.class);

    @Inject
    FirestoreService firestoreService;

    @Inject
    ObjectMapper objectMapper;

    @Inject
    @Channel("sse-notifications")
    Emitter<String> emitter;

    @Incoming("orders-in")
    @Blocking
    public void consumeOrder(String payload) {
        process("order", payload);
    }

    @Incoming("inventory-in")
    @Blocking
    public void consumeInventory(String payload) {
        process("inventory", payload);
    }

    private void process(String type, String payload) {
        try {
            // Création de l'entité
            NotificationEntity entity = new NotificationEntity(type, payload, System.currentTimeMillis());
            // Stockage Firestore via le service
            String id = firestoreService.save(entity);

            // Création d’un JSON sûr avec Jackson
        ObjectNode json = objectMapper.createObjectNode();
        json.put("id", id);
        json.put("type", type);
        json.put("payload", payload);
        json.put("timestamp", entity.timestamp);

        emitter.send(json.toString());
        LOG.debugf("Emitted SSE: %s", json.toString());
        } catch (Exception ex) {
            LOG.error("Failed to process message", ex);
        }
    }

    public static class NotificationEntity {
        public String type;
        public String payload;
        public long timestamp;

        // Constructeur par défaut requis par Firestore
        public NotificationEntity() {}

        public NotificationEntity(String type, String payload, long timestamp) {
            this.type = type;
            this.payload = payload;
            this.timestamp = timestamp;
        }
    }
}
