import { useEffect, useState, type FormEvent } from 'react';
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  Loader2,
  LockKeyhole,
  Megaphone,
  Plus,
  Save,
  X,
} from 'lucide-react';
import {
  cerrarConvocatoria,
  crearConvocatoria,
  getConvocatorias,
  type Convocatoria,
} from '../api/convocatorias.api';

const initialFormData = {
  titulo: '',
  tematica: '',
  fechaInicio: '',
  fechaFin: '',
};

const inputClassName =
  'h-11 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100';

const statusLabels: Record<Convocatoria['estado'], string> = {
  ABIERTA: 'Abierta',
  CERRADA: 'Cerrada',
  EN_EVALUACION: 'En evaluación',
  PUBLICADA: 'Publicada',
};

const statusClassNames: Record<Convocatoria['estado'], string> = {
  ABIERTA: 'bg-blue-50 text-blue-700 ring-blue-600/20',
  CERRADA: 'bg-slate-100 text-slate-600 ring-slate-500/20',
  EN_EVALUACION: 'bg-indigo-50 text-indigo-700 ring-indigo-600/20',
  PUBLICADA: 'bg-sky-50 text-sky-700 ring-sky-600/20',
};

const formatDate = (date: string): string =>
  new Intl.DateTimeFormat('es-AR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${date}T00:00:00Z`));

export const PanelConvocatorias = () => {
  const [convocatorias, setConvocatorias] = useState<Convocatoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorForm, setErrorForm] = useState('');
  const [modalCierreId, setModalCierreId] = useState<number | null>(null);
  const [passwordConfirmacion, setPasswordConfirmacion] = useState('');
  const [errorPassword, setErrorPassword] = useState('');
  const [isClosing, setIsClosing] = useState(false);
  const [formData, setFormData] = useState(initialFormData);
  const hoy = new Date().toISOString().split('T')[0];

  useEffect(() => {
    void cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setLoading(true);
    setLoadError('');
    try {
      setConvocatorias(await getConvocatorias());
    } catch (error: unknown) {
      setLoadError(
        error instanceof Error
          ? error.message
          : 'No se pudieron cargar las convocatorias.',
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorForm('');

    if (formData.fechaInicio < hoy) {
      setErrorForm('La fecha de inicio no puede ser una fecha pasada.');
      return;
    }
    if (formData.fechaFin < formData.fechaInicio) {
      setErrorForm(
        'La fecha límite no puede ser anterior a la fecha de inicio.',
      );
      return;
    }

    setIsSubmitting(true);
    try {
      await crearConvocatoria({ ...formData, estado: 'ABIERTA' });
      const nuevaConvocatoria: Convocatoria = {
        ...formData,
        id: Date.now(),
        estado: 'ABIERTA',
      };
      setConvocatorias((current) => [nuevaConvocatoria, ...current]);
      setShowForm(false);
      setFormData(initialFormData);
    } catch (error: unknown) {
      setErrorForm(
        error instanceof Error
          ? error.message
          : 'No se pudo crear la convocatoria.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const iniciarCierre = (id: number) => {
    setModalCierreId(id);
    setPasswordConfirmacion('');
    setErrorPassword('');
  };

  const cancelarCierre = () => {
    setModalCierreId(null);
    setPasswordConfirmacion('');
    setErrorPassword('');
  };

  const handleCloseConvocatoria = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    if (modalCierreId === null || !passwordConfirmacion) return;

    setIsClosing(true);
    setErrorPassword('');
    try {
      await cerrarConvocatoria(modalCierreId, passwordConfirmacion);
      setConvocatorias((current) =>
        current.map((convocatoria) =>
          convocatoria.id === modalCierreId
            ? { ...convocatoria, estado: 'CERRADA' }
            : convocatoria,
        ),
      );
      cancelarCierre();
    } catch (error: unknown) {
      setErrorPassword(
        error instanceof Error
          ? error.message
          : 'No se pudo validar la contraseña. Inténtalo nuevamente.',
      );
    } finally {
      setIsClosing(false);
    }
  };

  return (
    <div className="space-y-7 text-slate-800">
      <header className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[.16em] text-blue-700">
            <Megaphone size={15} />
            Administración editorial
          </div>
          <h1 className="font-editorial text-3xl tracking-tight text-slate-900 md:text-4xl">
            Convocatorias
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
            Gestiona las ediciones y los períodos de recepción de manuscritos.
          </p>
        </div>

        {!showForm && (
          <button
            type="button"
            onClick={() => {
              setErrorForm('');
              setShowForm(true);
            }}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-200"
          >
            <Plus size={17} />
            Nueva convocatoria
          </button>
        )}
      </header>

      {showForm ? (
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-5 sm:px-7">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Abrir nueva convocatoria
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Define el período y la temática de recepción.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setErrorForm('');
              }}
              aria-label="Cancelar y volver al listado"
              className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
            >
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="max-w-3xl space-y-5 p-5 sm:p-7">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">
                Título de la edición
              </span>
              <input
                required
                type="text"
                placeholder="Ej.: Volumen 3, Número 1"
                value={formData.titulo}
                onChange={(event) =>
                  setFormData({ ...formData, titulo: event.target.value })
                }
                className={inputClassName}
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">
                Temática principal
              </span>
              <textarea
                required
                rows={3}
                placeholder="Breve descripción de la temática de la convocatoria."
                value={formData.tematica}
                onChange={(event) =>
                  setFormData({ ...formData, tematica: event.target.value })
                }
                className="w-full rounded-xl border border-slate-300 bg-white p-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
              />
            </label>

            <div className="grid gap-5 sm:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">
                  Fecha de inicio
                </span>
                <input
                  required
                  type="date"
                  min={hoy}
                  value={formData.fechaInicio}
                  onChange={(event) => {
                    setFormData({
                      ...formData,
                      fechaInicio: event.target.value,
                    });
                    setErrorForm('');
                  }}
                  className={inputClassName}
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">
                  Fecha límite de cierre
                </span>
                <input
                  required
                  type="date"
                  min={formData.fechaInicio || hoy}
                  value={formData.fechaFin}
                  onChange={(event) => {
                    setFormData({ ...formData, fechaFin: event.target.value });
                    setErrorForm('');
                  }}
                  className={inputClassName}
                />
              </label>
            </div>

            {errorForm && (
              <div
                role="alert"
                className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700"
              >
                <AlertCircle size={17} />
                {errorForm}
              </div>
            )}

            <div className="flex flex-col-reverse justify-end gap-3 border-t border-slate-100 pt-5 sm:flex-row">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setErrorForm('');
                }}
                className="h-11 rounded-xl border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-700 px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? (
                  <Loader2 className="animate-spin" size={17} />
                ) : (
                  <Save size={17} />
                )}
                {isSubmitting ? 'Guardando…' : 'Crear convocatoria'}
              </button>
            </div>
          </form>
        </section>
      ) : (
        <>
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 sm:px-7">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">
                  Ediciones
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Convocatorias vigentes y anteriores
                </p>
              </div>
              <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                {convocatorias.length}
              </span>
            </div>

            {loading ? (
              <div
                role="status"
                className="flex items-center justify-center gap-3 py-16 text-sm text-slate-500"
              >
                <Loader2 className="animate-spin text-blue-600" size={20} />
                Cargando convocatorias…
              </div>
            ) : loadError ? (
              <div className="flex flex-col items-center gap-3 px-5 py-14 text-center">
                <AlertCircle className="text-red-500" size={24} />
                <p className="text-sm text-slate-600">{loadError}</p>
                <button
                  type="button"
                  onClick={() => void cargarDatos()}
                  className="text-sm font-semibold text-blue-700 hover:text-blue-800"
                >
                  Reintentar
                </button>
              </div>
            ) : convocatorias.length === 0 ? (
              <div className="flex flex-col items-center px-5 py-14 text-center">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-700">
                  <Megaphone size={21} />
                </div>
                <h3 className="text-sm font-semibold text-slate-900">
                  Aún no hay convocatorias
                </h3>
                <p className="mt-1 max-w-sm text-sm text-slate-500">
                  Crea una convocatoria para comenzar a recibir manuscritos.
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-slate-200">
                {convocatorias.map((convocatoria) => {
                  const id = convocatoria.id;

                  return (
                    <li
                      key={id ?? convocatoria.titulo}
                      className="flex flex-col gap-5 px-5 py-5 transition hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between sm:px-7"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="mb-2 flex flex-wrap items-center gap-2.5">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset ${statusClassNames[convocatoria.estado]}`}
                          >
                            {statusLabels[convocatoria.estado]}
                          </span>
                          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500">
                            <CalendarDays size={14} />
                            {formatDate(convocatoria.fechaInicio)} –{' '}
                            {formatDate(convocatoria.fechaFin)}
                          </span>
                        </div>
                        <h3 className="truncate text-base font-semibold text-slate-900">
                          {convocatoria.titulo}
                        </h3>
                        <p className="mt-1 line-clamp-2 text-sm leading-5 text-slate-500">
                          {convocatoria.tematica}
                        </p>
                      </div>

                      {convocatoria.estado === 'ABIERTA' &&
                        id !== undefined && (
                          <button
                            type="button"
                            onClick={() => iniciarCierre(id)}
                            className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 text-xs font-semibold text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            <LockKeyhole size={15} />
                            Cerrar convocatoria
                          </button>
                        )}
                      {convocatoria.estado === 'CERRADA' && (
                        <span className="inline-flex shrink-0 items-center gap-1.5 text-xs font-medium text-slate-500">
                          <CheckCircle2 size={15} />
                          Cerrada
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </>
      )}

      {modalCierreId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 py-6 backdrop-blur-sm">
          <section
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="modal-cierre-titulo"
            aria-describedby="modal-cierre-descripcion"
            className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
          >
            <div className="border-b border-slate-200 bg-slate-50 px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                  <LockKeyhole size={20} />
                </div>
                <div>
                  <h2
                    id="modal-cierre-titulo"
                    className="text-base font-semibold text-slate-900"
                  >
                    Confirmar cierre
                  </h2>
                  <p className="mt-0.5 text-xs text-slate-500">
                    Re-autenticación requerida
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleCloseConvocatoria} className="space-y-5 p-6">
              <p
                id="modal-cierre-descripcion"
                className="text-sm leading-6 text-slate-600"
              >
                Cerrar la convocatoria detendrá la recepción de nuevos
                manuscritos. Confirma la acción ingresando tu contraseña.
              </p>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">
                  Contraseña
                </span>
                <input
                  autoFocus
                  required
                  type="password"
                  autoComplete="current-password"
                  value={passwordConfirmacion}
                  onChange={(event) => {
                    setPasswordConfirmacion(event.target.value);
                    setErrorPassword('');
                  }}
                  className={inputClassName}
                />
              </label>

              {errorPassword && (
                <div
                  role="alert"
                  className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700"
                >
                  <AlertCircle size={17} />
                  {errorPassword}
                </div>
              )}

              <div className="flex flex-col-reverse justify-end gap-3 border-t border-slate-100 pt-4 sm:flex-row">
                <button
                  type="button"
                  disabled={isClosing}
                  onClick={cancelarCierre}
                  className="h-10 rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isClosing || !passwordConfirmacion}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isClosing ? (
                    <Loader2 className="animate-spin" size={16} />
                  ) : (
                    <LockKeyhole size={16} />
                  )}
                  {isClosing ? 'Verificando…' : 'Confirmar cierre'}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
};

export default PanelConvocatorias;
