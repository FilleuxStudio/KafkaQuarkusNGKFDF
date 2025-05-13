package com.example.inventory;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import jakarta.annotation.PostConstruct;
import jakarta.inject.Singleton;
import java.io.File;
import java.io.FileInputStream;
import java.io.InputStream;

@Singleton
public class FirebaseConfig {

    private static final String[] POSSIBLE_PATHS = {
        "src/main/resources/kafka-ccm-dev-cloud-df-kf-ng-48d9e2125a11.json",
        "/deployments/resources/kafka-ccm-dev-cloud-df-kf-ng-48d9e2125a11.json",
        "kafka-ccm-dev-cloud-df-kf-ng-48d9e2125a11.json"
    };

    @PostConstruct
    void init() {
        System.out.println("✅ Firebase init lancé !");
        
        try {
            InputStream serviceAccount = findServiceAccountFile();
            if (serviceAccount != null) {
                FirebaseOptions options = FirebaseOptions.builder()
                        .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                        .build();

                FirebaseApp.initializeApp(options);
                System.out.println("✅ Firebase initialisé avec succès !");
            } else {
                System.out.println("⚠️ Fichier de configuration Firebase non trouvé, fonctionnalité désactivée");
            }
        } catch (Exception e) {
            System.out.println("❌ Erreur lors de l'initialisation de Firebase: " + e.getMessage());
            e.printStackTrace();
            // Ne pas bloquer l'application si Firebase n'est pas disponible
        }
    }
    
    private InputStream findServiceAccountFile() {
        // D'abord essayer à partir des ressources de classe
        InputStream fromClasspath = getClass().getResourceAsStream("/kafka-ccm-dev-cloud-df-kf-ng-48d9e2125a11.json");
        if (fromClasspath != null) {
            System.out.println("✅ Fichier de configuration Firebase trouvé dans les ressources de classe");
            return fromClasspath;
        }
        
        // Ensuite essayer les autres chemins
        for (String path : POSSIBLE_PATHS) {
            File file = new File(path);
            if (file.exists() && file.isFile()) {
                try {
                    System.out.println("✅ Fichier de configuration Firebase trouvé à: " + path);
                    return new FileInputStream(file);
                } catch (Exception e) {
                    System.out.println("❌ Erreur lors de l'accès au fichier: " + path);
                }
            }
        }
        
        return null;
    }
}
