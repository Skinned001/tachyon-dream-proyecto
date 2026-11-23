import {
  Bot,
  CheckCircle2,
  Clock,
  FileText,
  MessageSquare,
  Sparkles,
  XCircle,
} from 'lucide-react';
import {
  getArticuloPdfUrl,
  type AIReport,
  type ArticleState,
  type ArticleVersion,
  type ReviewVerdict,
} from '../../api/articulos.api';
import { formatDateTime } from '../../utils/formatDate';

const stateConfig: Record<
  ArticleState,
  { label: string; className: string }
> = {
  BORRADOR: {
    label: 'Borrador',
    className: 'bg-slate-100 text-slate-700',
  },
  PENDIENTE: {
    label: 'Pendiente DDI',
    className: 'bg-[#fff0cf] text-[#85500b]',
  },
  EN_REVISION: {
    label: 'En revisión (Comité)',
    className: 'bg-[#dcecf4] text-[#28677c]',
  },
  REVISION_MENOR: {
    label: 'Aprobado con correcciones',
    className: 'bg-amber-100 text-amber-900',
  },
  REVISION_MAYOR: {
    label: 'Requiere correcciones',
    className: 'bg-amber-100 text-amber-900',
  },
  PENDIENTE_DECISION: {
    label: 'Pendiente de decisión',
    className: 'bg-violet-100 text-violet-800',
  },
  APROBADO: {
    label: 'Aprobado para publicación',
    className: 'bg-[#d7f2e6] text-[#126443]',
  },
  ACEPTADO: {
    label: 'Aprobado para publicación',
    className: 'bg-[#d7f2e6] text-[#126443]',
  },
  RECHAZADO: {
    label: 'Rechazado',
    className: 'bg-rose-100 text-rose-800',
  },
  PUBLICADO: {
    label: 'Publicado',
    className: 'bg-[#087d70] text-white',
  },
};

const verdictConfig: Record<
  ReviewVerdict,
  { label: string; className: string }
> = {
  APROBAR: {
    label: 'Aprobado sin cambios',
    className: 'bg-[#d7f2e6] text-[#126443]',
  },
  APROBAR_CON_CORRECCIONES: {
    label: 'Aprobado con correcciones',
    className: 'bg-amber-100 text-amber-900',
  },
  RECHAZAR: {
    label: 'Rechazado',
    className: 'bg-rose-100 text-rose-800',
  },
};

export function ArticleStateBadge({ state }: { state: ArticleState }) {
  const config = stateConfig[state] ?? {
    label: state.replace(/_/g, ' '),
    className: 'bg-[#e5edf0] text-[#415e68]',
  };
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-[10px] font-semibold ${config.className}`}
    >
      {config.label}
    </span>
  );
}

export function VerdictBadge({ verdict }: { verdict: ReviewVerdict }) {
  const config = verdictConfig[verdict];
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold ${config.className}`}
    >
      {verdict === 'APROBAR' ? (
        <CheckCircle2 size={12} />
      ) : verdict === 'RECHAZAR' ? (
        <XCircle size={12} />
      ) : (
        <Clock size={12} />
      )}
      {config.label}
    </span>
  );
}

export function AiPreliminaryCard({
  report,
}: {
  report: AIReport | null | undefined;
}) {
  if (!report) {
    return (
      <div className="rounded-xl border border-dashed border-[#b9d8ca] bg-[#f5fbf8] p-4">
        <div className="flex items-center gap-2 text-[11px] font-semibold text-[#385f56]">
          <Bot size={15} className="text-[#087d70]" />
          Resumen preliminar de IA
        </div>
        <p className="mt-1.5 text-[11px] leading-5 text-[#58786f]">
          El informe asistido de verificación editorial todavía no fue generado para esta versión. Se mostrará aquí automáticamente cuando el servicio de IA lo procese.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[#b9e2d2] bg-[#f1faf6] p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-[11px] font-semibold text-[#07584f]">
          <Sparkles size={15} />
          Resumen preliminar de IA (apoyo editorial)
        </div>
        <span className="font-data text-[10px] text-[#52766d]">
          {formatDateTime(report.analyzedAt)}
        </span>
      </div>
      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        <div className="rounded-lg border border-[#d5e6df] bg-white px-3 py-2">
          <p className="text-[10px] text-[#58786f]">Checklist editorial</p>
          <p className="mt-0.5 text-xs font-semibold text-[#173d3b]">
            {report.checklistPassed ? 'Cumplida' : 'Con observaciones'}
          </p>
        </div>
        <div className="rounded-lg border border-[#d5e6df] bg-white px-3 py-2">
          <p className="text-[10px] text-[#58786f]">Similitud estimada</p>
          <p className="font-data mt-0.5 text-xs font-semibold text-[#173d3b]">
            {report.similarityScore}%
          </p>
        </div>
        <div className="rounded-lg border border-[#d5e6df] bg-white px-3 py-2">
          <p className="text-[10px] text-[#58786f]">Índice de coincidencia</p>
          <p className="font-data mt-0.5 text-xs font-semibold text-[#173d3b]">
            {report.plagiarismPercentage}%
          </p>
        </div>
      </div>
      {report.observations.length > 0 && (
        <ul className="mt-3 list-disc space-y-1 pl-5 text-[11px] leading-5 text-[#385f56]">
          {report.observations.map((obs, idx) => (
            <li key={idx}>{obs}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function VersionHistoryPanel({
  articleId,
  versions,
  showReviewerNames = false,
}: {
  articleId: number;
  versions: ArticleVersion[];
  showReviewerNames?: boolean;
}) {
  if (versions.length === 0) {
    return (
      <p className="text-xs text-[#58786f]">
        No hay versiones cargadas para este manuscrito.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {versions.map((version, idx) => {
        const isLatest = idx === 0;
        return (
          <div
            key={version.id}
            className={`rounded-xl border p-4 ${
              isLatest
                ? 'border-[#a7d5c3] bg-[#f7fcf9]'
                : 'border-[#dcebe5] bg-white'
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="font-data rounded-md bg-[#087d70] px-2 py-0.5 text-[10px] font-semibold text-white">
                  v{version.version_number}
                </span>
                {isLatest && (
                  <span className="rounded-full bg-[#d7f2e6] px-2 py-0.5 text-[10px] font-semibold text-[#07584f]">
                    Versión vigente
                  </span>
                )}
                <span className="text-[11px] text-[#58786f]">
                  {formatDateTime(version.createdAt)}
                </span>
              </div>
              {version.pdf_path && (
                <a
                  href={getArticuloPdfUrl(articleId, version.id)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[#b9d8ca] bg-white px-3 py-1.5 text-[11px] font-semibold text-[#087366] transition hover:bg-[#e7f4ee]"
                >
                  <FileText size={13} />
                  Ver PDF v{version.version_number}
                </a>
              )}
            </div>

            {version.version_number >= 2 && version.body_text && (
              <div className="mt-3 rounded-lg border border-[#dcebe5] bg-white p-3">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-[#52766d]">
                  Nota de corrección del autor
                </p>
                <p className="mt-1 whitespace-pre-line text-xs leading-relaxed text-[#244f47]">
                  {version.body_text}
                </p>
              </div>
            )}

            {version.reviews.length > 0 && (
              <div className="mt-3 space-y-2.5 border-t border-[#e3eee9] pt-3">
                <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-[#52766d]">
                  <MessageSquare size={12} />
                  Dictámenes del Comité ({version.reviews.length})
                </p>
                {version.reviews.map((review) => (
                  <div
                    key={review.id}
                    className="rounded-lg border border-[#dcebe5] bg-white p-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-[#173d3b]">
                        {showReviewerNames && review.reviewerName
                          ? `${review.reviewerLabel} (${review.reviewerName})`
                          : review.reviewerLabel}
                        {review.isOwnReview ? ' · Tu evaluación' : ''}
                      </span>
                      <VerdictBadge verdict={review.verdict} />
                    </div>
                    {review.observations.length > 0 && (
                      <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-[#244f47]">
                        {review.observations.map((obs, obsIdx) => (
                          <li key={obsIdx}>{obs}</li>
                        ))}
                      </ul>
                    )}
                    <p className="mt-2 whitespace-pre-line text-xs leading-relaxed text-[#45665f]">
                      {review.comments}
                    </p>
                    <p className="mt-2 text-[10px] text-[#78918a]">
                      {formatDateTime(review.createdAt)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
