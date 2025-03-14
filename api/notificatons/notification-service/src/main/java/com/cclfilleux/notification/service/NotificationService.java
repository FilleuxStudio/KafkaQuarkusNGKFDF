package com.cclfilleux.notification.service;

import com.cclfilleux.notification.model.Notification;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.jboss.logging.Logger;

@ApplicationScoped
public class NotificationService {
    
    private static final Logger LOG = Logger.getLogger(NotificationService.class);
    
    @Inject
    FirebaseService firebaseService;

    @Inject
    WebPushService webPushService;

        public void processNotification(Notification notification) {
        try {
            firebaseService.saveNotification(notification);
            
            switch(notification.getType()) {
                case STOCK_ALERT:
                    webPushService.sendPushNotification(notification.getRecipient(), notification.getMessage());
                    break;
                case ORDER_CONFIRMATION:
                   
                    break;
                case SHIPMENT_UPDATE:
                   
                    webPushService.sendPushNotification(notification.getRecipient(), notification.getMessage());
                    break;
            }
        } catch (Exception e) {
            LOG.error("Erreur de traitement de notification", e);
        }
    }
}