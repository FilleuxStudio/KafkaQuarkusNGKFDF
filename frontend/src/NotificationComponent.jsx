import { useEffect } from 'react';
import { toast } from 'react-toastify';

export default function NotificationComponent() {
  useEffect(() => {
    const evtSource = new EventSource('http://localhost:8080/notifications/stream');

    evtSource.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        const message = `${data.type.toUpperCase()}: ${data.payload}`;
        toast.info(message, {
          position: 'top-right',
          autoClose: 5000,
          pauseOnHover: true,
          draggable: true,
        });
      } catch (err) {
        console.error("Erreur parsing SSE:", err);
      }
    };

    return () => {
      evtSource.close();
    };
  }, []);

  return null;
}

