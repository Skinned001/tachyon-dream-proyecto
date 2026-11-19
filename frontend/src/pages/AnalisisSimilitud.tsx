import { useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  FileSearch,
  Loader2,
  ShieldCheck,
  UploadCloud,
} from 'lucide-react';
import {
  analyzeSimilarity,
  type SimilarityReport,
  type SimilaritySourceMode,
} from '../api/ai.api';

const DEMO_TEXT =
  'En una evaluación piloto del programa de acompañamiento, el equipo registró la participación de cada unidad durante ocho semanas.';

export function AnalisisSimilitud() {
  const [sourceMode, setSourceMode] = useState<SimilaritySourceMode>('demo');
  const [targetText, setTargetText] = useState(DEMO_TEXT);
  const [targetFile, setTargetFile] = useState<File | null>(null);
  const [referenceFiles, setReferenceFiles] = useState<File[]>([]);
  const [report, setReport] = useState<SimilarityReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const changeSourceMode = (mode: SimilaritySourceMode) => {
    setSourceMode(mode);
    setReport(null);
    setError('');
  };

  const handleTargetFile = (file: File | undefined) => {
    setTargetFile(file ?? null);
    setReport(null);
    setError('');
  };

  const handleReferenceFiles = (files: FileList | null) => {
    const selected = files ? Array.from(files) : [];
    if (selected.some((file) => file.type !== 'application/pdf')) {
      setReferenceFiles([]);
      setError('Todas las referencias deben ser archivos PDF.');
      return;
    }
    if (selected.length > 5) {
      setReferenceFiles([]);
      setError('Puedes cargar hasta 5 referencias por análisis.');
      return;
    }
    setReferenceFiles(selected);
    setReport(null);
    setError('');
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setReport(null);

    if (!targetFile && !targetText.trim() && sourceMode !== 'demo') {
      setError('Adjunta un PDF objetivo o escribe el texto que deseas revisar.');
      return;
    }
    if (sourceMode === 'uploaded' && referenceFiles.length === 0) {
      setError('Carga al menos un PDF de referencia para comparar.');
      return;
    }

    try {
      setLoading(true);
      const result = await analyzeSimilarity(
        sourceMode,
        targetText,
        targetFile,
        sourceMode === 'uploaded' ? referenceFiles : [],
      );
      setReport(result);
    } catch (requestError: unknown) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'No se pudo completar el análisis.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-7">
      <section>
        <p className="text-[10px] font-semibold uppercase tracking-[.17em] text-[#52766d]">
          Prototipo local
        </p>
        <h2 className="font-editorial mt-2 text-[32px] tracking-[-.03em] text-[#173d3b]">
          Análisis de similitud
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-[#52766d]">
          Revisa coincidencias textuales con las fuentes seleccionadas. El prototipo no
          busca en internet ni determina si existe plagio.
        </p>
      </section>

      <section className="rounded-2xl border border-[#d5e6df] bg-[#fcfefd] p-5 md:p-7">
        <div className="mb-6 grid gap-3 md:grid-cols-2">
          <button
            type="button"
            onClick={() => changeSourceMode('demo')}
            aria-pressed={sourceMode === 'demo'}
            className={`rounded-xl border p-4 text-left transition ${
              sourceMode === 'demo'
                ? 'border-[#087d70] bg-[#e7f4ee]'
                : 'border-[#d5e6df] hover:bg-[#f3faf6]'
            }`}
          >
            <span className="block text-sm font-semibold text-[#173d3b]">
              Probar con referencias sintéticas
            </span>
            <span className="mt-1 block text-xs text-[#52766d]">
              Ejecuta un caso de prueba preparado para la demostración.
            </span>
          </button>
          <button
            type="button"
            onClick={() => changeSourceMode('uploaded')}
            aria-pressed={sourceMode === 'uploaded'}
            className={`rounded-xl border p-4 text-left transition ${
              sourceMode === 'uploaded'
                ? 'border-[#087d70] bg-[#e7f4ee]'
                : 'border-[#d5e6df] hover:bg-[#f3faf6]'
            }`}
          >
            <span className="block text-sm font-semibold text-[#173d3b]">
              Cargar mis propias referencias
            </span>
            <span className="mt-1 block text-xs text-[#52766d]">
              Compara contra hasta 5 PDFs que selecciones.
            </span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <label className="block">
            <span className="mb-2 block text-xs font-semibold text-[#244f47]">
              Texto objetivo
            </span>
            <textarea
              value={targetText}
              onChange={(event) => {
                setTargetText(event.target.value);
                setTargetFile(null);
                setReport(null);
              }}
              maxLength={20_000}
              rows={5}
              placeholder="Pega aquí un fragmento para comparar..."
              className="w-full rounded-xl border border-[#bfdcd0] bg-white p-4 text-sm text-[#173d3b] outline-none focus:border-[#087d70] focus:ring-4 focus:ring-[#bce8d8]/70"
            />
            <span className="mt-1 block text-right text-[10px] text-[#52766d]">
              {targetText.length.toLocaleString('es-AR')} / 20.000 caracteres
            </span>
          </label>

          <div className="rounded-xl border border-dashed border-[#82c4a9] bg-[#f3faf6] p-4">
            <label className="flex cursor-pointer items-center gap-3">
              <UploadCloud size={19} className="shrink-0 text-[#087366]" />
              <span className="min-w-0">
                <span className="block text-xs font-semibold text-[#244f47]">
                  {targetFile ? targetFile.name : 'O selecciona un PDF objetivo'}
                </span>
                <span className="block text-[10px] text-[#526e68]">
                  Máximo 10 MB. Si adjuntas un PDF, se usará en lugar del texto.
                </span>
              </span>
              <input
                type="file"
                accept="application/pdf,.pdf"
                className="sr-only"
                onChange={(event) => handleTargetFile(event.target.files?.[0])}
              />
            </label>
          </div>

          {sourceMode === 'uploaded' && (
            <label className="block rounded-xl border border-dashed border-[#82c4a9] bg-[#f3faf6] p-4">
              <span className="mb-2 block text-xs font-semibold text-[#244f47]">
                PDFs de referencia
              </span>
              <input
                type="file"
                accept="application/pdf,.pdf"
                multiple
                onChange={(event) => handleReferenceFiles(event.target.files)}
                className="block w-full text-xs text-[#526e68] file:mr-3 file:rounded-lg file:border-0 file:bg-[#d7f2e6] file:px-3 file:py-2 file:text-xs file:font-semibold file:text-[#07584f]"
              />
              <span className="mt-2 block text-[10px] text-[#526e68]">
                Hasta 5 PDFs; máximo 20 MB en total con el objetivo.
              </span>
              {referenceFiles.length > 0 && (
                <span className="mt-1 block text-[10px] text-[#087366]">
                  {referenceFiles.length} referencia(s) seleccionada(s).
                </span>
              )}
            </label>
          )}

          <div className="flex items-start gap-2 rounded-xl border border-[#d5e6df] bg-[#f8fcfa] p-3 text-[11px] leading-5 text-[#45665f]">
            <ShieldCheck className="mt-0.5 shrink-0 text-[#087366]" size={15} />
            <span>
              Los archivos se procesan para esta solicitud y no se guardan como referencias
              permanentes. No cargues información sensible de pacientes.
            </span>
          </div>

          {error && (
            <p role="alert" className="flex items-center gap-2 text-xs text-[#a3342d]">
              <AlertCircle size={15} /> {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex h-11 items-center justify-center gap-2 rounded-xl bg-[#087d70] px-5 text-sm font-semibold text-white transition hover:bg-[#07584f] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? <Loader2 className="animate-spin" size={16} /> : <FileSearch size={16} />}
            {loading ? 'Analizando…' : 'Comparar documentos'}
          </button>
        </form>
      </section>

      {report && (
        <section
          aria-live="polite"
          className="space-y-4 rounded-2xl border border-[#d5e6df] bg-[#fcfefd] p-5 md:p-7"
        >
          <div className="flex items-start gap-3">
            {report.status === 'completed' ? (
              <CheckCircle2 className="mt-0.5 shrink-0 text-[#087366]" size={20} />
            ) : (
              <AlertCircle className="mt-0.5 shrink-0 text-[#a66a13]" size={20} />
            )}
            <div>
              <h3 className="text-sm font-semibold text-[#173d3b]">
                {report.status === 'completed' ? 'Análisis completado' : 'No evaluable'}
              </h3>
              <p className="mt-1 text-xs leading-5 text-[#52766d]">{report.message}</p>
            </div>
          </div>

          {report.warnings.map((warning) => (
            <p key={warning} className="rounded-lg bg-[#fff7e6] px-3 py-2 text-xs text-[#85500b]">
              {warning}
            </p>
          ))}

          {report.findings.length > 0 ? (
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-[#244f47]">
                Coincidencias potenciales: {report.findings.length}
              </h4>
              {report.findings.map((finding, index) => (
                <article
                  key={`${finding.sourceLabel}-${finding.sourcePage}-${index}`}
                  className="rounded-xl border border-[#d5e6df] bg-[#f8fcfa] p-4"
                >
                  <div className="flex flex-wrap justify-between gap-2 text-[11px] font-semibold text-[#244f47]">
                    <span>{finding.sourceLabel}</span>
                    <span>
                      Página objetivo {finding.targetPage} · referencia {finding.sourcePage}
                    </span>
                  </div>
                  <blockquote className="mt-3 border-l-2 border-[#82c4a9] pl-3 text-xs leading-5 text-[#45665f]">
                    “{finding.excerpt}”
                  </blockquote>
                  <p className="mt-2 text-[10px] text-[#52766d]">
                    {finding.matchedTokens} palabras consecutivas coincidentes
                  </p>
                </article>
              ))}
            </div>
          ) : (
            report.status === 'completed' && (
              <p className="rounded-xl bg-[#f3faf6] p-4 text-xs leading-5 text-[#45665f]">
                No hubo coincidencias en las fuentes comparadas. Esto no demuestra que el
                documento esté libre de plagio.
              </p>
            )
          )}

          <p className="border-t border-[#e3eee9] pt-3 text-[10px] leading-5 text-[#58786f]">
            {report.disclaimer} Analizador {report.analyzerVersion}.
          </p>
        </section>
      )}
    </div>
  );
}

export default AnalisisSimilitud;
