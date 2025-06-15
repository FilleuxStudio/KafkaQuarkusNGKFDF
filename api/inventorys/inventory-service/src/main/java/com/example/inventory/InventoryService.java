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
import org.eclipse.microprofile.reactive.messaging.Incoming;
import org.eclipse.microprofile.reactive.messaging.Outgoing;
import org.eclipse.microprofile.reactive.messaging.Channel;
import io.smallrye.reactive.messaging.kafka.Record;
import io.quarkus.logging.Log;
import io.opentelemetry.api.trace.Span;
import io.opentelemetry.api.trace.Tracer;
import java.util.List;

@ApplicationScoped
public class InventoryService {

    @Inject
    FirebaseConfig firebaseConfig;
    
    @Inject
    InventoryMetrics metrics;
    
    @Inject
    Tracer tracer;

    @Incoming("orders-in")
    public void handleOrder(JsonObject order) {
        FirebaseConfig.ensureInitialized();
        Span span = tracer.spanBuilder("handleOrder").startSpan();
        try (var scope = span.makeCurrent()) {
            String productName = order.getString("product");
            int quantity = order.getInteger("quantity");

            span.setAttribute("product", productName);
            span.setAttribute("quantity", quantity);

            Firestore db = FirestoreClient.getFirestore();
            DocumentReference docRef = db.collection("inventory").document(productName);
            try {
                ApiFuture<DocumentSnapshot> future = docRef.get();
                DocumentSnapshot snapshot = future.get();
                if (snapshot.exists()) {
                    Long stock = snapshot.getLong("stock");
                    long newStock = stock - quantity;
                    docRef.update("stock", newStock);
                    
                    metrics.incrementOrdersProcessed();
                    metrics.incrementStockUpdates();

                    if (newStock < 5) {
                        Log.warnf("⚠️ Stock bas pour %s", productName);
                        metrics.incrementLowStockAlerts();
                    }
                } else {
                    // Création automatique du document si le produit n'existe pas
                    Log.warnf("Produit %s introuvable, création automatique dans Firestore.", productName);
                    docRef.set(new java.util.HashMap<String, Object>() {{
                        put("name", productName);
                        put("stock", quantity);
                        put("price", order.getDouble("price"));
                        put("description", "Produit ajouté automatiquement depuis une commande.");
                    }});
                    Log.infof("✅ Produit %s créé avec un stock initial de %d.", productName, quantity);
                }
            } catch (Exception e) {
                Log.error("Erreur lors de la mise à jour du stock", e);
                span.recordException(e);
                throw new RuntimeException("Erreur lors de la mise à jour du stock", e);
            }
        } finally {
            span.end();
        }
    }

}
