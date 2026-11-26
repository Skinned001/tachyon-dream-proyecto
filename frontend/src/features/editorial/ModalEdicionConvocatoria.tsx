import { useEffect, useState, type FormEvent } from 'react';
import { AlertCircle, Loader2, LockKeyhole, Save } from 'lucide-react';
import {
  editarConvocatoria,
  finalizarConvocatoria,
  type Convocatoria,
  type EditarConvocatoriaRequest,
  type EstadoConvocatoria,
} from '../../api/convocatorias.api';
import { ConfirmPasswordInput } from '../../components/ui/ConfirmPasswordInput';
import { CustomDatePicker } from '../../components/ui/DatePicker';
import { Modal } from '../../components/ui/Modal';
import {
  parseLocalDateTimeValue,
  toLocalDateTimeValue,
} from '../../utils/formatDate';

interface ModalEdicionConvocatoriaProps {
  convocatoria: Convocatoria | null;
  onClose: () => void;
  onSaved: (message: string) => void;
}

const inputClassName =
  'h-11 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-[#087d70] focus:ring-4 focus:ring-[#087d70]/10 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500';

const getLocalDateTimeNow = (): string => {
  return toLocalDateTimeValue(new Date());
};

const toLocalDateTimeInput = (isoDate: string): string => {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return '';
  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000)
    .toISOString()
    .slice(0, 16);
};

const getErrorMessage = (error: unknown): string => {
  const message =
    error instanceof Error ? error.message : 'No se pudo completar la acción.';
  return /contraseñ|password/i.test(message)
    ? 'La contraseña actual es incorrecta.'
    : message;
};

const editableStates: EstadoConvocatoria[] = [
  'BORRADOR',
  'PROGRAMADA',
  'ABIERTA',
];

export const ModalEdicionConvocatoria = ({
  convocatoria,
  onClose,
  onSaved,
}: ModalEdicionConvocatoriaProps) => {
  const [title, setTitle] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [initialFechaInicio, setInitialFechaInicio] = useState('');
  const [initialFechaFin, setInitialFechaFin] = useState('');
  const [estado, setEstado] = useState<EstadoConvocatoria>('BORRADOR');
  const [visibleEnLanding, setVisibleEnLanding] = useState(false);
  const [password, setPassword] = useState('');
  const [finalizePassword, setFinalizePassword] = useState('');
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [confirmingFinalize, setConfirmingFinalize] = useState(false);

  useEffect(() => {
    if (!convocatoria) return;
    setTitle(convocatoria.title);
    const localFechaInicio = toLocalDateTimeInput(convocatoria.fechaInicio);
    const localFechaFin = toLocalDateTimeInput(convocatoria.fechaFin);
    setFechaInicio(localFechaInicio);
    setFechaFin(localFechaFin);
    setInitialFechaInicio(localFechaInicio);
    setInitialFechaFin(localFechaFin);
    setEstado(convocatoria.estado);
    setVisibleEnLanding(convocatoria.visibleEnLanding);
    setPassword('');
    setFinalizePassword('');
    setConfirmingFinalize(false);
    setError('');
  }, [convocatoria]);

  const isOpen = convocatoria !== null;
  const canEditLifecycle =
    convocatoria?.estado === 'BORRADOR' ||
    convocatoria?.estado === 'PROGRAMADA';
  const minDateTime = getLocalDateTimeNow();
  const minFechaInicio =
    fechaInicio === initialFechaInicio && initialFechaInicio < minDateTime
      ? initialFechaInicio
      : minDateTime;
  const minFechaFin =
    fechaFin === initialFechaFin && initialFechaFin < minDateTime
      ? initialFechaFin
      : canEditLifecycle && fechaInicio > minDateTime
        ? fechaInicio
        : minDateTime;

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!convocatoria || !password) return;
    if (!fechaFin || (canEditLifecycle && !fechaInicio)) {
      setError('Debes seleccionar la fecha y hora de inicio y de fin.');
      return;
    }

    const dateStart = canEditLifecycle ? new Date(fechaInicio) : null;
    const dateEnd = new Date(fechaFin);
    const now = new Date();
    const startChanged = canEditLifecycle && fechaInicio !== initialFechaInicio;
    const endChanged = fechaFin !== initialFechaFin;
    const startMinimum = new Date(now.getTime() - 2 * 60 * 1000);
    if (
      Number.isNaN(dateEnd.getTime()) ||
      (dateStart && Number.isNaN(dateStart.getTime())) ||
      (dateStart && dateEnd <= dateStart) ||
      (!dateStart && dateEnd <= new Date(convocatoria.fechaInicio))
    ) {
      setError('La fecha de fin debe ser posterior a la fecha de inicio.');
      return;
    }
    if (startChanged && dateStart && dateStart < startMinimum) {
      setError('La fecha y hora de inicio no puede estar en el pasado.');
      return;
    }
    if (endChanged && dateEnd <= now) {
      setError('La fecha y hora de fin debe ser posterior al momento actual.');
      return;
    }

    const request: EditarConvocatoriaRequest = {
      title: title.trim(),
      fechaFin: dateEnd.toISOString(),
      visibleEnLanding,
      password,
      ...(canEditLifecycle && dateStart
        ? {
            fechaInicio: dateStart.toISOString(),
            estado,
          }
        : {}),
    };

    setIsSaving(true);
    setError('');
    try {
      await editarConvocatoria(convocatoria.id, request);
      setPassword('');
      onSaved('Convocatoria actualizada correctamente.');
    } catch (saveError: unknown) {
      setError(getErrorMessage(saveError));
    } finally {
      setIsSaving(false);
    }
  };

  const handleFinalize = async () => {
    if (!convocatoria || !finalizePassword) return;
    setConfirmingFinalize(false);
    setIsFinalizing(true);
    setError('');
    try {
      await finalizarConvocatoria(convocatoria.id, finalizePassword);
      setFinalizePassword('');
      onSaved('Convocatoria finalizada correctamente.');
    } catch (finalizeError: unknown) {
      setError(getErrorMessage(finalizeError));
    } finally {
      setIsFinalizing(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Editar convocatoria"
      maxWidthClass="max-w-2xl"
    >
      {convocatoria && (
        <div className="space-y-6">
          <form onSubmit={handleSave} autoComplete="off" className="space-y-5">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">
                Título
              </span>
              <input
                required
                autoComplete="off"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                className={inputClassName}
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">
                  Fecha y hora de inicio
                </span>
                <CustomDatePicker
                  selected={parseLocalDateTimeValue(fechaInicio)}
                  minDateTime={new Date(minFechaInicio)}
                  onChange={(date) =>
                    setFechaInicio(date ? toLocalDateTimeValue(date) : '')
                  }
                  disabled={!canEditLifecycle}
                  placeholder="Seleccionar fecha y hora de inicio"
                />
                {!canEditLifecycle && (
                  <span className="mt-1 block text-xs text-slate-500">
                    La convocatoria ya está abierta; el inicio no se puede modificar.
                  </span>
                )}
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">
                  Fecha y hora de fin
                </span>
                <CustomDatePicker
                  required
                  selected={parseLocalDateTimeValue(fechaFin)}
                  minDateTime={new Date(minFechaFin)}
                  onChange={(date) =>
                    setFechaFin(date ? toLocalDateTimeValue(date) : '')
                  }
                  placeholder="Seleccionar fecha y hora de fin"
                />
              </label>
            </div>

            {canEditLifecycle && (
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">
                  Estado
                </span>
                <select
                  value={estado}
                  onChange={(event) =>
                    setEstado(event.target.value as EstadoConvocatoria)
                  }
                  className={inputClassName}
                >
                  {editableStates.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </label>
            )}

            <label className="flex items-start gap-3 rounded-xl border border-slate-200 p-3.5">
              <input
                type="checkbox"
                checked={visibleEnLanding}
                onChange={(event) => setVisibleEnLanding(event.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#087d70] focus:ring-[#087d70]"
              />
              <span className="text-sm text-slate-700">
                Mostrar anuncio anticipado en el portal público
              </span>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">
                Contraseña actual
              </span>
              <ConfirmPasswordInput
                required
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                  setError('');
                }}
                className={inputClassName}
              />
            </label>

            {error && (
              <div
                role="alert"
                className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
              >
                <AlertCircle className="mt-0.5 shrink-0" size={17} />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isSaving || isFinalizing || !password || !title.trim()}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#087d70] px-5 text-sm font-semibold text-white transition hover:bg-[#06665c] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? (
                <Loader2 className="animate-spin" size={17} />
              ) : (
                <Save size={17} />
              )}
              {isSaving ? 'Guardando…' : 'Guardar cambios'}
            </button>
          </form>

          {convocatoria.estado === 'ABIERTA' && (
            <section className="space-y-3 rounded-xl border border-red-200 bg-red-50/60 p-4">
              <div>
                <h3 className="text-sm font-semibold text-red-800">
                  Finalización anticipada
                </h3>
                <p className="mt-1 text-xs leading-5 text-red-700">
                  Cerrará la convocatoria inmediatamente y detendrá los envíos.
                </p>
              </div>
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">
                  Confirma con tu contraseña actual
                </span>
                <ConfirmPasswordInput
                  value={finalizePassword}
                  onChange={(event) => {
                    setFinalizePassword(event.target.value);
                    setError('');
                  }}
                  className={inputClassName}
                />
              </label>
              {confirmingFinalize ? (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => void handleFinalize()}
                    disabled={isSaving || isFinalizing || !finalizePassword}
                    className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isFinalizing ? (
                      <Loader2 className="animate-spin" size={16} />
                    ) : (
                      <LockKeyhole size={16} />
                    )}
                    {isFinalizing ? 'Finalizando…' : 'Confirmar finalización'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmingFinalize(false)}
                    disabled={isFinalizing}
                    className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                  >
                    Cancelar
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmingFinalize(true)}
                  disabled={isSaving || isFinalizing || !finalizePassword}
                  className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-red-300 bg-white px-4 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <LockKeyhole size={16} />
                  Finalizar ahora
                </button>
              )}
            </section>
          )}
        </div>
      )}
    </Modal>
  );
};
