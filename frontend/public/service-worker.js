// Événement "install" : s'exécute lors de l'installation du service worker.
self.addEventListener('install', event => {
    console.log('Service Worker : Installé');
    // Optionnel : pré-cacher des ressources ici si nécessaire
    // Par exemple, vous pouvez utiliser caches.open() pour stocker des fichiers en cache.
    // On force l'activation immédiate du service worker :
    self.skipWaiting();
  });
  
  // Événement "activate" : s'exécute après l'installation et permet de nettoyer les anciens caches.
  self.addEventListener('activate', event => {
    console.log('Service Worker : Activé');
    // Permet de prendre le contrôle de toutes les pages clients dès l'activation.
    event.waitUntil(self.clients.claim());
  });
  
  // Événement "push" : déclenché lorsqu'une notification push est reçue.
  self.addEventListener('push', event => {
    if (!event.data) {
      console.error("Notification reçue mais sans données.");
      return;
    }
  
    // Extraire les données envoyées par le serveur
    const data = event.data.json();
    console.log("Notification reçue :", data);
  
    // Définir le titre et les options de la notification
    const title = data.title || "Nouvelle Notification";
    const options = {
      body: data.body || "Vous avez un nouveau message.",
      icon: "/vite.svg",    // Chemin vers l'icône
      badge: "/vite.svg",   // Chemin vers le badge
      vibrate: [200, 100, 200],
      data: { url: data.url || "/" }  // URL à ouvrir lors du clic
    };
  
    event.waitUntil(
      self.registration.showNotification(title, options)
    );
  });
  
  // Événement "notificationclick" : s'exécute lorsqu'un utilisateur clique sur la notification.
  self.addEventListener('notificationclick', event => {
    event.notification.close(); // Fermer la notification
    const urlToOpen = event.notification.data?.url || "/";
  
    event.waitUntil(
      // Vérifier s'il y a déjà une fenêtre ouverte avec l'URL souhaitée
      self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(clientList => {
        for (const client of clientList) {
          if (client.url === urlToOpen && "focus" in client) {
            return client.focus();
          }
        }
        // Sinon, ouvrir une nouvelle fenêtre/tab
        if (self.clients.openWindow) {
          return self.clients.openWindow(urlToOpen);
        }
      })
    );
  });
  