package com.cclfilleux.notification;

import jakarta.annotation.PostConstruct;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.ws.rs.WebApplicationException;
import jakarta.ws.rs.core.Response;
import nl.martijndwars.webpush.Notification;
import nl.martijndwars.webpush.PushService;
import nl.martijndwars.webpush.Subscription;
import org.bouncycastle.jce.provider.BouncyCastleProvider;
import org.bouncycastle.jce.ECNamedCurveTable;
import org.bouncycastle.jce.spec.ECNamedCurveParameterSpec;
import org.bouncycastle.jce.spec.ECPublicKeySpec;
import org.bouncycastle.math.ec.ECCurve;
import org.bouncycastle.math.ec.ECPoint;
import com.google.gson.Gson;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.jboss.logging.Logger;

import java.security.*;
import java.security.spec.*;
import java.util.Base64;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@ApplicationScoped
public class WebPushService {

    private static final Logger LOG = Logger.getLogger(WebPushService.class);

    static {
        Security.addProvider(new BouncyCastleProvider());
    }

    @ConfigProperty(name = "vapid.public.key")
    String publicKey;
    
    @ConfigProperty(name = "vapid.private.key")
    String privateKey;

    private final Map<String, String> subscriptions = new ConcurrentHashMap<>();
    private final Gson gson = new Gson();
    private PushService pushService;

    @PostConstruct
    void init() {
        try {
            this.pushService = new PushService(publicKey, privateKey);
            LOG.info("PushService initialisé avec succès.");
        } catch (GeneralSecurityException e) {
            LOG.error("Erreur d'initialisation de PushService", e);
            throw new RuntimeException("Erreur d'initialisation de PushService", e);
        }
    }

    public void registerSubscription(String userId, String subscriptionJson) {
        subscriptions.put(userId, subscriptionJson);
        LOG.info("Nouvelle inscription de l'utilisateur : " + userId);
    }

    public void sendWebPush(String userId, String message) {
        String subscriptionJson = subscriptions.get(userId);
        if (subscriptionJson == null) {
            LOG.warn("Tentative d'envoi à un utilisateur non abonné : " + userId);
            throw new WebApplicationException("Utilisateur non abonné", Response.Status.NOT_FOUND);
        }

        try {
            Subscription subscription = gson.fromJson(subscriptionJson, Subscription.class);
            String payload = gson.toJson(Map.of("title", "Nouvelle notification", "body", message));

            PublicKey userPublicKey = generatePublicKey(subscription.keys.p256dh);

            Notification notification = new Notification(
                subscription.endpoint,
                userPublicKey,
                Base64.getUrlDecoder().decode(subscription.keys.auth),
                payload.getBytes()
            );

            pushService.send(notification);
            LOG.info("Notification envoyée à " + userId);
        } catch (Exception e) {
            LOG.error("Erreur lors de l'envoi de la notification à " + userId, e);
            throw new WebApplicationException("Erreur d'envoi de notification: " + e.getMessage(), Response.Status.INTERNAL_SERVER_ERROR);
        }
    }

    public Map<String, String> getAllSubscriptions() {
        return subscriptions;
    }

    public boolean removeSubscription(String userId) {
        boolean removed = subscriptions.remove(userId) != null;
        if (removed) {
            LOG.info("Utilisateur désinscrit des notifications : " + userId);
        } else {
            LOG.warn("Tentative de désinscription d'un utilisateur non trouvé : " + userId);
        }
        return removed;
    }

    private PublicKey generatePublicKey(String base64Key) throws GeneralSecurityException {
        byte[] decodedKey = Base64.getUrlDecoder().decode(base64Key);
        KeyFactory keyFactory = KeyFactory.getInstance("EC");

        ECNamedCurveParameterSpec spec = ECNamedCurveTable.getParameterSpec("secp256r1");
        ECCurve curve = spec.getCurve();
        ECPoint point = curve.decodePoint(decodedKey);
        ECPublicKeySpec publicKeySpec = new ECPublicKeySpec(point, spec);

        return keyFactory.generatePublic(publicKeySpec);
    }
}
