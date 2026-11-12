import { useEffect, useState } from 'react';
import { FileText, CheckCircle2, MessageSquare, Loader2, Send, X, AlertCircle } from 'lucide-react';
import { getArticulosAsignados, enviarDictamen } from '../api/editor.api';
import { type Articulo } from '../api/articulos.api';

export const PanelEditor = () => {
  const [articulos, setArticulos] = useState<Articulo[]>([]);
  const [loading, setLoading] = useState(true);
  const [evaluando, setEvaluando] = useState<Articulo | null>(null);

  // Estado del formulario de dictamen
  const [dictamen, setDictamen] = useState('');
  const [comentarios, setComentarios] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    cargarBandeja();
  }, []);

  const cargarBandeja = async () => {
    try {
      setLoading(true);
      const data = await getArticulosAsignados();
      setArticulos(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error al cargar la bandeja del editor:', err);
      // Mock temporal visual hasta que el endpoint esté en el backend
      setArticulos([
        { id: 99, title: 'Impacto de la Inteligencia Artificial en Diagnósticos (Demo)', abstract: 'El presente estudio analiza las métricas de fiabilidad...', status: 'EN_REVISION', createdAt: new Date().toISOString() }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!evaluando || !dictamen) return;

    try {
      setIsSubmitting(true);

      // Descomentar cuando el endpoint esté listo:
      // await enviarDictamen(evaluando.id!, dictamen, comentarios);

      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulación

      setFeedback('Dictamen enviado correctamente al Comité.');
      setTimeout(() => {
        setFeedback('');
        setEvaluando(null);
        setDictamen('');
        setComentarios('');
        setArticulos(prev => prev.filter(a => a.id !== evaluando.id));
      }, 2000);

    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (evaluando) {
    return (
      <div className="page-enter space-y-6">
        <div className="flex items-center gap-3 text-[#52766d] transition hover:text-[#173d3b]">
          <button onClick={() => setEvaluando(null)} className="flex items-center gap-2 text-[12px] font-semibold"><X size={16} /> Volver a mis asignaciones</button>
        </div>

        <section className="rounded-2xl border border-[#d5e6df] bg-[#fcfefd] p-6 md:p-8">
          <div className="mb-6 border-b border-[#e3eee9] pb-6">
             <span className="mb-3 inline-block rounded-full bg-[#e1f3eb] px-2.5 py-1 text-[10px] font-semibold text-[#087366]">EVALUACIÓN TÉCNICA</span>
             <h2 className="text-[20px] font-semibold text-[#173d3b]">{evaluando.title}</h2>
             <p className="mt-3 text-[13px] leading-relaxed text-[#52766d]">{evaluando.abstract}</p>
             {evaluando.fileUrl && (
                <a href={`http://localhost:3000${evaluando.fileUrl}`} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#f3faf6] px-4 py-2 text-[12px] font-semibold text-[#087366] transition hover:bg-[#e1f3eb]">
                  <FileText size={16} /> Leer Documento Completo (PDF)
                </a>
             )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <label className="block">
              <span className="mb-2 flex items-center gap-1.5 text-[12px] font-semibold text-[#244f47]"><CheckCircle2 size={15} /> Veredicto Final</span>
              <select required value={dictamen} onChange={e => setDictamen(e.target.value)} className="h-11 w-full max-w-md rounded-xl border border-[#bfdcd0] bg-white px-4 text-[13px] text-[#173d3b] outline-none transition focus:border-[#087d70] focus:ring-4 focus:ring-[#bce8d8]/70">
                <option value="" disabled>Seleccione una resolución...</option>
                <option value="APROBADO">Aprobado (Sin cambios)</option>
                <option value="CORRECCIONES_MENORES">Aprobado con Correcciones Menores</option>
                <option value="CORRECCIONES_MAYORES">Requiere Correcciones Mayores</option>
                <option value="RECHAZADO">Rechazado</option>
              </select>
            </label>

            <label className="block">
              <span className="mb-2 flex items-center gap-1.5 text-[12px] font-semibold text-[#244f47]"><MessageSquare size={15} /> Comentarios y Sugerencias al Comité</span>
              <textarea required value={comentarios} onChange={e => setComentarios(e.target.value)} rows={6} placeholder="Detalle aquí las observaciones técnicas sobre la estructura, metodología o pertinencia del artículo..." className="w-full rounded-xl border border-[#bfdcd0] bg-white p-4 text-[13px] text-[#173d3b] outline-none transition focus:border-[#087d70] focus:ring-4 focus:ring-[#bce8d8]/70" />
            </label>

            {feedback && (
               <div className="flex items-center gap-2 rounded-lg bg-[#e1f3eb] p-3 text-[12px] font-semibold text-[#087366]">
                 <CheckCircle2 size={16} /> {feedback}
               </div>
            )}

            <div className="flex justify-end border-t border-[#e3eee9] pt-5">
              <button type="submit" disabled={isSubmitting || !dictamen} className="group flex h-11 items-center justify-center gap-2 rounded-xl bg-[#087d70] px-8 text-[13px] font-semibold text-white transition hover:bg-[#07584f] disabled:opacity-50">
                {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
                {isSubmitting ? "Enviando..." : "Enviar Dictamen"}
              </button>
            </div>
          </form>
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[.17em] text-[#52766d]">Área de Evaluación</p>
          <h2 className="font-editorial mt-2 text-[32px] tracking-[-.03em] text-[#173d3b]">Panel del Editor</h2>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-[#d5e6df] bg-[#fcfefd]">
        <div className="flex items-center justify-between border-b border-[#dcebe5] px-5 py-5 md:px-6">
          <h3 className="text-[14px] font-semibold text-[#244f47]">Manuscritos Asignados</h3>
        </div>
        <div className="divide-y divide-[#e3eee9]">
          {loading ? (
             <div className="flex flex-col items-center justify-center py-16 text-sm text-[#52766d]"><Loader2 className="mb-2 animate-spin" size={24} /> Buscando asignaciones...</div>
          ) : articulos.length > 0 ? (
            articulos.map((articulo, i) => {
              const safeId = articulo.id || i;
              return (
                <article key={safeId} className="flex flex-col gap-4 px-5 py-6 transition hover:bg-[#f3faf6] md:flex-row md:items-center md:justify-between md:px-6">
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex items-center gap-2">
                      <span className="rounded-full bg-[#e5edf0] px-2 py-0.5 text-[9px] font-semibold text-[#415e68]">PENDIENTE DE LECTURA</span>
                    </div>
                    <h4 className="text-[14px] font-semibold leading-5 text-[#244f47]">{articulo.title || 'Documento sin título'}</h4>
                    <p className="mt-1 text-[11px] text-[#58786f]">Asignado recientemente por el Comité Editorial</p>
                  </div>

                  <button onClick={() => setEvaluando(articulo)} className="shrink-0 rounded-xl border border-[#bce8d8] bg-white px-5 py-2.5 text-[12px] font-semibold text-[#087366] shadow-sm transition hover:bg-[#e1f3eb]">
                    Iniciar Evaluación
                  </button>
                </article>
              );
            })
          ) : (
             <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#f3faf6] text-[#52766d]"><AlertCircle size={24} /></div>
                <h4 className="text-[14px] font-semibold text-[#244f47]">No tienes asignaciones pendientes</h4>
                <p className="mt-1 text-[12px] text-[#526e68]">El Comité Editorial no te ha derivado nuevos manuscritos.</p>
             </div>
          )}
        </div>
      </section>
    </div>
  );
};
export default PanelEditor;