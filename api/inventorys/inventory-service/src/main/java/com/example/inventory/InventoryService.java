package com.example.inventory;

import com.google.cloud.firestore.*;
import com.google.firebase.cloud.FirestoreClient;
import io.vertx.core.json.JsonObject;
import jakarta.enterprise.context.ApplicationScoped;
import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.Firestore;
import com.google.cloud.firestore.FirestoreOptions;
import com.google.cloud.firestore.DocumentReference;
import com.google.cloud.firestore.DocumentSnapshot;
import com.google.firebase.cloud.FirestoreClient;
import jakarta.inject.Inject;


@ApplicationScoped
public class InventoryService {

    @Inject
    FirebaseConfig firebaseConfig;

    public void handleOrder(JsonObject order) {
        String productId = order.getString("productId");
        int quantity = order.getInteger("quantity");

        Firestore db = FirestoreClient.getFirestore();
        DocumentReference docRef = db.collection("inventory").document(productId);

        ApiFuture<DocumentSnapshot> future = docRef.get();
        try {
            DocumentSnapshot snapshot = future.get();
            if (snapshot.exists()) {
                Long stock = snapshot.getLong("stock");
                long newStock = stock - quantity;
                docRef.update("stock", newStock);

                if (newStock < 5) {
                    System.out.println("⚠️ Stock bas pour " + productId);
                }

            } else {
                System.out.println("❌ Produit introuvable : " + productId);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

}
