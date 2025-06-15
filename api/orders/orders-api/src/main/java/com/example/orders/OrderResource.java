package com.example.orders;

import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.time.Instant;
import java.util.List;
import org.eclipse.microprofile.reactive.messaging.Channel;
import org.eclipse.microprofile.reactive.messaging.Emitter;

@Path("/orders")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class OrderResource {

    @Inject
    FirestoreService firestoreService;

    // Inject a Kafka emitter on the "orders-out" channel
    @Inject
    @Channel("orders-out")
    Emitter<Order> orderEmitter;

    @POST
    public Response createOrder(Order order) {
        try {
            // Set the timestamp right before saving
            order.setTimestamp(Instant.now());
            Order createdOrder = firestoreService.createOrder(order);
            
            // Produce the order event to Kafka (as JSON)
            orderEmitter.send(createdOrder);
            
            return Response.status(Response.Status.CREATED).entity(createdOrder).build();
        } catch (Exception e) {
            e.printStackTrace();
            return Response.serverError().build();
        }
    }

    @GET
    public Response listOrders() {
        try {
            List<Order> orders = firestoreService.listOrders();
            return Response.ok(orders).build();
        } catch (Exception e) {
            e.printStackTrace();
            return Response.serverError().build();
        }
    }
}
