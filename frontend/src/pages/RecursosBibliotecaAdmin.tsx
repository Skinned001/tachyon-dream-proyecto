import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import { FileText, Loader2, Search, Trash2, Upload, ExternalLink } from 'lucide-react';
import {
  createLibraryResource,
  deleteLibraryResource,
  getLibraryResourceFileUrl,
  getLibraryResources,
  type LibraryResource,
  type LibraryResourceCategory,
} from '../api/library-resources.api';
import {
  getEspecialidades,
  type Especialidad,
} from '../api/especialidades.api';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { formatDateTime } from '../utils/formatDate';

const categories: { value: LibraryResourceCategory; label: string }[] = [
  { value: 'MANUAL', label: 'Manual' },
  { value: 'PROTOCOLO', label: 'Protocolo' },
  { value: 'GUIA', label: 'Guía clínica' },
  { value: 'NORMATIVA', label: 'Normativa' },
  { value: 'OTRO', label: 'Otro' },
];

const MAX_FILE_SIZE = 20 * 1024 * 1024;
const fieldClassName =
  'w-full rounded-xl border border-[#cfe0d9] bg-white px-3.5 py-3 text-sm text-[#173d3b] outline-none transition focus:border-[#087d70] focus:ring-4 focus:ring-[#087d70]/10';

const getErrorMessage = (error: unknown, fallback: string): string =>
  error instanceof Error ? error.message : fallback;

export function RecursosBibliotecaAdmin() {
  const [resources, setResources] = useState<LibraryResource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<number | null>(null);
  const [listError, setListError] = useState('');
  const [formError, setFormError] = useState('');
  const [feedback, setFeedback] = useState('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<LibraryResourceCategory>('MANUAL');
  const [specialtyId, setSpecialtyId] = useState('');
  const [especialidades, setEspecialidades] = useState<Especialidad[]>([]);
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadResources = useCallback(async () => {
    setIsLoading(true);
    setListError('');
    try {
      setResources(await getLibraryResources());
    } catch (error: unknown) {
      setListError(
        getErrorMessage(error, 'No se pudieron cargar los documentos.'),
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadResources();
    void getEspecialidades()
      .then(setEspecialidades)
      .catch(() => setEspecialidades([]));
  }, [loadResources]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError('');
    setFeedback('');

    if (!title.trim()) {
      setFormError('El título es obligatorio.');
      return;
    }
    if (!file) {
      setFormError('Seleccioná un archivo PDF para subir.');
      return;
    }
    if (file.type !== 'application/pdf') {
      setFormError('El archivo debe ser un PDF válido.');
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setFormError('El PDF no puede superar los 20 MB.');
      return;
    }

    setIsSubmitting(true);
    try {
      await createLibraryResource({
        title: title.trim(),
        category,
        specialtyId: specialtyId ? Number(specialtyId) : null,
        description: description.trim(),
        file,
      });
      setTitle('');
      setCategory('MANUAL');
      setSpecialtyId('');
      setDescription('');
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      setFeedback('Documento cargado correctamente.');
      await loadResources();
    } catch (error: unknown) {
      setFormError(
        getErrorMessage(error, 'No se pudo cargar el documento.'),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (resource: LibraryResource) => {
    setConfirmingDeleteId(null);
    setDeletingId(resource.id);
    setFeedback('');
    setListError('');
    try {
      await deleteLibraryResource(resource.id);
      setFeedback('Documento eliminado correctamente.');
      await loadResources();
    } catch (error: unknown) {
      setListError(
        getErrorMessage(error, 'No se pudo eliminar el documento.'),
      );
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="mx-auto max-w-6xl">
      <header className="mb-7">
        <p className="text-[10px] font-semibold uppercase tracking-[.16em] text-[#52766d]">
          Gestión institucional
        </p>
        <h2 className="mt-1 font-editorial text-[30px] leading-tight tracking-[-.03em] text-[#173d3b]">
          Documentos Institucionales
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#526e68]">
          Cargá manuales, protocolos, guías clínicas y normativas para su
          consulta pública.
        </p>
      </header>

      <Card title="Cargar un documento">
        <form className="space-y-5" onSubmit={(event) => void handleSubmit(event)}>
          <div className="grid gap-5 md:grid-cols-3">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-[#244f47]">
                Título <span className="text-red-600">*</span>
              </span>
              <input
                className={fieldClassName}
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                maxLength={255}
                required
                placeholder="Ej. Protocolo de procedimientos"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-[#244f47]">
                Categoría <span className="text-red-600">*</span>
              </span>
              <select
                className={fieldClassName}
                value={category}
                onChange={(event) =>
                  setCategory(event.target.value as LibraryResourceCategory)
                }
              >
                {categories.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-[#244f47]">
                Especialidad <span className="font-normal text-[#78918a]">(opcional)</span>
              </span>
              <select
                className={fieldClassName}
                value={specialtyId}
                onChange={(event) => setSpecialtyId(event.target.value)}
              >
                <option value="">General / Transversal</option>
                {especialidades.map((especialidad) => (
                  <option key={especialidad.id} value={especialidad.id}>
                    {especialidad.name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-[#244f47]">
              Descripción <span className="font-normal text-[#78918a]">(opcional)</span>
            </span>
            <textarea
              className={`${fieldClassName} min-h-24 resize-y`}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              maxLength={5000}
              placeholder="Breve descripción del documento"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-[#244f47]">
              Archivo PDF <span className="text-red-600">*</span>
            </span>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              required
              onChange={(event) => setFile(event.currentTarget.files?.[0] ?? null)}
              className="block w-full cursor-pointer rounded-xl border border-dashed border-[#a9cbbd] bg-[#f7fbf9] px-4 py-3 text-sm text-[#385f56] file:mr-3 file:rounded-lg file:border-0 file:bg-[#dff2e9] file:px-3 file:py-2 file:text-xs file:font-semibold file:text-[#07584f] hover:border-[#087d70]"
            />
            <span className="mt-2 block text-xs text-[#78918a]">
              PDF, máximo 20 MB.
              {file ? ` Archivo seleccionado: ${file.name}` : ''}
            </span>
          </label>

          {formError && (
            <p
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {formError}
            </p>
          )}
          {feedback && (
            <p
              role="status"
              className="rounded-xl border border-[#b9e2d2] bg-[#eff9f4] px-4 py-3 text-sm text-[#087d70]"
            >
              {feedback}
            </p>
          )}

          <div className="flex justify-end">
            <Button
              type="submit"
              isLoading={isSubmitting}
              className="gap-2 rounded-xl bg-[#087d70] text-sm hover:bg-[#06695e] focus:ring-[#087d70]"
            >
              <Upload size={16} />
              Subir documento
            </Button>
          </div>
        </form>
      </Card>

      <section className="mt-8">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-[#173d3b]">
              Documentos cargados
            </h3>
            <p className="mt-1 text-xs text-[#668079]">
              {resources.length} {resources.length === 1 ? 'documento' : 'documentos'}
            </p>
          </div>
          <Button
            type="button"
            variant="secondary"
            onClick={() => void loadResources()}
            disabled={isLoading}
            className="gap-2 rounded-xl border-[#cfe4dc] text-xs text-[#385f56]"
          >
            <Search size={14} />
            Actualizar listado
          </Button>
        </div>

        {listError && (
          <p
            role="alert"
            className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {listError}
          </p>
        )}

        {isLoading ? (
          <div
            className="flex justify-center rounded-2xl border border-[#d5e6df] bg-white p-10"
            role="status"
            aria-label="Cargando documentos"
          >
            <Loader2 className="h-7 w-7 animate-spin text-[#087d70]" />
          </div>
        ) : resources.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#c7ddd3] bg-[#f8fcfa] px-5 py-12 text-center">
            <FileText className="mx-auto mb-3 h-8 w-8 text-[#8eaaa0]" />
            <p className="text-sm font-medium text-[#385f56]">
              Todavía no hay documentos institucionales cargados.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-[#d5e6df] bg-white shadow-sm">
            <div className="divide-y divide-[#e7f0ec]">
              {resources.map((resource) => (
                <article
                  key={resource.id}
                  className="flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex min-w-0 items-start gap-3">
                    <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#e7f4ee] text-[#087d70]">
                      <FileText size={18} />
                    </span>
                    <div className="min-w-0">
                      <h4 className="truncate text-sm font-semibold text-[#173d3b]">
                        {resource.title}
                      </h4>
                      <div className="mt-1.5 flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-[#e8f4ee] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[#176451]">
                          {resource.category}
                        </span>
                        {resource.specialty && (
                          <span className="rounded-full border border-[#cfe4dc] bg-[#f7fbf9] px-2.5 py-1 text-[10px] font-semibold text-[#244f47]">
                            {resource.specialty.name}
                          </span>
                        )}
                        <span className="text-xs text-[#78918a]">
                          Cargado el {formatDateTime(resource.createdAt)}
                        </span>
                      </div>
                      {resource.description && (
                        <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-[#668079]">
                          {resource.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-2 pl-[52px] sm:pl-0">
                    <a
                      href={getLibraryResourceFileUrl(resource.fileUrl)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-xl border border-[#b9d8ca] px-3 py-2 text-xs font-semibold text-[#087d70] transition-colors hover:bg-[#eff9f4]"
                    >
                      Ver PDF
                      <ExternalLink size={14} />
                    </a>
                    {confirmingDeleteId === resource.id ? (
                      <div className="flex items-center gap-1.5">
                        <Button
                          type="button"
                          variant="danger"
                          disabled={deletingId !== null}
                          isLoading={deletingId === resource.id}
                          onClick={() => void handleDelete(resource)}
                          className="gap-1.5 rounded-xl px-3 py-2 text-xs"
                        >
                          <Trash2 size={14} />
                          Confirmar
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          disabled={deletingId !== null}
                          onClick={() => setConfirmingDeleteId(null)}
                          className="rounded-xl px-2.5 py-2 text-xs text-[#526e68]"
                        >
                          Cancelar
                        </Button>
                      </div>
                    ) : (
                      <Button
                        type="button"
                        variant="danger"
                        disabled={deletingId !== null}
                        isLoading={deletingId === resource.id}
                        onClick={() => setConfirmingDeleteId(resource.id)}
                        className="gap-1.5 rounded-xl px-3 py-2 text-xs"
                      >
                        <Trash2 size={14} />
                        Eliminar
                      </Button>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
