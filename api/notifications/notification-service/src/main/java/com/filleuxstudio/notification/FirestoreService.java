package com.filleuxstudio.notification;

import jakarta.annotation.PostConstruct;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import com.google.cloud.firestore.CollectionReference;
import com.google.cloud.firestore.DocumentReference;
import com.google.cloud.firestore.Firestore;
import com.google.api.core.ApiFuture;

import org.jboss.logging.Logger;

@ApplicationScoped
public class FirestoreService {

    private static final Logger LOG = Logger.getLogger(FirestoreService.class);

    @Inject
    Firestore firestore;

    private CollectionReference notifCollection;

    @PostConstruct
    void init() {
        notifCollection = firestore.collection("notifications");
    }

    /**
     * Stocke l'entité dans Firestore de façon synchrone et renvoie l'ID du document.
     */
    public String save(NotificationProcessor.NotificationEntity entity) {
        try {
            ApiFuture<DocumentReference> future = notifCollection.add(entity);
            String id = future.get().getId();
            LOG.infov("Stored notification ID={0}", id);
            return id;
        } catch (Exception ex) {
            LOG.error("Failed to store notification in Firestore", ex);
            throw new RuntimeException("Firestore save failed", ex);
        }
    }
}
