import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  BarChart3,
  BookOpen,
  Clock,
  Download,
  Eye,
  Loader2,
  RefreshCw,
  TrendingUp,
} from 'lucide-react';
import {
  getMetricsOverview,
  type MetricsOverviewDTO,
  type MetricsPeriod,
} from '../api/metricas.api';

const periodLabels: Record<MetricsPeriod, string> = {
  '30d': 'Últimos 30 días',
  '90d': 'Últimos 90 días',
  all: 'Histórico completo',
};

const formatDays = (value: number | null): string =>
  value === null ? '—' : `${value} d`;

export const AdminMetricas = () => {
  const [period, setPeriod] = useState<MetricsPeriod>('30d');
  const [data, setData] = useState<MetricsOverviewDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadMetrics = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      setData(await getMetricsOverview(period));
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudieron cargar las métricas del sistema.',
      );
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    void loadMetrics();
  }, [loadMetrics]);

  const maxSpecialtyTotal = useMemo(() => {
    if (!data || data.bySpecialty.length === 0) return 1;
    return Math.max(
      1,
      ...data.bySpecialty.map((item) => item.visits + item.downloads),
    );
  }, [data]);

  const maxMonthlyCount = useMemo(() => {
    if (!data || data.editorial.monthlyTrend.length === 0) return 1;
    return Math.max(
      1,
      ...data.editorial.monthlyTrend.map((item) =>
        Math.max(item.submissions, item.publications),
      ),
    );
  }, [data]);

  return (
    <div className="space-y-7">
      <section className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[.17em] text-[#52766d]">
            <BarChart3 size={14} className="text-[#087d70]" />
            Analítica institucional
          </p>
          <h2 className="font-editorial mt-2 text-[32px] tracking-[-.03em] text-[#173d3b]">
            Métricas del Repositorio y Flujo Editorial
          </h2>
          <p className="mt-1 text-[13px] text-[#526e68]">
            Indicadores de uso público, descargas por especialidad y rendimiento del proceso de revisión.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="inline-flex rounded-xl border border-[#cfe4dc] bg-[#fcfefd] p-1">
            {(['30d', '90d', 'all'] as MetricsPeriod[]).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setPeriod(option)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  period === option
                    ? 'bg-[#087d70] text-white shadow-sm'
                    : 'text-[#385f56] hover:bg-[#edf6f2]'
                }`}
              >
                {periodLabels[option]}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => void loadMetrics()}
            disabled={loading}
            className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-[#cfe4dc] bg-[#fcfefd] px-3.5 text-xs font-semibold text-[#385f56] hover:bg-[#edf6f2] disabled:opacity-60"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Actualizar
          </button>
        </div>
      </section>

      {error && (
        <div
          role="alert"
          className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800"
        >
          {error}
        </div>
      )}

      {loading && !data ? (
        <div className="flex items-center justify-center gap-2 rounded-2xl border border-[#d5e6df] bg-[#fcfefd] py-20 text-sm text-[#52766d]">
          <Loader2 className="animate-spin" size={20} /> Cargando métricas...
        </div>
      ) : (
        data && (
          <>
            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <article className="rounded-2xl border border-[#d5e6df] bg-[#fcfefd] p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#526e68]">
                    Visitas al repositorio
                  </span>
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#d7f2e6] text-[#08745e]">
                    <Eye size={17} />
                  </span>
                </div>
                <p className="font-editorial mt-3 text-3xl text-[#173d3b]">
                  {data.summary.totalVisits.toLocaleString('es-AR')}
                </p>
                <p className="mt-1 text-xs text-[#52766d]">
                  {data.summary.uniqueVisitors.toLocaleString('es-AR')} visitantes únicos
                </p>
              </article>

              <article className="rounded-2xl border border-[#d5e6df] bg-[#fcfefd] p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#526e68]">
                    Descargas de PDF
                  </span>
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#dcecf4] text-[#28677c]">
                    <Download size={17} />
                  </span>
                </div>
                <p className="font-editorial mt-3 text-3xl text-[#173d3b]">
                  {data.summary.totalDownloads.toLocaleString('es-AR')}
                </p>
                <p className="mt-1 text-xs text-[#52766d]">
                  Artículos y manuales de biblioteca
                </p>
              </article>

              <article className="rounded-2xl border border-[#d5e6df] bg-[#fcfefd] p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#526e68]">
                    Artículos publicados
                  </span>
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#e6edc9] text-[#526d1c]">
                    <BookOpen size={17} />
                  </span>
                </div>
                <p className="font-editorial mt-3 text-3xl text-[#173d3b]">
                  {data.summary.totalPublishedArticles.toLocaleString('es-AR')}
                </p>
                <p className="mt-1 text-xs text-[#52766d]">
                  Tasa de aprobación:{' '}
                  {data.editorial.approvalRate !== null
                    ? `${data.editorial.approvalRate}%`
                    : 'Sin dictámenes aún'}
                </p>
              </article>

              <article className="rounded-2xl border border-[#d5e6df] bg-[#fcfefd] p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#526e68]">
                    Tiempo medio a publicación
                  </span>
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#fff0cf] text-[#985b08]">
                    <Clock size={17} />
                  </span>
                </div>
                <p className="font-editorial mt-3 text-3xl text-[#173d3b]">
                  {formatDays(data.editorial.avgDaysToPublish)}
                </p>
                <p className="mt-1 text-xs text-[#52766d]">
                  Primer dictamen: {formatDays(data.editorial.avgDaysToFirstReview)}
                </p>
              </article>
            </section>

            <section className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-2xl border border-[#d5e6df] bg-[#fcfefd] p-5 md:p-6">
                <div className="flex items-center justify-between border-b border-[#e3eee9] pb-3">
                  <h3 className="text-sm font-semibold text-[#173d3b]">
                    Actividad por especialidad
                  </h3>
                  <span className="text-[11px] text-[#52766d]">
                    Visitas y descargas
                  </span>
                </div>

                {data.bySpecialty.length === 0 ? (
                  <p className="py-10 text-center text-xs text-[#526e68]">
                    No hay especialidades activas registradas.
                  </p>
                ) : (
                  <div className="mt-4 space-y-4">
                    {data.bySpecialty.map((item) => {
                      const total = item.visits + item.downloads;
                      const widthPct = Math.round(
                        (total / maxSpecialtyTotal) * 100,
                      );
                      return (
                        <div key={item.specialtyId} className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-medium text-[#244f47]">
                              {item.specialtyName}
                            </span>
                            <span className="font-data text-[11px] text-[#52766d]">
                              {item.visits} visitas · {item.downloads} descargas
                            </span>
                          </div>
                          <div className="h-2 overflow-hidden rounded-full bg-[#e6f1ec]">
                            <div
                              className="h-full rounded-full bg-[#087d70] transition-all"
                              style={{ width: `${total === 0 ? 0 : Math.max(4, widthPct)}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="rounded-2xl border border-[#d5e6df] bg-[#fcfefd] p-5 md:p-6">
                <div className="flex items-center justify-between border-b border-[#e3eee9] pb-3">
                  <h3 className="text-sm font-semibold text-[#173d3b]">
                    Documentos más descargados
                  </h3>
                  <span className="text-[11px] text-[#52766d]">Top 5</span>
                </div>

                {data.topDownloaded.length === 0 ? (
                  <p className="py-10 text-center text-xs text-[#526e68]">
                    Aún no se registraron descargas en este período.
                  </p>
                ) : (
                  <ol className="mt-4 divide-y divide-[#e3eee9]">
                    {data.topDownloaded.map((item, index) => (
                      <li
                        key={`${item.entityType}-${item.entityId}`}
                        className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-data text-[11px] font-semibold text-[#087d70]">
                              #{index + 1}
                            </span>
                            <span className="rounded-full border border-[#cfe4dc] bg-[#f2f7f4] px-2 py-0.5 text-[10px] font-semibold text-[#244f47]">
                              {item.entityType === 'ARTICULO'
                                ? 'Artículo'
                                : 'Biblioteca'}
                            </span>
                            {item.specialtyName && (
                              <span className="truncate text-[11px] text-[#52766d]">
                                {item.specialtyName}
                              </span>
                            )}
                          </div>
                          <p className="mt-1 truncate text-xs font-semibold text-[#173d3b]">
                            {item.title}
                          </p>
                        </div>
                        <span className="shrink-0 rounded-xl bg-[#e1f3eb] px-2.5 py-1 font-data text-xs font-semibold text-[#07584f]">
                          {item.downloads}
                        </span>
                      </li>
                    ))}
                  </ol>
                )}
              </div>
            </section>

            <section className="rounded-2xl border border-[#d5e6df] bg-[#fcfefd] p-5 md:p-6">
              <div className="flex flex-col justify-between gap-3 border-b border-[#e3eee9] pb-4 sm:flex-row sm:items-center">
                <div className="flex items-center gap-2">
                  <TrendingUp size={16} className="text-[#087d70]" />
                  <h3 className="text-sm font-semibold text-[#173d3b]">
                    Salud del flujo editorial (últimos 6 meses)
                  </h3>
                </div>
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="rounded-full bg-[#f2f7f4] px-3 py-1 font-medium text-[#244f47]">
                    Envíos: <strong>{data.editorial.totalSubmissions}</strong>
                  </span>
                  <span className="rounded-full bg-[#e1f3eb] px-3 py-1 font-medium text-[#07584f]">
                    Aprobados/Pub.:{' '}
                    <strong>{data.editorial.approvedOrPublishedCount}</strong>
                  </span>
                  <span className="rounded-full bg-rose-50 px-3 py-1 font-medium text-rose-700">
                    Rechazados: <strong>{data.editorial.rejectedCount}</strong>
                  </span>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6">
                {data.editorial.monthlyTrend.map((point) => {
                  const subHeight = Math.round(
                    (point.submissions / maxMonthlyCount) * 100,
                  );
                  const pubHeight = Math.round(
                    (point.publications / maxMonthlyCount) * 100,
                  );
                  return (
                    <div
                      key={point.month}
                      className="flex flex-col items-center rounded-xl border border-[#e3eee9] bg-white p-3"
                    >
                      <div className="flex h-24 w-full items-end justify-center gap-2">
                        <div className="flex h-full flex-col items-center justify-end gap-1">
                          <span className="font-data text-[10px] text-[#52766d]">
                            {point.submissions}
                          </span>
                          <div
                            className="w-4 rounded-t bg-[#9bd4c1]"
                            style={{
                              height: `${point.submissions === 0 ? 4 : Math.max(10, subHeight)}%`,
                            }}
                            title={`Envíos: ${point.submissions}`}
                          />
                        </div>
                        <div className="flex h-full flex-col items-center justify-end gap-1">
                          <span className="font-data text-[10px] text-[#07584f]">
                            {point.publications}
                          </span>
                          <div
                            className="w-4 rounded-t bg-[#087d70]"
                            style={{
                              height: `${point.publications === 0 ? 4 : Math.max(10, pubHeight)}%`,
                            }}
                            title={`Publicaciones: ${point.publications}`}
                          />
                        </div>
                      </div>
                      <span className="mt-2 text-[11px] font-semibold capitalize text-[#244f47]">
                        {point.label}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 flex items-center justify-end gap-4 text-[11px] text-[#526e68]">
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-sm bg-[#9bd4c1]" />
                  Manuscritos enviados
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-sm bg-[#087d70]" />
                  Publicaciones
                </span>
              </div>
            </section>
          </>
        )
      )}
    </div>
  );
};
