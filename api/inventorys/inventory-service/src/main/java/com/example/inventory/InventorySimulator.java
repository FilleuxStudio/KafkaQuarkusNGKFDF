package com.example.inventory;

import io.vertx.core.json.JsonObject;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;




@Path("/simulate-order")
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
public class InventorySimulator {

    @Inject
    InventoryService inventoryService;

    @Inject
    FirebaseConfig firebaseConfig;

    @POST
    public Response simulateOrder(JsonObject order) {
        inventoryService.handleOrder(order);
        return Response.ok().build();
    }
}
