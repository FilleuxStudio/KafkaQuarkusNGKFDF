package com.filleuxstudio.notification;

import com.google.cloud.firestore.Firestore;
import com.google.cloud.firestore.SetOptions;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@ApplicationScoped
public class NotificationRepository {

    @Inject
    Firestore firestore;

    public void saveNotification(String message) {
        Map<String, Object> data = new HashMap<>();
        data.put("message", message);
        data.put("timestamp", System.currentTimeMillis());
        data.put("read", false);

        firestore.collection("notifications")
                .document(UUID.randomUUID().toString())
                .set(data, SetOptions.merge());
    }
}