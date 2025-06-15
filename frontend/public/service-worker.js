self.addEventListener("push", (event) => {
    if (!event.data) {
        console.error("Notification reçue mais sans données.");
        return;
    }

    const data = event.data.json(); // Les données envoyées par le serveur
    console.log("Notification reçue :", data);

    const title = data.title || "Nouvelle Notification";
    const options = {
        body: data.body || "Vous avez un nouveau message.",
        icon: "/vite.svg", // Icône de la notification (ajuste le chemin si nécessaire)
        badge: "/vite.svg", // Petit badge qui apparaît sur l'icône
        vibrate: [200, 100, 200], // Vibration pour attirer l'attention
        data: { url: data.url || "/" }, // URL à ouvrir au clic
    };

    event.waitUntil(
        self.registration.showNotification(title, options)
    );
});

// Gérer le clic sur la notification
self.addEventListener("notificationclick", (event) => {
    event.notification.close();
    const urlToOpen = event.notification.data?.url || "/";

    event.waitUntil(
        clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
            for (const client of clientList) {
                if (client.url === urlToOpen && "focus" in client) {
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow(urlToOpen);
            }
        })
    );
});

