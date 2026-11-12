import { useCallback, useEffect, useState } from 'react';
import { Bell, CheckCircle, Loader2 } from 'lucide-react';
import {
  getNotificaciones,
  markAsRead,
  type Notificacion,
} from '../api/notificaciones.api';
import { Card } from '../components/ui/Card';

export const Notificaciones = () => {
  const [notifs, setNotifs] = useState<Notificacion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchNotifs = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      setNotifs(await getNotificaciones());
    } catch (requestError: unknown) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Error al cargar las notificaciones.',
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchNotifs();
  }, [fetchNotifs]);

  const handleRead = async (notification: Notificacion) => {
    if (notification.read) return;

    try {
      await markAsRead(notification.id);
      setNotifs((current) =>
        current.map((item) =>
          item.id === notification.id ? { ...item, read: true } : item,
        ),
      );
      window.dispatchEvent(new Event('notifications-updated'));
    } catch (requestError: unknown) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Error al marcar la notificación como leída.',
      );
    }
  };

  return (
    <div className="mx-auto max-w-4xl">
      <header className="mb-6">
        <h2 className="font-editorial text-[32px] leading-tight tracking-[-.03em] text-[#173d3b]">
          Notificaciones
        </h2>
        <p className="mt-1 text-[13px] text-[#526e68]">
          Mensajes y avisos del sistema
        </p>
      </header>

      <Card>
        {isLoading ? (
          <div
            className="flex justify-center p-8"
            role="status"
            aria-label="Cargando notificaciones"
          >
            <Loader2 className="h-8 w-8 animate-spin text-[#087d70]" />
          </div>
        ) : error && notifs.length === 0 ? (
          <div
            className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700"
            role="alert"
          >
            {error}
          </div>
        ) : notifs.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-gray-400">
            <Bell className="mb-3 h-12 w-12 text-gray-300" />
            <p>No tienes notificaciones por el momento.</p>
          </div>
        ) : (
          <>
            {error && (
              <p
                className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700"
                role="alert"
              >
                {error}
              </p>
            )}
            <div className="flex flex-col">
              {notifs.map((notification) => (
                <button
                  key={notification.id}
                  type="button"
                  onClick={() => void handleRead(notification)}
                  aria-label={`${notification.read ? 'Leída' : 'Marcar como leída'}: ${notification.title}`}
                  className={`flex w-full cursor-pointer gap-4 border-b border-gray-100 p-4 text-left transition-colors hover:bg-gray-50 ${
                    notification.read ? '' : 'bg-blue-50/30'
                  }`}
                >
                  <span
                    className={`mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                      notification.read
                        ? 'bg-gray-100 text-gray-500'
                        : 'bg-blue-100 text-blue-600'
                    }`}
                  >
                    {notification.read ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <Bell className="h-4 w-4" />
                    )}
                  </span>
                  <span>
                    <span
                      className={`block text-sm ${
                        notification.read
                          ? 'font-medium text-gray-700'
                          : 'font-bold text-gray-900'
                      }`}
                    >
                      {notification.title}
                    </span>
                    <span className="mt-1 block text-sm text-gray-600">
                      {notification.message}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </>
        )}
      </Card>
    </div>
  );
};
