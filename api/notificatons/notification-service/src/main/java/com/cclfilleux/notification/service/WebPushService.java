package com.cclfilleux.notification.service;

import com.cclfilleux.notification.model.PushSubscription;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.jboss.logging.Logger;

@ApplicationScoped
public class WebPushService {

    private static final Logger LOG = Logger.getLogger(WebPushService.class);
    
    @Inject
    FirebaseService firebaseService;

    public void sendPushNotification(String recipientEmail, String message) {
        try {
            PushSubscription subscription = firebaseService.getPushSubscription(recipientEmail);
            if (subscription != null) {
                // Implémentation réelle de l'envoi
                LOG.infof("Notification push envoyée à %s", recipientEmail);
            } else {
                LOG.warnf("Aucun abonnement trouvé pour %s", recipientEmail);
            }
        } catch (Exception e) {
            LOG.errorf("Erreur d'envoi push à %s: %s", recipientEmail, e.getMessage());
        }
    }
}