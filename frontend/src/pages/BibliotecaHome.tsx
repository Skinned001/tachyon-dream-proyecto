import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowDownToLine, BookMarked, BookOpen, Eye, FileText, Filter, Search, SlidersHorizontal, X } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import {
  getFavoriteKey,
  getFavoritosBiblioteca,
  getRecursosBiblioteca,
  readGuestFavorites,
  toggleFavoritoBiblioteca,
  writeGuestFavorites,
  type FavoriteTargetType,
  type RecursoBiblioteca,
} from '../api/biblioteca.api';
import { getConvocatoriasPublicas } from '../api/convocatorias.api';
import {
  trackBibliotecaVisit,
  trackDocumentDownload,
  trackDocumentView,
} from '../api/metricas.api';
import { useAuth } from '../context/AuthContext';

const FAVORITES_FILTER = '__GUARDADOS__';

const categoryLabels: Record<string, string> = {
  MANUAL: 'Manual',
  PROTOCOLO: 'Protocolo',
  GUIA: 'Guía clínica',
  NORMATIVA: 'Normativa',
  OTRO: 'Otro',
};

const getCategoryLabel = (value: string): string =>
  categoryLabels[value] ?? value;

const extractDownloadFileName = (
  disposition: string | null,
): string | null => {
  if (!disposition) return null;
  const utf8Match = /filename\*=UTF-8''([^;]+)/i.exec(disposition);
  if (utf8Match?.[1]) {
    try {
      return decodeURIComponent(utf8Match[1]).trim();
    } catch {
      // Fallback to quoted filename below
    }
  }
  const asciiMatch = /filename="?([^";]+)"?/i.exec(disposition);
  return asciiMatch?.[1]?.trim() || null;
};

const sanitizePdfDownloadName = (candidate: string): string => {
  const cleaned = candidate.replace(/[\\/:*?"<>|]+/g, '_').trim();
  const base = cleaned || 'documento.pdf';
  return base.toLowerCase().endsWith('.pdf') ? base : `${base}.pdf`;
};

export const BibliotecaHome = () => {
  const { isAuthenticated } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [recursos, setRecursos] = useState<RecursoBiblioteca[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [downloadingKey, setDownloadingKey] = useState<string | null>(null);

  useEffect(() => {
    void trackBibliotecaVisit();
  }, []);

  const handleDownload = async (resource: RecursoBiblioteca) => {
    if (!resource.archivoUrl) return;
    const key = `${resource.source}-${resource.id}`;
    setDownloadingKey(key);
    try {
      const response = await fetch(resource.archivoUrl, {
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('No se pudo descargar el archivo.');
      }
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const preferredName =
        extractDownloadFileName(response.headers.get('Content-Disposition')) ||
        resource.nombreArchivo ||
        resource.titulo ||
        `documento-${resource.id}`;
      link.href = objectUrl;
      link.download = sanitizePdfDownloadName(preferredName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(objectUrl);

      trackDocumentDownload(
        resource.source === 'articulo' ? 'ARTICULO' : 'RECURSO_BIBLIOTECA',
        resource.id,
      );
    } catch {
      window.open(resource.archivoUrl, '_blank', 'noreferrer');
    } finally {
      setDownloadingKey(null);
    }
  };
  const [category, setCategory] = useState(() =>
    searchParams.get('guardados') === '1'
      ? FAVORITES_FILTER
      : 'Todos los recursos',
  );
  const [savedKeys, setSavedKeys] = useState<string[]>([]);
  const [notice, setNotice] = useState('');
  const [loadError, setLoadError] = useState('');
  const [activeConvocationTitle, setActiveConvocationTitle] = useState('');
  const [reloadCounter, setReloadCounter] = useState(0);

  const searchInput = useRef<HTMLInputElement>(null);
  const convocatoriaIdParam = searchParams.get('convocatoriaId');
  const convocatoriaId =
    convocatoriaIdParam !== null ? Number(convocatoriaIdParam) : undefined;
  const invalidConvocatoriaId =
    convocatoriaIdParam !== null &&
    (!Number.isSafeInteger(convocatoriaId) || (convocatoriaId ?? 0) < 1);

  useEffect(() => {
    if (searchParams.get('focus') === 'search') {
      searchInput.current?.focus();
      const nextParams = new URLSearchParams(searchParams);
      nextParams.delete('focus');
      setSearchParams(nextParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    let isCurrent = true;

    const cargarRecursos = async () => {
      setLoading(true);
      setLoadError('');
      setActiveConvocationTitle('');

      if (invalidConvocatoriaId) {
        setRecursos([]);
        setLoadError('El identificador de convocatoria no es válido.');
        setLoading(false);
        return;
      }

      try {
        const [resources, publicConvocatorias] = await Promise.all([
          getRecursosBiblioteca(convocatoriaId),
          convocatoriaId !== undefined
            ? getConvocatoriasPublicas()
            : Promise.resolve(null),
        ]);
        if (!isCurrent) return;

        setRecursos(Array.isArray(resources) ? resources : []);
        if (convocatoriaId !== undefined && publicConvocatorias) {
          const todas = [
            ...(publicConvocatorias.abiertas ?? []),
            ...(publicConvocatorias.proximas ?? []),
            ...(publicConvocatorias.cerradas ?? []),
          ];
          setActiveConvocationTitle(
            todas.find((item) => item.id === convocatoriaId)?.title ?? '',
          );
        }
      } catch (error) {
        if (!isCurrent) return;
        setRecursos([]);
        setLoadError(
          error instanceof Error
            ? error.message
            : 'No se pudo cargar la biblioteca.',
        );
      } finally {
        if (isCurrent) setLoading(false);
      }
    };

    void cargarRecursos();
    return () => {
      isCurrent = false;
    };
  }, [convocatoriaId, convocatoriaIdParam, invalidConvocatoriaId, reloadCounter]);

  const tiposDisponibles = useMemo(() => {
    const uniqueTypes = Array.from(
      new Set(
        recursos
          .map((resource) => resource.tipo?.trim())
          .filter((value): value is string => Boolean(value)),
      ),
    );
    return ['Todos los recursos', ...uniqueTypes];
  }, [recursos]);

  useEffect(() => {
    if (searchParams.get('guardados') === '1') {
      setCategory(FAVORITES_FILTER);
    }
  }, [searchParams]);

  useEffect(() => {
    let isCurrent = true;
    if (!isAuthenticated) {
      setSavedKeys(readGuestFavorites());
      return;
    }

    getFavoritosBiblioteca()
      .then((items) => {
        if (isCurrent) {
          setSavedKeys(
            items.map((item) => getFavoriteKey(item.targetType, item.targetId)),
          );
        }
      })
      .catch(() => {
        if (isCurrent) setSavedKeys([]);
      });

    return () => {
      isCurrent = false;
    };
  }, [isAuthenticated]);

  const toTargetType = (source: RecursoBiblioteca['source']): FavoriteTargetType =>
    source === 'articulo' ? 'ARTICULO' : 'RECURSO';

  const savedCountInView = useMemo(
    () =>
      recursos.filter((resource) =>
        savedKeys.includes(
          getFavoriteKey(toTargetType(resource.source), resource.id),
        ),
      ).length,
    [recursos, savedKeys],
  );

  const visibleResources = useMemo(() => recursos.filter(resource => {
    // Protección contra valores nulos en la búsqueda
    const titulo = resource.titulo || '';
    const descripcion = resource.descripcion || '';
    const area = resource.area || '';
    const tipo = resource.tipo || '';
    const autor = resource.autor || '';
    const favKey = getFavoriteKey(toTargetType(resource.source), resource.id);

    const textToSearch = `${titulo} ${descripcion} ${area} ${tipo} ${autor}`.toLowerCase();
    const matchesQuery = textToSearch.includes(query.toLowerCase());
    const matchesType =
      category === 'Todos los recursos' ||
      (category === FAVORITES_FILTER
        ? savedKeys.includes(favKey)
        : tipo === category);
    return matchesQuery && matchesType;
  }), [query, category, recursos, savedKeys]);

  async function toggleSaved(resource: RecursoBiblioteca) {
    const targetType = toTargetType(resource.source);
    const key = getFavoriteKey(targetType, resource.id);
    const wasSaved = savedKeys.includes(key);
    const optimistic = wasSaved
      ? savedKeys.filter((item) => item !== key)
      : [...savedKeys, key];

    setSavedKeys(optimistic);

    if (!isAuthenticated) {
      writeGuestFavorites(optimistic);
      setNotice(
        wasSaved
          ? 'Se quitó de tus guardados locales.'
          : 'Se agregó a tus guardados locales.',
      );
      window.setTimeout(() => setNotice(''), 2600);
      return;
    }

    try {
      const result = await toggleFavoritoBiblioteca(targetType, resource.id);
      setNotice(
        result.saved
          ? 'Se agregó a tus favoritos.'
          : 'Se quitó de tus favoritos.',
      );
      window.setTimeout(() => setNotice(''), 2600);
    } catch {
      setSavedKeys(savedKeys);
      setNotice('No se pudo actualizar tus guardados.');
      window.setTimeout(() => setNotice(''), 2600);
    }
  }

  const getVisualProps = (titulo: string | undefined, index: number) => {
    const colors = ['sage', 'sand', 'blue', 'rose'];
    const color = colors[index % colors.length];
    // Fallback: si el título viene vacío de la base de datos, usamos 'SA' (Sin Asignar)
    const safeTitulo = titulo || 'SA';
    const initials = safeTitulo.substring(0, 2).toUpperCase();
    return { color, initials };
  };

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-[22px] bg-[#087366] px-6 py-8 text-[#f3fffa] md:px-9 md:py-10">
        <div className="absolute -right-12 -top-28 h-[380px] w-[380px] rounded-full border border-[#b3e8d3]/30" />
        <div className="absolute -right-1 -top-16 h-[250px] w-[250px] rounded-full border border-[#b3e8d3]/35" />
        <div className="relative max-w-[610px]">
          <p className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[.18em] text-[#d0f2e3]"><BookOpen size={14} /> Colección de conocimiento</p>
          <h2 className="font-editorial mt-4 text-[39px] leading-[1.02] tracking-[-.03em] md:text-[47px]">Una biblioteca para<br />mejores preguntas.</h2>
          <p className="mt-4 max-w-[460px] text-[12px] leading-6 text-[#e0f4eb]">Métodos confiables, herramientas prácticas y lecturas para la comunidad de investigación del HIEF.</p>
        </div>
      </section>

      {convocatoriaId !== undefined && !invalidConvocatoriaId && (
        <section
          aria-live="polite"
          className="flex flex-col justify-between gap-3 rounded-2xl border border-[#9bcfbb] bg-[#f3fffa] p-4 sm:flex-row sm:items-center"
        >
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[.15em] text-[#52766d]">
              Filtro de convocatoria
            </p>
            <p className="mt-1 text-sm font-semibold text-[#244f47]">
              {activeConvocationTitle || `Convocatoria #${convocatoriaId}`}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              const nextParams = new URLSearchParams(searchParams);
              nextParams.delete('convocatoriaId');
              setSearchParams(nextParams);
            }}
            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-[#087d70]/30 px-3 text-[11px] font-semibold text-[#087d70] transition hover:bg-[#e1f3eb]"
          >
            <X size={13} />
            Ver todos los artículos
          </button>
        </section>
      )}

      <section className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[.17em] text-[#52766d]">Biblioteca virtual</p>
          <h3 className="font-editorial mt-2 text-[32px] tracking-[-.03em] text-[#173d3b]">Encuentra recursos para tu trabajo.</h3>
        </div>
        <div className="relative w-full md:max-w-[330px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#52766d]" size={16} />
          <input ref={searchInput} type="search" placeholder="Buscar recursos..." value={query} onChange={e => setQuery(e.target.value)} className="h-11 w-full rounded-xl border border-[#bfdcd0] bg-[#fcfefd] pl-10 pr-10 text-[12px] text-[#173d3b] outline-none focus:border-[#087d70] focus:ring-4 focus:ring-[#bce8d8]" />
          {query && <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#52766d]"><X size={15} /></button>}
        </div>
      </section>

      <section className="grid gap-7 lg:grid-cols-[190px_1fr]">
        <aside className="space-y-5">
          <div className="flex items-center gap-2 text-[11px] font-semibold text-[#244f47]"><SlidersHorizontal size={15} /> Filtrar colección</div>
          <div>
            <p className="mb-2 text-[9px] font-semibold uppercase tracking-[.14em] text-[#58786f]">Tipo de recurso</p>
            <div className="scrollbar-subtle flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible">
              <button
                type="button"
                onClick={() => {
                  setCategory(FAVORITES_FILTER);
                  const next = new URLSearchParams(searchParams);
                  next.set('guardados', '1');
                  setSearchParams(next, { replace: true });
                }}
                className={`flex shrink-0 items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-[11px] transition ${
                  category === FAVORITES_FILTER
                    ? 'bg-[#bce8d8] font-semibold text-[#07584f] shadow-[inset_3px_0_0_#087d70]'
                    : 'text-[#45665f] hover:bg-[#dff2e9]'
                }`}
              >
                <span className="inline-flex items-center gap-1.5">
                  <BookMarked size={13} />
                  Mis guardados
                </span>
                <span className="font-data rounded-full bg-white/80 px-1.5 py-0.5 text-[10px]">
                  {savedCountInView}
                </span>
              </button>
              {tiposDisponibles.map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => {
                    setCategory(type);
                    if (searchParams.has('guardados')) {
                      const next = new URLSearchParams(searchParams);
                      next.delete('guardados');
                      setSearchParams(next, { replace: true });
                    }
                  }}
                  className={`shrink-0 rounded-lg px-3 py-2 text-left text-[11px] transition ${category === type ? 'bg-[#bce8d8] font-semibold text-[#07584f] shadow-[inset_3px_0_0_#087d70]' : 'text-[#45665f] hover:bg-[#dff2e9]'}`}
                >
                  {type === 'Todos los recursos' ? type : getCategoryLabel(type)}
                </button>
              ))}
            </div>
          </div>
          <div className="hidden rounded-xl border border-[#d5e6df] bg-[#fcfefd] p-4 lg:block">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#d7f2e6] text-[#087366]"><Filter size={15} /></div>
            <p className="mt-3 text-[11px] font-semibold text-[#244f47]">Conexión en vivo</p>
            <p className="mt-1 text-[10px] leading-4 text-[#526e68]">Mostrando recursos institucionales y publicaciones.</p>
          </div>
        </aside>

        <div>
          <div className="mb-4 flex items-center justify-between">
            <p className="text-[11px] text-[#526e68]">Se muestran <span className="font-semibold text-[#244f47]">{loading ? '...' : visibleResources.length}</span> recursos</p>
            <button onClick={() => { setCategory('Todos los recursos'); setQuery(''); }} className="flex items-center gap-1.5 text-[10px] font-medium text-[#45665f] hover:text-[#07584f]"><X size={12} /> Borrar filtros</button>
          </div>

          {loading ? (
            <div role="status" className="py-16 text-center text-sm text-[#52766d]">Cargando recursos desde el servidor...</div>
          ) : loadError ? (
            <div role="alert" className="rounded-2xl border border-[#e7c6bb] bg-[#fff9f6] px-6 py-8 text-center">
              <p className="text-[13px] font-semibold text-[#7b342d]">No pudimos cargar la biblioteca</p>
              <p className="mt-2 text-[12px] text-[#765b55]">{loadError}</p>
              <button
                type="button"
                onClick={() => setReloadCounter((current) => current + 1)}
                className="mt-4 rounded-xl bg-[#087d70] px-4 py-2 text-[11px] font-semibold text-white hover:bg-[#07584f]"
              >
                Reintentar
              </button>
            </div>
          ) : visibleResources.length ? (
            <div className="grid gap-3 md:grid-cols-2">
              {visibleResources.map((resource, i) => {
                const visual = getVisualProps(resource.titulo, i);
                const safeTitulo = resource.titulo || 'Documento sin título';
                const isSaved = savedKeys.includes(
                  getFavoriteKey(toTargetType(resource.source), resource.id),
                );

                return (
                  <article key={`${resource.source}-${resource.id}`} className="group rounded-2xl border border-[#d5e6df] bg-[#fcfefd] p-6 transition hover:-translate-y-0.5 hover:border-[#82c4a9] hover:shadow-[0_8px_24px_rgba(7,88,79,.09)]">
                    <div className="flex items-start justify-between gap-3">
                      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-sm font-bold tracking-wide ${visual.color === 'sage' ? 'bg-[#d7f2e6] text-[#08745e]' : visual.color === 'sand' ? 'bg-[#fff0cf] text-[#85500b]' : visual.color === 'blue' ? 'bg-[#dcecf4] text-[#28677c]' : 'bg-[#ffe3dc] text-[#9a4939]'}`}>{visual.initials}</div>
                      <button
                        type="button"
                        aria-label={isSaved ? 'Quitar de guardados' : 'Guardar en favoritos'}
                        title={isSaved ? 'Quitar de guardados' : 'Guardar en favoritos'}
                        onClick={() => void toggleSaved(resource)}
                        className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-sm font-semibold transition ${
                          isSaved
                            ? 'border-[#7bc9ad] bg-[#d4f2e6] text-[#07584f]'
                            : 'border-[#cfe4dc] bg-[#f4fbf8] text-[#173d3b] hover:border-[#82c4a9] hover:bg-[#dff2e9] hover:text-[#07584f]'
                        }`}
                      >
                        <BookMarked fill={isSaved ? 'currentColor' : 'none'} size={16} />
                        {isSaved ? 'Guardado' : 'Guardar'}
                      </button>
                    </div>
                    <div className="mt-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-[#e1f3eb] px-3 py-1 text-xs font-semibold text-[#134e3f]">{getCategoryLabel(resource.tipo || 'General')}</span>
                        <span className="text-xs font-medium text-[#2d584f]">{resource.area || 'Sin área'}</span>
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${resource.visibilidad === 'PUBLICO' ? 'bg-slate-100 text-slate-700' : resource.visibilidad === 'INTERNO' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'}`}>{resource.visibilidad || 'PÚBLICO'}</span>
                      </div>
                      <h4 className="mt-3 text-lg font-bold leading-snug text-[#102f2d]">{safeTitulo}</h4>
                      {resource.autor && (
                        <p className="mt-1 text-sm font-medium text-[#2d584f]">{resource.autor}</p>
                      )}
                      <p className="mt-2 min-h-[44px] text-sm leading-relaxed text-[#35534d] line-clamp-2">{resource.descripcion || 'Sin descripción'}</p>
                    </div>
                    <div className="mt-5 flex items-center justify-between border-t border-[#e3eee9] pt-4">
                      <div className="flex items-center gap-1.5 text-xs font-medium text-[#35534d]"><FileText size={15} />PDF</div>
                      {resource.archivoUrl ? (
                        <div className="flex items-center gap-2.5">
                          <a
                            href={resource.vistaUrl || resource.archivoUrl}
                            target="_blank"
                            rel="noreferrer"
                            onClick={() =>
                              trackDocumentView(
                                resource.source === 'articulo'
                                  ? 'ARTICULO'
                                  : 'RECURSO_BIBLIOTECA',
                                resource.id,
                              )
                            }
                            className="inline-flex items-center gap-1.5 rounded-lg border border-[#b9d8ca] bg-white px-3.5 py-2 text-sm font-semibold text-[#102f2d] transition hover:border-[#087d70] hover:bg-[#edf6f2]"
                          >
                            <Eye size={16} /> Ver
                          </a>
                          <button
                            type="button"
                            disabled={
                              downloadingKey ===
                              `${resource.source}-${resource.id}`
                            }
                            onClick={() => void handleDownload(resource)}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-[#087d70] px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#07584f] disabled:opacity-50"
                          >
                            <ArrowDownToLine size={16} />
                            {downloadingKey ===
                            `${resource.source}-${resource.id}`
                              ? 'Descargando...'
                              : 'Descargar'}
                          </button>
                        </div>
                      ) : (
                        <span className="text-sm text-[#526e68]">PDF no disponible</span>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-[#a9d2c1] bg-[#f3faf6] px-6 py-16 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#d7f2e6] text-[#087366]"><Search size={20} /></div>
              <h4 className="font-editorial mt-4 text-[22px] text-[#244f47]">
                {convocatoriaId !== undefined && recursos.length === 0
                  ? 'Aún no hay artículos publicados en esta convocatoria'
                  : 'No se encontraron recursos'}
              </h4>
              <p className="mt-2 text-[11px] text-[#526e68]">
                {convocatoriaId !== undefined && recursos.length === 0
                  ? 'Las publicaciones aparecerán aquí cuando estén disponibles.'
                  : 'Intenta con otra búsqueda o comunícate con Docencia e Investigación.'}
              </p>
              <button onClick={() => { setCategory('Todos los recursos'); setQuery(''); }} className="mt-4 text-[11px] font-semibold text-[#087366] hover:underline">Borrar filtros</button>
            </div>
          )}
        </div>
      </section>

      {notice && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-xl border border-[#9bcfbb] bg-[#f3fffa] px-4 py-3 text-[11px] text-[#244f47] shadow-lg">
          <BookMarked size={15} />{notice}<button onClick={() => setNotice('')} className="ml-2"><X size={13} /></button>
        </div>
      )}
    </div>
  );
};
export default BibliotecaHome;