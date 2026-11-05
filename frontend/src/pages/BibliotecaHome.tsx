import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowDownToLine, BookMarked, BookOpen, FileText, Filter, Search, SlidersHorizontal, X } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { getRecursosBiblioteca, type RecursoBiblioteca } from '../api/biblioteca.api';

const tiposDisponibles = ['Todos los recursos', 'Guía', 'Estándar de reporte', 'Recurso formativo', 'Herramienta', 'Plantilla', 'Lista de verificación'];

export const BibliotecaHome = () => {
  const [recursos, setRecursos] = useState<RecursoBiblioteca[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('Todos los recursos');
  const [saved, setSaved] = useState<string[]>([]);
  const [notice, setNotice] = useState('');
  
  const [searchParams, setSearchParams] = useSearchParams();
  const searchInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    cargarRecursos();
    if (searchParams.get('focus') === 'search') {
      searchInput.current?.focus();
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const cargarRecursos = async () => {
    try {
      setLoading(true);
      const data = await getRecursosBiblioteca();
      // Aseguramos que data sea un array válido, incluso si la API falla parcialmente
      setRecursos(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error al cargar la biblioteca:', error);
      setRecursos([]);
    } finally {
      setLoading(false);
    }
  };

  const visibleResources = useMemo(() => recursos.filter(resource => {
    // Protección contra valores nulos en la búsqueda
    const titulo = resource.titulo || '';
    const descripcion = resource.descripcion || '';
    const area = resource.area || '';
    const tipo = resource.tipo || '';

    const textToSearch = `${titulo} ${descripcion} ${area} ${tipo}`.toLowerCase();
    const matchesQuery = textToSearch.includes(query.toLowerCase());
    const matchesType = category === 'Todos los recursos' || tipo === category;
    return matchesQuery && matchesType;
  }), [query, category, recursos]);

  function toggleSaved(title: string) {
    if (!title) return;
    const isSaved = saved.includes(title);
    setSaved(current => isSaved ? current.filter(item => item !== title) : [...current, title]);
    setNotice(isSaved ? 'Se quitó de tus recursos guardados.' : 'Se agregó a tus recursos guardados.');
    window.setTimeout(() => setNotice(''), 2600);
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
              {tiposDisponibles.map(type => (
                <button key={type} onClick={() => setCategory(type)} className={`shrink-0 rounded-lg px-3 py-2 text-left text-[11px] transition ${category === type ? 'bg-[#bce8d8] font-semibold text-[#07584f] shadow-[inset_3px_0_0_#087d70]' : 'text-[#45665f] hover:bg-[#dff2e9]'}`}>
                  {type}
                </button>
              ))}
            </div>
          </div>
          <div className="hidden rounded-xl border border-[#d5e6df] bg-[#fcfefd] p-4 lg:block">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#d7f2e6] text-[#087366]"><Filter size={15} /></div>
            <p className="mt-3 text-[11px] font-semibold text-[#244f47]">Conexión en vivo</p>
            <p className="mt-1 text-[10px] leading-4 text-[#526e68]">Mostrando recursos sincronizados desde PostgreSQL.</p>
          </div>
        </aside>

        <div>
          <div className="mb-4 flex items-center justify-between">
            <p className="text-[11px] text-[#526e68]">Se muestran <span className="font-semibold text-[#244f47]">{loading ? '...' : visibleResources.length}</span> recursos</p>
            <button onClick={() => { setCategory('Todos los recursos'); setQuery(''); }} className="flex items-center gap-1.5 text-[10px] font-medium text-[#45665f] hover:text-[#07584f]"><X size={12} /> Borrar filtros</button>
          </div>

          {loading ? (
             <div className="py-16 text-center text-sm text-[#52766d]">Cargando recursos desde el servidor...</div>
          ) : visibleResources.length ? (
            <div className="grid gap-3 md:grid-cols-2">
              {visibleResources.map((resource, i) => {
                const visual = getVisualProps(resource.titulo, i);
                const safeTitulo = resource.titulo || 'Documento sin título';
                
                return (
                  <article key={resource.id || i} className="group rounded-2xl border border-[#d5e6df] bg-[#fcfefd] p-5 transition hover:-translate-y-0.5 hover:border-[#82c4a9] hover:shadow-[0_8px_24px_rgba(7,88,79,.09)]">
                    <div className="flex items-start justify-between gap-3">
                      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-[11px] font-bold tracking-wide ${visual.color === 'sage' ? 'bg-[#d7f2e6] text-[#08745e]' : visual.color === 'sand' ? 'bg-[#fff0cf] text-[#85500b]' : visual.color === 'blue' ? 'bg-[#dcecf4] text-[#28677c]' : 'bg-[#ffe3dc] text-[#9a4939]'}`}>{visual.initials}</div>
                      <button onClick={() => toggleSaved(safeTitulo)} className={`flex h-8 w-8 items-center justify-center rounded-full transition ${saved.includes(safeTitulo) ? 'bg-[#bce8d8] text-[#07584f]' : 'text-[#52766d] hover:bg-[#dff2e9] hover:text-[#07584f]'}`}>
                        <BookMarked fill={saved.includes(safeTitulo) ? 'currentColor' : 'none'} size={15} />
                      </button>
                    </div>
                    <div className="mt-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-[#e1f3eb] px-2 py-1 text-[9px] font-semibold text-[#17624f]">{resource.tipo || 'General'}</span>
                        <span className="text-[9px] text-[#52766d]">{resource.area || 'Sin área'}</span>
                        <span className={`rounded-full px-2 py-1 text-[9px] font-semibold ${resource.visibilidad === 'PUBLICO' ? 'bg-slate-100 text-slate-600' : resource.visibilidad === 'INTERNO' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}>{resource.visibilidad || 'PÚBLICO'}</span>
                      </div>
                      <h4 className="mt-3 text-[13px] font-semibold leading-5 text-[#244f47]">{safeTitulo}</h4>
                      <p className="mt-1.5 min-h-[34px] text-[10px] leading-[1.7] text-[#526e68] line-clamp-2">{resource.descripcion || 'Sin descripción'}</p>
                    </div>
                    <div className="mt-4 flex items-center justify-between border-t border-[#e3eee9] pt-3">
                      <div className="flex items-center gap-1.5 text-[9px] text-[#52766d]"><FileText size={12} />PDF</div>
                      <a href={resource.archivoUrl ? `http://localhost:3000${resource.archivoUrl}` : '#'} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-[10px] font-semibold text-[#087366] hover:underline">
                        <ArrowDownToLine size={13} /> Descargar
                      </a>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-[#a9d2c1] bg-[#f3faf6] px-6 py-16 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#d7f2e6] text-[#087366]"><Search size={20} /></div>
              <h4 className="font-editorial mt-4 text-[22px] text-[#244f47]">No se encontraron recursos</h4>
              <p className="mt-2 text-[11px] text-[#526e68]">Intenta con otra búsqueda o comunícate con Docencia e Investigación.</p>
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