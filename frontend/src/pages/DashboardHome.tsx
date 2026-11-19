import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  LoaderCircle,
  UsersRound,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  getDashboardSummary,
  type DashboardArticleState,
  type DashboardRecentArticle,
  type DashboardSummary,
} from '../api/dashboard.api';
import { useAuth } from '../context/AuthContext';

const stateLabels: Record<DashboardArticleState, string> = {
  BORRADOR: 'Borrador',
  PENDIENTE: 'Pendiente',
  EN_REVISION: 'En revisión',
  REVISION_MENOR: 'Revisión menor',
  REVISION_MAYOR: 'Revisión mayor',
  PENDIENTE_DECISION: 'Pendiente de decisión',
  APROBADO: 'Aprobado',
  ACEPTADO: 'Aceptado',
  RECHAZADO: 'Rechazado',
  PUBLICADO: 'Publicado',
};

const stateColors: Record<DashboardArticleState, string> = {
  BORRADOR: 'bg-slate-400',
  PENDIENTE: 'bg-amber-400',
  EN_REVISION: 'bg-blue-500',
  REVISION_MENOR: 'bg-cyan-500',
  REVISION_MAYOR: 'bg-indigo-500',
  PENDIENTE_DECISION: 'bg-violet-500',
  APROBADO: 'bg-teal-500',
  ACEPTADO: 'bg-emerald-500',
  RECHAZADO: 'bg-rose-500',
  PUBLICADO: 'bg-[#087d70]',
};

const formatDate = (value: string, withTime = false): string => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Fecha no disponible';
  return new Intl.DateTimeFormat(
    'es-AR',
    withTime
      ? { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }
      : { day: 'numeric', month: 'long', year: 'numeric' },
  ).format(date);
};

const getStatusTone = (state: DashboardArticleState): string => {
  if (state === 'PUBLICADO' || state === 'ACEPTADO') {
    return 'bg-[#e2f4ec] text-[#087366]';
  }
  if (state === 'RECHAZADO') return 'bg-rose-50 text-rose-700';
  if (state === 'BORRADOR') return 'bg-slate-100 text-slate-600';
  return 'bg-amber-50 text-amber-800';
};

const getRecentPath = (summary: DashboardSummary): string => {
  if (summary.role === 'REVISOR') return '/revisiones';
  if (summary.role === 'ADMIN' || summary.role === 'EDITOR' || summary.role === 'DDI') {
    return '/editor';
  }
  return '/mis-articulos';
};

const getRecentTitle = (summary: DashboardSummary): string =>
  summary.role === 'ADMIN' || summary.role === 'EDITOR' || summary.role === 'DDI'
    ? 'Producción científica reciente'
    : summary.role === 'REVISOR'
      ? 'Artículos asignados recientemente'
      : 'Mis manuscritos recientes';

const getKpis = (summary: DashboardSummary) => {
  if (summary.role === 'ADMIN' || summary.role === 'EDITOR' || summary.role === 'DDI') {
    return [
      {
        label: 'Convocatorias abiertas',
        value: summary.kpis.convocatoriasActivas,
        note: `${summary.kpis.convocatoriasProgramadas} programadas`,
        icon: CalendarDays,
        tint: 'bg-[#d7f2e6] text-[#08745e]',
      },
      {
        label: 'Artículos en revisión',
        value: summary.kpis.enRevision,
        note: `${summary.kpis.publicados} publicados`,
        icon: ClipboardCheck,
        tint: 'bg-[#fff0cf] text-[#985b08]',
      },
      {
        label: 'Recursos de Biblioteca',
        value: summary.kpis.recursosBiblioteca,
        note: 'Manuales y documentos',
        icon: BookOpen,
        tint: 'bg-[#dcecf4] text-[#28677c]',
      },
      {
        label: 'Usuarios',
        value: summary.kpis.usuariosTotal,
        note: `${summary.kpis.autoresCount} autores · ${summary.kpis.revisoresCount} revisores`,
        icon: UsersRound,
        tint: 'bg-[#e6edc9] text-[#526d1c]',
      },
    ];
  }

  if (summary.role === 'REVISOR') {
    return [
      {
        label: 'Pendientes de revisión',
        value: summary.kpis.pendientesRevision,
        note: 'Asignaciones sin dictamen',
        icon: ClipboardCheck,
        tint: 'bg-[#fff0cf] text-[#985b08]',
      },
      {
        label: 'Evaluados',
        value: summary.kpis.evaluados,
        note: 'Dictámenes completados',
        icon: CheckCircle2,
        tint: 'bg-[#d7f2e6] text-[#08745e]',
      },
      {
        label: 'Artículos publicados',
        value: summary.kpis.articulosPublicados,
        note: 'Disponibles en Biblioteca',
        icon: FileText,
        tint: 'bg-[#dcecf4] text-[#28677c]',
      },
      {
        label: 'Recursos de Biblioteca',
        value: summary.kpis.recursosBiblioteca,
        note: 'Manuales y documentos',
        icon: BookOpen,
        tint: 'bg-[#e6edc9] text-[#526d1c]',
      },
    ];
  }

  if (!('misManuscritos' in summary.kpis)) return [];

  return [
    {
      label: 'Mis manuscritos',
      value: summary.kpis.misManuscritos,
      note: 'Enviados al sistema',
      icon: FileText,
      tint: 'bg-[#d7f2e6] text-[#08745e]',
    },
    {
      label: 'En revisión',
      value: summary.kpis.enRevision,
      note: 'En evaluación editorial',
      icon: ClipboardCheck,
      tint: 'bg-[#fff0cf] text-[#985b08]',
    },
    {
      label: 'Publicados',
      value: summary.kpis.publicados,
      note: 'En Biblioteca',
      icon: BookOpen,
      tint: 'bg-[#dcecf4] text-[#28677c]',
    },
    {
      label: 'Convocatorias abiertas',
      value: summary.kpis.convocatoriasAbiertas,
      note: 'Disponibles para postular',
      icon: CalendarDays,
      tint: 'bg-[#e6edc9] text-[#526d1c]',
    },
  ];
};

const RecentArticle = ({ article }: { article: DashboardRecentArticle }) => (
  <article className="flex items-start justify-between gap-3 px-5 py-5 transition hover:bg-[#f1f9f5] md:px-6">
    <div className="min-w-0">
      <h4 className="max-w-[520px] text-[12px] font-semibold leading-5 text-[#244f47]">
        {article.title}
      </h4>
      <p className="mt-1.5 text-[10px] text-[#52766d]">
        {[article.autorNombre, article.convocatoriaTitle].filter(Boolean).join(' · ') ||
          'Sin datos adicionales'}
      </p>
      <p className="mt-3 text-[10px] text-[#58786f]">{formatDate(article.createdAt, true)}</p>
    </div>
    <span
      className={`mt-0.5 shrink-0 rounded-full px-2.5 py-1 text-[9px] font-semibold ${getStatusTone(article.estado)}`}
    >
      {stateLabels[article.estado]}
    </span>
  </article>
);

export const DashboardHome = () => {
  const { user } = useAuth();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  const today = useMemo(
    () =>
      new Intl.DateTimeFormat('es-AR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).format(new Date()),
    [],
  );

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');

    getDashboardSummary()
      .then((data) => {
        if (active) setSummary(data);
      })
      .catch((cause: unknown) => {
        if (active) {
          setError(cause instanceof Error ? cause.message : 'No se pudo cargar el Dashboard.');
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [reloadKey]);

  const isManager = summary?.role === 'ADMIN' || summary?.role === 'EDITOR';
  const kpis = summary ? getKpis(summary) : [];
  const distribution = summary?.role === 'ADMIN' || summary?.role === 'EDITOR'
    ? summary.distribucionEstados
    : [];
  const distributionTotal = distribution.reduce((total, item) => total + item.count, 0);

  return (
    <div className="space-y-8">
      <section className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[.17em] text-[#52766d]">
            {today}
          </p>
          <h2 className="font-editorial mt-2 text-[40px] leading-tight tracking-[-.035em] text-[#173d3b] md:text-[48px]">
            Buen día{user?.first_name ? `, ${user.first_name}` : ''}.
          </h2>
          <p className="mt-2 text-[13px] text-[#526e68]">
            Resumen de actividad del Hospital Interdistrital Evita.
          </p>
        </div>
        <Link
          className="inline-flex h-10 items-center gap-2 self-start rounded-xl border border-[#9bcfbb] bg-[#e2f4ec] px-4 text-[12px] font-semibold text-[#07584f] transition hover:border-[#087d70] hover:bg-[#c8ecdc] md:self-auto"
          to="/biblioteca"
        >
          Explorar biblioteca <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </section>

      {error && (
        <div
          role="alert"
          className="flex flex-col justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 sm:flex-row sm:items-center"
        >
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setReloadKey((value) => value + 1)}
            className="font-semibold underline underline-offset-2"
          >
            Reintentar
          </button>
        </div>
      )}

      <section aria-label="Indicadores" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {loading && !summary
          ? Array.from({ length: 4 }, (_, index) => (
              <article
                key={index}
                className="animate-pulse rounded-2xl border border-[#d5e6df] bg-white p-5"
              >
                <div className="h-3 w-28 rounded bg-[#e3eee9]" />
                <div className="mt-6 h-9 w-20 rounded bg-[#e3eee9]" />
                <div className="mt-3 h-3 w-36 rounded bg-[#edf4f0]" />
              </article>
            ))
          : kpis.map(({ label, value, note, icon: Icon, tint }) => (
              <article
                key={label}
                className="rounded-2xl border border-[#d5e6df] bg-white p-5"
              >
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-medium text-[#42685e]">{label}</p>
                  <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${tint}`}>
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                </div>
                <div className="mt-4 flex min-h-12 flex-wrap items-end justify-between gap-x-2 gap-y-1">
                  <p className="font-editorial text-[37px] leading-none text-[#173d3b]">
                    {value.toLocaleString('es-AR')}
                  </p>
                  <p className="pb-1 text-[10px] text-[#58786f]">{note}</p>
                </div>
              </article>
            ))}
      </section>

      {(summary?.role === 'ADMIN' || summary?.role === 'EDITOR') && (
        <section className="rounded-2xl border border-[#d5e6df] bg-white p-5 md:p-6">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
            <div>
              <h3 className="text-[14px] font-semibold text-[#244f47]">
                Distribución de artículos
              </h3>
              <p className="mt-1 text-[11px] text-[#58786f]">
                {distributionTotal.toLocaleString('es-AR')} artículos en total
              </p>
            </div>
          </div>
          {distributionTotal > 0 ? (
            <>
              <div
                className="flex h-3 overflow-hidden rounded-full bg-[#edf4f0]"
                role="img"
                aria-label="Distribución de artículos por estado"
              >
                {distribution
                  .filter((item) => item.count > 0)
                  .map((item) => (
                    <span
                      key={item.estado}
                      className={`${stateColors[item.estado]} first:rounded-l-full last:rounded-r-full`}
                      style={{ flexGrow: item.count, flexBasis: 0 }}
                      title={`${stateLabels[item.estado]}: ${item.count}`}
                    />
                  ))}
              </div>
              <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
                {distribution
                  .filter((item) => item.count > 0)
                  .map((item) => (
                    <li
                      key={item.estado}
                      className="flex items-center gap-1.5 text-[10px] text-[#526e68]"
                    >
                      <span className={`h-2 w-2 rounded-full ${stateColors[item.estado]}`} />
                      {stateLabels[item.estado]} ({item.count})
                    </li>
                  ))}
              </ul>
            </>
          ) : (
            <p className="rounded-xl bg-[#f3faf6] px-4 py-5 text-center text-[12px] text-[#58786f]">
              Todavía no hay artículos para mostrar.
            </p>
          )}
        </section>
      )}

      {loading && !summary ? (
        <div role="status" className="flex items-center justify-center gap-2 py-8 text-sm text-[#52766d]">
          <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
          Cargando resumen...
        </div>
      ) : summary ? (
        <section className="grid gap-5 xl:grid-cols-[1.65fr_1fr]">
          <div className="overflow-hidden rounded-2xl border border-[#d5e6df] bg-white">
            <div className="flex items-center justify-between border-b border-[#dcebe5] px-5 py-5 md:px-6">
              <div>
                <h3 className="text-[14px] font-semibold text-[#244f47]">
                  {getRecentTitle(summary)}
                </h3>
                <p className="mt-1 text-[11px] text-[#58786f]">
                  Últimos registros del sistema
                </p>
              </div>
              <Link
                className="inline-flex items-center rounded-lg px-2 py-1.5 text-[11px] font-semibold text-[#087366] hover:bg-[#e2f4ec]"
                to={getRecentPath(summary)}
              >
                Ver todos <ArrowUpRight className="ml-1 h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
            {summary.recientes.length > 0 ? (
              <div className="divide-y divide-[#e3eee9]">
                {summary.recientes.map((article) => (
                  <RecentArticle key={article.id} article={article} />
                ))}
              </div>
            ) : (
              <p className="px-5 py-10 text-center text-[12px] text-[#58786f]">
                Todavía no hay actividad para mostrar.
              </p>
            )}
          </div>

          <aside>
            <div className="h-full overflow-hidden rounded-2xl bg-[#087366] p-6 text-[#f3fffa]">
              <div className="flex items-center justify-between">
                <span className="rounded-md border border-[#b3e8d3]/40 bg-[#e9fff5]/15 px-2 py-1 text-[9px] font-semibold uppercase tracking-[.13em] text-[#d0f2e3]">
                  Convocatorias
                </span>
                <CalendarDays className="h-5 w-5 text-[#c0f2df]" aria-hidden="true" />
              </div>
              <h3 className="font-editorial mt-5 text-[24px] leading-tight">
                Convocatorias abiertas
              </h3>

              {summary.convocatoriasAbiertasList.length > 0 ? (
                <ul className="mt-4 divide-y divide-[#b3e8d3]/25">
                  {summary.convocatoriasAbiertasList.map((convocation) => (
                    <li key={convocation.id} className="py-3 first:pt-0 last:pb-0">
                      <p className="text-[12px] font-semibold leading-5">{convocation.title}</p>
                      <p className="mt-1 flex items-center gap-1.5 text-[10px] text-[#d0f2e3]">
                        <CalendarDays className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                        Cierra el {formatDate(convocation.fechaFin, true)}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-4 rounded-xl bg-[#e9fff5]/10 px-4 py-4 text-[11px] leading-5 text-[#e0f4eb]">
                  No hay convocatorias abiertas en este momento.
                </p>
              )}

              <div className="mt-5 border-t border-[#b3e8d3]/35 pt-4">
                {isManager ? (
                  <Link
                    to="/convocatorias"
                    className="inline-flex min-h-9 items-center justify-center rounded-lg bg-[#d7f2e6] px-4 text-[11px] font-semibold text-[#07584f] transition hover:bg-[#f3fffa]"
                  >
                    Gestionar convocatorias
                  </Link>
                ) : summary.role === 'REVISOR' ? (
                  <Link
                    to="/revisiones"
                    className="inline-flex min-h-9 items-center justify-center rounded-lg bg-[#d7f2e6] px-4 text-[11px] font-semibold text-[#07584f] transition hover:bg-[#f3fffa]"
                  >
                    Ver bandeja de revisión
                  </Link>
                ) : summary.role === 'AUTOR' &&
                  summary.convocatoriasAbiertasList[0] ? (
                  <Link
                    to={`/mis-articulos?convocatoriaId=${summary.convocatoriasAbiertasList[0].id}`}
                    className="inline-flex min-h-9 items-center justify-center rounded-lg bg-[#d7f2e6] px-4 text-[11px] font-semibold text-[#07584f] transition hover:bg-[#f3fffa]"
                  >
                    Postular manuscrito
                  </Link>
                ) : summary.role === 'AUTOR' ? (
                  <Link
                    to="/mis-articulos"
                    className="inline-flex min-h-9 items-center justify-center rounded-lg bg-[#d7f2e6] px-4 text-[11px] font-semibold text-[#07584f] transition hover:bg-[#f3fffa]"
                  >
                    Ver mis manuscritos
                  </Link>
                ) : (
                  <Link
                    to="/"
                    className="inline-flex min-h-9 items-center justify-center rounded-lg bg-[#d7f2e6] px-4 text-[11px] font-semibold text-[#07584f] transition hover:bg-[#f3fffa]"
                  >
                    Ver convocatorias
                  </Link>
                )}
              </div>
            </div>
          </aside>
        </section>
      ) : null}
    </div>
  );
};

export default DashboardHome;
