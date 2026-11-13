import { useEffect, useState } from 'react';
import {
  AlertCircle,
  CheckCircle,
  FileText,
  Loader2,
  MessageSquare,
  RefreshCw,
  Users,
  XCircle,
} from 'lucide-react';
import {
  aprobarUsuario,
  getCredencialUrl,
  getUsuariosPendientes,
  rechazarUsuario,
  type UsuarioPendiente,
} from '../api/usuarios.api';

interface PanelUsuariosProps {
  embedded?: boolean;
  onPendingCountChange?: (count: number) => void;
}

export const PanelUsuarios = ({
  embedded = false,
  onPendingCountChange,
}: PanelUsuariosProps) => {
  const [usuarios, setUsuarios] = useState<UsuarioPendiente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState('');
  const [isWarning, setIsWarning] = useState(false);
  const [processingId, setProcessingId] = useState<number | null>(null);

  const cargarUsuarios = async () => {
    setLoading(true);
    setError('');
    try {
      setUsuarios(await getUsuariosPendientes());
    } catch (requestError: unknown) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Error al cargar las solicitudes pendientes',
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void cargarUsuarios();
  }, []);

  useEffect(() => {
    onPendingCountChange?.(usuarios.length);
  }, [onPendingCountChange, usuarios.length]);

  const handleAprobar = async (id: number) => {
    setProcessingId(id);
    setError('');
    setFeedback('');
    try {
      const result = await aprobarUsuario(id);
      setUsuarios((current) => current.filter((usuario) => usuario.id !== id));
      setIsWarning(Boolean(result.warning));
      setFeedback(result.warning ?? 'Usuario aprobado y correo enviado.');
    } catch (requestError: unknown) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Error al aprobar usuario',
      );
    } finally {
      setProcessingId(null);
    }
  };

  const handleRechazar = async (id: number) => {
    if (
      !window.confirm(
        '¿Está seguro de rechazar y eliminar esta solicitud de registro?',
      )
    ) {
      return;
    }

    setProcessingId(id);
    setError('');
    setFeedback('');
    try {
      const result = await rechazarUsuario(id);
      setUsuarios((current) => current.filter((usuario) => usuario.id !== id));
      setIsWarning(Boolean(result.warning));
      setFeedback(result.warning ?? 'Solicitud rechazada.');
    } catch (requestError: unknown) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Error al rechazar solicitud',
      );
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <section className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
        {!embedded && (
          <div>
          <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-[#087d70]">
            <span className="flex h-4 w-4 items-center justify-center rounded-sm bg-[#e1f3eb]">
              <Users size={10} />
            </span>
            Control de acceso
          </p>
          <h2 className="font-editorial mt-2 text-3xl tracking-tight text-[#173d3b]">
            Solicitudes de registro
          </h2>
          <p className="mt-1 text-sm text-[#52766d]">
            Revisa la documentación y aprueba las cuentas de nuevos autores.
          </p>
          </div>
        )}
        <button
          type="button"
          onClick={() => void cargarUsuarios()}
          disabled={loading || processingId !== null}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-[#cfe4dc] bg-white px-4 text-xs font-semibold text-[#087d70] transition hover:bg-[#e1f3eb] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw size={15} />
          Actualizar
        </button>
      </section>

      {feedback && (
        <div
          role="status"
          className={`rounded-xl border p-4 text-sm ${
            isWarning
              ? 'border-amber-200 bg-amber-50 text-amber-800'
              : 'border-emerald-200 bg-emerald-50 text-emerald-800'
          }`}
        >
          {feedback}
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="flex items-center justify-between gap-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          <span>{error}</span>
          <button
            type="button"
            onClick={() => void cargarUsuarios()}
            className="shrink-0 font-semibold underline"
          >
            Reintentar
          </button>
        </div>
      )}

      <section className="overflow-hidden rounded-2xl border border-[#d5e6df] bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-[#d5e6df] bg-[#f8fbf9] px-6 py-4">
          <h3 className="text-sm font-bold uppercase tracking-wide text-[#173d3b]">
            Cuentas pendientes
          </h3>
          <span className="rounded-md bg-[#e1f3eb] px-2.5 py-1 text-xs font-bold text-[#087d70]">
            {usuarios.length}
          </span>
        </div>

        <div className="divide-y divide-[#edf3f0]">
          {loading ? (
            <div
              className="flex justify-center py-20 text-[#087d70]"
              role="status"
              aria-label="Cargando solicitudes"
            >
              <Loader2 className="animate-spin" size={28} />
            </div>
          ) : usuarios.length === 0 && !error ? (
            <div className="flex flex-col items-center justify-center py-20 text-[#52766d]">
              <CheckCircle className="mb-3 text-[#b3e8d3]" size={40} />
              <p className="text-sm font-medium">
                No hay solicitudes pendientes por revisar.
              </p>
            </div>
          ) : (
            usuarios.map((usuario) => (
              <article
                key={usuario.id}
                className="p-6 transition hover:bg-[#fafdfb]"
              >
                <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
                  <div className="min-w-0 flex-1">
                    <h4 className="text-base font-bold text-[#173d3b]">
                      {usuario.nombre} {usuario.apellido}
                    </h4>
                    <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs font-medium text-[#52766d]">
                      <span>DNI: {usuario.dni}</span>
                      <span aria-hidden="true">·</span>
                      <span>{usuario.email}</span>
                      <span aria-hidden="true">·</span>
                      <span>
                        Registrado el:{' '}
                        {new Date(usuario.createdAt).toLocaleDateString('es-AR')}
                      </span>
                    </div>
                    {usuario.comentarios && (
                      <div className="mt-3 flex items-start gap-2 rounded-lg bg-[#f0f6f3] p-3 text-xs text-[#244f47]">
                        <MessageSquare
                          className="mt-0.5 shrink-0 text-[#64877c]"
                          size={14}
                        />
                        <p className="leading-relaxed">{usuario.comentarios}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex shrink-0 flex-col items-stretch gap-3 sm:flex-row sm:items-center">
                    {usuario.credencialUrl ? (
                      <a
                        href={getCredencialUrl(usuario.id)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex h-10 items-center justify-center gap-2 rounded-xl border border-[#cfe4dc] bg-white px-4 text-xs font-semibold text-[#087d70] transition hover:bg-[#e1f3eb]"
                      >
                        <FileText size={16} />
                        Ver documento
                      </a>
                    ) : (
                      <span className="flex items-center justify-center gap-1.5 px-2 text-xs text-[#7b958c]">
                        <AlertCircle size={14} />
                        Sin documento
                      </span>
                    )}

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => void handleRechazar(usuario.id)}
                        disabled={processingId !== null}
                        className="flex h-10 items-center justify-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-4 text-xs font-semibold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {processingId === usuario.id ? (
                          <Loader2 className="animate-spin" size={16} />
                        ) : (
                          <XCircle size={16} />
                        )}
                        Rechazar
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleAprobar(usuario.id)}
                        disabled={processingId !== null}
                        className="flex h-10 items-center justify-center gap-1.5 rounded-xl bg-[#087366] px-4 text-xs font-semibold text-white shadow-sm transition hover:bg-[#07584f] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {processingId === usuario.id ? (
                          <Loader2 className="animate-spin" size={16} />
                        ) : (
                          <CheckCircle size={16} />
                        )}
                        Aprobar
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  );
};

export default PanelUsuarios;
