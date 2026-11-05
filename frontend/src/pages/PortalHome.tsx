import { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  ArrowDown,
  ArrowRight,
  BookOpen,
  CalendarDays,
  Download,
  FileText,
  Search,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { articulosApi, type PublishedArticle } from '../api/articulos.api';

const apiBaseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:3000/api').replace(/\/$/, '');

export function PortalHome() {
  const [articles, setArticles] = useState<PublishedArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [selectedYear, setSelectedYear] = useState('all');

  async function loadArticles() {
    setLoading(true);
    setError('');
    try {
      setArticles(await articulosApi.listPublished());
    } catch (loadError: unknown) {
      setError(loadError instanceof Error ? loadError.message : 'No se pudo cargar el archivo público.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadArticles();
  }, []);

  const years = useMemo(
    () => [...new Set(articles.map((article) => new Date(article.createdAt).getFullYear()))]
      .filter(Number.isFinite)
      .sort((left, right) => right - left),
    [articles],
  );

  const filteredArticles = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase('es');
    return articles.filter((article) => {
      const articleYear = new Date(article.createdAt).getFullYear().toString();
      const matchesYear = selectedYear === 'all' || articleYear === selectedYear;
      const searchableText = [
        article.title,
        article.summary,
        article.specialty?.name,
        ...(article.keywords ?? []),
        ...(article.coauthors ?? []),
      ].filter(Boolean).join(' ').toLocaleLowerCase('es');
      return matchesYear && (!normalizedSearch || searchableText.includes(normalizedSearch));
    });
  }, [articles, search, selectedYear]);

  return (
    <main className="min-h-screen bg-[#f2f7f4] text-[#173d3b]">
      <header className="border-b border-[#d5e6df] bg-[#f8fcfa]">
        <nav className="mx-auto flex max-w-[1240px] items-center justify-between gap-5 px-5 py-4 md:px-8">
          <a href="#inicio" className="flex items-center gap-3" aria-label="Hospital Evita, inicio">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#087d70] text-[#f4fffb]">
              <Activity size={20} />
            </span>
            <span>
              <span className="block text-xs font-bold tracking-[.12em]">HOSPITAL EVITA</span>
              <span className="mt-0.5 block text-[10px] uppercase tracking-[.15em] text-[#52766d]">Chief Journal</span>
            </span>
          </a>
          <div className="flex items-center gap-3">
            <a href="#archivo" className="hidden text-[12px] font-medium text-[#45665f] transition hover:text-[#07584f] sm:inline">
              Publicaciones
            </a>
            <Link
              to="/login"
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#087d70] px-4 text-[12px] font-semibold text-white transition hover:bg-[#07584f]"
            >
              Acceso institucional <ArrowRight size={15} />
            </Link>
          </div>
        </nav>
      </header>

      <section id="inicio" className="relative overflow-hidden bg-[#087366] text-[#f3fffa]">
        <div className="pointer-events-none absolute -right-36 -top-56 h-[600px] w-[600px] rounded-full border border-[#a8ead5]/20" />
        <div className="pointer-events-none absolute -right-12 -top-32 h-[380px] w-[380px] rounded-full border border-[#a8ead5]/25" />
        <div className="mx-auto grid max-w-[1240px] items-center gap-12 px-5 py-16 md:px-8 md:py-24 lg:grid-cols-[1.2fr_.8fr]">
          <div className="page-enter">
            <p className="mb-6 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[.2em] text-[#d0f2e3]">
              <span className="h-px w-7 bg-[#b3e8d3]" />Producción científica · Formosa
            </p>
            <h1 className="font-editorial max-w-[760px] text-[clamp(44px,7vw,78px)] leading-[.98] tracking-[-.04em]">
              Conocimiento que <i className="font-medium text-[#c0f2df]">transforma.</i>
            </h1>
            <p className="mt-6 max-w-[570px] text-[14px] leading-7 text-[#e0f4eb] md:text-[15px]">
              Explora la producción científica del Hospital Interdistrital Evita: publicaciones actuales y de años anteriores, abiertas para su consulta.
            </p>
            <a
              href="#archivo"
              className="mt-8 inline-flex h-12 items-center gap-2 rounded-xl bg-[#d7f2e6] px-5 text-[13px] font-semibold text-[#07584f] transition hover:bg-white"
            >
              Explorar publicaciones <ArrowDown size={16} />
            </a>
          </div>
          <aside className="relative rounded-2xl border border-[#b3e8d3]/30 bg-[#effff8]/10 p-6 backdrop-blur-sm md:p-8">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#d7f2e6] text-[#07584f]">
              <BookOpen size={21} />
            </div>
            <p className="mt-7 text-[10px] font-semibold uppercase tracking-[.17em] text-[#c7f0df]">Archivo abierto</p>
            <p className="font-editorial mt-2 text-[32px] leading-tight">Investigación al alcance de todos.</p>
            <p className="mt-3 text-[12px] leading-6 text-[#e0f4eb]">
              Consulta artículos publicados, encuentra trabajos por año o tema y descarga sus documentos en PDF.
            </p>
            <div className="mt-7 flex items-center gap-2 border-t border-[#b3e8d3]/30 pt-5 text-[10px] text-[#d0f2e3]">
              <FileText size={14} /> Acceso público sin cuenta
            </div>
          </aside>
        </div>
      </section>

      <section id="archivo" className="mx-auto max-w-[1240px] px-5 py-16 md:px-8 md:py-20">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[.18em] text-[#52766d]">Biblioteca digital</p>
            <h2 className="font-editorial mt-2 text-[38px] leading-tight tracking-[-.03em] md:text-[48px]">Archivo de publicaciones</h2>
            <p className="mt-2 max-w-[540px] text-[13px] leading-6 text-[#526e68]">
              Manuscritos publicados por el hospital, reunidos en un solo lugar para su consulta y descarga.
            </p>
          </div>
          {!loading && !error && (
            <p className="text-[11px] text-[#58786f]">
              {articles.length} {articles.length === 1 ? 'publicación disponible' : 'publicaciones disponibles'}
            </p>
          )}
        </div>

        <div className="mt-8 grid gap-3 rounded-2xl border border-[#d5e6df] bg-[#fcfefd] p-4 md:grid-cols-[1fr_190px] md:p-5">
          <label className="relative block">
            <span className="sr-only">Buscar publicaciones</span>
            <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64877c]" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por título, autor, palabra clave..."
              className="h-12 w-full rounded-xl border border-[#cfe4dc] bg-[#f8fcfa] pl-11 pr-4 text-[12px] text-[#173d3b] outline-none transition placeholder:text-[#7b958c] focus:border-[#087d70] focus:ring-4 focus:ring-[#bce8d8]/60"
            />
          </label>
          <label className="relative block">
            <span className="sr-only">Filtrar por año</span>
            <CalendarDays size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#64877c]" />
            <select
              value={selectedYear}
              onChange={(event) => setSelectedYear(event.target.value)}
              className="h-12 w-full appearance-none rounded-xl border border-[#cfe4dc] bg-[#f8fcfa] pl-11 pr-4 text-[12px] text-[#244f47] outline-none transition focus:border-[#087d70] focus:ring-4 focus:ring-[#bce8d8]/60"
            >
              <option value="all">Todos los años</option>
              {years.map((year) => <option key={year} value={year}>{year}</option>)}
            </select>
          </label>
        </div>

        <div className="mt-6">
          {loading && (
            <div className="rounded-2xl border border-[#d5e6df] bg-[#fcfefd] px-6 py-12 text-center text-[13px] text-[#526e68]" role="status">
              Cargando publicaciones...
            </div>
          )}
          {!loading && error && (
            <div className="rounded-2xl border border-[#e7c6bb] bg-[#fff9f6] px-6 py-8 text-center">
              <p className="text-[13px] font-semibold text-[#7b342d]">No pudimos cargar el archivo</p>
              <p className="mt-2 text-[12px] text-[#765b55]">{error}</p>
              <button
                type="button"
                onClick={() => void loadArticles()}
                className="mt-5 rounded-xl bg-[#087d70] px-4 py-2.5 text-[12px] font-semibold text-white transition hover:bg-[#07584f]"
              >
                Reintentar
              </button>
            </div>
          )}
          {!loading && !error && filteredArticles.length > 0 && (
            <div className="grid gap-4 md:grid-cols-2">
              {filteredArticles.map((article) => (
                <article key={article.id} className="flex flex-col rounded-2xl border border-[#d5e6df] bg-[#fcfefd] p-5 transition hover:border-[#9bcfbb] hover:shadow-[0_12px_30px_rgba(23,61,59,.06)] md:p-6">
                  <div className="flex items-center justify-between gap-3">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#e6f5ee] px-3 py-1.5 text-[10px] font-semibold text-[#07584f]">
                      <CalendarDays size={12} /> {new Date(article.createdAt).getFullYear()}
                    </span>
                    {article.specialty?.name && (
                      <span className="truncate text-[10px] font-medium text-[#58786f]">{article.specialty.name}</span>
                    )}
                  </div>
                  <h3 className="font-editorial mt-5 text-[24px] leading-tight text-[#173d3b]">{article.title}</h3>
                  {article.summary && <p className="mt-3 line-clamp-3 text-[12px] leading-6 text-[#526e68]">{article.summary}</p>}
                  {article.coauthors && article.coauthors.length > 0 && (
                    <p className="mt-3 text-[11px] text-[#58786f]">{article.coauthors.join(' · ')}</p>
                  )}
                  {article.keywords && article.keywords.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {article.keywords.slice(0, 4).map((keyword) => (
                        <span key={keyword} className="rounded-md bg-[#f0f6f3] px-2 py-1 text-[9px] text-[#52766d]">{keyword}</span>
                      ))}
                    </div>
                  )}
                  <div className="mt-auto border-t border-[#e3eee9] pt-5">
                    {article.pdfAvailable ? (
                      <a
                        href={`${apiBaseUrl}/articulos/publicados/${article.id}/pdf`}
                        className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#087d70] px-4 text-[11px] font-semibold text-white transition hover:bg-[#07584f]"
                      >
                        <Download size={15} /> Descargar PDF
                      </a>
                    ) : (
                      <span className="text-[11px] text-[#718a81]">PDF no disponible</span>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
          {!loading && !error && filteredArticles.length === 0 && (
            <div className="rounded-2xl border border-[#d5e6df] bg-[#fcfefd] px-6 py-12 text-center">
              <BookOpen className="mx-auto text-[#77a995]" size={25} />
              <p className="mt-3 text-[13px] font-semibold text-[#244f47]">
                {articles.length === 0 ? 'Todavía no hay publicaciones en el archivo.' : 'No encontramos publicaciones con esos filtros.'}
              </p>
              {articles.length > 0 && (
                <button
                  type="button"
                  onClick={() => { setSearch(''); setSelectedYear('all'); }}
                  className="mt-3 text-[11px] font-semibold text-[#087366] hover:text-[#07584f]"
                >
                  Limpiar filtros
                </button>
              )}
            </div>
          )}
        </div>
      </section>

      <footer className="border-t border-[#d5e6df] bg-[#e7f4ee]">
        <div className="mx-auto flex max-w-[1240px] flex-col gap-3 px-5 py-7 text-[10px] text-[#52766d] sm:flex-row sm:items-center sm:justify-between md:px-8">
          <span>© {new Date().getFullYear()} Hospital Interdistrital Evita</span>
          <Link to="/login" className="inline-flex items-center gap-1 font-semibold text-[#07584f] hover:underline">
            Acceso para autores y personal <ArrowRight size={13} />
          </Link>
        </div>
      </footer>
    </main>
  );
}
