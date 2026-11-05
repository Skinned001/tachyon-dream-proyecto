import { useEffect, useState } from "react";
import { FileText, Plus, UploadCloud, X, Loader2, FileUp } from "lucide-react";
import { getMisArticulos, subirManuscrito, type Articulo } from "../api/articulos.api";

export const MisArticulos = () => {
  const [articulos, setArticulos] = useState<Articulo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [title, setTitle] = useState("");
  const [abstract, setAbstract] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    cargarArticulos();
  }, []);

  const cargarArticulos = async () => {
    try {
      setLoading(true);
      const data = await getMisArticulos();
      setArticulos(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error al cargar artículos:", err);
      setArticulos([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selected = e.target.files[0];
      if (selected.type !== "application/pdf") {
        setError("Solo se permiten archivos en formato PDF.");
        setFile(null);
      } else {
        setError("");
        setFile(selected);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !abstract || !file) {
      setError("Por favor, completa todos los campos y adjunta un PDF.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");

      const formData = new FormData();
      formData.append("title", title);
      formData.append("abstract", abstract);
      formData.append("titulo", title);
      formData.append("resumen", abstract);
      formData.append("specialtyId", "1"); // El ID que pide Zod
      formData.append("file", file);

      await subirManuscrito(formData);

      setTitle("");
      setAbstract("");
      setFile(null);
      setShowForm(false);
      await cargarArticulos();
    } catch (err: any) {
      const zodDetails = err.response?.data?.details;
      if (zodDetails && Array.isArray(zodDetails)) {
        const fallos = zodDetails.map((d: any) => `${d.path.join('.')}: ${d.message}`).join(' | ');
        setError(`Error de validación: ${fallos}`);
      } else {
        setError(err.response?.data?.error || "Error al subir el manuscrito.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <section className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[.17em] text-[#52766d]">Área del Autor</p>
          <h2 className="font-editorial mt-2 text-[32px] tracking-[-.03em] text-[#173d3b]">Mis Manuscritos</h2>
        </div>
        {!showForm && (
          <button onClick={() => setShowForm(true)} className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#087d70] px-4 text-[12px] font-semibold text-white transition hover:bg-[#07584f]">
            <Plus size={15} /> Nuevo Manuscrito
          </button>
        )}
      </section>

      {showForm && (
        <section className="page-enter rounded-[22px] border border-[#d5e6df] bg-[#fcfefd] p-6 md:p-8">
          <div className="mb-6 flex items-center justify-between border-b border-[#e3eee9] pb-4">
            <h3 className="text-[16px] font-semibold text-[#173d3b]">Someter Nuevo Artículo</h3>
            <button onClick={() => setShowForm(false)} className="text-[#52766d] hover:text-[#173d3b]"><X size={18} /></button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-5 max-w-2xl">
            <label className="block">
              <span className="mb-2 block text-[11px] font-semibold text-[#244f47]">Título de la Investigación</span>
              <input type="text" required value={title} onChange={e => setTitle(e.target.value)} placeholder="Ej. Resultados a largo plazo..." className="h-11 w-full rounded-xl border border-[#bfdcd0] bg-[#fcfefd] px-4 text-[13px] text-[#173d3b] outline-none transition focus:border-[#087d70] focus:ring-4 focus:ring-[#bce8d8]/70" />
            </label>
            <label className="block">
              <span className="mb-2 block text-[11px] font-semibold text-[#244f47]">Resumen (Abstract)</span>
              <textarea required value={abstract} onChange={e => setAbstract(e.target.value)} rows={4} placeholder="Breve descripción del estudio..." className="w-full rounded-xl border border-[#bfdcd0] bg-[#fcfefd] p-4 text-[13px] text-[#173d3b] outline-none transition focus:border-[#087d70] focus:ring-4 focus:ring-[#bce8d8]/70" />
            </label>
            
            <div className="rounded-xl border border-dashed border-[#82c4a9] bg-[#f3faf6] p-6 text-center">
              <input type="file" id="file-upload" accept="application/pdf" className="hidden" onChange={handleFileChange} />
              <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#d7f2e6] text-[#087366]"><UploadCloud size={20} /></div>
                <p className="mt-3 text-[12px] font-semibold text-[#244f47]">{file ? file.name : "Haz clic para seleccionar tu PDF"}</p>
                <p className="mt-1 text-[10px] text-[#526e68]">{file ? "Archivo adjunto listo" : "Solo formato .pdf (Máx. 10MB)"}</p>
              </label>
            </div>

            {error && <p className="text-[11px] text-[#a3342d]">{error}</p>}

            <div className="flex justify-end pt-4">
              <button type="submit" disabled={isSubmitting} className="group flex h-11 items-center justify-center gap-2 rounded-xl bg-[#087d70] px-6 text-[13px] font-semibold text-white transition hover:bg-[#07584f] disabled:opacity-70">
                {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : <FileUp size={16} />}
                {isSubmitting ? "Subiendo..." : "Enviar a Revisión"}
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="overflow-hidden rounded-2xl border border-[#d5e6df] bg-[#fcfefd]">
        <div className="flex items-center justify-between border-b border-[#dcebe5] px-5 py-5 md:px-6">
          <h3 className="text-[14px] font-semibold text-[#244f47]">Historial de Producción</h3>
        </div>
        <div className="divide-y divide-[#e3eee9]">
          {loading ? (
             <div className="py-12 text-center text-sm text-[#52766d]">Cargando artículos...</div>
          ) : articulos.length > 0 ? (
            articulos.map((articulo, i) => {
              const statusStr = articulo.status ? articulo.status.toString() : "BORRADOR";
              return (
                <article key={articulo.id || i} className="flex items-start justify-between gap-3 px-5 py-5 transition hover:bg-[#f1f9f5] md:px-6">
                  <div className="min-w-0">
                    <h4 className="max-w-[520px] text-[12px] font-semibold leading-5 text-[#244f47]">{articulo.title || "Documento sin título"}</h4>
                    <p className="mt-1.5 text-[10px] text-[#52766d] line-clamp-1">{articulo.abstract || "Sin resumen"}</p>
                    <div className="mt-3 flex items-center gap-3">
                      <p className="text-[10px] text-[#58786f]">Enviado: {articulo.createdAt ? new Date(articulo.createdAt).toLocaleDateString("es-AR") : "Fecha desconocida"}</p>
                      {articulo.fileUrl && (
                         <a href={`http://localhost:3000${articulo.fileUrl}`} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-[10px] font-semibold text-[#087366] hover:underline">
                           <FileText size={12} /> Ver PDF
                         </a>
                      )}
                    </div>
                  </div>
                  <span className={`mt-0.5 shrink-0 rounded-full px-2.5 py-1 text-[9px] font-semibold ${
                    statusStr === "APROBADO" || statusStr === "PUBLICADO" ? "bg-[#d7f2e6] text-[#126443]" : statusStr === "EN_REVISION" ? "bg-[#fff0cf] text-[#85500b]" : "bg-[#e5edf0] text-[#415e68]"
                  }`}>
                    {statusStr.replace("_", " ")}
                  </span>
                </article>
              );
            })
          ) : (
             <div className="py-12 text-center text-[12px] text-[#526e68]">No has enviado ningún manuscrito todavía.</div>
          )}
        </div>
      </section>
    </div>
  );
};
export default MisArticulos;