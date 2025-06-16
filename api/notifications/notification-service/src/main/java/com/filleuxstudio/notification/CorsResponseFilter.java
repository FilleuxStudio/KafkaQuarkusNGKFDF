package com.filleuxstudio.notification;

import jakarta.ws.rs.container.ContainerRequestContext;
import jakarta.ws.rs.container.ContainerResponseContext;
import jakarta.ws.rs.container.ContainerResponseFilter;
import jakarta.ws.rs.ext.Provider;
import java.io.IOException;
import java.util.Arrays;
import java.util.List;

@Provider
public class CorsResponseFilter implements ContainerResponseFilter {

    // Liste des origines autorisées
    private static final List<String> ALLOWED_ORIGINS = Arrays.asList(
        "http://localhost:3002",
        "http://127.0.0.1:3002",
        "http://104.155.70.59:3002"
    );

    @Override
    public void filter(ContainerRequestContext requestContext, 
                       ContainerResponseContext responseContext) throws IOException {
        
        String origin = requestContext.getHeaderString("Origin");
        
        // Vérifie si l'origine est autorisée
        if (origin != null && ALLOWED_ORIGINS.contains(origin)) {
            responseContext.getHeaders().add("Access-Control-Allow-Origin", origin);
            responseContext.getHeaders().add("Access-Control-Allow-Credentials", "true");
            
            // Headers nécessaires pour SSE
            responseContext.getHeaders().add("Access-Control-Expose-Headers", "*");
        }
        
        // Headers généraux
        responseContext.getHeaders().add("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
        responseContext.getHeaders().add("Access-Control-Allow-Headers", "Content-Type,Authorization,Accept,X-Requested-With");
        responseContext.getHeaders().add("Access-Control-Max-Age", "86400");
    }
}