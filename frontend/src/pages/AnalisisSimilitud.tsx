import { useState } from 'react';
import {
  AlertCircle,
  BookMarked,
  CheckCircle2,
  Database,
  ExternalLink,
  FileSearch,
  Globe,
  Loader2,
  ShieldCheck,
  Sparkles,
  UploadCloud,
} from 'lucide-react';
import {
  analyzeSimilarity,
  type SimilarityReport,
  type SimilaritySourceMode,
} from '../api/ai.api';

const DEMO_TEXT =
  'En una evaluación piloto del programa de acompañamiento, el equipo registró la participación de cada unidad durante ocho semanas.';

const PROVIDER_LABELS: Record<string, string> = {
  internal_corpus: 'Corpus HIEF',
  openalex: 'OpenAlex',
  crossref: 'Crossref',
  europe_pmc: 'Europe PMC',
  open_web: 'Web abierta',
  uploaded: 'PDF cargado',
  synthetic: 'Sintética',
};

const apiRoot = (import.meta.env.VITE_API_URL || 'http://localhost:3000/api')
  .replace(/\/api\/?$/, '')
  .replace(/\/$/, '');

const resolveSafeSourceUrl = (url: string | null | undefined): string | null => {
  if (!url) return null;
  if (url.startsWith('https://') || url.startsWith('http://')) {
    return url;
  }
  if (url.startsWith('/')) {
    return apiRoot ? `${apiRoot}${url}` : url;
  }
  return null;
};

export function AnalisisSimilitud() {
  const [sourceMode, setSourceMode] = useState<SimilaritySourceMode>('corpus');
  const [targetText, setTargetText] = useState('');
  const [targetFile, setTargetFile] = useState<File | null>(null);
  const [referenceFiles, setReferenceFiles] = useState<File[]>([]);
  const [includeInternalCorpus, setIncludeInternalCorpus] = useState(true);
  const [includeScientificApis, setIncludeScientificApis] = useState(true);
  const [includeOpenWeb, setIncludeOpenWeb] = useState(false);
  const [report, setReport] = useState<SimilarityReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const changeSourceMode = (mode: SimilaritySourceMode) => {
    setSourceMode(mode);
    setReport(null);
    setError('');
    if (mode === 'demo' && !targetText.trim() && !targetFile) {
      setTargetText(DEMO_TEXT);
    }
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
    if (
      sourceMode === 'corpus' &&
      !includeInternalCorpus &&
      !includeScientificApis &&
      !includeOpenWeb
    ) {
      setError('Activa al menos una fuente de comparación.');
      return;
    }

    try {
      setLoading(true);
      const result = await analyzeSimilarity(
        sourceMode,
        targetText,
        targetFile,
        sourceMode === 'uploaded' ? referenceFiles : [],
        {
          includeInternalCorpus,
          includeScientificApis,
          includeOpenWeb,
        },
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
          Apoyo editorial
        </p>
        <h2 className="font-editorial mt-2 text-[32px] tracking-[-.03em] text-[#173d3b]">
          Análisis de similitud
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-[#52766d]">
          Compara coincidencias literales y léxicas contra publicaciones del Hospital
          Evita, bases científicas abiertas (OpenAlex, Crossref y Europe PMC) o PDFs
          cargados. Es una herramienta de apoyo y no emite dictámenes automáticos de plagio.
        </p>
      </section>

      <section className="rounded-2xl border border-[#d5e6df] bg-[#fcfefd] p-5 md:p-7">
        <div className="mb-6 grid gap-3 md:grid-cols-3">
          <button
            type="button"
            onClick={() => changeSourceMode('corpus')}
            aria-pressed={sourceMode === 'corpus'}
            className={`rounded-xl border p-4 text-left transition ${
              sourceMode === 'corpus'
                ? 'border-[#087d70] bg-[#e7f4ee]'
                : 'border-[#d5e6df] hover:bg-[#f3faf6]'
            }`}
          >
            <span className="flex items-center gap-2 text-sm font-semibold text-[#173d3b]">
              <Database size={16} className="text-[#087d70]" />
              Corpus HIEF y APIs científicas
            </span>
            <span className="mt-1 block text-xs text-[#52766d]">
              Cruza contra publicaciones internas y literatura científica gratuita.
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
            <span className="flex items-center gap-2 text-sm font-semibold text-[#173d3b]">
              <UploadCloud size={16} className="text-[#087d70]" />
              Cargar mis referencias
            </span>
            <span className="mt-1 block text-xs text-[#52766d]">
              Compara directamente contra hasta 5 PDFs que selecciones.
            </span>
          </button>

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
            <span className="flex items-center gap-2 text-sm font-semibold text-[#173d3b]">
              <Sparkles size={16} className="text-[#087d70]" />
              Modo demostración
            </span>
            <span className="mt-1 block text-xs text-[#52766d]">
              Ejecuta un caso de prueba controlado con textos sintéticos.
            </span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {sourceMode === 'corpus' && (
            <div className="grid gap-3 rounded-xl border border-[#d5e6df] bg-[#f8fcfa] p-4 md:grid-cols-3">
              <label className="flex cursor-pointer items-start gap-2.5 text-xs text-[#244f47]">
                <input
                  type="checkbox"
                  checked={includeInternalCorpus}
                  onChange={(event) => setIncludeInternalCorpus(event.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-[#82c4a9] accent-[#087d70]"
                />
                <span>
                  <span className="block font-semibold">Corpus interno HIEF</span>
                  <span className="text-[11px] text-[#52766d]">
                    Artículos publicados y biblioteca pública local.
                  </span>
                </span>
              </label>

              <label className="flex cursor-pointer items-start gap-2.5 text-xs text-[#244f47]">
                <input
                  type="checkbox"
                  checked={includeScientificApis}
                  onChange={(event) => setIncludeScientificApis(event.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-[#82c4a9] accent-[#087d70]"
                />
                <span>
                  <span className="block font-semibold">APIs científicas gratuitas</span>
                  <span className="text-[11px] text-[#52766d]">
                    OpenAlex, Crossref y Europe PMC (solo frases clave).
                  </span>
                </span>
              </label>

              <label className="flex cursor-pointer items-start gap-2.5 text-xs text-[#244f47]">
                <input
                  type="checkbox"
                  checked={includeOpenWeb}
                  onChange={(event) => setIncludeOpenWeb(event.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-[#82c4a9] accent-[#087d70]"
                />
                <span>
                  <span className="inline-flex items-center gap-1 font-semibold">
                    <Globe size={12} /> Web abierta
                    <span className="rounded-full bg-[#e7f4ee] px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-[#07584f]">
                      Base lista
                    </span>
                  </span>
                  <span className="block text-[11px] text-[#52766d]">
                    Conector preparado para SearXNG o Brave Search.
                  </span>
                </span>
              </label>
            </div>
          )}

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
              placeholder="Pega aquí el resumen o fragmento del manuscrito a evaluar..."
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
                  Máximo 10 MB. Si adjuntas un PDF, se analizará en lugar del texto pegado.
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
              {sourceMode === 'corpus' && includeScientificApis
                ? 'Nunca se envía el archivo PDF ni datos personales a internet: solo se consultan frases técnicas breves para localizar literatura comparable. No cargues información de pacientes.'
                : 'Los archivos se procesan solo para esta solicitud y no se guardan como copias permanentes. No cargues información sensible de pacientes.'}
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
            {loading ? 'Analizando fuentes…' : 'Analizar similitud'}
          </button>
        </form>
      </section>

      {report && (
        <section
          aria-live="polite"
          className="space-y-4 rounded-2xl border border-[#d5e6df] bg-[#fcfefd] p-5 md:p-7"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
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

            <div className="flex flex-wrap items-center gap-1.5">
              <span className="rounded-full bg-[#e7f4ee] px-2.5 py-1 text-[10px] font-semibold text-[#07584f]">
                {report.sourcesEvaluated} fuente(s) evaluada(s)
              </span>
              {report.queriedProviders.map((provider) => (
                <span
                  key={provider}
                  className="rounded-full border border-[#cfe4dc] bg-white px-2.5 py-1 text-[10px] font-medium text-[#385f56]"
                >
                  {PROVIDER_LABELS[provider] ?? provider}
                </span>
              ))}
            </div>
          </div>

          {report.queriesUsed.length > 0 && (
            <details className="rounded-xl border border-[#e3eee9] bg-[#f8fcfa] px-4 py-2.5 text-xs text-[#45665f]">
              <summary className="cursor-pointer font-semibold text-[#244f47]">
                Frases clave enviadas a APIs científicas ({report.queriesUsed.length})
              </summary>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-[11px]">
                {report.queriesUsed.map((query, idx) => (
                  <li key={`${idx}-${query.slice(0, 16)}`}>{query}</li>
                ))}
              </ul>
            </details>
          )}

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
              {report.findings.map((finding, index) => {
                const safeUrl = resolveSafeSourceUrl(finding.sourceUrl);
                return (
                  <article
                    key={`${finding.sourceLabel}-${finding.sourcePage}-${index}`}
                    className="rounded-xl border border-[#d5e6df] bg-[#f8fcfa] p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="min-w-0 space-y-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="rounded-full bg-[#d7f2e6] px-2 py-0.5 text-[10px] font-semibold text-[#07584f]">
                            {PROVIDER_LABELS[finding.provider] ?? finding.provider}
                          </span>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                              finding.matchType === 'exact'
                                ? 'bg-[#fce8e6] text-[#9b2c25]'
                                : 'bg-[#fff3d6] text-[#85500b]'
                            }`}
                          >
                            {finding.matchType === 'exact'
                              ? 'Coincidencia literal'
                              : `Similitud léxica · ${finding.similarityScore}%`}
                          </span>
                          {finding.isCited && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-[#e6f0ff] px-2 py-0.5 text-[10px] font-semibold text-[#1e4d8c]">
                              <BookMarked size={11} /> Citada en bibliografía
                            </span>
                          )}
                        </div>
                        <p className="text-xs font-semibold text-[#173d3b]">
                          {finding.sourceLabel}
                          {finding.year ? ` (${finding.year})` : ''}
                        </p>
                      </div>

                      <div className="flex items-center gap-3 text-[11px] text-[#52766d]">
                        <span>
                          Pág. objetivo {finding.targetPage} · fuente {finding.sourcePage}
                        </span>
                        {safeUrl && (
                          <a
                            href={safeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 font-semibold text-[#087d70] hover:underline"
                          >
                            Ver fuente <ExternalLink size={12} />
                          </a>
                        )}
                      </div>
                    </div>

                    <blockquote className="mt-3 border-l-2 border-[#82c4a9] pl-3 text-xs leading-5 text-[#244f47]">
                      <span className="mb-0.5 block text-[10px] font-semibold uppercase tracking-wider text-[#58786f]">
                        Fragmento en el manuscrito
                      </span>
                      “{finding.excerpt}”
                    </blockquote>

                    {finding.sourceExcerpt && finding.matchType !== 'exact' && (
                      <blockquote className="mt-2 border-l-2 border-[#cfe4dc] pl-3 text-xs leading-5 text-[#52766d]">
                        <span className="mb-0.5 block text-[10px] font-semibold uppercase tracking-wider text-[#58786f]">
                          Fragmento en la fuente
                        </span>
                        “{finding.sourceExcerpt}”
                      </blockquote>
                    )}

                    <p className="mt-2 text-[10px] text-[#52766d]">
                      {finding.matchedTokens}{' '}
                      {finding.matchType === 'exact'
                        ? 'palabras consecutivas coincidentes'
                        : 'términos informativos compartidos'}
                      {finding.doi ? ` · DOI: ${finding.doi}` : ''}
                    </p>
                  </article>
                );
              })}
            </div>
          ) : (
            report.status === 'completed' && (
              <p className="rounded-xl bg-[#f3faf6] p-4 text-xs leading-5 text-[#45665f]">
                No se detectaron coincidencias relevantes en las fuentes consultadas. Esto
                no garantiza por sí solo ausencia de plagio fuera de dichas fuentes.
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
