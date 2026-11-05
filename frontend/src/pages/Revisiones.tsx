import { useEffect, useState } from 'react';
import { FileText, Inbox, Users, CheckCircle2, AlertCircle, Loader2, ArrowRight, X } from 'lucide-react';
import { getArticulosGenerales, asignarRevisores, especialistasMock } from '../api/comite.api';
import { type Articulo } from '../api/articulos.api';

export const Revisiones = () => {
  const [articulos, setArticulos] = useState<Articulo[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Ahora guardamos un array de strings (IDs) por cada artículo
  const [asignaciones, setAsignaciones] = useState<Record<number, string[]>>({});
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<{ id: number; type: 'success' | 'error'; msg: string } | null>(null);

  useEffect(() => {
    cargarBandeja();
  }, []);

  const cargarBandeja = async () => {
    try {
      setLoading(true);
      const data = await getArticulosGenerales();
      setArticulos(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error al cargar la bandeja del comité:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddRevisor = (articuloId: number, revisorId: string) => {
    if (!revisorId) return;
    setAsignaciones(prev => {
      const actuales = prev[articuloId] || [];
      // Evitamos duplicados
      if (actuales.includes(revisorId)) return prev;
      return { ...prev, [articuloId]: [...actuales, revisorId] };
    });
  };

  const handleRemoveRevisor = (articuloId: number, revisorId: string) => {
    setAsignaciones(prev => {
      const actuales = prev[articuloId] || [];
      return { ...prev, [articuloId]: actuales.filter(id => id !== revisorId) };
    });
  };

  const handleAsignar = async (articuloId: number) => {
    const revisores = asignaciones[articuloId] || [];
    if (revisores.length === 0) return;

    try {
      setProcessingId(articuloId);
      setFeedback(null);
      
      const revisoresNumericos = revisores.map(id => Number(id));
      
      // Descomentar cuando el endpoint esté listo en el backend:
      // await asignarRevisores(articuloId, revisoresNumericos);
      
      // Simulación temporal
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setFeedback({ id: articuloId, type: 'success', msg: `Derivado a ${revisores.length} especialista(s).` });
      setTimeout(() => setFeedback(null), 3000);
      
    } catch (err: any) {
      setFeedback({ id: articuloId, type: 'error', msg: err.response?.data?.error || 'Error al derivar.' });
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-8">
      <section className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[.17em] text-[#52766d]">Comité Editorial</p>
          <h2 className="font-editorial mt-2 text-[32px] tracking-[-.03em] text-[#173d3b]">Mesa de Entrada</h2>
        </div>
        <div className="flex h-10 items-center gap-2 rounded-xl bg-[#e1f3eb] px-4 text-[12px] font-semibold text-[#087366]">
          <Inbox size={16} /> {articulos.length} Nuevos Ingresos
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-[#d5e6df] bg-[#fcfefd]">
        <div className="flex items-center justify-between border-b border-[#dcebe5] px-5 py-5 md:px-6">
          <h3 className="text-[14px] font-semibold text-[#244f47]">Manuscritos Pendientes de Derivación</h3>
        </div>
        <div className="divide-y divide-[#e3eee9]">
          {loading ? (
             <div className="flex flex-col items-center justify-center py-16 text-sm text-[#52766d]">
               <Loader2 className="mb-2 animate-spin" size={24} /> Cargando ingresos...
             </div>
          ) : articulos.length > 0 ? (
            articulos.map((articulo, i) => {
              const safeId = articulo.id || i;
              const isProcessing = processingId === safeId;
              const feedbackMsg = feedback?.id === safeId ? feedback : null;
              const revisoresSeleccionados = asignaciones[safeId] || [];

              return (
                <article key={safeId} className="flex flex-col gap-5 px-5 py-6 transition hover:bg-[#f3faf6] md:flex-row md:items-start md:justify-between md:px-6">
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex items-center gap-2">
                      <span className="rounded-full bg-[#fff0cf] px-2 py-0.5 text-[9px] font-semibold text-[#85500b]">NUEVO INGRESO</span>
                      <span className="text-[10px] text-[#58786f]">ID: #{safeId}</span>
                    </div>
                    <h4 className="text-[14px] font-semibold leading-5 text-[#244f47]">{articulo.title || 'Documento sin título'}</h4>
                    <p className="mt-1.5 line-clamp-2 pr-4 text-[11px] text-[#52766d]">{articulo.abstract || 'Sin resumen'}</p>
                    <div className="mt-3 flex items-center gap-4">
                      {articulo.fileUrl && (
                         <a href={`http://localhost:3000${articulo.fileUrl}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-[10px] font-semibold text-[#087366] hover:underline">
                           <FileText size={13} /> Leer PDF
                         </a>
                      )}
                    </div>
                  </div>
                  
                  <div className="w-full shrink-0 rounded-xl border border-[#bce8d8] bg-white p-4 shadow-sm md:w-[320px]">
                    <p className="mb-3 flex items-center gap-1.5 text-[11px] font-semibold text-[#244f47]">
                      <Users size={14} /> Designar Pares Evaluadores
                    </p>
                    
                    {/* Lista de etiquetas (chips) de doctores seleccionados */}
                    {revisoresSeleccionados.length > 0 && (
                      <div className="mb-3 flex flex-wrap gap-1.5">
                        {revisoresSeleccionados.map(id => {
                          const doc = especialistasMock.find(e => e.id.toString() === id);
                          return (
                            <span key={id} className="flex items-center gap-1 rounded-md bg-[#e1f3eb] px-2 py-1 text-[10px] font-semibold text-[#087366]">
                              {doc?.nombre}
                              <button onClick={() => handleRemoveRevisor(safeId, id)} disabled={isProcessing} className="ml-0.5 text-[#52766d] hover:text-[#a3342d] disabled:opacity-50">
                                <X size={11} strokeWidth={3} />
                              </button>
                            </span>
                          );
                        })}
                      </div>
                    )}

                    <select 
                      className="mb-4 h-10 w-full rounded-lg border border-[#d5e6df] bg-[#fcfefd] px-3 text-[12px] text-[#173d3b] outline-none focus:border-[#087d70]"
                      value=""
                      onChange={(e) => handleAddRevisor(safeId, e.target.value)}
                      disabled={isProcessing}
                    >
                      <option value="" disabled>+ Agregar especialista...</option>
                      {especialistasMock.map(esp => (
                        <option key={esp.id} value={esp.id} disabled={revisoresSeleccionados.includes(esp.id.toString())}>
                          {esp.nombre} ({esp.especialidad})
                        </option>
                      ))}
                    </select>
                    
                    {feedbackMsg ? (
                      <div className={`flex items-center justify-center gap-1.5 text-[11px] font-semibold ${feedbackMsg.type === 'success' ? 'text-[#087366]' : 'text-[#a3342d]'}`}>
                        {feedbackMsg.type === 'success' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                        {feedbackMsg.msg}
                      </div>
                    ) : (
                      <button onClick={() => handleAsignar(safeId)} disabled={revisoresSeleccionados.length === 0 || isProcessing} className="flex h-9 w-full items-center justify-center gap-2 rounded-lg bg-[#087d70] px-4 text-[12px] font-semibold text-white transition hover:bg-[#07584f] disabled:opacity-50 disabled:hover:bg-[#087d70]">
                        {isProcessing ? <Loader2 className="animate-spin" size={14} /> : `Derivar a ${revisoresSeleccionados.length || '...'} Revisor(es)`}
                        {!isProcessing && <ArrowRight size={14} />}
                      </button>
                    )}
                  </div>
                </article>
              );
            })
          ) : (
             <div className="flex flex-col items-center justify-center py-16 text-center text-[12px] text-[#526e68]">No hay nuevos manuscritos esperando derivación.</div>
          )}
        </div>
      </section>
    </div>
  );
};
export default Revisiones;