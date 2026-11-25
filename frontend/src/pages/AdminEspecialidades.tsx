import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { Edit, Loader2, Plus, Stethoscope } from 'lucide-react';
import {
  createEspecialidad,
  getEspecialidades,
  updateEspecialidad,
  type Especialidad,
} from '../api/especialidades.api';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { useForm } from '../hooks/useForm';

type EspecialidadForm = {
  name: string;
  description: string;
};

const initialForm: EspecialidadForm = { name: '', description: '' };

export const AdminEspecialidades = () => {
  const [especialidades, setEspecialidades] = useState<Especialidad[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [confirmingId, setConfirmingId] = useState<number | null>(null);
  const [pageError, setPageError] = useState('');
  const [formError, setFormError] = useState('');
  const { formulario, handleChange, resetForm, setFormulario } =
    useForm<EspecialidadForm>(initialForm);

  const fetchEspecialidades = useCallback(async () => {
    setIsLoading(true);
    setPageError('');
    try {
      setEspecialidades(await getEspecialidades(false));
    } catch (error: unknown) {
      setPageError(
        error instanceof Error
          ? error.message
          : 'Error al cargar las especialidades.',
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchEspecialidades();
  }, [fetchEspecialidades]);

  const openCreate = () => {
    resetForm();
    setEditingId(null);
    setFormError('');
    setIsModalOpen(true);
  };

  const openEdit = (especialidad: Especialidad) => {
    setFormulario({
      name: especialidad.name,
      description: especialidad.description ?? '',
    });
    setEditingId(especialidad.id);
    setFormError('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (isSaving) return;
    setIsModalOpen(false);
    setFormError('');
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError('');

    const name = formulario.name.trim();
    const description = formulario.description.trim();
    if (!name) {
      setFormError('El nombre es obligatorio.');
      return;
    }

    setIsSaving(true);
    try {
      const payload = { name, description };
      if (editingId !== null) {
        await updateEspecialidad(editingId, payload);
      } else {
        await createEspecialidad(payload);
      }
      setIsModalOpen(false);
      await fetchEspecialidades();
    } catch (error: unknown) {
      setFormError(
        error instanceof Error
          ? error.message
          : 'No se pudo guardar la especialidad.',
      );
    } finally {
      setIsSaving(false);
    }
  };

  const toggleActive = async (especialidad: Especialidad) => {
    setConfirmingId(null);
    setBusyId(especialidad.id);
    setPageError('');
    try {
      await updateEspecialidad(especialidad.id, {
        active: !especialidad.active,
      });
      await fetchEspecialidades();
    } catch (error: unknown) {
      setPageError(
        error instanceof Error
          ? error.message
          : 'No se pudo cambiar el estado de la especialidad.',
      );
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="mx-auto max-w-5xl">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[.17em] text-[#52766d]">
            Administración
          </p>
          <h2 className="font-editorial mt-2 text-[32px] tracking-[-.03em] text-[#173d3b]">
            Especialidades Médicas
          </h2>
          <p className="mt-1 text-[13px] text-[#526e68]">
            Administra el catálogo de especialidades del hospital.
          </p>
        </div>
        <Button type="button" onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          Nueva especialidad
        </Button>
      </header>

      {pageError && (
        <div
          className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          role="alert"
        >
          <span>{pageError}</span>
          <Button
            type="button"
            variant="secondary"
            onClick={() => void fetchEspecialidades()}
          >
            Reintentar
          </Button>
        </div>
      )}

      <Card>
        {isLoading ? (
          <div
            className="flex justify-center p-8"
            role="status"
            aria-label="Cargando especialidades"
          >
            <Loader2 className="h-8 w-8 animate-spin text-[#087d70]" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/50 text-sm text-gray-500">
                  <th scope="col" className="px-4 py-3 font-medium">
                    Nombre
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium">
                    Descripción
                  </th>
                  <th
                    scope="col"
                    className="whitespace-nowrap px-4 py-3 font-medium"
                  >
                    Estado
                  </th>
                  <th
                    scope="col"
                    className="whitespace-nowrap px-4 py-3 text-right font-medium"
                  >
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {especialidades.map((especialidad) => (
                  <tr
                    key={especialidad.id}
                    className="border-b border-gray-100 transition-colors hover:bg-gray-50"
                  >
                    <td className="whitespace-nowrap px-4 py-3 font-medium text-gray-800">
                      <span className="flex items-center gap-2">
                        <Stethoscope className="h-4 w-4 text-[#087d70]" />
                        {especialidad.name}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {especialidad.description?.trim() || '—'}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <span
                        className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          especialidad.active
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {especialidad.active ? 'Activa' : 'Inactiva'}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => openEdit(especialidad)}
                          disabled={busyId !== null}
                          className="gap-1 whitespace-nowrap"
                          aria-label={`Editar ${especialidad.name}`}
                        >
                          <Edit className="h-4 w-4" />
                          Editar
                        </Button>
                        {confirmingId === especialidad.id ? (
                          <div className="flex items-center gap-1.5">
                            <Button
                              type="button"
                              variant={especialidad.active ? 'danger' : 'primary'}
                              onClick={() => void toggleActive(especialidad)}
                              isLoading={busyId === especialidad.id}
                              disabled={busyId !== null}
                              className="whitespace-nowrap px-2.5 text-xs"
                            >
                              {especialidad.active ? 'Confirmar' : 'Confirmar'}
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              onClick={() => setConfirmingId(null)}
                              disabled={busyId !== null}
                              className="whitespace-nowrap px-2 text-xs text-gray-600"
                            >
                              Cancelar
                            </Button>
                          </div>
                        ) : (
                          <Button
                            type="button"
                            variant={especialidad.active ? 'ghost' : 'primary'}
                            onClick={() => setConfirmingId(especialidad.id)}
                            isLoading={busyId === especialidad.id}
                            disabled={busyId !== null}
                            className={`w-32 whitespace-nowrap px-2 text-sm ${
                              especialidad.active
                                ? 'text-red-600 hover:bg-red-50 hover:text-red-700'
                                : ''
                            }`}
                          >
                            {especialidad.active ? 'Deshabilitar' : 'Habilitar'}
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {especialidades.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-4 py-10 text-center text-sm text-gray-500"
                    >
                      No hay especialidades registradas.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingId !== null ? 'Editar especialidad' : 'Nueva especialidad'}
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Nombre"
            name="name"
            value={formulario.name}
            onChange={handleChange}
            maxLength={255}
            required
            disabled={isSaving}
          />
          <Input
            label="Descripción (opcional)"
            name="description"
            value={formulario.description}
            onChange={handleChange}
            maxLength={5000}
            disabled={isSaving}
          />
          {formError && (
            <p className="text-sm text-red-600" role="alert">
              {formError}
            </p>
          )}
          <div className="mt-2 flex justify-end gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={closeModal}
              disabled={isSaving}
            >
              Cancelar
            </Button>
            <Button type="submit" isLoading={isSaving}>
              Guardar
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
