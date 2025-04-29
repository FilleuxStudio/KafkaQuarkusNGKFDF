package com.example.inventory;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import jakarta.annotation.PostConstruct;
import jakarta.inject.Singleton;




import java.io.InputStream;

@Singleton
public class FirebaseConfig {

    @PostConstruct
    void init() {
        System.out.println("✅ Firebase init lancé !");
        try (InputStream serviceAccount = getClass().getResourceAsStream("/firebase-service-account.json")) {
            FirebaseOptions options = FirebaseOptions.builder()
                    .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                    .build();

            FirebaseApp.initializeApp(options);
            System.out.println("✅ Firebase initialisé avec succès !");
        } catch (Exception e) {
            throw new RuntimeException("Erreur d'initialisation Firebase", e);
        }
    }
}
