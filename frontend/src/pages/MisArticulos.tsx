import { useCallback, useEffect, useState } from 'react';
import {
  AlertCircle,
  ChevronDown,
  ChevronUp,
  FileText,
  FileUp,
  Loader2,
  Plus,
  RefreshCw,
  UploadCloud,
  Users,
  X,
} from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import {
  getMisArticulos,
  subirManuscrito,
  subirVersionCorregida,
  type Articulo,
} from '../api/articulos.api';
import {
  getConvocatoriasPublicas,
  type Convocatoria,
} from '../api/convocatorias.api';
import { getEspecialidades, type Especialidad } from '../api/especialidades.api';
import {
  ArticleStateBadge,
  VersionHistoryPanel,
} from '../features/articulos/ArticleWorkflowMeta';

const formatClosingDate = (isoDate: string): string => {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
};

const parseCoauthorsInput = (value: string): string[] =>
  value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

export const MisArticulos = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialConvocatoriaParam = searchParams.get('convocatoriaId');
  const parsedInitialConvocatoria = initialConvocatoriaParam
    ? Number(initialConvocatoriaParam)
    : undefined;
  const hasValidQueryConvocatoria =
    parsedInitialConvocatoria !== undefined &&
    Number.isSafeInteger(parsedInitialConvocatoria) &&
    parsedInitialConvocatoria > 0;

  const [articulos, setArticulos] = useState<Articulo[]>([]);
  const [convocatoriasAbiertas, setConvocatoriasAbiertas] = useState<
    Convocatoria[]
  >([]);
  const [especialidades, setEspecialidades] = useState<Especialidad[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(hasValidQueryConvocatoria);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [globalSuccess, setGlobalSuccess] = useState('');

  // Formulario nuevo manuscrito
  const [title, setTitle] = useState('');
  const [abstract, setAbstract] = useState('');
  const [coauthorsInput, setCoauthorsInput] = useState('');
  const [convocatoriaId, setConvocatoriaId] = useState(
    hasValidQueryConvocatoria ? String(parsedInitialConvocatoria) : '',
  );
  const [specialtyId, setSpecialtyId] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Formulario nueva versión corregida
  const [correctingArticleId, setCorrectingArticleId] = useState<number | null>(
    null,
  );
  const [correctionTitle, setCorrectionTitle] = useState('');
  const [correctionAbstract, setCorrectionAbstract] = useState('');
  const [correctionCoauthors, setCorrectionCoauthors] = useState('');
  const [correctionNotes, setCorrectionNotes] = useState('');
  const [correctionFile, setCorrectionFile] = useState<File | null>(null);
  const [correctionError, setCorrectionError] = useState('');
  const [isSubmittingCorrection, setIsSubmittingCorrection] = useState(false);

  const cargarDatos = useCallback(async () => {
    try {
      setLoading(true);
      const [articulosResult, convocatoriasResult, especialidadesResult] =
        await Promise.allSettled([
          getMisArticulos(),
          getConvocatoriasPublicas(),
          getEspecialidades(),
        ]);

      setArticulos(
        articulosResult.status === 'fulfilled' &&
          Array.isArray(articulosResult.value)
          ? articulosResult.value
          : [],
      );

      const abiertas =
        convocatoriasResult.status === 'fulfilled' &&
        Array.isArray(convocatoriasResult.value?.abiertas)
          ? convocatoriasResult.value.abiertas
          : [];
      setConvocatoriasAbiertas(abiertas);

      const activeSpecialties =
        especialidadesResult.status === 'fulfilled' &&
        Array.isArray(especialidadesResult.value)
          ? especialidadesResult.value
          : [];
      setEspecialidades(activeSpecialties);

      setConvocatoriaId((current) => {
        if (current && abiertas.some((item) => String(item.id) === current)) {
          return current;
        }
        return abiertas[0] ? String(abiertas[0].id) : '';
      });

      setSpecialtyId((current) => {
        if (
          current &&
          activeSpecialties.some((item) => String(item.id) === current)
        ) {
          return current;
        }
        return activeSpecialties[0] ? String(activeSpecialties[0].id) : '';
      });
    } catch (err) {
      console.error('Error al cargar datos de manuscritos:', err);
      setArticulos([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void cargarDatos();
  }, [cargarDatos]);

  useEffect(() => {
    if (!hasValidQueryConvocatoria) return;
    setShowForm(true);
    setConvocatoriaId(String(parsedInitialConvocatoria));
  }, [hasValidQueryConvocatoria, parsedInitialConvocatoria]);

  const handleCloseForm = () => {
    setShowForm(false);
    if (searchParams.has('convocatoriaId')) {
      const nextParams = new URLSearchParams(searchParams);
      nextParams.delete('convocatoriaId');
      setSearchParams(nextParams, { replace: true });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    if (selected.type !== 'application/pdf') {
      setError('Solo se permiten archivos en formato PDF.');
      setFile(null);
      return;
    }
    setError('');
    setFile(selected);
  };

  const handleCorrectionFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    if (selected.type !== 'application/pdf') {
      setCorrectionError('Solo se permiten archivos en formato PDF.');
      setCorrectionFile(null);
      return;
    }
    setCorrectionError('');
    setCorrectionFile(selected);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !title.trim() ||
      !abstract.trim() ||
      !convocatoriaId ||
      !specialtyId ||
      !file
    ) {
      setError(
        'Por favor, completa todos los campos obligatorios y adjunta un PDF.',
      );
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      setGlobalSuccess('');

      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('abstract', abstract.trim());
      formData.append('specialtyId', specialtyId);
      formData.append('convocatoriaId', convocatoriaId);
      const coauthors = parseCoauthorsInput(coauthorsInput);
      if (coauthors.length > 0) {
        formData.append('coauthors', JSON.stringify(coauthors));
      }
      formData.append('file', file);

      await subirManuscrito(formData);

      setTitle('');
      setAbstract('');
      setCoauthorsInput('');
      setFile(null);
      handleCloseForm();
      setGlobalSuccess(
        'Manuscrito enviado correctamente. Ingresó en estado Pendiente para evaluación del DDI.',
      );
      await cargarDatos();
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : 'Error al subir el manuscrito.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const openCorrectionForm = (articulo: Articulo) => {
    setCorrectingArticleId(articulo.id);
    setExpandedId(articulo.id);
    setCorrectionTitle(articulo.title);
    setCorrectionAbstract(articulo.abstract);
    setCorrectionCoauthors(articulo.coauthors.join(', '));
    setCorrectionNotes('');
    setCorrectionFile(null);
    setCorrectionError('');
  };

  const handleSubmitCorrection = async (
    e: React.FormEvent,
    articleId: number,
  ) => {
    e.preventDefault();
    if (!correctionFile) {
      setCorrectionError('Debe adjuntar el nuevo PDF con las correcciones.');
      return;
    }

    try {
      setIsSubmittingCorrection(true);
      setCorrectionError('');
      setGlobalSuccess('');

      const formData = new FormData();
      formData.append('file', correctionFile);
      if (correctionTitle.trim()) {
        formData.append('title', correctionTitle.trim());
      }
      if (correctionAbstract.trim()) {
        formData.append('abstract', correctionAbstract.trim());
      }
      formData.append(
        'coauthors',
        JSON.stringify(parseCoauthorsInput(correctionCoauthors)),
      );
      if (correctionNotes.trim()) {
        formData.append('notes', correctionNotes.trim());
      }

      const updated = await subirVersionCorregida(articleId, formData);
      setCorrectingArticleId(null);
      setCorrectionFile(null);
      setCorrectionNotes('');
      setGlobalSuccess(
        `Versión v${updated.latestVersion?.version_number ?? ''} enviada al Comité Científico para su verificación.`,
      );
      await cargarDatos();
    } catch (err: unknown) {
      setCorrectionError(
        err instanceof Error
          ? err.message
          : 'Error al subir la versión corregida.',
      );
    } finally {
      setIsSubmittingCorrection(false);
    }
  };

  const canSubmit =
    convocatoriasAbiertas.length > 0 &&
    especialidades.length > 0 &&
    !isSubmitting;

  return (
    <div className="space-y-8">
      <section className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[.17em] text-[#52766d]">
            Área del Autor
          </p>
          <h2 className="font-editorial mt-2 text-[32px] tracking-[-.03em] text-[#173d3b]">
            Mis Manuscritos
          </h2>
          <p className="mt-1 text-[13px] text-[#526e68]">
            Envía trabajos a convocatorias abiertas, consulta devoluciones anónimas del Comité y carga correcciones sobre el mismo manuscrito.
          </p>
        </div>
        {!showForm && (
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#087d70] px-4 text-[12px] font-semibold text-white transition hover:bg-[#07584f]"
          >
            <Plus size={15} /> Nuevo Manuscrito
          </button>
        )}
      </section>

      {globalSuccess && (
        <div
          role="status"
          className="flex items-center justify-between gap-3 rounded-xl border border-[#b9e2d2] bg-[#eff9f4] px-4 py-3 text-sm text-[#07584f]"
        >
          <span>{globalSuccess}</span>
          <button
            type="button"
            onClick={() => setGlobalSuccess('')}
            className="text-[#52766d] hover:text-[#173d3b]"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {showForm && (
        <section className="page-enter rounded-[22px] border border-[#d5e6df] bg-[#fcfefd] p-6 md:p-8">
          <div className="mb-6 flex items-center justify-between border-b border-[#e3eee9] pb-4">
            <h3 className="text-[16px] font-semibold text-[#173d3b]">
              Someter Nuevo Artículo
            </h3>
            <button
              type="button"
              onClick={handleCloseForm}
              className="text-[#52766d] hover:text-[#173d3b]"
            >
              <X size={18} />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="max-w-2xl space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-[11px] font-semibold text-[#244f47]">
                  Convocatoria Abierta
                </span>
                <select
                  required
                  value={convocatoriaId}
                  onChange={(e) => setConvocatoriaId(e.target.value)}
                  disabled={convocatoriasAbiertas.length === 0}
                  className="h-11 w-full rounded-xl border border-[#bfdcd0] bg-[#fcfefd] px-3 text-[13px] text-[#173d3b] outline-none transition focus:border-[#087d70] focus:ring-4 focus:ring-[#bce8d8]/70 disabled:bg-[#eef5f2] disabled:text-[#668079]"
                >
                  {convocatoriasAbiertas.length === 0 ? (
                    <option value="">No hay convocatorias abiertas</option>
                  ) : (
                    convocatoriasAbiertas.map((conv) => (
                      <option key={conv.id} value={String(conv.id)}>
                        {conv.title}
                        {conv.fechaFin
                          ? ` (cierra ${formatClosingDate(conv.fechaFin)})`
                          : ''}
                      </option>
                    ))
                  )}
                </select>
              </label>

              <label className="block">
                <span className="mb-2 block text-[11px] font-semibold text-[#244f47]">
                  Especialidad
                </span>
                <select
                  required
                  value={specialtyId}
                  onChange={(e) => setSpecialtyId(e.target.value)}
                  disabled={especialidades.length === 0}
                  className="h-11 w-full rounded-xl border border-[#bfdcd0] bg-[#fcfefd] px-3 text-[13px] text-[#173d3b] outline-none transition focus:border-[#087d70] focus:ring-4 focus:ring-[#bce8d8]/70 disabled:bg-[#eef5f2] disabled:text-[#668079]"
                >
                  {especialidades.length === 0 ? (
                    <option value="">Sin especialidades disponibles</option>
                  ) : (
                    especialidades.map((esp) => (
                      <option key={esp.id} value={String(esp.id)}>
                        {esp.name}
                      </option>
                    ))
                  )}
                </select>
              </label>
            </div>

            {!loading && convocatoriasAbiertas.length === 0 && (
              <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-[12px] text-amber-800">
                Actualmente no hay convocatorias en estado ABIERTA para recibir
                manuscritos.
              </p>
            )}

            <label className="block">
              <span className="mb-2 block text-[11px] font-semibold text-[#244f47]">
                Título de la Investigación
              </span>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej. Resultados a largo plazo..."
                className="h-11 w-full rounded-xl border border-[#bfdcd0] bg-[#fcfefd] px-4 text-[13px] text-[#173d3b] outline-none transition focus:border-[#087d70] focus:ring-4 focus:ring-[#bce8d8]/70"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-[11px] font-semibold text-[#244f47]">
                Co-autores{' '}
                <span className="font-normal text-[#78918a]">
                  (opcional, separados por coma)
                </span>
              </span>
              <input
                type="text"
                value={coauthorsInput}
                onChange={(e) => setCoauthorsInput(e.target.value)}
                placeholder="Ej. Dra. María Gómez, Dr. Juan Pérez"
                className="h-11 w-full rounded-xl border border-[#bfdcd0] bg-[#fcfefd] px-4 text-[13px] text-[#173d3b] outline-none transition focus:border-[#087d70] focus:ring-4 focus:ring-[#bce8d8]/70"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-[11px] font-semibold text-[#244f47]">
                Resumen (Abstract)
              </span>
              <textarea
                required
                value={abstract}
                onChange={(e) => setAbstract(e.target.value)}
                rows={4}
                placeholder="Breve descripción del estudio..."
                className="w-full rounded-xl border border-[#bfdcd0] bg-[#fcfefd] p-4 text-[13px] text-[#173d3b] outline-none transition focus:border-[#087d70] focus:ring-4 focus:ring-[#bce8d8]/70"
              />
            </label>

            <div className="rounded-xl border border-dashed border-[#82c4a9] bg-[#f3faf6] p-6 text-center">
              <input
                type="file"
                id="file-upload"
                accept="application/pdf"
                className="hidden"
                onChange={handleFileChange}
              />
              <label
                htmlFor="file-upload"
                className="flex cursor-pointer flex-col items-center"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#d7f2e6] text-[#087366]">
                  <UploadCloud size={20} />
                </div>
                <p className="mt-3 text-[12px] font-semibold text-[#244f47]">
                  {file ? file.name : 'Haz clic para seleccionar tu PDF'}
                </p>
                <p className="mt-1 text-[10px] text-[#526e68]">
                  {file
                    ? 'Archivo adjunto listo'
                    : 'Solo formato .pdf (Máx. 10MB)'}
                </p>
              </label>
            </div>

            {error && <p className="text-[12px] text-[#a3342d]">{error}</p>}

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={!canSubmit}
                className="group flex h-11 items-center justify-center gap-2 rounded-xl bg-[#087d70] px-6 text-[13px] font-semibold text-white transition hover:bg-[#07584f] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : (
                  <FileUp size={16} />
                )}
                {isSubmitting ? 'Subiendo...' : 'Enviar a Mesa de Entrada (DDI)'}
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="overflow-hidden rounded-2xl border border-[#d5e6df] bg-[#fcfefd]">
        <div className="flex items-center justify-between border-b border-[#dcebe5] px-5 py-5 md:px-6">
          <h3 className="text-[14px] font-semibold text-[#244f47]">
            Historial de Producción ({articulos.length})
          </h3>
          <button
            type="button"
            onClick={() => void cargarDatos()}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#cfe4dc] px-3 py-1.5 text-[11px] font-medium text-[#385f56] hover:bg-[#eef7f3]"
          >
            <RefreshCw size={13} /> Actualizar
          </button>
        </div>

        <div className="divide-y divide-[#e3eee9]">
          {loading ? (
            <div className="py-12 text-center text-sm text-[#52766d]">
              Cargando artículos...
            </div>
          ) : articulos.length > 0 ? (
            articulos.map((articulo) => {
              const isExpanded = expandedId === articulo.id;
              const isCorrecting = correctingArticleId === articulo.id;
              const latestVersionNum =
                articulo.latestVersion?.version_number ?? 1;
              const needsCorrection = articulo.status === 'REVISION_MENOR';
              const isRejected = articulo.status === 'RECHAZADO';

              return (
                <article key={articulo.id} className="px-5 py-5 md:px-6">
                  <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <ArticleStateBadge state={articulo.status} />
                        <span className="font-data rounded-md bg-[#edf5f1] px-2 py-0.5 text-[10px] font-semibold text-[#385f56]">
                          v{latestVersionNum}
                        </span>
                        {articulo.specialtyName && (
                          <span className="text-[11px] text-[#52766d]">
                            {articulo.specialtyName}
                          </span>
                        )}
                        {articulo.convocatoriaTitle && (
                          <span className="text-[11px] text-[#78918a]">
                            · {articulo.convocatoriaTitle}
                          </span>
                        )}
                      </div>

                      <h4 className="mt-2.5 text-[15px] font-semibold leading-snug text-[#173d3b]">
                        {articulo.title}
                      </h4>
                      <p className="mt-1 text-[12px] leading-relaxed text-[#526e68] line-clamp-2">
                        {articulo.abstract || 'Sin resumen'}
                      </p>

                      {articulo.coauthors.length > 0 && (
                        <p className="mt-2 flex items-center gap-1.5 text-[11px] text-[#52766d]">
                          <Users size={13} />
                          Co-autores: {articulo.coauthors.join(', ')}
                        </p>
                      )}

                      <div className="mt-3 flex flex-wrap items-center gap-4">
                        <p className="text-[11px] text-[#58786f]">
                          Enviado:{' '}
                          {new Date(articulo.createdAt).toLocaleDateString(
                            'es-AR',
                          )}
                        </p>
                        {articulo.fileUrl && (
                          <a
                            href={articulo.fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#087366] hover:underline"
                          >
                            <FileText size={13} /> Ver PDF vigente
                          </a>
                        )}
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedId(isExpanded ? null : articulo.id)
                          }
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#244f47] hover:text-[#087d70]"
                        >
                          {isExpanded ? (
                            <>
                              Ocultar historial y dictámenes{' '}
                              <ChevronUp size={14} />
                            </>
                          ) : (
                            <>
                              Ver historial y dictámenes{' '}
                              <ChevronDown size={14} />
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {needsCorrection && !isCorrecting && (
                      <button
                        type="button"
                        onClick={() => openCorrectionForm(articulo)}
                        className="inline-flex h-10 shrink-0 items-center gap-2 rounded-xl bg-[#087d70] px-4 text-[12px] font-semibold text-white transition hover:bg-[#07584f]"
                      >
                        <UploadCloud size={15} />
                        Subir versión corregida (v{latestVersionNum + 1})
                      </button>
                    )}
                  </div>

                  {isRejected && articulo.rejectionReason && (
                    <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-4">
                      <p className="flex items-center gap-1.5 text-xs font-semibold text-rose-800">
                        <AlertCircle size={15} />
                        Motivo de rechazo (Docencia e Investigación)
                      </p>
                      <p className="mt-1.5 whitespace-pre-line text-xs leading-relaxed text-rose-700">
                        {articulo.rejectionReason}
                      </p>
                    </div>
                  )}

                  {isRejected && (
                    <p className="mt-3 text-[11px] font-medium text-rose-700">
                      Este manuscrito fue rechazado y no admite nuevas entregas ni edición.
                    </p>
                  )}

                  {needsCorrection && (
                    <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50/80 px-4 py-3 text-xs text-amber-900">
                      Tu manuscrito fue <strong>aprobado con correcciones</strong>. Revisá las devoluciones de los revisores y subí la nueva versión (v{latestVersionNum + 1}) sobre este mismo artículo para que el Comité valide los cambios.
                    </div>
                  )}

                  {isCorrecting && needsCorrection && (
                    <form
                      onSubmit={(e) => void handleSubmitCorrection(e, articulo.id)}
                      className="mt-4 space-y-4 rounded-2xl border border-[#9bcfbb] bg-[#f4fbf7] p-5"
                    >
                      <div className="flex items-center justify-between">
                        <h5 className="text-sm font-semibold text-[#173d3b]">
                          Enviar versión corregida (v{latestVersionNum + 1})
                        </h5>
                        <button
                          type="button"
                          onClick={() => setCorrectingArticleId(null)}
                          className="text-[#52766d] hover:text-[#173d3b]"
                        >
                          <X size={16} />
                        </button>
                      </div>

                      <label className="block">
                        <span className="mb-1.5 block text-[11px] font-semibold text-[#244f47]">
                          Resumen de correcciones realizadas
                        </span>
                        <textarea
                          rows={3}
                          value={correctionNotes}
                          onChange={(e) => setCorrectionNotes(e.target.value)}
                          placeholder="Detallá brevemente qué observaciones del Comité se corrigieron en esta versión..."
                          className="w-full rounded-xl border border-[#bfdcd0] bg-white p-3 text-xs text-[#173d3b] outline-none focus:border-[#087d70]"
                        />
                      </label>

                      <div className="grid gap-3 sm:grid-cols-2">
                        <label className="block">
                          <span className="mb-1.5 block text-[11px] font-semibold text-[#244f47]">
                            Título (opcional ajustar)
                          </span>
                          <input
                            type="text"
                            value={correctionTitle}
                            onChange={(e) => setCorrectionTitle(e.target.value)}
                            className="h-10 w-full rounded-xl border border-[#bfdcd0] bg-white px-3 text-xs text-[#173d3b] outline-none focus:border-[#087d70]"
                          />
                        </label>
                        <label className="block">
                          <span className="mb-1.5 block text-[11px] font-semibold text-[#244f47]">
                            Co-autores (separados por coma)
                          </span>
                          <input
                            type="text"
                            value={correctionCoauthors}
                            onChange={(e) =>
                              setCorrectionCoauthors(e.target.value)
                            }
                            className="h-10 w-full rounded-xl border border-[#bfdcd0] bg-white px-3 text-xs text-[#173d3b] outline-none focus:border-[#087d70]"
                          />
                        </label>
                      </div>

                      <label className="block">
                        <span className="mb-1.5 block text-[11px] font-semibold text-[#244f47]">
                          Resumen / Abstract actualizado
                        </span>
                        <textarea
                          rows={2}
                          value={correctionAbstract}
                          onChange={(e) =>
                            setCorrectionAbstract(e.target.value)
                          }
                          className="w-full rounded-xl border border-[#bfdcd0] bg-white p-3 text-xs text-[#173d3b] outline-none focus:border-[#087d70]"
                        />
                      </label>

                      <label className="block">
                        <span className="mb-1.5 block text-[11px] font-semibold text-[#244f47]">
                          Nuevo archivo PDF corregido *
                        </span>
                        <input
                          type="file"
                          accept="application/pdf"
                          required
                          onChange={handleCorrectionFileChange}
                          className="block w-full cursor-pointer rounded-xl border border-dashed border-[#82c4a9] bg-white px-4 py-3 text-xs text-[#385f56] file:mr-3 file:rounded-lg file:border-0 file:bg-[#dff2e9] file:px-3 py-1.5 file:text-xs file:font-semibold file:text-[#07584f]"
                        />
                      </label>

                      {correctionError && (
                        <p className="text-xs text-rose-700">
                          {correctionError}
                        </p>
                      )}

                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setCorrectingArticleId(null)}
                          className="h-10 rounded-xl border border-[#cfe4dc] bg-white px-4 text-xs font-semibold text-[#385f56] hover:bg-[#f2f7f4]"
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          disabled={isSubmittingCorrection || !correctionFile}
                          className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#087d70] px-5 text-xs font-semibold text-white transition hover:bg-[#07584f] disabled:opacity-60"
                        >
                          {isSubmittingCorrection ? (
                            <Loader2 className="animate-spin" size={14} />
                          ) : (
                            <FileUp size={14} />
                          )}
                          {isSubmittingCorrection
                            ? 'Enviando...'
                            : 'Enviar corrección al Comité'}
                        </button>
                      </div>
                    </form>
                  )}

                  {isExpanded && (
                    <div className="mt-5 border-t border-[#e3eee9] pt-5">
                      <h5 className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#52766d]">
                        Historial de versiones y dictámenes anónimos
                      </h5>
                      <VersionHistoryPanel
                        articleId={articulo.id}
                        versions={articulo.versions}
                        showReviewerNames={false}
                      />
                    </div>
                  )}
                </article>
              );
            })
          ) : (
            <div className="py-12 text-center text-[12px] text-[#526e68]">
              No has enviado ningún manuscrito todavía.
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default MisArticulos;
