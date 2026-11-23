import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  FileText,
  Inbox,
  Loader2,
  RefreshCw,
  Users,
  X,
  XCircle,
} from 'lucide-react';
import {
  asignarRevisoresComite,
  getArticulos,
  getRevisoresComite,
  rechazarManuscritoDdi,
  type Articulo,
  type ReviewerCandidate,
} from '../api/articulos.api';
import {
  AiPreliminaryCard,
  ArticleStateBadge,
  VersionHistoryPanel,
} from '../features/articulos/ArticleWorkflowMeta';

export const MesaEntradaDDI = () => {
  const [articulos, setArticulos] = useState<Articulo[]>([]);
  const [revisores, setRevisores] = useState<ReviewerCandidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [activeTab, setActiveTab] = useState<'pendientes' | 'seguimiento'>(
    'pendientes',
  );
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const [asignaciones, setAsignaciones] = useState<Record<number, number[]>>(
    {},
  );
  const [rejectingId, setRejectingId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const cargarBandeja = useCallback(async () => {
    try {
      setLoading(true);
      setLoadError('');
      const [articulosData, revisoresData] = await Promise.all([
        getArticulos(),
        getRevisoresComite(),
      ]);
      setArticulos(articulosData);
      setRevisores(revisoresData);
    } catch (err: unknown) {
      setLoadError(
        err instanceof Error
          ? err.message
          : 'No se pudo cargar la Mesa de Entrada.',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void cargarBandeja();
  }, [cargarBandeja]);

  const pendientes = useMemo(
    () => articulos.filter((item) => item.status === 'PENDIENTE'),
    [articulos],
  );

  const seguimiento = useMemo(
    () => articulos.filter((item) => item.status !== 'PENDIENTE'),
    [articulos],
  );

  const handleToggleRevisor = (articuloId: number, reviewerId: number) => {
    setAsignaciones((prev) => {
      const actuales = prev[articuloId] ?? [];
      if (actuales.includes(reviewerId)) {
        return {
          ...prev,
          [articuloId]: actuales.filter((id) => id !== reviewerId),
        };
      }
      if (actuales.length >= 3) {
        return prev;
      }
      return {
        ...prev,
        [articuloId]: [...actuales, reviewerId],
      };
    });
  };

  const handleAsignar = async (articuloId: number) => {
    const selectedIds = asignaciones[articuloId] ?? [];
    if (selectedIds.length !== 1 && selectedIds.length !== 3) {
      setFeedback({
        type: 'error',
        message:
          'Debés asignar exactamente 1 o 3 miembros del Comité Científico (número impar para votación por mayoría).',
      });
      return;
    }

    try {
      setProcessingId(articuloId);
      setFeedback(null);
      await asignarRevisoresComite(articuloId, selectedIds);
      setAsignaciones((prev) => {
        const next = { ...prev };
        delete next[articuloId];
        return next;
      });
      setFeedback({
        type: 'success',
        message: `Manuscrito derivado a ${selectedIds.length} miembro(s) del Comité Científico.`,
      });
      await cargarBandeja();
    } catch (err: unknown) {
      setFeedback({
        type: 'error',
        message:
          err instanceof Error
            ? err.message
            : 'No se pudo derivar el manuscrito.',
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleRechazar = async (articuloId: number) => {
    if (rejectReason.trim().length < 5) {
      setFeedback({
        type: 'error',
        message:
          'Ingresá una justificación de al menos 5 caracteres para rechazar el manuscrito.',
      });
      return;
    }

    try {
      setProcessingId(articuloId);
      setFeedback(null);
      await rechazarManuscritoDdi(articuloId, rejectReason.trim());
      setRejectingId(null);
      setRejectReason('');
      setFeedback({
        type: 'success',
        message: 'Manuscrito rechazado en Mesa de Entrada. Se notificó al autor.',
      });
      await cargarBandeja();
    } catch (err: unknown) {
      setFeedback({
        type: 'error',
        message:
          err instanceof Error
            ? err.message
            : 'No se pudo rechazar el manuscrito.',
      });
    } finally {
      setProcessingId(null);
    }
  };

  const visibleList = activeTab === 'pendientes' ? pendientes : seguimiento;

  return (
    <div className="space-y-8">
      <section className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[.17em] text-[#52766d]">
            Departamento de Docencia e Investigación (DDI)
          </p>
          <h2 className="font-editorial mt-2 text-[32px] tracking-[-.03em] text-[#173d3b]">
            Mesa de Entrada
          </h2>
          <p className="mt-1 text-[13px] text-[#526e68]">
            Evaluación inicial de pertinencia, rechazo fundamentado en escritorio o derivación a 1 o 3 revisores del Comité Científico.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex h-10 items-center gap-2 rounded-xl bg-[#e1f3eb] px-4 text-[12px] font-semibold text-[#087366]">
            <Inbox size={16} /> {pendientes.length} Pendiente(s)
          </div>
          <button
            type="button"
            onClick={() => void cargarBandeja()}
            className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-[#cfe4dc] bg-[#fcfefd] px-3.5 text-[12px] font-semibold text-[#385f56] hover:bg-[#edf6f2]"
          >
            <RefreshCw size={14} /> Actualizar
          </button>
        </div>
      </section>

      <div className="flex flex-wrap gap-2 border-b border-[#d5e6df] pb-3">
        <button
          type="button"
          onClick={() => setActiveTab('pendientes')}
          className={`rounded-xl px-4 py-2 text-xs font-semibold transition ${
            activeTab === 'pendientes'
              ? 'bg-[#087d70] text-white'
              : 'bg-[#e7f4ee] text-[#385f56] hover:bg-[#d5eee4]'
          }`}
        >
          Pendientes DDI ({pendientes.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('seguimiento')}
          className={`rounded-xl px-4 py-2 text-xs font-semibold transition ${
            activeTab === 'seguimiento'
              ? 'bg-[#087d70] text-white'
              : 'bg-[#e7f4ee] text-[#385f56] hover:bg-[#d5eee4]'
          }`}
        >
          Seguimiento Editorial ({seguimiento.length})
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
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="opacity-70 hover:opacity-100"
          >
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

      <section className="overflow-hidden rounded-2xl border border-[#d5e6df] bg-[#fcfefd]">
        <div className="divide-y divide-[#e3eee9]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-sm text-[#52766d]">
              <Loader2 className="mb-2 animate-spin" size={24} /> Cargando
              manuscritos...
            </div>
          ) : visibleList.length === 0 ? (
            <div className="py-16 text-center text-sm text-[#526e68]">
              {activeTab === 'pendientes'
                ? 'No hay manuscritos pendientes en Mesa de Entrada.'
                : 'Todavía no hay manuscritos derivados o resueltos.'}
            </div>
          ) : (
            visibleList.map((articulo) => {
              const selectedIds = asignaciones[articulo.id] ?? [];
              const isProcessing = processingId === articulo.id;
              const isRejecting = rejectingId === articulo.id;
              const isExpanded = expandedId === articulo.id;
              const validReviewerCount =
                selectedIds.length === 1 || selectedIds.length === 3;

              return (
                <article key={articulo.id} className="space-y-4 px-5 py-6 md:px-6">
                  <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <ArticleStateBadge state={articulo.status} />
                        <span className="font-data text-[10px] text-[#58786f]">
                          ID #{articulo.id} · v
                          {articulo.latestVersion?.version_number ?? 1}
                        </span>
                        {articulo.specialtyName && (
                          <span className="rounded-full bg-[#edf6f2] px-2.5 py-0.5 text-[10px] font-medium text-[#244f47]">
                            {articulo.specialtyName}
                          </span>
                        )}
                        {articulo.convocatoriaTitle && (
                          <span className="text-[11px] text-[#58786f]">
                            {articulo.convocatoriaTitle}
                          </span>
                        )}
                      </div>

                      <h3 className="mt-2.5 text-[16px] font-semibold text-[#173d3b]">
                        {articulo.title}
                      </h3>
                      <p className="mt-1.5 text-[12px] leading-relaxed text-[#526e68]">
                        {articulo.abstract}
                      </p>

                      <div className="mt-3 flex flex-wrap items-center gap-4 text-[11px] text-[#52766d]">
                        {articulo.authorName && (
                          <span>
                            <strong>Autor:</strong> {articulo.authorName}
                          </span>
                        )}
                        {articulo.coauthors.length > 0 && (
                          <span>
                            <strong>Co-autores:</strong>{' '}
                            {articulo.coauthors.join(', ')}
                          </span>
                        )}
                        <span>
                          <strong>Cargado:</strong>{' '}
                          {new Date(articulo.createdAt).toLocaleDateString(
                            'es-AR',
                          )}
                        </span>
                      </div>

                      <div className="mt-3 flex flex-wrap items-center gap-3">
                        {articulo.fileUrl && (
                          <a
                            href={articulo.fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-lg border border-[#b9d8ca] bg-white px-3 py-1.5 text-[11px] font-semibold text-[#087366] hover:bg-[#e7f4ee]"
                          >
                            <FileText size={13} /> Ver PDF
                          </a>
                        )}
                        {activeTab === 'seguimiento' && (
                          <button
                            type="button"
                            onClick={() =>
                              setExpandedId(isExpanded ? null : articulo.id)
                            }
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#244f47] hover:text-[#087d70]"
                          >
                            {isExpanded ? (
                              <>
                                Ocultar historial <ChevronUp size={14} />
                              </>
                            ) : (
                              <>
                                Ver versiones y dictámenes{' '}
                                <ChevronDown size={14} />
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {activeTab === 'pendientes' && (
                    <>
                      <AiPreliminaryCard
                        report={articulo.latestVersion?.ai_report}
                      />

                      <div className="grid gap-4 rounded-2xl border border-[#dcebe5] bg-[#f7fbf9] p-4 lg:grid-cols-[1fr_auto]">
                        <div>
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <p className="flex items-center gap-1.5 text-xs font-semibold text-[#173d3b]">
                              <Users size={15} className="text-[#087d70]" />
                              Asignar miembros del Comité Científico (1 o 3 jueces)
                            </p>
                            <span
                              className={`text-[11px] font-semibold ${
                                validReviewerCount
                                  ? 'text-[#087d70]'
                                  : 'text-amber-700'
                              }`}
                            >
                              {selectedIds.length} seleccionado(s)
                              {selectedIds.length === 2
                                ? ' · Seleccioná 1 más o quitá 1 (debe ser 1 o 3)'
                                : ''}
                            </span>
                          </div>

                          {revisores.length === 0 ? (
                            <p className="mt-2 text-xs text-amber-800">
                              No hay usuarios activos con rol COMITE disponibles.
                            </p>
                          ) : (
                            <div className="mt-3 flex flex-wrap gap-2">
                              {revisores.map((revisor) => {
                                const isSelected = selectedIds.includes(
                                  revisor.id,
                                );
                                const isDisabled =
                                  !isSelected && selectedIds.length >= 3;
                                return (
                                  <button
                                    key={revisor.id}
                                    type="button"
                                    disabled={isDisabled || isProcessing}
                                    onClick={() =>
                                      handleToggleRevisor(
                                        articulo.id,
                                        revisor.id,
                                      )
                                    }
                                    className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-medium transition ${
                                      isSelected
                                        ? 'border-[#087d70] bg-[#d7f2e6] text-[#07584f]'
                                        : 'border-[#cfe4dc] bg-white text-[#385f56] hover:border-[#82c4a9] disabled:opacity-45'
                                    }`}
                                  >
                                    <span>
                                      {revisor.first_name} {revisor.last_name}
                                    </span>
                                    {revisor.specialtyName && (
                                      <span className="text-[10px] opacity-75">
                                        · {revisor.specialtyName}
                                      </span>
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col justify-end gap-2 sm:flex-row lg:flex-col">
                          <button
                            type="button"
                            disabled={!validReviewerCount || isProcessing}
                            onClick={() => void handleAsignar(articulo.id)}
                            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#087d70] px-4 text-xs font-semibold text-white transition hover:bg-[#07584f] disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {isProcessing ? (
                              <Loader2 className="animate-spin" size={14} />
                            ) : (
                              <ArrowRight size={14} />
                            )}
                            Derivar al Comité
                          </button>

                          <button
                            type="button"
                            disabled={isProcessing}
                            onClick={() => {
                              setRejectingId(isRejecting ? null : articulo.id);
                              setRejectReason('');
                            }}
                            className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl border border-rose-300 bg-white px-4 text-xs font-semibold text-rose-700 transition hover:bg-rose-50 disabled:opacity-50"
                          >
                            <XCircle size={14} />
                            Rechazar en escritorio
                          </button>
                        </div>
                      </div>

                      {isRejecting && (
                        <div className="space-y-3 rounded-xl border border-rose-200 bg-rose-50/70 p-4">
                          <label className="block">
                            <span className="mb-1.5 block text-xs font-semibold text-rose-900">
                              Motivo del rechazo (se enviará al autor) *
                            </span>
                            <textarea
                              rows={3}
                              value={rejectReason}
                              onChange={(e) => setRejectReason(e.target.value)}
                              placeholder="Explicá las razones de pertinencia, formato o alcance por las cuales no pasa a evaluación del Comité..."
                              className="w-full rounded-xl border border-rose-200 bg-white p-3 text-xs text-[#173d3b] outline-none focus:border-rose-400"
                            />
                          </label>
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setRejectingId(null);
                                setRejectReason('');
                              }}
                              className="h-9 rounded-xl border border-rose-200 bg-white px-3.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                            >
                              Cancelar
                            </button>
                            <button
                              type="button"
                              disabled={
                                isProcessing || rejectReason.trim().length < 5
                              }
                              onClick={() => void handleRechazar(articulo.id)}
                              className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-rose-600 px-4 text-xs font-semibold text-white hover:bg-rose-700 disabled:opacity-50"
                            >
                              {isProcessing ? (
                                <Loader2 className="animate-spin" size={14} />
                              ) : (
                                <XCircle size={14} />
                              )}
                              Confirmar rechazo
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {activeTab === 'seguimiento' && (
                    <div className="space-y-3">
                      {articulo.assignments.length > 0 && (
                        <div className="flex flex-wrap items-center gap-2 text-xs text-[#385f56]">
                          <span className="font-semibold">Comité asignado:</span>
                          {articulo.assignments.map((assignment) => (
                            <span
                              key={assignment.id}
                              className="inline-flex items-center gap-1 rounded-full border border-[#cfe4dc] bg-[#f3faf6] px-2.5 py-1 text-[11px]"
                            >
                              {assignment.reviewerName ??
                                assignment.reviewerLabel}
                              {assignment.hasReviewedLatest ? (
                                <CheckCircle2
                                  size={12}
                                  className="text-[#087d70]"
                                />
                              ) : null}
                            </span>
                          ))}
                        </div>
                      )}
                      {articulo.rejectionReason && (
                        <p className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs text-rose-800">
                          <strong>Motivo rechazo DDI:</strong>{' '}
                          {articulo.rejectionReason}
                        </p>
                      )}
                      {isExpanded && (
                        <div className="border-t border-[#e3eee9] pt-4">
                          <VersionHistoryPanel
                            articleId={articulo.id}
                            versions={articulo.versions}
                            showReviewerNames
                          />
                        </div>
                      )}
                    </div>
                  )}
                </article>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
};

export default MesaEntradaDDI;
