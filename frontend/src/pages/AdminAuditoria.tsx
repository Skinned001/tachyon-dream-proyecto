import { useCallback, useEffect, useState } from 'react';
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Loader2,
  RefreshCw,
  Search,
  ShieldCheck,
  X,
} from 'lucide-react';
import {
  getAuditLogs,
  type AuditEntityType,
  type AuditLogItem,
} from '../api/auditoria.api';
import { CustomDatePicker } from '../components/ui/DatePicker';
import {
  formatDateTime,
  parseLocalDateValue,
  toLocalDateValue,
} from '../utils/formatDate';

const entityLabels: Record<AuditEntityType, string> = {
  ARTICULO: 'Manuscrito',
  CONVOCATORIA: 'Convocatoria',
  USUARIO: 'Usuario',
  RECURSO_BIBLIOTECA: 'Biblioteca',
  ESPECIALIDAD: 'Especialidades',
  REVISTA: 'Revista Oficial',
  PORTAL_NOVEDAD: 'Portada / Novedades',
};

const actionTone = (action: string): string => {
  if (
    action.includes('RECHAZADO') ||
    action.includes('RETIRADO') ||
    action.includes('SUSPENDIDO') ||
    action.includes('ELIMINADO') ||
    action.includes('FINALIZADA')
  ) {
    return 'bg-rose-50 text-rose-800 border-rose-200';
  }
  if (
    action.includes('PUBLICADO') ||
    action.includes('APROBADO') ||
    action.includes('APROBADA') ||
    action.includes('CREADA') ||
    action.includes('CREADO')
  ) {
    return 'bg-[#e1f3eb] text-[#07584f] border-[#b9e2d2]';
  }
  return 'bg-amber-50 text-amber-900 border-amber-200';
};

const formatActionLabel = (action: string): string =>
  action
    .toLowerCase()
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

export const AdminAuditoria = () => {
  const [items, setItems] = useState<AuditLogItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const limit = 20;

  const [entityType, setEntityType] = useState<AuditEntityType | ''>('');
  const [search, setSearch] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const result = await getAuditLogs({
        entityType,
        search,
        from,
        to,
        page,
        limit,
      });
      setItems(result.items);
      setTotal(result.total);
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudo cargar el registro de auditoría.',
      );
    } finally {
      setLoading(false);
    }
  }, [entityType, from, page, search, to]);

  useEffect(() => {
    void loadLogs();
  }, [loadLogs]);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  const clearFilters = () => {
    setEntityType('');
    setSearch('');
    setFrom('');
    setTo('');
    setPage(1);
  };

  const hasFilters = Boolean(entityType || search || from || to);

  return (
    <div className="space-y-7">
      <section className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[.17em] text-[#52766d]">
            <ShieldCheck size={14} className="text-[#087d70]" />
            Trazabilidad institucional
          </p>
          <h2 className="font-editorial mt-2 text-[32px] tracking-[-.03em] text-[#173d3b]">
            Auditoría del Sistema
          </h2>
          <p className="mt-1 text-[13px] text-[#526e68]">
            Historial inmutable de acciones críticas sobre manuscritos, convocatorias, usuarios, biblioteca y especialidades.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void loadLogs()}
          className="inline-flex h-10 items-center gap-1.5 self-start rounded-xl border border-[#cfe4dc] bg-[#fcfefd] px-3.5 text-xs font-semibold text-[#385f56] hover:bg-[#edf6f2] md:self-auto"
        >
          <RefreshCw size={14} /> Actualizar
        </button>
      </section>

      <section className="grid items-end gap-3 rounded-2xl border border-[#d5e6df] bg-[#fcfefd] p-4 sm:grid-cols-2 lg:grid-cols-[1.3fr_180px_185px_185px_auto]">
        <label className="relative block">
          <span className="sr-only">Buscar en auditoría</span>
          <Search
            size={15}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64877c]"
          />
          <input
            type="search"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Buscar por usuario, acción o detalle..."
            className="h-11 w-full rounded-xl border border-[#cfe4dc] bg-white pl-10 pr-3 text-xs text-[#173d3b] outline-none focus:border-[#087d70]"
          />
        </label>

        <select
          aria-label="Filtrar por módulo"
          value={entityType}
          onChange={(e) => {
            setEntityType(e.target.value as AuditEntityType | '');
            setPage(1);
          }}
          className="h-11 rounded-xl border border-[#cfe4dc] bg-white px-3 text-xs text-[#244f47] outline-none focus:border-[#087d70]"
        >
          <option value="">Todos los módulos</option>
          <option value="ARTICULO">Manuscritos</option>
          <option value="CONVOCATORIA">Convocatorias</option>
          <option value="USUARIO">Usuarios</option>
          <option value="RECURSO_BIBLIOTECA">Biblioteca</option>
          <option value="ESPECIALIDAD">Especialidades</option>
        </select>

        <label className="block">
          <span className="mb-1 block text-[10px] font-semibold uppercase tracking-[.08em] text-[#52766d]">
            Desde
          </span>
          <CustomDatePicker
            showTimeSelect={false}
            isClearable
            selected={parseLocalDateValue(from)}
            maxDateTime={parseLocalDateValue(to) ?? undefined}
            onChange={(date) => {
              setFrom(date ? toLocalDateValue(date) : '');
              setPage(1);
            }}
            placeholder="dd/mm/aaaa"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-[10px] font-semibold uppercase tracking-[.08em] text-[#52766d]">
            Hasta
          </span>
          <CustomDatePicker
            showTimeSelect={false}
            isClearable
            selected={parseLocalDateValue(to)}
            minDateTime={parseLocalDateValue(from) ?? undefined}
            onChange={(date) => {
              setTo(date ? toLocalDateValue(date) : '');
              setPage(1);
            }}
            placeholder="dd/mm/aaaa"
          />
        </label>

        {hasFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="inline-flex h-11 items-center justify-center gap-1 rounded-xl border border-[#cfe4dc] bg-white px-3 text-xs font-semibold text-[#52766d] hover:bg-[#f2f7f4]"
          >
            <X size={14} /> Limpiar
          </button>
        )}
      </section>

      {error && (
        <div
          role="alert"
          className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800"
        >
          {error}
        </div>
      )}

      <section className="overflow-hidden rounded-2xl border border-[#d5e6df] bg-[#fcfefd]">
        <div className="flex items-center justify-between border-b border-[#dcebe5] px-5 py-4 md:px-6">
          <p className="text-xs font-semibold text-[#244f47]">
            {total.toLocaleString('es-AR')} evento(s) registrado(s)
          </p>
          <p className="font-data text-[11px] text-[#58786f]">
            Página {page} de {totalPages}
          </p>
        </div>

        <div className="divide-y divide-[#e3eee9]">
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-16 text-sm text-[#52766d]">
              <Loader2 className="animate-spin" size={20} /> Cargando registros...
            </div>
          ) : items.length === 0 ? (
            <div className="py-16 text-center text-xs text-[#526e68]">
              No se encontraron eventos de auditoría con los filtros aplicados.
            </div>
          ) : (
            items.map((item) => {
              const isExpanded = expandedId === item.id;
              const hasDetails =
                item.details !== null && Object.keys(item.details).length > 0;

              return (
                <article
                  key={item.id}
                  className="px-5 py-4 transition hover:bg-[#f6fbf8] md:px-6"
                >
                  <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold ${actionTone(
                            item.action,
                          )}`}
                        >
                          {formatActionLabel(item.action)}
                        </span>
                        <span className="rounded-md bg-[#edf5f1] px-2 py-0.5 text-[10px] font-medium text-[#385f56]">
                          {entityLabels[item.entityType] ?? item.entityType}
                          {item.entityId !== null ? ` #${item.entityId}` : ''}
                        </span>
                        {item.actorRole && (
                          <span className="font-data text-[10px] font-semibold text-[#52766d]">
                            {item.actorRole}
                          </span>
                        )}
                      </div>

                      <p className="mt-2 text-[13px] font-medium text-[#173d3b]">
                        {item.summary}
                      </p>

                      <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-[#58786f]">
                        <span>{item.actorName ?? 'Sistema'}</span>
                        <span className="font-data">
                          {formatDateTime(item.createdAt)}
                        </span>
                      </div>
                    </div>

                    {hasDetails && (
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedId(isExpanded ? null : item.id)
                        }
                        className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-[#dcebe5] bg-white px-2.5 py-1.5 text-[11px] font-semibold text-[#385f56] hover:bg-[#edf6f2]"
                      >
                        Detalle
                        {isExpanded ? (
                          <ChevronUp size={13} />
                        ) : (
                          <ChevronDown size={13} />
                        )}
                      </button>
                    )}
                  </div>

                  {isExpanded && hasDetails && (
                    <pre className="font-data mt-3 overflow-x-auto rounded-xl border border-[#dcebe5] bg-[#f4f9f6] p-3 text-[11px] leading-relaxed text-[#244f47]">
                      {JSON.stringify(item.details, null, 2)}
                    </pre>
                  )}
                </article>
              );
            })
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-[#dcebe5] px-5 py-3.5 md:px-6">
            <button
              type="button"
              disabled={page <= 1 || loading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="inline-flex h-9 items-center gap-1 rounded-xl border border-[#cfe4dc] bg-white px-3 text-xs font-semibold text-[#385f56] hover:bg-[#edf6f2] disabled:opacity-45"
            >
              <ChevronLeft size={14} /> Anterior
            </button>
            <button
              type="button"
              disabled={page >= totalPages || loading}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="inline-flex h-9 items-center gap-1 rounded-xl border border-[#cfe4dc] bg-white px-3 text-xs font-semibold text-[#385f56] hover:bg-[#edf6f2] disabled:opacity-45"
            >
              Siguiente <ChevronRight size={14} />
            </button>
          </div>
        )}
      </section>
    </div>
  );
};

export default AdminAuditoria;
