package com.filleuxstudio.notification;

import java.security.spec.ECFieldFp;

import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

@Path("/")  // racine
public class StatusResource {

    @GET
    @Produces(MediaType.TEXT_HTML)
    public Response statusPage() {
        String html = """
            <!DOCTYPE html>
            <html lang="fr">
            <head>
              <meta charset="UTF-8">
              <title>Notification Service</title>
            </head>
            <body style="font-family:Arial,sans-serif;padding:2rem;background:#f5f5f5;">
              <div style="max-width:600px;margin:auto;background:#fff;padding:2rem;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.1);">
                <h1>Service de Notifications</h1>
                <p>🟢 Le service est en ligne ! 🎉</p>
                <p>Flux SSE disponible sur <a href="/notifications/stream">/notifications/stream</a></p>
              </div>
            </body>
            </html>
            """;
        return Response.ok(html).build();
    }
}