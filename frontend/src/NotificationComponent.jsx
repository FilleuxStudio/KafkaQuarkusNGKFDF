// NotificationComponent.jsx
import { useEffect } from 'react';
import { toast } from 'react-toastify';

export default function NotificationComponent() {
  useEffect(() => {
    // 1. Crée la connexion SSE
    const evtSource = new EventSource('http://localhost:8080/notifications/stream');
    
    // 2. À chaque message reçu, affiche un toast
    evtSource.onmessage = (e) => {
      const data = JSON.parse(e.data);
      const message = `${data.type.toUpperCase()}: ${data.payload}`;
      toast.info(message, {
        position: 'top-right',
        autoClose: 5000,
        pauseOnHover: true,
        draggable: true,
      });
    };
    
    // 3. Nettoyage à la destruction du composant
    return () => {
      evtSource.close();
    };
  }, []);

  // Ce composant n'affiche rien en lui-même
  return null;
}

