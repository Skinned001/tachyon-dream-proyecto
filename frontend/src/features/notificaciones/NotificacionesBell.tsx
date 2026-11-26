import { Bell, CheckCheck, Loader2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  getNotificaciones,
  markAllAsRead,
  markAsRead,
  updateNotificationPreference,
  type Notificacion,
} from '../../api/notificaciones.api';
import { useAuth } from '../../context/AuthContext';
import { formatDateTime } from '../../utils/formatDate';

const getErrorMessage = (error: unknown, fallback: string): string =>
  error instanceof Error ? error.message : fallback;

export function NotificacionesBell() {
  const { user, updateUser } = useAuth();
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [noLeidasCount, setNoLeidasCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState('');
  const [recibirNotificaciones, setRecibirNotificaciones] = useState(true);
  const [isSavingPreference, setIsSavingPreference] = useState(false);
  const [isMarkingAll, setIsMarkingAll] = useState(false);
  const [preferenceMessage, setPreferenceMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const userId = user?.id;

  useEffect(() => {
    if (userId === undefined) {
      setNotificaciones([]);
      setNoLeidasCount(0);
      setIsLoading(false);
      return;
    }

    let isCurrent = true;
    const fetchNotificaciones = async () => {
      try {
        const result = await getNotificaciones();
        if (isCurrent) {
          setNotificaciones(result.notificaciones);
          setNoLeidasCount(result.noLeidasCount);
          setError('');
        }
      } catch (requestError: unknown) {
        if (isCurrent) {
          setError(
            getErrorMessage(
              requestError,
              'No se pudieron cargar las notificaciones.',
            ),
          );
        }
      } finally {
        if (isCurrent) {
          setIsLoading(false);
        }
      }
    };

    setIsLoading(true);
    void fetchNotificaciones();
    const intervalId = window.setInterval(() => {
      void fetchNotificaciones();
    }, 60_000);

    return () => {
      isCurrent = false;
      window.clearInterval(intervalId);
    };
  }, [userId]);

  useEffect(() => {
    setRecibirNotificaciones(user?.recibirNotificaciones ?? true);
  }, [user?.id, user?.recibirNotificaciones]);

  useEffect(() => {
    if (!isOpen) return;

    const closeOnOutsideClick = (event: PointerEvent) => {
      if (
        event.target instanceof Node &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };

    window.addEventListener('pointerdown', closeOnOutsideClick);
    window.addEventListener('keydown', closeOnEscape);
    return () => {
      window.removeEventListener('pointerdown', closeOnOutsideClick);
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!preferenceMessage) return;
    const timeoutId = window.setTimeout(() => setPreferenceMessage(null), 3000);
    return () => window.clearTimeout(timeoutId);
  }, [preferenceMessage]);

  if (!user) return null;

  const handleMarkAsRead = async (notification: Notificacion) => {
    if (notification.read) return;

    try {
      await markAsRead(notification.id);
      setNotificaciones((current) =>
        current.map((item) =>
          item.id === notification.id ? { ...item, read: true } : item,
        ),
      );
      setNoLeidasCount((current) => Math.max(0, current - 1));
      window.dispatchEvent(new Event('notifications-updated'));
    } catch (requestError: unknown) {
      setError(
        getErrorMessage(
          requestError,
          'No se pudo marcar la notificación como leída.',
        ),
      );
    }
  };

  const handleMarkAllAsRead = async () => {
    if (isMarkingAll) return;
    setIsMarkingAll(true);
    try {
      await markAllAsRead();
      setNotificaciones((current) =>
        current.map((notification) => ({ ...notification, read: true })),
      );
      setNoLeidasCount(0);
      setError('');
      window.dispatchEvent(new Event('notifications-updated'));
    } catch (requestError: unknown) {
      setError(
        getErrorMessage(
          requestError,
          'No se pudieron marcar todas como leídas.',
        ),
      );
    } finally {
      setIsMarkingAll(false);
    }
  };

  const handlePreferenceChange = async () => {
    if (isSavingPreference) return;

    const previousValue = recibirNotificaciones;
    const nextValue = !previousValue;
    setRecibirNotificaciones(nextValue);
    setPreferenceMessage(null);
    setIsSavingPreference(true);

    try {
      const savedValue = await updateNotificationPreference(nextValue);
      updateUser({ ...user, recibirNotificaciones: savedValue });
      setRecibirNotificaciones(savedValue);
      setPreferenceMessage({
        type: 'success',
        text: 'Preferencia actualizada.',
      });
    } catch (requestError: unknown) {
      setRecibirNotificaciones(previousValue);
      setPreferenceMessage({
        type: 'error',
        text: getErrorMessage(
          requestError,
          'No se pudo guardar la preferencia.',
        ),
      });
    } finally {
      setIsSavingPreference(false);
    }
  };

  return (
    <div ref={dropdownRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-label={
          noLeidasCount > 0
            ? `Notificaciones, ${noLeidasCount} sin leer`
            : 'Notificaciones'
        }
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        className="relative flex h-10 w-10 items-center justify-center rounded-full text-[#385f56] transition-colors hover:bg-[#e7f4ee] hover:text-[#07584f] focus:outline-none focus:ring-2 focus:ring-[#78bda5]"
      >
        <Bell size={19} strokeWidth={1.8} />
        {noLeidasCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full border-2 border-[#f8fcfa] bg-[#c43d45] px-1 text-[9px] font-bold leading-none text-white">
            {noLeidasCount > 9 ? '9+' : noLeidasCount}
          </span>
        )}
      </button>

      {isOpen && (
        <section
          role="dialog"
          aria-label="Notificaciones"
          className="absolute right-0 top-full z-[60] mt-3 flex max-h-[min(34rem,calc(100dvh-6rem))] w-[min(22rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-[#cfe4dc] bg-[#fcfefd] shadow-[0_16px_50px_rgba(23,61,59,.18)] sm:w-[360px]"
        >
          <header className="flex items-center justify-between gap-2 border-b border-[#e1eee8] px-4 py-3.5">
            <h2 className="text-sm font-bold text-[#173d3b]">Notificaciones</h2>
            <div className="flex items-center gap-2">
              {noLeidasCount > 0 && (
                <button
                  type="button"
                  onClick={() => void handleMarkAllAsRead()}
                  disabled={isMarkingAll}
                  className="flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-semibold text-[#087d70] transition-colors hover:bg-[#e7f4ee] disabled:opacity-60"
                >
                  <CheckCheck size={14} />
                  Leídas
                </button>
              )}
              <Link
                to="/notificaciones"
                onClick={() => setIsOpen(false)}
                className="rounded-lg px-2 py-1 text-[11px] font-semibold text-[#385f56] transition-colors hover:bg-[#e7f4ee] hover:text-[#07584f]"
              >
                Ver todas
              </Link>
            </div>
          </header>

          {error && (
            <p
              role="alert"
              className="mx-3 mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700"
            >
              {error}
            </p>
          )}

          <div className="min-h-24 flex-1 overflow-y-auto">
            {isLoading ? (
              <div
                className="flex justify-center p-8"
                role="status"
                aria-label="Cargando notificaciones"
              >
                <Loader2 className="h-6 w-6 animate-spin text-[#087d70]" />
              </div>
            ) : error && notificaciones.length === 0 ? null : notificaciones.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-[#668079]">
                No tenés notificaciones por el momento.
              </p>
            ) : (
              notificaciones.map((notification) => (
                <button
                  key={notification.id}
                  type="button"
                  onClick={() => void handleMarkAsRead(notification)}
                  disabled={notification.read}
                  className={`flex w-full gap-3 border-b border-[#edf3f0] px-4 py-3 text-left transition-colors ${
                    notification.read
                      ? 'bg-[#fcfefd]'
                      : 'bg-[#edf8f3] hover:bg-[#e2f3eb]'
                  }`}
                >
                  <span className="mt-1 flex w-3 shrink-0 justify-center">
                    {!notification.read && (
                      <span className="h-2 w-2 rounded-full bg-[#087d70]" />
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span
                      className={`block text-[13px] ${
                        notification.read
                          ? 'font-medium text-[#45665f]'
                          : 'font-bold text-[#173d3b]'
                      }`}
                    >
                      {notification.title}
                    </span>
                    <span className="mt-1 block text-xs leading-relaxed text-[#526e68]">
                      {notification.message}
                    </span>
                    <span className="mt-1.5 block text-[10px] text-[#78918a]">
                      {formatDateTime(notification.createdAt)}
                    </span>
                  </span>
                </button>
              ))
            )}
          </div>

          <footer className="border-t border-[#e1eee8] bg-[#f7fbf9] px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs font-medium text-[#385f56]">
                Recibir notificaciones de convocatorias
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={recibirNotificaciones}
                aria-label="Recibir notificaciones de convocatorias"
                disabled={isSavingPreference}
                onClick={() => void handlePreferenceChange()}
                className={`relative h-6 w-11 shrink-0 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#78bda5] focus:ring-offset-2 disabled:opacity-60 ${
                  recibirNotificaciones ? 'bg-[#087d70]' : 'bg-[#a8bbb4]'
                }`}
              >
                <span
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                    recibirNotificaciones ? 'translate-x-[22px]' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
            {preferenceMessage && (
              <p
                role="status"
                className={`mt-2 text-[11px] ${
                  preferenceMessage.type === 'error'
                    ? 'text-red-700'
                    : 'text-[#087d70]'
                }`}
              >
                {preferenceMessage.text}
              </p>
            )}
            {isSavingPreference && (
              <span className="sr-only">Guardando preferencia</span>
            )}
          </footer>
        </section>
      )}
    </div>
  );
}
