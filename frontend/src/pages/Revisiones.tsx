import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  ListPlus,
  Loader2,
  MessageSquare,
  RefreshCw,
  Send,
  Trash2,
  X,
} from 'lucide-react';
import {
  emitirDictamenComite,
  getArticulos,
  type Articulo,
  type ReviewVerdict,
} from '../api/articulos.api';
import {
  AiPreliminaryCard,
  ArticleStateBadge,
  VersionHistoryPanel,
} from '../features/articulos/ArticleWorkflowMeta';

export const Revisiones = () => {
  const [articulos, setArticulos] = useState<Articulo[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [evaluando, setEvaluando] = useState<Articulo | null>(null);
  const [activeTab, setActiveTab] = useState<'pendientes' | 'historial'>(
    'pendientes',
  );

  // Formulario de dictamen
  const [verdict, setVerdict] = useState<ReviewVerdict | ''>('');
  const [comments, setComments] = useState('');
  const [observationInput, setObservationInput] = useState('');
  const [observations, setObservations] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [feedback, setFeedback] = useState('');

  const cargarBandeja = useCallback(async () => {
    try {
      setLoading(true);
      setLoadError('');
      setArticulos(await getArticulos());
    } catch (err: unknown) {
      setLoadError(
        err instanceof Error
          ? err.message
          : 'No se pudo cargar tu bandeja de evaluaciones.',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void cargarBandeja();
  }, [cargarBandeja]);

  const pendientes = useMemo(
    () =>
      articulos.filter(
        (item) =>
          item.status === 'EN_REVISION' &&
          item.currentUserAssignment !== undefined &&
          !item.currentUserAssignment.hasReviewedLatest,
      ),
    [articulos],
  );

  const historial = useMemo(
    () =>
      articulos.filter(
        (item) =>
          item.status !== 'EN_REVISION' ||
          item.currentUserAssignment === undefined ||
          item.currentUserAssignment.hasReviewedLatest,
      ),
    [articulos],
  );

  const openEvaluation = (articulo: Articulo) => {
    setEvaluando(articulo);
    setVerdict('');
    setComments('');
    setObservationInput('');
    setObservations([]);
    setFormError('');
    setFeedback('');
  };

  const handleAddObservation = () => {
    const trimmed = observationInput.trim();
    if (!trimmed) return;
    setObservations((prev) => [...prev, trimmed]);
    setObservationInput('');
  };

  const handleRemoveObservation = (index: number) => {
    setObservations((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!evaluando || !verdict) return;

    if (comments.trim().length < 5) {
      setFormError(
        'Debés justificar tu dictamen con al menos 5 caracteres.',
      );
      return;
    }

    try {
      setIsSubmitting(true);
      setFormError('');
      await emitirDictamenComite(evaluando.id, {
        verdict,
        comments: comments.trim(),
        observations,
      });
      setFeedback('Dictamen registrado correctamente.');
      window.dispatchEvent(new Event('notifications-updated'));
      await cargarBandeja();
      setEvaluando(null);
      setVerdict('');
      setComments('');
      setObservations([]);
    } catch (err: unknown) {
      setFormError(
        err instanceof Error
          ? err.message
          : 'No se pudo registrar el dictamen.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (evaluando) {
    const latestVersionNum = evaluando.latestVersion?.version_number ?? 1;
    const isCorrectionRound = latestVersionNum >= 2;
    const canVote =
      evaluando.status === 'EN_REVISION' &&
      evaluando.currentUserAssignment !== undefined &&
      !evaluando.currentUserAssignment.hasReviewedLatest;

    return (
      <div className="page-enter space-y-6">
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setEvaluando(null)}
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#52766d] transition hover:text-[#173d3b]"
          >
            <X size={16} /> Volver a mi bandeja de revisión
          </button>
          <ArticleStateBadge state={evaluando.status} />
        </div>

        <section className="space-y-6 rounded-2xl border border-[#d5e6df] bg-[#fcfefd] p-6 md:p-8">
          <div className="border-b border-[#e3eee9] pb-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-[#e1f3eb] px-2.5 py-1 text-[10px] font-semibold text-[#087366]">
                {isCorrectionRound
                  ? `VERIFICACIÓN DE CORRECCIONES · v${latestVersionNum}`
                  : 'EVALUACIÓN DEL COMITÉ · v1'}
              </span>
              {evaluando.specialtyName && (
                <span className="rounded-full bg-[#edf6f2] px-2.5 py-1 text-[10px] font-medium text-[#244f47]">
                  {evaluando.specialtyName}
                </span>
              )}
              {evaluando.convocatoriaTitle && (
                <span className="text-[11px] text-[#58786f]">
                  {evaluando.convocatoriaTitle}
                </span>
              )}
            </div>

            <h2 className="font-editorial mt-3 text-[26px] leading-tight text-[#173d3b]">
              {evaluando.title}
            </h2>
            <p className="mt-3 text-[13px] leading-relaxed text-[#526e68]">
              {evaluando.abstract}
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-[#52766d]">
              {evaluando.authorName && (
                <span>
                  <strong>Autor:</strong> {evaluando.authorName}
                </span>
              )}
              {evaluando.coauthors.length > 0 && (
                <span>
                  <strong>Co-autores:</strong> {evaluando.coauthors.join(', ')}
                </span>
              )}
              <span>
                <strong>Fecha de envío:</strong>{' '}
                {new Date(evaluando.createdAt).toLocaleDateString('es-AR')}
              </span>
            </div>

            {evaluando.fileUrl && (
              <a
                href={evaluando.fileUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#087d70] px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-[#07584f]"
              >
                <FileText size={15} /> Leer manuscrito vigente (PDF v
                {latestVersionNum})
              </a>
            )}
          </div>

          <AiPreliminaryCard report={evaluando.latestVersion?.ai_report} />

          <div>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#52766d]">
              Historial de versiones y dictámenes previos
            </h3>
            <VersionHistoryPanel
              articleId={evaluando.id}
              versions={evaluando.versions}
              showReviewerNames={false}
            />
          </div>

          {canVote ? (
            <form
              onSubmit={handleSubmit}
              className="space-y-5 border-t border-[#e3eee9] pt-6"
            >
              <div>
                <h3 className="text-base font-semibold text-[#173d3b]">
                  {isCorrectionRound
                    ? `Emitir resolución sobre corrección (v${latestVersionNum})`
                    : 'Emitir dictamen del Comité Científico'}
                </h3>
                <p className="mt-1 text-xs text-[#526e68]">
                  Tu evaluación se mostrará de forma anónima al autor como &quot;Revisor&quot;.
                </p>
              </div>

              <label className="block">
                <span className="mb-2 block text-xs font-semibold text-[#244f47]">
                  Resolución *
                </span>
                <select
                  required
                  value={verdict}
                  onChange={(e) =>
                    setVerdict(e.target.value as ReviewVerdict | '')
                  }
                  className="h-11 w-full max-w-md rounded-xl border border-[#bfdcd0] bg-white px-4 text-[13px] text-[#173d3b] outline-none transition focus:border-[#087d70] focus:ring-4 focus:ring-[#bce8d8]/70"
                >
                  <option value="" disabled>
                    Seleccione una resolución...
                  </option>
                  <option value="APROBAR">
                    {isCorrectionRound
                      ? 'Aprobar (correcciones resueltas, listo para publicación)'
                      : 'Aprobar sin cambios'}
                  </option>
                  <option value="APROBAR_CON_CORRECCIONES">
                    Aprobar con correcciones
                  </option>
                  <option value="RECHAZAR">Rechazar</option>
                </select>
              </label>

              <div>
                <span className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-[#244f47]">
                  <ListPlus size={15} />
                  Lista de observaciones / puntos a corregir (opcional)
                </span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={observationInput}
                    onChange={(e) => setObservationInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddObservation();
                      }
                    }}
                    placeholder="Ej. Aclarar tamaño muestral en la sección Metodología..."
                    className="h-10 flex-1 rounded-xl border border-[#bfdcd0] bg-white px-3.5 text-xs text-[#173d3b] outline-none focus:border-[#087d70]"
                  />
                  <button
                    type="button"
                    onClick={handleAddObservation}
                    className="h-10 rounded-xl border border-[#087d70] px-4 text-xs font-semibold text-[#087d70] transition hover:bg-[#e7f4ee]"
                  >
                    Agregar ítem
                  </button>
                </div>
                {observations.length > 0 && (
                  <ul className="mt-3 space-y-2">
                    {observations.map((obs, idx) => (
                      <li
                        key={idx}
                        className="flex items-center justify-between gap-2 rounded-lg border border-[#dcebe5] bg-[#f7fbf9] px-3 py-2 text-xs text-[#244f47]"
                      >
                        <span>
                          {idx + 1}. {obs}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveObservation(idx)}
                          className="text-rose-600 hover:text-rose-800"
                          aria-label="Quitar observación"
                        >
                          <Trash2 size={14} />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <label className="block">
                <span className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-[#244f47]">
                  <MessageSquare size={15} />
                  Justificación del dictamen *
                </span>
                <textarea
                  required
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  rows={5}
                  placeholder="Fundamentá tu decisión técnica sobre metodología, aportes, redacción o correcciones requeridas..."
                  className="w-full rounded-xl border border-[#bfdcd0] bg-white p-4 text-[13px] text-[#173d3b] outline-none transition focus:border-[#087d70] focus:ring-4 focus:ring-[#bce8d8]/70"
                />
              </label>

              {formError && (
                <p
                  role="alert"
                  className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-700"
                >
                  {formError}
                </p>
              )}

              <div className="flex justify-end border-t border-[#e3eee9] pt-5">
                <button
                  type="submit"
                  disabled={isSubmitting || !verdict}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#087d70] px-7 text-[13px] font-semibold text-white transition hover:bg-[#07584f] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <Loader2 className="animate-spin" size={16} />
                  ) : (
                    <Send size={16} />
                  )}
                  {isSubmitting ? 'Registrando...' : 'Enviar Dictamen'}
                </button>
              </div>
            </form>
          ) : (
            <div className="rounded-xl border border-[#cfe4dc] bg-[#f3faf6] p-4 text-xs text-[#244f47]">
              Ya emitiste tu dictamen para la versión vigente o el manuscrito no se encuentra en espera de evaluación.
            </div>
          )}
        </section>
      </div>
    );
  }

  const visibleList = activeTab === 'pendientes' ? pendientes : historial;

  return (
    <div className="space-y-8">
      <section className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[.17em] text-[#52766d]">
            Comité Científico
          </p>
          <h2 className="font-editorial mt-2 text-[32px] tracking-[-.03em] text-[#173d3b]">
            Panel de Revisión
          </h2>
          <p className="mt-1 text-[13px] text-[#526e68]">
            Manuscritos asignados por el DDI para tu evaluación técnica y verificación de versiones corregidas.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex h-10 items-center gap-2 rounded-xl bg-[#fff0cf] px-4 text-[12px] font-semibold text-[#85500b]">
            <ClipboardCheck size={16} /> {pendientes.length} Pendiente(s)
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
          Pendientes de tu dictamen ({pendientes.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('historial')}
          className={`rounded-xl px-4 py-2 text-xs font-semibold transition ${
            activeTab === 'historial'
              ? 'bg-[#087d70] text-white'
              : 'bg-[#e7f4ee] text-[#385f56] hover:bg-[#d5eee4]'
          }`}
        >
          Evaluados / Historial ({historial.length})
        </button>
      </div>

      {feedback && (
        <div
          role="status"
          className="flex items-center justify-between gap-2 rounded-xl border border-[#b9e2d2] bg-[#eff9f4] px-4 py-3 text-sm text-[#07584f]"
        >
          <span className="flex items-center gap-2">
            <CheckCircle2 size={16} /> {feedback}
          </span>
          <button type="button" onClick={() => setFeedback('')}>
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
              <Loader2 className="mb-2 animate-spin" size={24} /> Buscando
              asignaciones...
            </div>
          ) : visibleList.length > 0 ? (
            visibleList.map((articulo) => {
              const latestVersionNum =
                articulo.latestVersion?.version_number ?? 1;
              const isCorrectionRound = latestVersionNum >= 2;
              const canVote =
                articulo.status === 'EN_REVISION' &&
                articulo.currentUserAssignment !== undefined &&
                !articulo.currentUserAssignment.hasReviewedLatest;

              return (
                <article
                  key={articulo.id}
                  className="flex flex-col gap-4 px-5 py-6 transition hover:bg-[#f3faf6] md:flex-row md:items-center md:justify-between md:px-6"
                >
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <ArticleStateBadge state={articulo.status} />
                      <span className="font-data rounded-md bg-[#edf5f1] px-2 py-0.5 text-[10px] font-semibold text-[#385f56]">
                        v{latestVersionNum}
                      </span>
                      {isCorrectionRound && canVote && (
                        <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-semibold text-amber-900">
                          Corrección recibida
                        </span>
                      )}
                      {articulo.specialtyName && (
                        <span className="text-[11px] text-[#58786f]">
                          {articulo.specialtyName}
                        </span>
                      )}
                    </div>
                    <h4 className="text-[15px] font-semibold leading-snug text-[#173d3b]">
                      {articulo.title}
                    </h4>
                    <p className="mt-1 line-clamp-2 text-[12px] text-[#526e68]">
                      {articulo.abstract}
                    </p>
                    <p className="mt-2 text-[11px] text-[#58786f]">
                      Cargado el{' '}
                      {new Date(articulo.createdAt).toLocaleDateString('es-AR')}
                      {articulo.convocatoriaTitle
                        ? ` · ${articulo.convocatoriaTitle}`
                        : ''}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => openEvaluation(articulo)}
                    className={`shrink-0 rounded-xl px-5 py-2.5 text-xs font-semibold shadow-sm transition ${
                      canVote
                        ? 'bg-[#087d70] text-white hover:bg-[#07584f]'
                        : 'border border-[#bce8d8] bg-white text-[#087366] hover:bg-[#e1f3eb]'
                    }`}
                  >
                    {canVote ? 'Evaluar manuscrito' : 'Ver historial'}
                  </button>
                </article>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#f3faf6] text-[#52766d]">
                <AlertCircle size={24} />
              </div>
              <h4 className="text-[14px] font-semibold text-[#244f47]">
                {activeTab === 'pendientes'
                  ? 'No tenés evaluaciones pendientes'
                  : 'Todavía no hay historial de evaluaciones'}
              </h4>
              <p className="mt-1 text-[12px] text-[#526e68]">
                Cuando el DDI te asigne un manuscrito o un autor envíe una corrección aparecerá aquí.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Revisiones;
