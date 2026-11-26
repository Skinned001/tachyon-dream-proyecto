import { useEffect, useMemo, useState } from 'react';
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  BookMarked,
  BookOpen,
  Building2,
  CalendarDays,
  Download,
  Eye,
  FileText,
  GraduationCap,
  Megaphone,
  Search,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { articulosApi, type PublishedArticle } from '../api/articulos.api';
import {
  getFavoritosBiblioteca,
  toggleFavoritoBiblioteca,
} from '../api/biblioteca.api';
import { Modal } from '../components/ui/Modal';
import {
  getConvocatoriasPublicas,
  type Convocatoria,
  type ConvocatoriaCerrada,
} from '../api/convocatorias.api';
import { useAuth } from '../context/AuthContext';
import {
  trackDocumentDownload,
  trackDocumentView,
  trackPortalVisit,
} from '../api/metricas.api';

const apiBaseUrl = (
  import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
).replace(/\/$/, '');

const formatDate = (value: string): string => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'fecha no disponible';
  return new Intl.DateTimeFormat('es-AR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

export function PortalHome() {
  const [articles, setArticles] = useState<PublishedArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [selectedYear, setSelectedYear] = useState('all');
  const [abiertas, setAbiertas] = useState<Convocatoria[]>([]);
  const [proximas, setProximas] = useState<Convocatoria[]>([]);
  const [cerradas, setCerradas] = useState<ConvocatoriaCerrada[]>([]);
  const [loadingConvocatorias, setLoadingConvocatorias] = useState(true);
  const [convocatoriaError, setConvocatoriaError] = useState('');
  const [convocatoriaParaParticipar, setConvocatoriaParaParticipar] =
    useState<Convocatoria | null>(null);
  const [savedArticleIds, setSavedArticleIds] = useState<number[]>([]);
  const [downloadingArticleId, setDownloadingArticleId] = useState<number | null>(
    null,
  );
  const { user, isLoading: isAuthLoading } = useAuth();

  useEffect(() => {
    void trackPortalVisit();
  }, []);

  async function loadArticles() {
    setLoading(true);
    setError('');
    try {
      setArticles(await articulosApi.listPublished());
    } catch (loadError: unknown) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : 'No se pudo cargar el archivo público.',
      );
    } finally {
      setLoading(false);
    }
  }

  async function loadConvocatorias() {
    setLoadingConvocatorias(true);
    setConvocatoriaError('');
    try {
      const convocatorias = await getConvocatoriasPublicas();
      setAbiertas(
        Array.isArray(convocatorias?.abiertas) ? convocatorias.abiertas : [],
      );
      setProximas(
        Array.isArray(convocatorias?.proximas) ? convocatorias.proximas : [],
      );
      setCerradas(
        Array.isArray(convocatorias?.cerradas) ? convocatorias.cerradas : [],
      );
    } catch (loadError: unknown) {
      setConvocatoriaError(
        loadError instanceof Error
          ? loadError.message
          : 'No se pudieron cargar las convocatorias.',
      );
      setAbiertas([]);
      setProximas([]);
      setCerradas([]);
    } finally {
      setLoadingConvocatorias(false);
    }
  }

  useEffect(() => {
    void loadArticles();
    void loadConvocatorias();
  }, []);

  useEffect(() => {
    if (!user) {
      setSavedArticleIds([]);
      return;
    }
    let active = true;
    getFavoritosBiblioteca()
      .then((items) => {
        if (active) {
          setSavedArticleIds(
            items
              .filter((item) => item.targetType === 'ARTICULO')
              .map((item) => item.targetId),
          );
        }
      })
      .catch(() => {
        if (active) setSavedArticleIds([]);
      });
    return () => {
      active = false;
    };
  }, [user]);

  async function handleToggleArticleFavorite(articleId: number) {
    if (!user) return;
    const wasSaved = savedArticleIds.includes(articleId);
    setSavedArticleIds((current) =>
      wasSaved
        ? current.filter((id) => id !== articleId)
        : [...current, articleId],
    );
    try {
      await toggleFavoritoBiblioteca('ARTICULO', articleId);
    } catch {
      setSavedArticleIds((current) =>
        wasSaved
          ? [...current, articleId]
          : current.filter((id) => id !== articleId),
      );
    }
  }

  async function handleDownloadArticle(article: PublishedArticle) {
    const pdfUrl = `${apiBaseUrl}/articulos/publicados/${article.id}/pdf`;
    setDownloadingArticleId(article.id);
    try {
      const response = await fetch(pdfUrl, { credentials: 'include' });
      if (!response.ok) {
        throw new Error('No se pudo descargar el PDF.');
      }
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const safeName = (article.title || `articulo-${article.id}`)
        .replace(/[\\/:*?"<>|]+/g, '_')
        .trim();
      link.href = objectUrl;
      link.download = safeName.toLowerCase().endsWith('.pdf')
        ? safeName
        : `${safeName}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(objectUrl);

      trackDocumentDownload('ARTICULO', article.id, article.specialty?.id);
    } catch {
      window.open(pdfUrl, '_blank', 'noreferrer');
    } finally {
      setDownloadingArticleId(null);
    }
  }

  const years = useMemo(
    () =>
      [
        ...new Set(
          articles.map((article) => new Date(article.createdAt).getFullYear()),
        ),
      ]
        .filter(Number.isFinite)
        .sort((left, right) => right - left),
    [articles],
  );

  const filteredArticles = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase('es');
    return articles.filter((article) => {
      const articleYear = new Date(article.createdAt).getFullYear().toString();
      const matchesYear =
        selectedYear === 'all' || articleYear === selectedYear;
      const searchableText = [
        article.title,
        article.summary,
        article.authorName,
        article.specialty?.name,
        article.editionNumber,
        article.doi,
        ...(article.keywords ?? []),
        ...(article.coauthors ?? []),
      ]
        .filter(Boolean)
        .join(' ')
        .toLocaleLowerCase('es');
      return (
        matchesYear &&
        (!normalizedSearch || searchableText.includes(normalizedSearch))
      );
    });
  }, [articles, search, selectedYear]);

  const isAuthor = user?.is_author === true || String(user?.role) === 'AUTOR';

  return (
    <main className="min-h-screen bg-[#f2f7f4] text-[#173d3b]">
      <header className="sticky top-0 z-30 border-b border-[#d5e6df] bg-[#f8fcfa]/95 backdrop-blur-md">
        <nav className="mx-auto flex max-w-[1240px] items-center justify-between gap-4 px-5 py-3.5 md:px-8">
          <a
            href="#inicio"
            className="flex items-center gap-3"
            aria-label="Hospital Interdistrital Evita e Instituto Politécnico Formosa, inicio"
          >
            <img
              src="/images/evita_1.jpg"
              alt="Emblema Hospital Interdistrital Evita"
              className="h-11 w-11 rounded-xl border border-[#cfe4dc] object-cover shadow-sm"
            />
            <span className="leading-tight">
              <span className="block text-xs font-bold tracking-[.1em] text-[#102f2d] sm:text-sm">
                HOSPITAL INTERDISTRITAL EVITA
              </span>
              <span className="mt-0.5 block text-[11px] font-medium uppercase tracking-[.14em] text-[#355d55]">
                Chief Journal · HIEF
              </span>
            </span>
            <span
              className="mx-1 hidden h-8 w-px bg-[#cfe4dc] lg:block"
              aria-hidden="true"
            />
            <img
              src="/images/Horizontal%201-1.png"
              alt="Instituto Politécnico Formosa Dr. Alberto Marcelo Zorrilla"
              className="hidden h-9 w-auto object-contain lg:block"
            />
          </a>

          <div className="flex items-center gap-4 md:gap-6">
            <a
              href="#convocatorias-abiertas"
              className="hidden text-sm font-medium text-[#2d524b] transition hover:text-[#07584f] md:inline"
            >
              Convocatorias
            </a>
            <Link
              to="/biblioteca"
              className="hidden text-sm font-medium text-[#2d524b] transition hover:text-[#07584f] sm:inline"
            >
              Biblioteca
            </Link>
            <a
              href="#archivo"
              className="hidden text-sm font-medium text-[#2d524b] transition hover:text-[#07584f] md:inline"
            >
              Publicaciones
            </a>
            <Link
              to={user ? '/dashboard' : '/login'}
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#087d70] px-4 text-xs font-semibold text-white shadow-sm transition hover:bg-[#07584f] sm:text-sm"
            >
              {user ? 'Ir al Panel' : 'Acceso institucional'}{' '}
              <ArrowRight size={15} />
            </Link>
          </div>
        </nav>
      </header>

      <section
        id="inicio"
        className="relative overflow-hidden bg-[#063b3a] text-[#f3fffa]"
      >
        <img
          src="/images/evita_2.jpg"
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 h-full w-full object-cover object-center opacity-25"
        />
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#053533]/95 via-[#07584f]/88 to-[#087366]/78"
          aria-hidden="true"
        />
        <div className="relative mx-auto grid max-w-[1240px] items-center gap-10 px-5 py-14 md:px-8 md:py-20 lg:grid-cols-[1.15fr_.85fr]">
          <div className="page-enter">
            <p className="mb-5 flex items-center gap-2.5 text-xs font-semibold uppercase tracking-[.18em] text-[#cdeee0]">
              <span className="h-px w-8 bg-[#9bdcc4]" />
              Producción científica · Formosa
            </p>
            <h1 className="font-editorial max-w-[720px] text-[clamp(40px,6vw,70px)] leading-[1.02] tracking-[-.035em] text-white">
              Conocimiento científico que{' '}
              <i className="font-medium text-[#c0f2df]">transforma.</i>
            </h1>
            <p className="mt-5 max-w-[590px] text-[15px] leading-7 text-[#e3f6ee] md:text-base">
              Portal institucional de investigación del{' '}
              <strong className="font-semibold text-white">
                Hospital Interdistrital Evita (HIEF)
              </strong>{' '}
              junto al{' '}
              <strong className="font-semibold text-white">
                Instituto Politécnico Formosa
              </strong>
              . Consulta artículos revisados por pares, manuales y convocatorias
              vigentes en acceso abierto.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href="#archivo"
                className="inline-flex h-12 items-center gap-2 rounded-xl bg-[#d7f2e6] px-5 text-sm font-semibold text-[#063b3a] shadow-sm transition hover:bg-white"
              >
                Explorar publicaciones <ArrowDown size={16} />
              </a>
              <Link
                to="/biblioteca"
                className="inline-flex h-12 items-center gap-2 rounded-xl border border-[#b3e8d3]/50 bg-white/10 px-5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
              >
                <BookOpen size={16} />
                Ir a la Biblioteca
              </Link>
            </div>
          </div>

          <aside className="relative overflow-hidden rounded-2xl border border-[#b3e8d3]/35 bg-[#042d2c]/65 shadow-2xl backdrop-blur-md">
            <div className="relative aspect-[16/10] w-full overflow-hidden">
              <img
                src="/images/evita_2.jpg"
                alt="Acceso principal del Hospital Interdistrital Evita Formosa (HIEF)"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#042d2c]/85 via-transparent to-transparent" />
              <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#063b3a]/90 px-3 py-1 text-[11px] font-semibold text-[#d7f2e6] backdrop-blur-sm">
                  <Building2 size={13} />
                  HIEF · Formosa
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold text-[#063b3a]">
                  <FileText size={13} />
                  Acceso abierto
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 divide-x divide-[#b3e8d3]/20 px-4 py-4 text-center">
              <div className="px-2">
                <p className="font-editorial text-2xl font-semibold text-white">
                  {loading ? '—' : articles.length}
                </p>
                <p className="mt-0.5 text-[11px] text-[#cdeee0]">
                  Publicaciones
                </p>
              </div>
              <div className="px-2">
                <p className="font-editorial text-2xl font-semibold text-white">
                  {loadingConvocatorias ? '—' : abiertas.length}
                </p>
                <p className="mt-0.5 text-[11px] text-[#cdeee0]">
                  Convocatorias
                </p>
              </div>
              <div className="px-2">
                <p className="font-editorial text-2xl font-semibold text-white">
                  Libre
                </p>
                <p className="mt-0.5 text-[11px] text-[#cdeee0]">
                  Sin cuenta
                </p>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <section className="mx-auto max-w-[1240px] px-5 pt-10 md:px-8 md:pt-12">
        <div className="grid items-center gap-6 rounded-2xl border border-[#cfe4dc] bg-white p-6 shadow-sm md:p-8 lg:grid-cols-[1.15fr_.85fr]">
          <div>
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[.16em] text-[#087d70]">
              <GraduationCap size={15} />
              Articulación institucional
            </p>
            <h2 className="font-editorial mt-2 text-2xl leading-snug text-[#102f2d] md:text-3xl">
              Respaldo académico y sanitario para la comunidad médica
            </h2>
            <p className="mt-3 text-sm leading-7 text-[#35534d]">
              Este repositorio reúne la producción científica del{' '}
              <strong className="font-semibold text-[#102f2d]">
                Hospital Interdistrital Evita (HIEF)
              </strong>{' '}
              —a través de su Departamento de Docencia e Investigación (DDI) y
              Comité Editorial— con el desarrollo tecnológico y académico del{' '}
              <strong className="font-semibold text-[#102f2d]">
                Instituto Politécnico Formosa &ldquo;Dr. Alberto Marcelo
                Zorrilla&rdquo;
              </strong>
              .
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 rounded-xl border border-[#e3eee9] bg-[#f7fbf9] p-5 sm:justify-around">
            <div className="flex items-center gap-3">
              <img
                src="/images/evita_1.jpg"
                alt="Hospital Interdistrital Evita"
                className="h-14 w-14 rounded-xl border border-[#cfe4dc] object-cover shadow-sm"
              />
              <div className="text-left">
                <p className="text-xs font-bold uppercase tracking-wide text-[#102f2d]">
                  Hospital Evita
                </p>
                <p className="text-xs text-[#35534d]">
                  Docencia e Investigación
                </p>
              </div>
            </div>
            <span
              className="hidden h-12 w-px bg-[#cfe4dc] sm:block"
              aria-hidden="true"
            />
            <img
              src="/images/Horizontal%201-1.png"
              alt="Instituto Politécnico Formosa Dr. Alberto Marcelo Zorrilla"
              className="h-12 w-auto object-contain"
            />
          </div>
        </div>
      </section>

      <section
        id="convocatorias-abiertas"
        className="mx-auto max-w-[1240px] px-5 pt-12 md:px-8 md:pt-14"
      >
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[.16em] text-[#355d55]">
              Recepción de manuscritos
            </p>
            <h2 className="font-editorial mt-1.5 text-[32px] tracking-[-.03em] text-[#102f2d] md:text-[38px]">
              Convocatorias Abiertas
            </h2>
          </div>
          {!loadingConvocatorias && (
            <span className="rounded-full bg-[#e1f3eb] px-3.5 py-1 text-xs font-semibold text-[#07584f]">
              {abiertas.length}
            </span>
          )}
        </div>

        {loadingConvocatorias ? (
          <div
            role="status"
            className="rounded-2xl border border-[#d5e6df] bg-white p-8 text-center text-sm text-[#355d55]"
          >
            Cargando convocatorias…
          </div>
        ) : convocatoriaError ? (
          <div
            role="alert"
            className="rounded-2xl border border-[#e7c6bb] bg-[#fff9f6] p-5 text-sm text-[#7b342d]"
          >
            <p>No se pudieron cargar las convocatorias: {convocatoriaError}</p>
            <button
              type="button"
              onClick={() => void loadConvocatorias()}
              className="mt-3 font-semibold text-[#087366] hover:text-[#07584f]"
            >
              Reintentar
            </button>
          </div>
        ) : abiertas.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#a9d2c1] bg-[#f3faf6] px-6 py-10 text-center">
            <Megaphone className="mx-auto text-[#77a995]" size={26} />
            <p className="mt-3 text-base font-semibold text-[#173d3b]">
              No hay convocatorias abiertas en este momento.
            </p>
            <p className="mt-1 text-sm text-[#35534d]">
              Vuelve pronto para conocer nuevas oportunidades de publicación.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {abiertas.map((convocatoria) => (
              <article
                key={convocatoria.id}
                className="flex flex-col justify-between rounded-2xl border border-[#cfe4dc] bg-white p-6 shadow-sm transition hover:border-[#9bcfbb] hover:shadow-[0_12px_30px_rgba(23,61,59,.07)]"
              >
                <div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#e6f5ee] px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-[#07584f]">
                    <Megaphone size={13} />
                    ABIERTA
                  </span>
                  <h3 className="font-editorial mt-4 text-2xl leading-tight text-[#102f2d]">
                    {convocatoria.title}
                  </h3>
                  <p className="mt-3 flex items-center gap-2 text-sm text-[#35534d]">
                    <CalendarDays size={15} />
                    Cierra el {formatDate(convocatoria.fechaFin)}
                  </p>
                </div>
                <div className="mt-6">
                  {isAuthLoading ? (
                    <span className="inline-flex h-11 items-center rounded-xl bg-slate-100 px-4 text-sm font-semibold text-slate-500">
                      Verificando sesión…
                    </span>
                  ) : isAuthor ? (
                    <Link
                      to={`/articulos?convocatoriaId=${convocatoria.id}`}
                      className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#087d70] px-5 text-sm font-semibold text-white transition hover:bg-[#07584f]"
                    >
                      Postular manuscrito <ArrowUpRight size={16} />
                    </Link>
                  ) : user ? (
                    <button
                      type="button"
                      disabled
                      title="La postulación está disponible para usuarios con cuenta de Autor."
                      className="inline-flex h-11 cursor-not-allowed items-center rounded-xl bg-slate-100 px-4 text-sm font-medium text-slate-600"
                    >
                      Solo autores
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConvocatoriaParaParticipar(convocatoria)}
                      className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#087d70] px-5 text-sm font-semibold text-white transition hover:bg-[#07584f]"
                    >
                      Participar <ArrowUpRight size={16} />
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {!loadingConvocatorias && !convocatoriaError && proximas.length > 0 && (
        <section className="mx-auto max-w-[1240px] px-5 pt-14 md:px-8">
          <div className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-[.16em] text-[#355d55]">
              Próximamente
            </p>
            <h2 className="font-editorial mt-1.5 text-[32px] tracking-[-.03em] text-[#102f2d] md:text-[38px]">
              Próximas Aperturas
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {proximas.map((convocatoria) => (
              <article
                key={convocatoria.id}
                className="rounded-2xl border border-[#d5e6df] bg-[#fcfefd] p-6"
              >
                <span className="inline-flex rounded-full bg-[#fff0cf] px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-[#85500b]">
                  PROGRAMADA
                </span>
                <h3 className="font-editorial mt-4 text-2xl leading-tight text-[#102f2d]">
                  {convocatoria.title}
                </h3>
                <p className="mt-3 inline-flex items-center gap-2 rounded-lg bg-[#fff8e9] px-3 py-2 text-sm font-semibold text-[#85500b]">
                  <CalendarDays size={15} />
                  A abrir el {formatDate(convocatoria.fechaInicio)}
                </p>
                <p className="mt-3 text-sm text-[#35534d]">
                  La postulación estará disponible al abrirse la convocatoria.
                </p>
              </article>
            ))}
          </div>
        </section>
      )}

      {!loadingConvocatorias && !convocatoriaError && cerradas.length > 0 && (
        <section className="mx-auto max-w-[1240px] px-5 pt-14 md:px-8">
          <div className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-[.16em] text-[#355d55]">
              Convocatorias finalizadas recientemente
            </p>
            <h2 className="font-editorial mt-1.5 text-[32px] tracking-[-.03em] text-[#102f2d] md:text-[38px]">
              Historial Reciente
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {cerradas.map((convocatoria) => {
              const publishedCount = convocatoria.articulosPublicadosCount ?? 0;
              return (
                <article
                  key={convocatoria.id}
                  className="flex flex-col justify-between rounded-2xl border border-[#d5e6df] bg-white p-6"
                >
                  <div>
                    <span className="inline-flex rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-slate-700">
                      CERRADA
                    </span>
                    <h3 className="font-editorial mt-4 text-2xl leading-tight text-[#102f2d]">
                      {convocatoria.title}
                    </h3>
                    <p className="mt-3 flex items-center gap-2 text-sm text-[#35534d]">
                      <CalendarDays size={15} />
                      Cerró el {formatDate(convocatoria.fechaFin)}
                    </p>
                    <p className="mt-2 text-sm font-medium text-[#173d3b]">
                      {publishedCount}{' '}
                      {publishedCount === 1
                        ? 'artículo publicado'
                        : 'artículos publicados'}
                    </p>
                  </div>
                  <Link
                    to={`/biblioteca?convocatoriaId=${convocatoria.id}`}
                    className="mt-5 inline-flex h-10 w-fit items-center gap-2 rounded-xl border border-[#087d70]/35 px-4 text-sm font-semibold text-[#087d70] transition hover:bg-[#e8f5f1]"
                  >
                    Ver en Biblioteca <ArrowRight size={15} />
                  </Link>
                </article>
              );
            })}
          </div>
        </section>
      )}

      <Modal
        isOpen={convocatoriaParaParticipar !== null}
        onClose={() => setConvocatoriaParaParticipar(null)}
        title="Participar de la convocatoria"
      >
        {convocatoriaParaParticipar && (
          <div className="space-y-5">
            <p className="text-sm leading-6 text-slate-600">
              Para participar en{' '}
              <span className="font-semibold text-[#173d3b]">
                {convocatoriaParaParticipar.title}
              </span>{' '}
              necesitás acceder con tu cuenta de Autor.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              {[
                ['/login', 'Iniciar sesión'],
                ['/register', 'Registrarse'],
              ].map(([route, label]) => {
                const redirect = `/articulos?convocatoriaId=${convocatoriaParaParticipar.id}`;
                return (
                  <Link
                    key={route}
                    to={`${route}?redirect=${encodeURIComponent(redirect)}`}
                    onClick={() => setConvocatoriaParaParticipar(null)}
                    className={`inline-flex h-10 items-center justify-center rounded-xl px-4 text-sm font-semibold transition ${
                      route === '/login'
                        ? 'bg-[#087d70] text-white hover:bg-[#07584f]'
                        : 'border border-[#087d70]/30 bg-white text-[#087d70] hover:bg-[#e8f5f1]'
                    }`}
                  >
                    {label}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </Modal>

      <section
        id="archivo"
        className="mx-auto max-w-[1240px] px-5 py-16 md:px-8 md:py-20"
      >
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[.16em] text-[#355d55]">
              Biblioteca digital
            </p>
            <h2 className="font-editorial mt-1.5 text-[36px] leading-tight tracking-[-.03em] text-[#102f2d] md:text-[46px]">
              Archivo de publicaciones
            </h2>
            <p className="mt-2 max-w-[580px] text-sm leading-6 text-[#35534d]">
              Manuscritos científicos publicados por el Hospital Interdistrital
              Evita, disponibles para lectura y descarga gratuita.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {!loading && !error && (
              <span className="rounded-full bg-[#e1f3eb] px-3.5 py-1.5 text-xs font-semibold text-[#07584f]">
                {articles.length}{' '}
                {articles.length === 1
                  ? 'publicación disponible'
                  : 'publicaciones disponibles'}
              </span>
            )}
            <Link
              to="/biblioteca"
              className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-[#b9d8ca] bg-white px-4 text-sm font-semibold text-[#102f2d] transition hover:border-[#087d70] hover:bg-[#edf6f2]"
            >
              Ver Biblioteca completa <ArrowRight size={15} />
            </Link>
          </div>
        </div>

        <div className="mt-8 grid gap-3 rounded-2xl border border-[#d5e6df] bg-[#fcfefd] p-4 md:grid-cols-[1fr_210px] md:p-5">
          <label className="relative block">
            <span className="sr-only">Buscar publicaciones</span>
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#52766d]"
            />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por título, autor, especialidad o palabra clave..."
              className="h-12 w-full rounded-xl border border-[#cfe4dc] bg-[#f8fcfa] pl-11 pr-4 text-sm text-[#102f2d] outline-none transition placeholder:text-[#668079] focus:border-[#087d70] focus:ring-4 focus:ring-[#bce8d8]/60"
            />
          </label>
          <label className="relative block">
            <span className="sr-only">Filtrar por año</span>
            <CalendarDays
              size={17}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#52766d]"
            />
            <select
              value={selectedYear}
              onChange={(event) => setSelectedYear(event.target.value)}
              className="h-12 w-full appearance-none rounded-xl border border-[#cfe4dc] bg-[#f8fcfa] pl-11 pr-4 text-sm font-medium text-[#173d3b] outline-none transition focus:border-[#087d70] focus:ring-4 focus:ring-[#bce8d8]/60"
            >
              <option value="all">Todos los años</option>
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-6">
          {loading && (
            <div
              className="rounded-2xl border border-[#d5e6df] bg-[#fcfefd] px-6 py-12 text-center text-sm text-[#35534d]"
              role="status"
            >
              Cargando publicaciones...
            </div>
          )}
          {!loading && error && (
            <div className="rounded-2xl border border-[#e7c6bb] bg-[#fff9f6] px-6 py-8 text-center">
              <p className="text-sm font-semibold text-[#7b342d]">
                No pudimos cargar el archivo
              </p>
              <p className="mt-2 text-sm text-[#765b55]">{error}</p>
              <button
                type="button"
                onClick={() => void loadArticles()}
                className="mt-5 rounded-xl bg-[#087d70] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#07584f]"
              >
                Reintentar
              </button>
            </div>
          )}
          {!loading && !error && filteredArticles.length > 0 && (
            <div className="grid gap-5 md:grid-cols-2">
              {filteredArticles.map((article) => {
                const isSaved = savedArticleIds.includes(article.id);
                const pdfUrl = `${apiBaseUrl}/articulos/publicados/${article.id}/pdf`;

                return (
                  <article
                    key={article.id}
                    className="flex flex-col rounded-2xl border border-[#d5e6df] bg-[#fcfefd] p-6 transition hover:border-[#82c4a9] hover:shadow-[0_12px_30px_rgba(23,61,59,.07)]"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#e6f5ee] px-3 py-1 text-xs font-semibold text-[#07584f]">
                          <CalendarDays size={13} />{' '}
                          {new Date(
                            article.publishedAt || article.createdAt,
                          ).getFullYear()}
                        </span>
                        {article.specialty?.name && (
                          <span className="rounded-full border border-[#cfe4dc] bg-[#f4fbf8] px-3 py-1 text-xs font-semibold text-[#244f47]">
                            {article.specialty.name}
                          </span>
                        )}
                      </div>

                      {user && (
                        <button
                          type="button"
                          aria-label={
                            isSaved
                              ? 'Quitar de guardados'
                              : 'Guardar en favoritos'
                          }
                          title={
                            isSaved
                              ? 'Quitar de guardados'
                              : 'Guardar en favoritos'
                          }
                          onClick={() =>
                            void handleToggleArticleFavorite(article.id)
                          }
                          className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition ${
                            isSaved
                              ? 'border-[#7bc9ad] bg-[#d4f2e6] text-[#07584f]'
                              : 'border-[#cfe4dc] bg-[#f4fbf8] text-[#173d3b] hover:border-[#82c4a9] hover:bg-[#dff2e9]'
                          }`}
                        >
                          <BookMarked
                            size={15}
                            fill={isSaved ? 'currentColor' : 'none'}
                          />
                          {isSaved ? 'Guardado' : 'Guardar'}
                        </button>
                      )}
                    </div>

                    <h3 className="font-editorial mt-4 text-2xl leading-snug text-[#102f2d]">
                      {article.title}
                    </h3>
                    {article.summary && (
                      <p className="mt-2.5 line-clamp-3 text-sm leading-relaxed text-[#35534d]">
                        {article.summary}
                      </p>
                    )}
                    {(article.authorName ||
                      (article.coauthors && article.coauthors.length > 0)) && (
                      <p className="mt-3 text-sm font-medium text-[#2d584f]">
                        {[article.authorName, ...(article.coauthors ?? [])]
                          .filter(Boolean)
                          .join(' · ')}
                      </p>
                    )}
                    {(article.editionNumber || article.doi) && (
                      <p className="font-data mt-2 text-xs text-[#526e68]">
                        {[
                          article.editionNumber,
                          article.doi ? `DOI: ${article.doi}` : null,
                        ]
                          .filter(Boolean)
                          .join(' · ')}
                      </p>
                    )}
                    {article.keywords && article.keywords.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {article.keywords.slice(0, 4).map((keyword) => (
                          <span
                            key={keyword}
                            className="rounded-md bg-[#eef6f2] px-2.5 py-1 text-xs font-medium text-[#2d584f]"
                          >
                            {keyword}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-[#e3eee9] pt-5 mt-5">
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#35534d]">
                        <FileText size={15} /> Documento PDF
                      </span>
                      {article.pdfAvailable ? (
                        <div className="flex items-center gap-2.5">
                          <a
                            href={pdfUrl}
                            target="_blank"
                            rel="noreferrer"
                            onClick={() =>
                              trackDocumentView(
                                'ARTICULO',
                                article.id,
                                article.specialty?.id,
                              )
                            }
                            className="inline-flex items-center gap-1.5 rounded-lg border border-[#b9d8ca] bg-white px-3.5 py-2 text-sm font-semibold text-[#102f2d] transition hover:border-[#087d70] hover:bg-[#edf6f2]"
                          >
                            <Eye size={16} /> Ver
                          </a>
                          <button
                            type="button"
                            disabled={downloadingArticleId === article.id}
                            onClick={() => void handleDownloadArticle(article)}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-[#087d70] px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#07584f] disabled:opacity-50"
                          >
                            <Download size={16} />
                            {downloadingArticleId === article.id
                              ? 'Descargando...'
                              : 'Descargar PDF'}
                          </button>
                        </div>
                      ) : (
                        <span className="text-sm text-[#526e68]">
                          PDF no disponible
                        </span>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
          {!loading && !error && filteredArticles.length === 0 && (
            <div className="rounded-2xl border border-[#d5e6df] bg-[#fcfefd] px-6 py-12 text-center">
              <BookOpen className="mx-auto text-[#77a995]" size={28} />
              <p className="mt-3 text-base font-semibold text-[#173d3b]">
                {articles.length === 0
                  ? 'Todavía no hay publicaciones en el archivo.'
                  : 'No encontramos publicaciones con esos filtros.'}
              </p>
              {articles.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch('');
                    setSelectedYear('all');
                  }}
                  className="mt-3 text-sm font-semibold text-[#087366] hover:text-[#07584f]"
                >
                  Limpiar filtros
                </button>
              )}
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-[1240px] px-5 pb-12 md:px-8">
        <div className="overflow-hidden rounded-2xl border border-[#cfe4dc] shadow-md">
          <img
            src="/images/evita_banner.jpg"
            alt="Hospital Interdistrital Evita Formosa · Ministerio de Desarrollo Humano · Gobierno de Formosa"
            className="h-auto w-full object-cover"
          />
        </div>
      </section>

      <footer className="border-t border-[#cfe4dc] bg-[#e7f4ee]">
        <div className="mx-auto flex max-w-[1240px] flex-col gap-6 px-5 py-8 md:flex-row md:items-center md:justify-between md:px-8">
          <div className="flex flex-wrap items-center gap-4">
            <img
              src="/images/Escudo%201-1.png"
              alt="Escudo Instituto Politécnico Formosa"
              className="h-11 w-auto object-contain"
            />
            <div>
              <p className="text-sm font-bold text-[#102f2d]">
                Hospital Interdistrital Evita · Instituto Politécnico Formosa
              </p>
              <p className="mt-0.5 text-xs text-[#35534d]">
                © {new Date().getFullYear()} Chief Journal HIEF · Formosa,
                Argentina
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-5 text-sm font-semibold text-[#07584f]">
            <Link to="/biblioteca" className="hover:underline">
              Biblioteca
            </Link>
            <a href="#convocatorias-abiertas" className="hover:underline">
              Convocatorias
            </a>
            <Link
              to={user ? '/dashboard' : '/login'}
              className="inline-flex items-center gap-1 hover:underline"
            >
              {user ? 'Ir al Panel' : 'Acceso para autores y personal'}{' '}
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
