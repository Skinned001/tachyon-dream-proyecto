<<<<<<< HEAD
import { useCallback, useEffect, useState } from 'react';
import { CheckCircle2, Loader2, RefreshCw, UserCheck } from 'lucide-react';
import {
  asignarRevisor,
  getArticulosPendientes,
  getEspecialistas,
  type ArticuloPendiente,
} from '../api/editorial.api';
import {
  getEspecialidades,
  type Especialidad,
} from '../api/especialidades.api';
import type { User } from '../types/user.types';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { formatDateTime } from '../utils/formatDate';

export const PanelEditor = () => {
  const [articulos, setArticulos] = useState<ArticuloPendiente[]>([]);
  const [especialistas, setEspecialistas] = useState<User[]>([]);
  const [especialidades, setEspecialidades] = useState<Especialidad[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAssigning, setIsAssigning] = useState<number | null>(null);
  const [selectedReviewer, setSelectedReviewer] = useState<
    Record<number, number>
  >({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const [pendingArticles, reviewers, specialties] = await Promise.all([
        getArticulosPendientes(),
        getEspecialistas(),
        getEspecialidades(),
      ]);
      setArticulos(pendingArticles);
      setEspecialistas(reviewers);
      setEspecialidades(specialties);
    } catch (requestError: unknown) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'No se pudo cargar la bandeja de asignación.',
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const handleAssign = async (articleId: number) => {
    const reviewerId = selectedReviewer[articleId];
    if (!reviewerId) {
      setError('Selecciona un especialista antes de asignar el artículo.');
      return;
    }

    setIsAssigning(articleId);
    setError('');
    setSuccess('');
    try {
      await asignarRevisor(articleId, reviewerId);
      const reviewer = especialistas.find((item) => item.id === reviewerId);
      setSuccess(
        reviewer
          ? `Artículo asignado a ${reviewer.first_name} ${reviewer.last_name}.`
          : 'Artículo asignado correctamente.',
      );
      setArticulos((current) =>
        current.filter((article) => article.id !== articleId),
      );
      setSelectedReviewer((current) => {
        const next = { ...current };
        delete next[articleId];
        return next;
      });
    } catch (requestError: unknown) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'No se pudo asignar el artículo.',
=======
import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import {
  AlertCircle,
  ArchiveRestore,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  FileText,
  Globe,
  Loader2,
  LockKeyhole,
  RefreshCw,
  Users,
  X,
} from 'lucide-react';
import {
  aprobarCorreccionEditorial,
  getArticulos,
  publicarArticulo,
  retirarArticulo,
  type Articulo,
} from '../api/articulos.api';
import { Modal } from '../components/ui/Modal';
import {
  ArticleStateBadge,
  VersionHistoryPanel,
} from '../features/articulos/ArticleWorkflowMeta';
import { formatDateTime } from '../utils/formatDate';

type EditorTab = 'aprobados' | 'publicados' | 'correcciones';

const inputClassName =
  'h-11 w-full rounded-xl border border-[#bfdcd0] bg-white px-3.5 text-sm text-[#173d3b] outline-none transition placeholder:text-[#78918a] focus:border-[#087d70] focus:ring-4 focus:ring-[#087d70]/10';

export const PanelEditor = () => {
  const [articulos, setArticulos] = useState<Articulo[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [activeTab, setActiveTab] = useState<EditorTab>('aprobados');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [approvingId, setApprovingId] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // Modal de publicación
  const [publishingArticle, setPublishingArticle] = useState<Articulo | null>(
    null,
  );
  const [editionNumber, setEditionNumber] = useState('');
  const [doi, setDoi] = useState('');
  const [keywordsInput, setKeywordsInput] = useState('');
  const [publishError, setPublishError] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);

  // Modal de retiro (despublicación)
  const [withdrawingArticle, setWithdrawingArticle] =
    useState<Articulo | null>(null);
  const [withdrawReason, setWithdrawReason] = useState('');
  const [withdrawPassword, setWithdrawPassword] = useState('');
  const [withdrawError, setWithdrawError] = useState('');
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  const cargarBandeja = useCallback(async () => {
    try {
      setLoading(true);
      setLoadError('');
      setArticulos(await getArticulos());
    } catch (err: unknown) {
      setLoadError(
        err instanceof Error
          ? err.message
          : 'No se pudo cargar la cola editorial.',
>>>>>>> cdb5e53e838edcb56febd5aad3e51d1aa29df9d0
      );
    } finally {
      setIsAssigning(null);
    }
  }, []);

  useEffect(() => {
    void cargarBandeja();
  }, [cargarBandeja]);

  const aprobadosParaPublicar = useMemo(
    () =>
      articulos.filter(
        (item) => item.status === 'APROBADO' || item.status === 'ACEPTADO',
      ),
    [articulos],
  );

  const publicados = useMemo(
    () => articulos.filter((item) => item.status === 'PUBLICADO'),
    [articulos],
  );

  const correccionesEnVerificacion = useMemo(
    () =>
      articulos.filter(
        (item) =>
          item.status === 'EN_REVISION' &&
          (item.latestVersion?.version_number ?? 1) >= 2,
      ),
    [articulos],
  );

  const openPublishModal = (articulo: Articulo) => {
    setPublishingArticle(articulo);
    setEditionNumber(articulo.editionNumber ?? '');
    setDoi(articulo.doi ?? '');
    setKeywordsInput(articulo.keywords.join(', '));
    setPublishError('');
  };

<<<<<<< HEAD
=======
  const handleConfirmPublish = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!publishingArticle) return;

    const keywords = keywordsInput
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);

    try {
      setIsPublishing(true);
      setPublishError('');
      await publicarArticulo(publishingArticle.id, {
        ...(editionNumber.trim() ? { editionNumber: editionNumber.trim() } : {}),
        ...(doi.trim() ? { doi: doi.trim() } : {}),
        ...(keywords.length > 0 ? { keywords } : {}),
      });
      setFeedback({
        type: 'success',
        message: `"${publishingArticle.title}" fue publicado y ya es visible en el Portal Público.`,
      });
      setPublishingArticle(null);
      await cargarBandeja();
    } catch (err: unknown) {
      setPublishError(
        err instanceof Error
          ? err.message
          : 'No se pudo publicar el manuscrito.',
      );
    } finally {
      setIsPublishing(false);
    }
  };

  const openWithdrawModal = (articulo: Articulo) => {
    setWithdrawingArticle(articulo);
    setWithdrawReason('');
    setWithdrawPassword('');
    setWithdrawError('');
  };

  const handleConfirmWithdraw = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!withdrawingArticle) return;

    if (withdrawReason.trim().length < 5) {
      setWithdrawError(
        'Indicá un motivo de al menos 5 caracteres para retirar la publicación.',
      );
      return;
    }
    if (!withdrawPassword) {
      setWithdrawError('Ingresá tu contraseña actual para confirmar.');
      return;
    }

    try {
      setIsWithdrawing(true);
      setWithdrawError('');
      await retirarArticulo(withdrawingArticle.id, {
        reason: withdrawReason.trim(),
        password: withdrawPassword,
      });
      setFeedback({
        type: 'success',
        message: `"${withdrawingArticle.title}" fue retirado del Portal Público y devuelto a la cola de Aprobados. Se notificó al autor.`,
      });
      setWithdrawingArticle(null);
      setWithdrawPassword('');
      await cargarBandeja();
    } catch (err: unknown) {
      setWithdrawError(
        err instanceof Error
          ? err.message
          : 'No se pudo retirar la publicación.',
      );
    } finally {
      setIsWithdrawing(false);
    }
  };

  const handleAprobarCorreccion = async (articulo: Articulo) => {
    const confirmed = window.confirm(
      `¿Confirmar que las correcciones de "${articulo.title}" están resueltas y pasarlo a APROBADO para publicación?`,
    );
    if (!confirmed) return;

    try {
      setApprovingId(articulo.id);
      setFeedback(null);
      await aprobarCorreccionEditorial(articulo.id);
      setFeedback({
        type: 'success',
        message: `"${articulo.title}" pasó a estado APROBADO listo para publicación.`,
      });
      await cargarBandeja();
    } catch (err: unknown) {
      setFeedback({
        type: 'error',
        message:
          err instanceof Error
            ? err.message
            : 'No se pudo aprobar la versión corregida.',
      });
    } finally {
      setApprovingId(null);
    }
  };

>>>>>>> cdb5e53e838edcb56febd5aad3e51d1aa29df9d0
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[.17em] text-[#52766d]">
<<<<<<< HEAD
            Área de Evaluación
          </p>
          <h2 className="font-editorial mt-2 text-[32px] tracking-[-.03em] text-[#173d3b]">
            Asignación de revisores
          </h2>
          <p className="mt-1 text-[13px] text-[#526e68]">
            Deriva los manuscritos pendientes a un especialista DDI o del Comité
            Científico.
          </p>
        </div>
        <Button
          type="button"
          variant="secondary"
          onClick={() => void loadData()}
          disabled={isLoading || isAssigning !== null}
          className="gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Actualizar
        </Button>
      </header>

      {error && (
        <p
          className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700"
          role="alert"
        >
          {error}
        </p>
      )}
      {success && (
        <p
          className="flex items-center gap-2 rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-700"
          role="status"
        >
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          {success}
        </p>
      )}

      <Card>
        {isLoading ? (
          <div
            className="flex justify-center p-8"
            role="status"
            aria-label="Cargando artículos pendientes"
          >
            <Loader2 className="h-8 w-8 animate-spin text-[#087d70]" />
          </div>
        ) : articulos.length === 0 ? (
          <p className="py-8 text-center text-sm text-gray-500">
            No hay artículos pendientes de asignación.
          </p>
        ) : (
          <div className="space-y-4">
            {articulos.map((articulo) => (
              <article
                key={articulo.id}
                className="flex flex-col gap-4 rounded-lg border border-gray-200 p-4 md:flex-row md:items-center md:justify-between"
              >
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-gray-800">
                    {articulo.title}
                  </h3>
                  {articulo.summary && (
                    <p className="mt-1 line-clamp-2 text-sm text-gray-600">
                      {articulo.summary}
                    </p>
                  )}
                  <p className="mt-2 text-xs text-gray-500">
                    Especialidad: {articulo.specialty?.name ?? articulo.specialtyId}
                  </p>
                  <p className="mt-1 text-xs text-gray-400">
                    Enviado: {formatDateTime(articulo.createdAt)}
                  </p>
                </div>

                <div className="flex w-full flex-col gap-2 sm:flex-row md:w-auto">
                  <label className="sr-only" htmlFor={`reviewer-${articulo.id}`}>
                    Especialista para {articulo.title}
                  </label>
                  <select
                    id={`reviewer-${articulo.id}`}
                    className="min-w-0 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm sm:min-w-64"
                    value={selectedReviewer[articulo.id] ?? ''}
                    onChange={(event) => {
                      const reviewerId = Number(event.target.value);
                      setSelectedReviewer((current) => ({
                        ...current,
                        [articulo.id]: reviewerId,
                      }));
                    }}
                    disabled={isAssigning !== null || especialistas.length === 0}
                  >
                    <option value="">Seleccionar especialista...</option>
                    {especialistas.map((especialista) => (
                      <option key={especialista.id} value={especialista.id}>
                        {especialista.first_name} {especialista.last_name} -{' '}
                        {especialidades.find(
                          (especialidad) =>
                            especialidad.id === especialista.specialtyId,
                        )?.name ?? 'Sin especialidad'}
                      </option>
                    ))}
                  </select>
                  <Button
                    type="button"
                    onClick={() => void handleAssign(articulo.id)}
                    disabled={
                      !selectedReviewer[articulo.id] || isAssigning !== null
                    }
                    isLoading={isAssigning === articulo.id}
                    className="shrink-0 gap-2"
                  >
                    <UserCheck className="h-4 w-4" />
                    Asignar
                  </Button>
                </div>
              </article>
            ))}
            {especialistas.length === 0 && (
              <p className="text-sm text-amber-700" role="status">
                No hay especialistas activos con rol DDI o COMITE disponibles.
              </p>
            )}
          </div>
        )}
      </Card>
=======
            Área Editorial
          </p>
          <h2 className="font-editorial mt-2 text-[32px] tracking-[-.03em] text-[#173d3b]">
            Panel del Editor
          </h2>
          <p className="mt-1 text-[13px] text-[#526e68]">
            Publicá manuscritos aprobados en el Portal Público, gestioná publicaciones activas o validá correcciones recibidas.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void cargarBandeja()}
          className="inline-flex h-10 items-center gap-1.5 self-start rounded-xl border border-[#cfe4dc] bg-[#fcfefd] px-3.5 text-xs font-semibold text-[#385f56] hover:bg-[#edf6f2] md:self-auto"
        >
          <RefreshCw size={14} /> Actualizar
        </button>
      </section>

      <div className="flex flex-wrap gap-2 border-b border-[#d5e6df] pb-3">
        <button
          type="button"
          onClick={() => setActiveTab('aprobados')}
          className={`rounded-xl px-4 py-2 text-xs font-semibold transition ${
            activeTab === 'aprobados'
              ? 'bg-[#087d70] text-white'
              : 'bg-[#e7f4ee] text-[#385f56] hover:bg-[#d5eee4]'
          }`}
        >
          Listos para publicar ({aprobadosParaPublicar.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('publicados')}
          className={`rounded-xl px-4 py-2 text-xs font-semibold transition ${
            activeTab === 'publicados'
              ? 'bg-[#087d70] text-white'
              : 'bg-[#e7f4ee] text-[#385f56] hover:bg-[#d5eee4]'
          }`}
        >
          Publicados en el portal ({publicados.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('correcciones')}
          className={`rounded-xl px-4 py-2 text-xs font-semibold transition ${
            activeTab === 'correcciones'
              ? 'bg-[#087d70] text-white'
              : 'bg-[#e7f4ee] text-[#385f56] hover:bg-[#d5eee4]'
          }`}
        >
          Correcciones en verificación ({correccionesEnVerificacion.length})
        </button>
      </div>

      {feedback && (
        <div
          role={feedback.type === 'error' ? 'alert' : 'status'}
          className={`flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-sm ${
            feedback.type === 'error'
              ? 'border-rose-200 bg-rose-50 text-rose-800'
              : 'border-[#b9e2d2] bg-[#eff9f4] text-[#07584f]'
          }`}
        >
          <span className="flex items-center gap-2">
            {feedback.type === 'error' ? (
              <AlertCircle size={16} />
            ) : (
              <CheckCircle2 size={16} />
            )}
            {feedback.message}
          </span>
          <button type="button" onClick={() => setFeedback(null)}>
            <X size={16} />
          </button>
        </div>
      )}

      {loadError && (
        <div
          role="alert"
          className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-800"
        >
          {loadError}
        </div>
      )}

      {activeTab === 'aprobados' && (
        <section className="overflow-hidden rounded-2xl border border-[#d5e6df] bg-[#fcfefd]">
          <div className="border-b border-[#dcebe5] px-5 py-5 md:px-6">
            <h3 className="text-[15px] font-semibold text-[#173d3b]">
              Manuscritos aprobados para publicación ({aprobadosParaPublicar.length})
            </h3>
            <p className="mt-0.5 text-xs text-[#58786f]">
              Verificá autor, co-autores, fecha de carga, comité evaluador y PDF final antes de publicar en el Portal Público.
            </p>
          </div>
          <div className="divide-y divide-[#e3eee9]">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-14 text-sm text-[#52766d]">
                <Loader2 className="mb-2 animate-spin" size={22} /> Cargando
                manuscritos aprobados...
              </div>
            ) : aprobadosParaPublicar.length > 0 ? (
              aprobadosParaPublicar.map((articulo) => {
                const isExpanded = expandedId === articulo.id;
                return (
                  <article key={articulo.id} className="space-y-3 px-5 py-5 md:px-6">
                    <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <ArticleStateBadge state={articulo.status} />
                          <span className="font-data rounded-md bg-[#edf5f1] px-2 py-0.5 text-[10px] font-semibold text-[#385f56]">
                            v{articulo.latestVersion?.version_number ?? 1}
                          </span>
                          {articulo.specialtyName && (
                            <span className="text-[11px] text-[#52766d]">
                              {articulo.specialtyName}
                            </span>
                          )}
                          {articulo.convocatoriaTitle && (
                            <span className="text-[11px] text-[#78918a]">
                              · {articulo.convocatoriaTitle}
                            </span>
                          )}
                        </div>
                        <h4 className="mt-2 text-[15px] font-semibold text-[#173d3b]">
                          {articulo.title}
                        </h4>
                        <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs text-[#526e68]">
                          <span>
                            <strong>Autor:</strong>{' '}
                            {articulo.authorName ?? 'Sin especificar'}
                          </span>
                          {articulo.coauthors.length > 0 && (
                            <span>
                              <strong>Co-autores:</strong>{' '}
                              {articulo.coauthors.join(', ')}
                            </span>
                          )}
                          <span>
                            <strong>Fecha de carga:</strong>{' '}
                            {new Date(articulo.createdAt).toLocaleDateString(
                              'es-AR',
                            )}
                          </span>
                        </div>
                        {articulo.assignments.length > 0 && (
                          <p className="mt-2 flex flex-wrap items-center gap-1.5 text-xs text-[#385f56]">
                            <Users size={13} className="text-[#087d70]" />
                            <strong>Comité evaluador:</strong>{' '}
                            {articulo.assignments
                              .map((a) => a.reviewerName ?? a.reviewerLabel)
                              .join(', ')}
                          </p>
                        )}
                      </div>

                      <div className="flex flex-wrap shrink-0 items-center gap-2">
                        {articulo.fileUrl && (
                          <a
                            href={articulo.fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-xl border border-[#b9d8ca] bg-white px-3.5 py-2 text-xs font-semibold text-[#087366] hover:bg-[#e7f4ee]"
                          >
                            <FileText size={14} /> Ver PDF final
                          </a>
                        )}
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedId(isExpanded ? null : articulo.id)
                          }
                          className="inline-flex items-center gap-1 rounded-xl border border-[#dcebe5] bg-white px-3 py-2 text-xs font-semibold text-[#385f56] hover:bg-[#f2f7f4]"
                        >
                          Historial{' '}
                          {isExpanded ? (
                            <ChevronUp size={14} />
                          ) : (
                            <ChevronDown size={14} />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => openPublishModal(articulo)}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-[#087d70] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#07584f]"
                        >
                          <Globe size={14} /> Publicar en el portal
                        </button>
                      </div>
                    </div>
                    {isExpanded && (
                      <div className="border-t border-[#e3eee9] pt-4">
                        <VersionHistoryPanel
                          articleId={articulo.id}
                          versions={articulo.versions}
                          showReviewerNames
                        />
                      </div>
                    )}
                  </article>
                );
              })
            ) : (
              <div className="py-14 text-center text-xs text-[#526e68]">
                No hay manuscritos aprobados pendientes de publicación.
              </div>
            )}
          </div>
        </section>
      )}

      {activeTab === 'publicados' && (
        <section className="overflow-hidden rounded-2xl border border-[#d5e6df] bg-[#fcfefd]">
          <div className="border-b border-[#dcebe5] px-5 py-5 md:px-6">
            <h3 className="text-[15px] font-semibold text-[#173d3b]">
              Artículos publicados en el Portal Público ({publicados.length})
            </h3>
            <p className="mt-0.5 text-xs text-[#58786f]">
              Si necesitás corregir un error o atender una observación editorial/legal, podés retirar la publicación sin perder su historial ni sus versiones.
            </p>
          </div>
          <div className="divide-y divide-[#e3eee9]">
            {loading ? (
              <div className="py-14 text-center text-sm text-[#52766d]">
                Cargando publicaciones...
              </div>
            ) : publicados.length > 0 ? (
              publicados.map((articulo) => {
                const isExpanded = expandedId === articulo.id;
                return (
                  <article key={articulo.id} className="space-y-3 px-5 py-5 md:px-6">
                    <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <ArticleStateBadge state={articulo.status} />
                          <span className="font-data rounded-md bg-[#edf5f1] px-2 py-0.5 text-[10px] font-semibold text-[#385f56]">
                            v{articulo.latestVersion?.version_number ?? 1}
                          </span>
                          {articulo.editionNumber && (
                            <span className="rounded-full bg-[#e6f5ee] px-2.5 py-0.5 text-[10px] font-semibold text-[#07584f]">
                              {articulo.editionNumber}
                            </span>
                          )}
                          {articulo.doi && (
                            <span className="font-data text-[10px] text-[#58786f]">
                              DOI: {articulo.doi}
                            </span>
                          )}
                        </div>
                        <h4 className="mt-2 text-[15px] font-semibold text-[#173d3b]">
                          {articulo.title}
                        </h4>
                        <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs text-[#526e68]">
                          <span>
                            <strong>Autor:</strong>{' '}
                            {articulo.authorName ?? 'Sin especificar'}
                          </span>
                          {articulo.coauthors.length > 0 && (
                            <span>
                              <strong>Co-autores:</strong>{' '}
                              {articulo.coauthors.join(', ')}
                            </span>
                          )}
                          <span>
                            <strong>Publicado:</strong>{' '}
                            {articulo.publishedAt
                              ? formatDateTime(articulo.publishedAt)
                              : formatDateTime(articulo.createdAt)}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap shrink-0 items-center gap-2">
                        {articulo.fileUrl && (
                          <a
                            href={articulo.fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-xl border border-[#b9d8ca] bg-white px-3.5 py-2 text-xs font-semibold text-[#087366] hover:bg-[#e7f4ee]"
                          >
                            <FileText size={14} /> Ver PDF
                          </a>
                        )}
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedId(isExpanded ? null : articulo.id)
                          }
                          className="inline-flex items-center gap-1 rounded-xl border border-[#dcebe5] bg-white px-3 py-2 text-xs font-semibold text-[#385f56] hover:bg-[#f2f7f4]"
                        >
                          Historial{' '}
                          {isExpanded ? (
                            <ChevronUp size={14} />
                          ) : (
                            <ChevronDown size={14} />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => openWithdrawModal(articulo)}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-rose-300 bg-white px-3.5 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-50"
                        >
                          <ArchiveRestore size={14} /> Retirar del portal
                        </button>
                      </div>
                    </div>
                    {isExpanded && (
                      <div className="border-t border-[#e3eee9] pt-4">
                        <VersionHistoryPanel
                          articleId={articulo.id}
                          versions={articulo.versions}
                          showReviewerNames
                        />
                      </div>
                    )}
                  </article>
                );
              })
            ) : (
              <div className="py-14 text-center text-xs text-[#526e68]">
                Todavía no hay artículos publicados en el Portal Público.
              </div>
            )}
          </div>
        </section>
      )}

      {activeTab === 'correcciones' && (
        <section className="overflow-hidden rounded-2xl border border-[#d5e6df] bg-[#fcfefd]">
          <div className="border-b border-[#dcebe5] px-5 py-5 md:px-6">
            <h3 className="text-[15px] font-semibold text-[#173d3b]">
              Correcciones en verificación ({correccionesEnVerificacion.length})
            </h3>
            <p className="mt-0.5 text-xs text-[#58786f]">
              Manuscritos aprobados con correcciones que ya recibieron una nueva versión (v2+) y pueden ser aprobados definitivamente por el Comité o el Editor.
            </p>
          </div>
          <div className="divide-y divide-[#e3eee9]">
            {loading ? (
              <div className="py-10 text-center text-sm text-[#52766d]">
                Cargando...
              </div>
            ) : correccionesEnVerificacion.length > 0 ? (
              correccionesEnVerificacion.map((articulo) => {
                const isExpanded = expandedId === articulo.id;
                return (
                  <article key={articulo.id} className="space-y-3 px-5 py-5 md:px-6">
                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <ArticleStateBadge state={articulo.status} />
                          <span className="font-data rounded-md bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-900">
                            v{articulo.latestVersion?.version_number ?? 2}
                          </span>
                        </div>
                        <h4 className="mt-2 text-[14px] font-semibold text-[#173d3b]">
                          {articulo.title}
                        </h4>
                        <p className="mt-1 text-xs text-[#526e68]">
                          Autor: {articulo.authorName ?? 'Sin especificar'}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        {articulo.fileUrl && (
                          <a
                            href={articulo.fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-xl border border-[#b9d8ca] bg-white px-3 py-2 text-xs font-semibold text-[#087366] hover:bg-[#e7f4ee]"
                          >
                            <FileText size={14} /> Ver PDF v
                            {articulo.latestVersion?.version_number}
                          </a>
                        )}
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedId(isExpanded ? null : articulo.id)
                          }
                          className="inline-flex items-center gap-1 rounded-xl border border-[#dcebe5] bg-white px-3 py-2 text-xs font-semibold text-[#385f56] hover:bg-[#f2f7f4]"
                        >
                          Historial{' '}
                          {isExpanded ? (
                            <ChevronUp size={14} />
                          ) : (
                            <ChevronDown size={14} />
                          )}
                        </button>
                        <button
                          type="button"
                          disabled={approvingId === articulo.id}
                          onClick={() => void handleAprobarCorreccion(articulo)}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-[#087d70] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#07584f] disabled:opacity-50"
                        >
                          {approvingId === articulo.id ? (
                            <Loader2 className="animate-spin" size={14} />
                          ) : (
                            <CheckCircle2 size={14} />
                          )}
                          Aprobar versión corregida
                        </button>
                      </div>
                    </div>
                    {isExpanded && (
                      <div className="border-t border-[#e3eee9] pt-4">
                        <VersionHistoryPanel
                          articleId={articulo.id}
                          versions={articulo.versions}
                          showReviewerNames
                        />
                      </div>
                    )}
                  </article>
                );
              })
            ) : (
              <div className="py-10 text-center text-xs text-[#526e68]">
                No hay versiones corregidas pendientes de validación.
              </div>
            )}
          </div>
        </section>
      )}

      {/* Modal de publicación */}
      <Modal
        isOpen={publishingArticle !== null}
        onClose={() => !isPublishing && setPublishingArticle(null)}
        title="Publicar en el Portal Público"
      >
        {publishingArticle && (
          <form onSubmit={handleConfirmPublish} className="space-y-4">
            <div className="rounded-xl border border-[#dcebe5] bg-[#f7fbf9] p-3.5 text-xs text-[#244f47]">
              <p className="font-semibold text-[#173d3b]">
                {publishingArticle.title}
              </p>
              <p className="mt-1.5">
                <strong>Autor:</strong>{' '}
                {publishingArticle.authorName ?? 'Sin especificar'}
              </p>
              {publishingArticle.coauthors.length > 0 && (
                <p className="mt-1">
                  <strong>Co-autores:</strong>{' '}
                  {publishingArticle.coauthors.join(', ')}
                </p>
              )}
              <p className="mt-1">
                <strong>Fecha de carga:</strong>{' '}
                {new Date(publishingArticle.createdAt).toLocaleDateString(
                  'es-AR',
                )}
              </p>
              {publishingArticle.assignments.length > 0 && (
                <p className="mt-1">
                  <strong>Comité revisor:</strong>{' '}
                  {publishingArticle.assignments
                    .map((a) => a.reviewerName ?? a.reviewerLabel)
                    .join(', ')}
                </p>
              )}
            </div>

            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-[#244f47]">
                Número de edición / Volumen{' '}
                <span className="font-normal text-[#78918a]">(opcional)</span>
              </span>
              <input
                type="text"
                value={editionNumber}
                onChange={(e) => setEditionNumber(e.target.value)}
                placeholder="Ej. Vol. 4 · N° 2 (2026)"
                className={inputClassName}
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-[#244f47]">
                DOI / Identificador{' '}
                <span className="font-normal text-[#78918a]">(opcional)</span>
              </span>
              <input
                type="text"
                value={doi}
                onChange={(e) => setDoi(e.target.value)}
                placeholder="Ej. 10.1234/hief.2026.001"
                className={inputClassName}
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-[#244f47]">
                Palabras clave{' '}
                <span className="font-normal text-[#78918a]">
                  (opcional, separadas por coma)
                </span>
              </span>
              <input
                type="text"
                value={keywordsInput}
                onChange={(e) => setKeywordsInput(e.target.value)}
                placeholder="Ej. Cardiología, Prevención, Formosa"
                className={inputClassName}
              />
            </label>

            {publishError && (
              <p
                role="alert"
                className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs text-rose-700"
              >
                {publishError}
              </p>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                disabled={isPublishing}
                onClick={() => setPublishingArticle(null)}
                className="h-10 rounded-xl border border-[#cfe4dc] bg-white px-4 text-xs font-semibold text-[#385f56] hover:bg-[#f2f7f4]"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isPublishing}
                className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-[#087d70] px-5 text-xs font-semibold text-white transition hover:bg-[#07584f] disabled:opacity-60"
              >
                {isPublishing ? (
                  <Loader2 className="animate-spin" size={14} />
                ) : (
                  <Globe size={14} />
                )}
                {isPublishing ? 'Publicando...' : 'Confirmar publicación'}
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Modal de retiro / despublicación */}
      <Modal
        isOpen={withdrawingArticle !== null}
        onClose={() => !isWithdrawing && setWithdrawingArticle(null)}
        title="Retirar publicación del portal"
      >
        {withdrawingArticle && (
          <form onSubmit={handleConfirmWithdraw} className="space-y-4">
            <div className="rounded-xl border border-rose-200 bg-rose-50/70 p-3.5 text-xs text-rose-900">
              <p className="font-semibold">{withdrawingArticle.title}</p>
              <p className="mt-1 leading-relaxed text-rose-700">
                El artículo dejará de estar visible y descargable en el Portal Público de inmediato. Sus versiones, dictámenes y metadatos se conservan en la base de datos y volverá a la cola de Aprobados.
              </p>
            </div>

            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-[#244f47]">
                Motivo del retiro (se notificará al autor) *
              </span>
              <textarea
                required
                rows={3}
                value={withdrawReason}
                onChange={(e) => setWithdrawReason(e.target.value)}
                placeholder="Ej. Solicitud de corrección editorial, verificación de datos o observación institucional..."
                className="w-full rounded-xl border border-[#bfdcd0] bg-white p-3 text-xs text-[#173d3b] outline-none focus:border-[#087d70]"
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-[#244f47]">
                Confirmá con tu contraseña actual *
              </span>
              <input
                required
                type="password"
                autoComplete="current-password"
                value={withdrawPassword}
                onChange={(e) => {
                  setWithdrawPassword(e.target.value);
                  setWithdrawError('');
                }}
                className={inputClassName}
              />
            </label>

            {withdrawError && (
              <p
                role="alert"
                className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs text-rose-700"
              >
                {withdrawError}
              </p>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                disabled={isWithdrawing}
                onClick={() => setWithdrawingArticle(null)}
                className="h-10 rounded-xl border border-[#cfe4dc] bg-white px-4 text-xs font-semibold text-[#385f56] hover:bg-[#f2f7f4]"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isWithdrawing || !withdrawPassword}
                className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-rose-600 px-5 text-xs font-semibold text-white transition hover:bg-rose-700 disabled:opacity-60"
              >
                {isWithdrawing ? (
                  <Loader2 className="animate-spin" size={14} />
                ) : (
                  <LockKeyhole size={14} />
                )}
                {isWithdrawing ? 'Retirando...' : 'Retirar del portal'}
              </button>
            </div>
          </form>
        )}
      </Modal>
>>>>>>> cdb5e53e838edcb56febd5aad3e51d1aa29df9d0
    </div>
  );
};

export default PanelEditor;
