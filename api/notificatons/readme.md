Consomme les messages Kafka produits par les micro-services Order et Inventory via SmallRye Reactive Messaging

Stocke chaque message transformé en document dans Google Firestore pour conserver l’historique

Expose les notifications en Streaming SSE (Server-Sent Events) pour votre frontend React/Vite

Dépendances installées

    quarkus-messaging-kafka (SmallRye Reactive Messaging pour Kafka)
    Quarkus - Supersonic Subatomic Java

    quarkus-rest (Jakarta REST / SSE)
    Quarkus - Supersonic Subatomic Java

    quarkus-arc (Jakarta CDI)

    quarkus-google-cloud-firestore

Imports Jakarta

    Toutes vos classes utilisent jakarta.ws.rs.* et jakarta.enterprise.context.* (plus de javax.*)
    Quarkus - Supersonic Subatomic Java

Configuration application.properties

    Topics orders et inventory en entrants (mp.messaging.incoming.*)

    Serveur Kafka pointant sur vos conteneurs Bitnami (kafka1:9092, etc.)

    Firestore configuré (project-id + credentials.file)

    CORS activé et SSE exposé sur /notifications/stream

Code métier

    NotificationProcessor consomme les deux channels (@Incoming) et persiste en Firestore

    NotificationResource expose un flux SSE via @Channel + Multi.createBy().merging()

Démarrage

    Kafka cluster via docker-compose (vos trois brokers)

    Lancer en dev :

./mvnw quarkus:dev

Vérifier la consommation SSE :

    curl http://localhost:8080/notifications/stream

Test rapide

    Produire un message :

kafka-console-producer --broker-list localhost:9092 --topic orders
>{"orderId":"X1","status":"CREATED"}

Confirmer :

    Sortie SSE dans le navigateur ou curl

    Document ajouté dans la collection notifications de Firestore
