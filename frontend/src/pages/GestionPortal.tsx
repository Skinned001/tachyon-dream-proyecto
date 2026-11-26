import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import {
  BookOpenCheck,
  ExternalLink,
  Eye,
  EyeOff,
  Loader2,
  Newspaper,
  Pin,
  Star,
  Trash2,
  Upload,
} from 'lucide-react';
import {
  createPortalNovedad,
  createRevistaEdicion,
  deletePortalNovedad,
  deleteRevistaEdicion,
  getNovedadesAdmin,
  getPortalFileUrl,
  getRevistasAdmin,
  updatePortalNovedad,
  updateRevistaEdicion,
  type PortalNovedad,
  type PortalNovedadCategory,
  type RevistaEdicion,
} from '../api/portal.api';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { formatDateTime } from '../utils/formatDate';

const fieldClassName =
  'w-full rounded-xl border border-[#cfe0d9] bg-white px-3.5 py-2.5 text-sm text-[#173d3b] outline-none transition focus:border-[#087d70] focus:ring-4 focus:ring-[#087d70]/10';

const novedadCategories: { value: PortalNovedadCategory; label: string }[] = [
  { value: 'NOVEDAD', label: 'Novedad' },
  { value: 'JORNADA', label: 'Jornada / Evento' },
  { value: 'COMUNICADO', label: 'Comunicado' },
  { value: 'DESTACADO', label: 'Destacado' },
];

export function GestionPortal() {
  const [activeTab, setActiveTab] = useState<'revista' | 'novedades'>('revista');

  // Revista state
  const [revistas, setRevistas] = useState<RevistaEdicion[]>([]);
  const [loadingRevistas, setLoadingRevistas] = useState(true);
  const [revistaTitle, setRevistaTitle] = useState('');
  const [editionLabel, setEditionLabel] = useState('');
  const [revistaSummary, setRevistaSummary] = useState('');
  const [publishedDate, setPublishedDate] = useState(
    () => new Date().toISOString().slice(0, 10),
  );
  const [isFeatured, setIsFeatured] = useState(true);
  const [isRevistaPublished, setIsRevistaPublished] = useState(true);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [savingRevista, setSavingRevista] = useState(false);
  const [busyRevistaId, setBusyRevistaId] = useState<number | null>(null);
  const [confirmDeleteRevistaId, setConfirmDeleteRevistaId] = useState<number | null>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  // Novedades state
  const [novedades, setNovedades] = useState<PortalNovedad[]>([]);
  const [loadingNovedades, setLoadingNovedades] = useState(true);
  const [novedadTitle, setNovedadTitle] = useState('');
  const [novedadCategory, setNovedadCategory] = useState<PortalNovedadCategory>('NOVEDAD');
  const [novedadSummary, setNovedadSummary] = useState('');
  const [externalLink, setExternalLink] = useState('');
  const [isNovedadPublished, setIsNovedadPublished] = useState(true);
  const [isPinned, setIsPinned] = useState(false);
  const [novedadImage, setNovedadImage] = useState<File | null>(null);
  const [novedadAttachment, setNovedadAttachment] = useState<File | null>(null);
  const [savingNovedad, setSavingNovedad] = useState(false);
  const [busyNovedadId, setBusyNovedadId] = useState<number | null>(null);
  const [confirmDeleteNovedadId, setConfirmDeleteNovedadId] = useState<number | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const attachmentInputRef = useRef<HTMLInputElement>(null);

  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState('');

  const loadAll = useCallback(async () => {
    setLoadingRevistas(true);
    setLoadingNovedades(true);
    setError('');
    try {
      const [revList, novList] = await Promise.all([
        getRevistasAdmin(),
        getNovedadesAdmin(),
      ]);
      setRevistas(revList);
      setNovedades(novList);
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudo cargar el contenido del portal.',
      );
    } finally {
      setLoadingRevistas(false);
      setLoadingNovedades(false);
    }
  }, []);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  const handleCreateRevista = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setFeedback('');

    if (!revistaTitle.trim() || !editionLabel.trim()) {
      setError('El título y el número de edición son obligatorios.');
      return;
    }
    if (!pdfFile) {
      setError('Debes adjuntar el archivo PDF completo de la revista.');
      return;
    }

    setSavingRevista(true);
    try {
      await createRevistaEdicion({
        title: revistaTitle.trim(),
        editionLabel: editionLabel.trim(),
        summary: revistaSummary.trim(),
        publishedDate,
        isFeatured,
        isPublished: isRevistaPublished,
        pdf: pdfFile,
        cover: coverFile,
      });
      setRevistaTitle('');
      setEditionLabel('');
      setRevistaSummary('');
      setPdfFile(null);
      setCoverFile(null);
      if (pdfInputRef.current) pdfInputRef.current.value = '';
      if (coverInputRef.current) coverInputRef.current.value = '';
      setFeedback('Edición de la Revista Oficial cargada correctamente.');
      await loadAll();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al subir la edición.');
    } finally {
      setSavingRevista(false);
    }
  };

  const handleToggleRevista = async (
    revista: RevistaEdicion,
    patch: Partial<{ isFeatured: boolean; isPublished: boolean }>,
  ) => {
    setBusyRevistaId(revista.id);
    setError('');
    setFeedback('');
    try {
      await updateRevistaEdicion(revista.id, patch);
      await loadAll();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al actualizar la edición.');
    } finally {
      setBusyRevistaId(null);
    }
  };

  const handleDeleteRevista = async (id: number) => {
    setConfirmDeleteRevistaId(null);
    setBusyRevistaId(id);
    setError('');
    setFeedback('');
    try {
      await deleteRevistaEdicion(id);
      setFeedback('Edición eliminada correctamente.');
      await loadAll();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al eliminar la edición.');
    } finally {
      setBusyRevistaId(null);
    }
  };

  const handleCreateNovedad = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setFeedback('');

    if (!novedadTitle.trim() || !novedadSummary.trim()) {
      setError('El título y el contenido son obligatorios.');
      return;
    }

    setSavingNovedad(true);
    try {
      await createPortalNovedad({
        title: novedadTitle.trim(),
        category: novedadCategory,
        summary: novedadSummary.trim(),
        externalLink: externalLink.trim() || undefined,
        isPublished: isNovedadPublished,
        isPinned,
        image: novedadImage,
        attachment: novedadAttachment,
      });
      setNovedadTitle('');
      setNovedadCategory('NOVEDAD');
      setNovedadSummary('');
      setExternalLink('');
      setIsPinned(false);
      setNovedadImage(null);
      setNovedadAttachment(null);
      if (imageInputRef.current) imageInputRef.current.value = '';
      if (attachmentInputRef.current) attachmentInputRef.current.value = '';
      setFeedback('Publicación de portada creada correctamente.');
      await loadAll();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al crear la publicación.');
    } finally {
      setSavingNovedad(false);
    }
  };

  const handleToggleNovedad = async (
    novedad: PortalNovedad,
    patch: Partial<{ isPublished: boolean; isPinned: boolean }>,
  ) => {
    setBusyNovedadId(novedad.id);
    setError('');
    setFeedback('');
    try {
      await updatePortalNovedad(novedad.id, patch);
      await loadAll();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al actualizar la publicación.');
    } finally {
      setBusyNovedadId(null);
    }
  };

  const handleDeleteNovedad = async (id: number) => {
    setConfirmDeleteNovedadId(null);
    setBusyNovedadId(id);
    setError('');
    setFeedback('');
    try {
      await deletePortalNovedad(id);
      setFeedback('Publicación eliminada correctamente.');
      await loadAll();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al eliminar la publicación.');
    } finally {
      setBusyNovedadId(null);
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header>
        <p className="text-[10px] font-semibold uppercase tracking-[.16em] text-[#52766d]">
          Gestión del portal público
        </p>
        <h2 className="mt-1 font-editorial text-[32px] leading-tight tracking-[-.03em] text-[#173d3b]">
          Portal y Revista Oficial HIEF
        </h2>
        <p className="mt-1.5 max-w-2xl text-sm text-[#526e68]">
          Administrá la revista estrella del hospital y las novedades o anuncios visibles en la página principal.
        </p>
      </header>

      <div className="flex gap-2 border-b border-[#d5e6df]">
        <button
          type="button"
          onClick={() => {
            setActiveTab('revista');
            setError('');
            setFeedback('');
          }}
          className={`inline-flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition ${
            activeTab === 'revista'
              ? 'border-[#087d70] text-[#07584f]'
              : 'border-transparent text-[#52766d] hover:text-[#173d3b]'
          }`}
        >
          <BookOpenCheck size={16} />
          Revista Oficial ({revistas.length})
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveTab('novedades');
            setError('');
            setFeedback('');
          }}
          className={`inline-flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition ${
            activeTab === 'novedades'
              ? 'border-[#087d70] text-[#07584f]'
              : 'border-transparent text-[#52766d] hover:text-[#173d3b]'
          }`}
        >
          <Newspaper size={16} />
          Novedades de Portada ({novedades.length})
        </button>
      </div>

      {error && (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}
      {feedback && (
        <div role="status" className="rounded-xl border border-[#b9e2d2] bg-[#eff9f4] px-4 py-3 text-sm text-[#087d70]">
          {feedback}
        </div>
      )}

      {activeTab === 'revista' ? (
        <div className="space-y-8">
          <Card title="Publicar nueva edición de la Revista Oficial HIEF">
            <form className="space-y-5" onSubmit={(e) => void handleCreateRevista(e)}>
              <div className="grid gap-4 md:grid-cols-3">
                <label className="block md:col-span-2">
                  <span className="mb-1.5 block text-sm font-semibold text-[#244f47]">
                    Título de la edición <span className="text-red-600">*</span>
                  </span>
                  <input
                    required
                    value={revistaTitle}
                    onChange={(e) => setRevistaTitle(e.target.value)}
                    placeholder="Ej. Revista Científica HIEF — Salud Pública e Innovación"
                    className={fieldClassName}
                  />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-sm font-semibold text-[#244f47]">
                    Número / Volumen <span className="text-red-600">*</span>
                  </span>
                  <input
                    required
                    value={editionLabel}
                    onChange={(e) => setEditionLabel(e.target.value)}
                    placeholder="Ej. Edición N.º 4 · Nov 2026"
                    className={fieldClassName}
                  />
                </label>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <label className="block md:col-span-2">
                  <span className="mb-1.5 block text-sm font-semibold text-[#244f47]">
                    Resumen editorial / Temas destacados
                  </span>
                  <textarea
                    value={revistaSummary}
                    onChange={(e) => setRevistaSummary(e.target.value)}
                    rows={3}
                    placeholder="Principales investigaciones, editoriales y novedades incluidas en este número..."
                    className={fieldClassName}
                  />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-sm font-semibold text-[#244f47]">
                    Fecha de publicación
                  </span>
                  <input
                    type="date"
                    value={publishedDate}
                    onChange={(e) => setPublishedDate(e.target.value)}
                    className={fieldClassName}
                  />
                </label>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="mb-1.5 block text-sm font-semibold text-[#244f47]">
                    PDF de la revista (máx. 40 MB) <span className="text-red-600">*</span>
                  </span>
                  <input
                    ref={pdfInputRef}
                    type="file"
                    accept="application/pdf,.pdf"
                    onChange={(e) => setPdfFile(e.currentTarget.files?.[0] ?? null)}
                    className="block w-full cursor-pointer rounded-xl border border-dashed border-[#a9cbbd] bg-[#f7fbf9] px-4 py-3 text-sm text-[#385f56] file:mr-3 file:rounded-lg file:border-0 file:bg-[#dff2e9] file:px-3 file:py-2 file:text-xs file:font-semibold file:text-[#07584f]"
                  />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-sm font-semibold text-[#244f47]">
                    Imagen de portada (JPG/PNG/WebP, opcional)
                  </span>
                  <input
                    ref={coverInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(e) => setCoverFile(e.currentTarget.files?.[0] ?? null)}
                    className="block w-full cursor-pointer rounded-xl border border-dashed border-[#a9cbbd] bg-[#f7fbf9] px-4 py-3 text-sm text-[#385f56] file:mr-3 file:rounded-lg file:border-0 file:bg-[#dff2e9] file:px-3 file:py-2 file:text-xs file:font-semibold file:text-[#07584f]"
                  />
                </label>
              </div>

              <div className="flex flex-wrap items-center gap-6">
                <label className="inline-flex items-center gap-2 text-sm font-medium text-[#173d3b]">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="h-4 w-4 rounded border-[#a9cbbd] text-[#087d70]"
                  />
                  Destacar como edición protagonista en la portada
                </label>
                <label className="inline-flex items-center gap-2 text-sm font-medium text-[#173d3b]">
                  <input
                    type="checkbox"
                    checked={isRevistaPublished}
                    onChange={(e) => setIsRevistaPublished(e.target.checked)}
                    className="h-4 w-4 rounded border-[#a9cbbd] text-[#087d70]"
                  />
                  Visible al público inmediatamente
                </label>
              </div>

              {error && (
                <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <div className="flex justify-end">
                <Button
                  type="submit"
                  isLoading={savingRevista}
                  className="gap-2 rounded-xl bg-[#087d70] text-sm hover:bg-[#06695e]"
                >
                  <Upload size={16} />
                  Publicar edición
                </Button>
              </div>
            </form>
          </Card>

          <section className="space-y-3">
            <h3 className="text-lg font-semibold text-[#173d3b]">
              Ediciones cargadas ({revistas.length})
            </h3>
            {loadingRevistas ? (
              <div className="flex items-center justify-center gap-2 rounded-2xl border border-[#d5e6df] bg-white py-12 text-sm text-[#52766d]">
                <Loader2 className="animate-spin" size={18} /> Cargando ediciones...
              </div>
            ) : revistas.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[#a9d2c1] bg-[#f7fbf9] p-10 text-center text-sm text-[#526e68]">
                Todavía no hay ediciones de la revista cargadas.
              </div>
            ) : (
              <div className="divide-y divide-[#e3eee9] overflow-hidden rounded-2xl border border-[#d5e6df] bg-white">
                {revistas.map((revista) => (
                  <article
                    key={revista.id}
                    className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex min-w-0 items-start gap-4">
                      {revista.coverImageUrl ? (
                        <img
                          src={getPortalFileUrl(revista.coverImageUrl)}
                          alt={revista.title}
                          className="h-20 w-16 shrink-0 rounded-lg border border-[#d5e6df] object-cover"
                        />
                      ) : (
                        <div className="flex h-20 w-16 shrink-0 items-center justify-center rounded-lg bg-[#e6f5ee] text-[#087d70]">
                          <BookOpenCheck size={24} />
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-[#e6f5ee] px-2.5 py-0.5 text-xs font-semibold text-[#07584f]">
                            {revista.editionLabel}
                          </span>
                          {revista.isFeatured && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
                              <Star size={12} fill="currentColor" /> Protagonista
                            </span>
                          )}
                          {!revista.isPublished && (
                            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
                              Oculta
                            </span>
                          )}
                        </div>
                        <h4 className="mt-1.5 text-base font-bold text-[#102f2d]">
                          {revista.title}
                        </h4>
                        {revista.summary && (
                          <p className="mt-1 line-clamp-2 text-xs text-[#526e68]">
                            {revista.summary}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <a
                        href={getPortalFileUrl(revista.pdfUrl)}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-lg border border-[#b9d8ca] px-3 py-1.5 text-xs font-semibold text-[#087d70] hover:bg-[#eff9f4]"
                      >
                        Ver PDF <ExternalLink size={13} />
                      </a>
                      {!revista.isFeatured && (
                        <Button
                          type="button"
                          variant="ghost"
                          disabled={busyRevistaId !== null}
                          onClick={() =>
                            void handleToggleRevista(revista, {
                              isFeatured: true,
                              isPublished: true,
                            })
                          }
                          className="gap-1 px-2.5 py-1.5 text-xs text-amber-700 hover:bg-amber-50"
                        >
                          <Star size={13} /> Destacar
                        </Button>
                      )}
                      <Button
                        type="button"
                        variant="ghost"
                        disabled={busyRevistaId !== null}
                        onClick={() =>
                          void handleToggleRevista(revista, {
                            isPublished: !revista.isPublished,
                          })
                        }
                        className="gap-1 px-2.5 py-1.5 text-xs text-[#385f56]"
                      >
                        {revista.isPublished ? (
                          <>
                            <EyeOff size={13} /> Ocultar
                          </>
                        ) : (
                          <>
                            <Eye size={13} /> Publicar
                          </>
                        )}
                      </Button>

                      {confirmDeleteRevistaId === revista.id ? (
                        <div className="flex items-center gap-1.5">
                          <Button
                            type="button"
                            variant="danger"
                            disabled={busyRevistaId !== null}
                            onClick={() => void handleDeleteRevista(revista.id)}
                            className="px-2.5 py-1.5 text-xs"
                          >
                            Confirmar
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setConfirmDeleteRevistaId(null)}
                            className="px-2 py-1.5 text-xs"
                          >
                            Cancelar
                          </Button>
                        </div>
                      ) : (
                        <Button
                          type="button"
                          variant="ghost"
                          disabled={busyRevistaId !== null}
                          onClick={() => setConfirmDeleteRevistaId(revista.id)}
                          className="gap-1 px-2.5 py-1.5 text-xs text-red-600 hover:bg-red-50"
                        >
                          <Trash2 size={13} /> Eliminar
                        </Button>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      ) : (
        <div className="space-y-8">
          <Card title="Crear publicación para la Landing Page">
            <form className="space-y-5" onSubmit={(e) => void handleCreateNovedad(e)}>
              <div className="grid gap-4 md:grid-cols-3">
                <label className="block md:col-span-2">
                  <span className="mb-1.5 block text-sm font-semibold text-[#244f47]">
                    Título <span className="text-red-600">*</span>
                  </span>
                  <input
                    required
                    value={novedadTitle}
                    onChange={(e) => setNovedadTitle(e.target.value)}
                    placeholder="Ej. Jornadas Científicas Anuales HIEF 2026"
                    className={fieldClassName}
                  />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-sm font-semibold text-[#244f47]">
                    Tipo de publicación
                  </span>
                  <select
                    value={novedadCategory}
                    onChange={(e) =>
                      setNovedadCategory(e.target.value as PortalNovedadCategory)
                    }
                    className={fieldClassName}
                  >
                    {novedadCategories.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="block">
                <span className="mb-1.5 block text-sm font-semibold text-[#244f47]">
                  Contenido / Resumen <span className="text-red-600">*</span>
                </span>
                <textarea
                  required
                  rows={4}
                  value={novedadSummary}
                  onChange={(e) => setNovedadSummary(e.target.value)}
                  placeholder="Escribí la novedad, anuncio o comunicado que aparecerá en la portada pública..."
                  className={fieldClassName}
                />
              </label>

              <div className="grid gap-4 md:grid-cols-3">
                <label className="block">
                  <span className="mb-1.5 block text-sm font-semibold text-[#244f47]">
                    Imagen ilustrativa (opcional)
                  </span>
                  <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(e) => setNovedadImage(e.currentTarget.files?.[0] ?? null)}
                    className="block w-full cursor-pointer rounded-xl border border-dashed border-[#a9cbbd] bg-[#f7fbf9] px-3 py-2.5 text-xs text-[#385f56] file:mr-2 file:rounded-lg file:border-0 file:bg-[#dff2e9] file:px-2.5 file:py-1.5 file:text-xs file:font-semibold file:text-[#07584f]"
                  />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-sm font-semibold text-[#244f47]">
                    PDF adjunto (opcional)
                  </span>
                  <input
                    ref={attachmentInputRef}
                    type="file"
                    accept="application/pdf"
                    onChange={(e) =>
                      setNovedadAttachment(e.currentTarget.files?.[0] ?? null)
                    }
                    className="block w-full cursor-pointer rounded-xl border border-dashed border-[#a9cbbd] bg-[#f7fbf9] px-3 py-2.5 text-xs text-[#385f56] file:mr-2 file:rounded-lg file:border-0 file:bg-[#dff2e9] file:px-2.5 file:py-1.5 file:text-xs file:font-semibold file:text-[#07584f]"
                  />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-sm font-semibold text-[#244f47]">
                    Enlace externo (opcional)
                  </span>
                  <input
                    type="url"
                    value={externalLink}
                    onChange={(e) => setExternalLink(e.target.value)}
                    placeholder="https://..."
                    className={fieldClassName}
                  />
                </label>
              </div>

              <div className="flex flex-wrap items-center gap-6">
                <label className="inline-flex items-center gap-2 text-sm font-medium text-[#173d3b]">
                  <input
                    type="checkbox"
                    checked={isPinned}
                    onChange={(e) => setIsPinned(e.target.checked)}
                    className="h-4 w-4 rounded border-[#a9cbbd] text-[#087d70]"
                  />
                  Fijar en primer lugar
                </label>
                <label className="inline-flex items-center gap-2 text-sm font-medium text-[#173d3b]">
                  <input
                    type="checkbox"
                    checked={isNovedadPublished}
                    onChange={(e) => setIsNovedadPublished(e.target.checked)}
                    className="h-4 w-4 rounded border-[#a9cbbd] text-[#087d70]"
                  />
                  Visible en la Landing Page
                </label>
              </div>

              <div className="flex justify-end">
                <Button
                  type="submit"
                  isLoading={savingNovedad}
                  className="gap-2 rounded-xl bg-[#087d70] text-sm hover:bg-[#06695e]"
                >
                  <Upload size={16} />
                  Publicar novedad
                </Button>
              </div>
            </form>
          </Card>

          <section className="space-y-3">
            <h3 className="text-lg font-semibold text-[#173d3b]">
              Publicaciones creadas ({novedades.length})
            </h3>
            {loadingNovedades ? (
              <div className="flex items-center justify-center gap-2 rounded-2xl border border-[#d5e6df] bg-white py-12 text-sm text-[#52766d]">
                <Loader2 className="animate-spin" size={18} /> Cargando publicaciones...
              </div>
            ) : novedades.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[#a9d2c1] bg-[#f7fbf9] p-10 text-center text-sm text-[#526e68]">
                Todavía no hay publicaciones de portada creadas.
              </div>
            ) : (
              <div className="divide-y divide-[#e3eee9] overflow-hidden rounded-2xl border border-[#d5e6df] bg-white">
                {novedades.map((novedad) => (
                  <article
                    key={novedad.id}
                    className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-[#e6f5ee] px-2.5 py-0.5 text-xs font-semibold text-[#07584f]">
                          {novedad.category}
                        </span>
                        {novedad.isPinned && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
                            <Pin size={12} /> Fijada
                          </span>
                        )}
                        {!novedad.isPublished && (
                          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
                            Oculta
                          </span>
                        )}
                        <span className="text-xs text-[#668079]">
                          {formatDateTime(novedad.createdAt)}
                        </span>
                      </div>
                      <h4 className="mt-1.5 text-base font-bold text-[#102f2d]">
                        {novedad.title}
                      </h4>
                      <p className="mt-1 line-clamp-2 text-xs text-[#526e68]">
                        {novedad.summary}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        disabled={busyNovedadId !== null}
                        onClick={() =>
                          void handleToggleNovedad(novedad, {
                            isPinned: !novedad.isPinned,
                          })
                        }
                        className="gap-1 px-2.5 py-1.5 text-xs text-amber-700 hover:bg-amber-50"
                      >
                        <Pin size={13} /> {novedad.isPinned ? 'Desfijar' : 'Fijar'}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        disabled={busyNovedadId !== null}
                        onClick={() =>
                          void handleToggleNovedad(novedad, {
                            isPublished: !novedad.isPublished,
                          })
                        }
                        className="gap-1 px-2.5 py-1.5 text-xs text-[#385f56]"
                      >
                        {novedad.isPublished ? (
                          <>
                            <EyeOff size={13} /> Ocultar
                          </>
                        ) : (
                          <>
                            <Eye size={13} /> Publicar
                          </>
                        )}
                      </Button>

                      {confirmDeleteNovedadId === novedad.id ? (
                        <div className="flex items-center gap-1.5">
                          <Button
                            type="button"
                            variant="danger"
                            disabled={busyNovedadId !== null}
                            onClick={() => void handleDeleteNovedad(novedad.id)}
                            className="px-2.5 py-1.5 text-xs"
                          >
                            Confirmar
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setConfirmDeleteNovedadId(null)}
                            className="px-2 py-1.5 text-xs"
                          >
                            Cancelar
                          </Button>
                        </div>
                      ) : (
                        <Button
                          type="button"
                          variant="ghost"
                          disabled={busyNovedadId !== null}
                          onClick={() => setConfirmDeleteNovedadId(novedad.id)}
                          className="gap-1 px-2.5 py-1.5 text-xs text-red-600 hover:bg-red-50"
                        >
                          <Trash2 size={13} /> Eliminar
                        </Button>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
