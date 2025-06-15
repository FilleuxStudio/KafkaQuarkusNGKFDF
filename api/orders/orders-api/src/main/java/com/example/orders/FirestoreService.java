package com.example.orders;

import com.google.cloud.firestore.Firestore;
import com.google.cloud.firestore.CollectionReference;
import com.google.cloud.firestore.DocumentReference;
import com.google.cloud.firestore.DocumentSnapshot;
import com.google.cloud.firestore.QuerySnapshot;
import com.google.cloud.firestore.WriteResult;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import java.util.concurrent.ExecutionException;
import java.util.List;
import java.util.ArrayList;

@ApplicationScoped
public class FirestoreService {

    @Inject
    Firestore firestore;

    private static final String COLLECTION_NAME = "orders";

    public Order createOrder(Order order) throws InterruptedException, ExecutionException {

        // Calculate the total price
        order.setTotalPrice(order.getPrice() * order.getQuantity());

        // Create a new document with an auto-generated ID
        DocumentReference docRef = firestore.collection(COLLECTION_NAME).document();
        // Set the generated ID into our order
        order.setId(docRef.getId());
        // Save the order to Firestore
        WriteResult result = docRef.set(order).get();
        // Optionally, log the update time: result.getUpdateTime()
        return order;
    }

    public List<Order> listOrders() throws InterruptedException, ExecutionException {
        CollectionReference ordersCollection = firestore.collection(COLLECTION_NAME);
        QuerySnapshot querySnapshot = ordersCollection.get().get();
        List<Order> orders = new ArrayList<>();
        for (DocumentSnapshot doc : querySnapshot.getDocuments()) {
            Order order = doc.toObject(Order.class);
            orders.add(order);
        }
        return orders;
    }
}
