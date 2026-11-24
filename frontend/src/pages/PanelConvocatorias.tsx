import { useCallback, useEffect, useState, type FormEvent } from 'react';
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  Megaphone,
  Pencil,
  Plus,
  Save,
  X,
} from 'lucide-react';
import {
  crearConvocatoria,
  getConvocatoriasGestion,
  type Convocatoria,
  type EstadoConvocatoria,
} from '../api/convocatorias.api';
import { CustomDatePicker } from '../components/ui/DatePicker';
import { ModalEdicionConvocatoria } from '../features/editorial/ModalEdicionConvocatoria';
import {
  parseLocalDateTimeValue,
  toLocalDateTimeValue,
} from '../utils/formatDate';

interface CreateFormData {
  title: string;
  fechaInicio: string;
  fechaFin: string;
  estado: 'BORRADOR' | 'PROGRAMADA';
  visibleEnLanding: boolean;
}

const initialFormData: CreateFormData = {
  title: '',
  fechaInicio: '',
  fechaFin: '',
  estado: 'PROGRAMADA',
  visibleEnLanding: false,
};

const inputClassName =
  'h-11 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#087d70] focus:ring-4 focus:ring-[#087d70]/10';

const statusLabels: Record<EstadoConvocatoria, string> = {
  BORRADOR: 'Borrador',
  PROGRAMADA: 'Programada',
  ABIERTA: 'Abierta',
  CERRADA: 'Cerrada',
};

const statusClassNames: Record<EstadoConvocatoria, string> = {
  BORRADOR: 'bg-slate-100 text-slate-700 ring-slate-600/20',
  PROGRAMADA: 'bg-amber-50 text-amber-800 ring-amber-600/20',
  ABIERTA: 'bg-emerald-50 text-emerald-800 ring-emerald-600/20',
  CERRADA: 'bg-rose-50 text-rose-800 ring-rose-600/20',
};

const formatDateTime = (value: string): string => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Fecha inválida';
  return new Intl.DateTimeFormat('es-AR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
};

const toIsoDateTime = (value: string): string => new Date(value).toISOString();

const getLocalDateTimeNow = (): string => {
  return toLocalDateTimeValue(new Date());
};

export const PanelConvocatorias = () => {
  const [convocatorias, setConvocatorias] = useState<Convocatoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [feedback, setFeedback] = useState<{
    kind: 'success' | 'error';
    message: string;
  } | null>(null);
  const [formData, setFormData] = useState<CreateFormData>(initialFormData);
  const [selectedConvocatoria, setSelectedConvocatoria] =
    useState<Convocatoria | null>(null);
  const minDateTime = getLocalDateTimeNow();

  const cargarDatos = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      setConvocatorias(await getConvocatoriasGestion());
    } catch (error: unknown) {
      setLoadError(
        error instanceof Error
          ? error.message
          : 'No se pudieron cargar las convocatorias.',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void cargarDatos();
  }, [cargarDatos]);

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError('');

    const fechaInicio = new Date(formData.fechaInicio);
    const fechaFin = new Date(formData.fechaFin);
    const ahora = new Date();
    const fechaInicioMinima = new Date(ahora.getTime() - 2 * 60 * 1000);
    if (fechaInicio < fechaInicioMinima) {
      setFormError('La fecha y hora de inicio no puede estar en el pasado.');
      return;
    }
    if (fechaFin <= ahora) {
      setFormError('La fecha y hora de fin debe ser posterior al momento actual.');
      return;
    }
    if (
      Number.isNaN(fechaInicio.getTime()) ||
      Number.isNaN(fechaFin.getTime()) ||
      fechaFin <= fechaInicio
    ) {
      setFormError('La fecha y hora de fin debe ser posterior al inicio.');
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);
    try {
      await crearConvocatoria({
        title: formData.title.trim(),
        fechaInicio: toIsoDateTime(formData.fechaInicio),
        fechaFin: toIsoDateTime(formData.fechaFin),
        estado: formData.estado,
        visibleEnLanding: formData.visibleEnLanding,
      });
      setShowForm(false);
      setFormData(initialFormData);
      setFeedback({
        kind: 'success',
        message: 'Convocatoria creada correctamente.',
      });
      await cargarDatos();
    } catch (error: unknown) {
      setFormError(
        error instanceof Error
          ? error.message
          : 'No se pudo crear la convocatoria.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleModalSaved = (message: string) => {
    setSelectedConvocatoria(null);
    setFeedback({ kind: 'success', message });
    void cargarDatos();
  };

  return (
    <div className="space-y-7 text-slate-800">
      <header className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[.16em] text-[#087d70]">
            <Megaphone size={15} />
            Administración editorial
          </div>
          <h1 className="font-editorial text-3xl tracking-tight text-slate-900 md:text-4xl">
            Convocatorias
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
            Gestiona convocatorias, fechas de recepción y anuncios anticipados.
          </p>
        </div>
        {!showForm && (
          <button
            type="button"
            onClick={() => {
              setFormError('');
              setFeedback(null);
              setShowForm(true);
            }}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#087d70] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#06665c] focus:outline-none focus:ring-4 focus:ring-[#087d70]/20"
          >
            <Plus size={17} />
            Nueva convocatoria
          </button>
        )}
      </header>

      {feedback && (
        <div
          role={feedback.kind === 'error' ? 'alert' : 'status'}
          className={`flex items-center gap-2 rounded-xl border p-3 text-sm font-medium ${
            feedback.kind === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
              : 'border-red-200 bg-red-50 text-red-700'
          }`}
        >
          {feedback.kind === 'success' ? (
            <CheckCircle2 size={17} />
          ) : (
            <AlertCircle size={17} />
          )}
          {feedback.message}
        </div>
      )}

      {showForm && (
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-5 sm:px-7">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Nueva convocatoria
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Define su período exacto y visibilidad.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setFormData(initialFormData);
                setFormError('');
              }}
              aria-label="Cancelar y volver al listado"
              className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
            >
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleCreate} className="max-w-3xl space-y-5 p-5 sm:p-7">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">
                Título
              </span>
              <input
                required
                type="text"
                value={formData.title}
                onChange={(event) =>
                  setFormData({ ...formData, title: event.target.value })
                }
                placeholder="Ej.: Convocatoria de investigación 2026"
                className={inputClassName}
              />
            </label>

            <div className="grid gap-5 sm:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">
                  Fecha y hora de inicio
                </span>
                <CustomDatePicker
                  required
                  selected={parseLocalDateTimeValue(formData.fechaInicio)}
                  minDateTime={new Date(minDateTime)}
                  onChange={(date) =>
                    setFormData({
                      ...formData,
                      fechaInicio: date ? toLocalDateTimeValue(date) : '',
                    })
                  }
                  className={inputClassName}
                  placeholder="Seleccionar fecha y hora de inicio"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">
                  Fecha y hora de fin
                </span>
                <CustomDatePicker
                  required
                  selected={parseLocalDateTimeValue(formData.fechaFin)}
                  minDateTime={
                    new Date(
                      formData.fechaInicio > minDateTime
                        ? formData.fechaInicio
                        : minDateTime,
                    )
                  }
                  onChange={(date) =>
                    setFormData({
                      ...formData,
                      fechaFin: date ? toLocalDateTimeValue(date) : '',
                    })
                  }
                  className={inputClassName}
                  placeholder="Seleccionar fecha y hora de fin"
                />
              </label>
            </div>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">
                Estado inicial
              </span>
              <select
                value={formData.estado}
                onChange={(event) =>
                  setFormData({
                    ...formData,
                    estado: event.target.value as CreateFormData['estado'],
                  })
                }
                className={inputClassName}
              >
                <option value="PROGRAMADA">
                  Programar / abrir según la fecha de inicio
                </option>
                <option value="BORRADOR">Guardar como borrador</option>
              </select>
              <span className="mt-1 block text-xs text-slate-500">
                Las convocatorias no borrador se programan automáticamente o se
                abren según su fecha de inicio.
              </span>
            </label>

            <label className="flex items-start gap-3 rounded-xl border border-slate-200 p-3.5">
              <input
                type="checkbox"
                checked={formData.visibleEnLanding}
                onChange={(event) =>
                  setFormData({
                    ...formData,
                    visibleEnLanding: event.target.checked,
                  })
                }
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#087d70] focus:ring-[#087d70]"
              />
              <span className="text-sm text-slate-700">
                Mostrar anuncio anticipado en el portal público
              </span>
            </label>

            {formError && (
              <div
                role="alert"
                className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700"
              >
                <AlertCircle size={17} />
                {formError}
              </div>
            )}

            <div className="flex flex-col-reverse justify-end gap-3 border-t border-slate-100 pt-5 sm:flex-row">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setFormData(initialFormData);
                  setFormError('');
                }}
                className="h-11 rounded-xl border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#087d70] px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-[#06665c] disabled:cursor-not-allowed disabled:opacity-60"
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
      )}

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 sm:px-7">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              Gestión de convocatorias
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Estados, fechas y visibilidad pública
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
            <Loader2 className="animate-spin text-[#087d70]" size={20} />
            Cargando convocatorias…
          </div>
        ) : loadError ? (
          <div className="flex flex-col items-center gap-3 px-5 py-14 text-center">
            <AlertCircle className="text-red-500" size={24} />
            <p className="text-sm text-slate-600">{loadError}</p>
            <button
              type="button"
              onClick={() => void cargarDatos()}
              className="text-sm font-semibold text-[#087d70] hover:text-[#06665c]"
            >
              Reintentar
            </button>
          </div>
        ) : convocatorias.length === 0 ? (
          <div className="flex flex-col items-center px-5 py-14 text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#e8f5f1] text-[#087d70]">
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
            {convocatorias.map((convocatoria) => (
              <li
                key={convocatoria.id}
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
                      {formatDateTime(convocatoria.fechaInicio)} –{' '}
                      {formatDateTime(convocatoria.fechaFin)}
                    </span>
                  </div>
                  <h3 className="truncate text-base font-semibold text-slate-900">
                    {convocatoria.title}
                  </h3>
                  <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-slate-500">
                    {convocatoria.visibleEnLanding ? (
                      <>
                        <Eye size={14} className="text-[#087d70]" />
                        Visible en el portal
                      </>
                    ) : (
                      <>
                        <EyeOff size={14} />
                        Sin anuncio anticipado
                      </>
                    )}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setFeedback(null);
                    setSelectedConvocatoria(convocatoria);
                  }}
                  className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl border border-[#087d70]/30 bg-white px-4 text-sm font-semibold text-[#087d70] transition hover:bg-[#e8f5f1]"
                >
                  <Pencil size={15} />
                  Editar
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <ModalEdicionConvocatoria
        convocatoria={selectedConvocatoria}
        onClose={() => setSelectedConvocatoria(null)}
        onSaved={handleModalSaved}
      />
    </div>
  );
};

export default PanelConvocatorias;
