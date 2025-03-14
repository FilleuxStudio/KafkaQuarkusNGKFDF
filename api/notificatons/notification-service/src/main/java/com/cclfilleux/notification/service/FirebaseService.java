package com.cclfilleux.notification.service;

import com.cclfilleux.notification.model.Notification;
import com.cclfilleux.notification.model.PushSubscription;
import com.google.api.core.ApiFuture;
import com.google.auth.oauth2.GoogleCredentials;
import com.google.cloud.firestore.DocumentReference;
import com.google.cloud.firestore.DocumentSnapshot;
import com.google.cloud.firestore.Firestore;
import com.google.cloud.firestore.QuerySnapshot;
import com.google.cloud.firestore.WriteResult;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.cloud.FirestoreClient;
import jakarta.annotation.PostConstruct;
import jakarta.enterprise.context.ApplicationScoped;
import java.io.IOException;
import java.io.InputStream;
import java.util.List;
import java.util.concurrent.ExecutionException;
import java.util.stream.Collectors;

@ApplicationScoped
public class FirebaseService {

    private Firestore db;

    @PostConstruct
    void init() throws IOException {
        InputStream serviceAccount = getClass().getClassLoader()
                .getResourceAsStream("firebase-config.json");

        FirebaseOptions options = FirebaseOptions.builder()
                .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                .build();

        if (FirebaseApp.getApps().isEmpty()) {
            FirebaseApp.initializeApp(options);
        }

        db = FirestoreClient.getFirestore();
    }

    public void saveNotification(Notification notification) {
        try {
            if (notification.getId() == null) {
                DocumentReference docRef = db.collection("notifications").document();
                notification.setId(docRef.getId());
            }

            ApiFuture<WriteResult> result = db.collection("notifications")
                    .document(notification.getId())
                    .set(notification);

            result.get(); // Attendre la complétion
        } catch (InterruptedException | ExecutionException e) {
            throw new RuntimeException("Erreur lors de la sauvegarde", e);
        }
    }

    public void deleteNotification(String id) {
        try {
            ApiFuture<WriteResult> result = db.collection("notifications")
                    .document(id)
                    .delete();

            result.get();
        } catch (InterruptedException | ExecutionException e) {
            throw new RuntimeException("Erreur lors de la suppression", e);
        }
    }

    public Notification getNotificationById(String id) throws ExecutionException, InterruptedException {
        DocumentReference docRef = db.collection("notifications").document(id);
        DocumentSnapshot document = docRef.get().get();

        if (document.exists()) {
            return document.toObject(Notification.class);
        }
        return null;
    }

    public List<Notification> getAllNotifications() throws ExecutionException, InterruptedException {
        ApiFuture<QuerySnapshot> query = db.collection("notifications").get();
        QuerySnapshot querySnapshot = query.get();

        return querySnapshot.getDocuments().stream()
                .map(document -> document.toObject(Notification.class))
                .collect(Collectors.toList());
    }

    public PushSubscription getPushSubscription(String email) throws ExecutionException, InterruptedException {
        DocumentReference docRef = db.collection("pushSubscriptions").document(email);
        DocumentSnapshot document = docRef.get().get();
        return document.exists() ? document.toObject(PushSubscription.class) : null;
    }

    // Pour l'accès direct si nécessaire
    public Firestore getFirestore() {
        return db;
    }
}