package com.filleuxstudio.notification;

import com.filleuxstudio.notification.NotificationRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.websocket.OnOpen;
import jakarta.websocket.OnClose;
import jakarta.websocket.Session;
import jakarta.websocket.server.ServerEndpoint;
import org.eclipse.microprofile.reactive.messaging.Incoming;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@ServerEndpoint("/notifications")
@ApplicationScoped
public class NotificationService {

    @Inject
    NotificationRepository repository;

    private final Map<String, Session> sessions = new ConcurrentHashMap<>();

    @Incoming("orders")
    public void processOrder(String message) {
        repository.saveNotification("Order: " + message);
        notifyClients("New order: " + message);
    }

    @Incoming("inventory")
    public void processInventory(String message) {
        repository.saveNotification("Inventory: " + message);
        notifyClients("Inventory update: " + message);
    }

    private void notifyClients(String message) {
        sessions.values().forEach(s -> {
            if (s.isOpen()) {
                s.getAsyncRemote().sendText(message);
            }
        });
    }

    @OnOpen
    public void onOpen(Session session) {
        sessions.put(session.getId(), session);
    }

    @OnClose
    public void onClose(Session session) {
        sessions.remove(session.getId());
    }
}