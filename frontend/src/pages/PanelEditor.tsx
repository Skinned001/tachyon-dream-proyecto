import { useCallback, useEffect, useState } from 'react';
import { CheckCircle2, Loader2, RefreshCw, UserCheck } from 'lucide-react';
import {
  asignarRevisor,
  getArticulosPendientes,
  getEspecialistas,
  type ArticuloPendiente,
} from '../api/editorial.api';
import {
  getEspecialidades,
  type Especialidad,
} from '../api/especialidades.api';
import type { User } from '../types/user.types';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { formatDateTime } from '../utils/formatDate';

export const PanelEditor = () => {
  const [articulos, setArticulos] = useState<ArticuloPendiente[]>([]);
  const [especialistas, setEspecialistas] = useState<User[]>([]);
  const [especialidades, setEspecialidades] = useState<Especialidad[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAssigning, setIsAssigning] = useState<number | null>(null);
  const [selectedReviewer, setSelectedReviewer] = useState<
    Record<number, number>
  >({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const [pendingArticles, reviewers, specialties] = await Promise.all([
        getArticulosPendientes(),
        getEspecialistas(),
        getEspecialidades(),
      ]);
      setArticulos(pendingArticles);
      setEspecialistas(reviewers);
      setEspecialidades(specialties);
    } catch (requestError: unknown) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'No se pudo cargar la bandeja de asignación.',
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const handleAssign = async (articleId: number) => {
    const reviewerId = selectedReviewer[articleId];
    if (!reviewerId) {
      setError('Selecciona un especialista antes de asignar el artículo.');
      return;
    }

    setIsAssigning(articleId);
    setError('');
    setSuccess('');
    try {
      await asignarRevisor(articleId, reviewerId);
      const reviewer = especialistas.find((item) => item.id === reviewerId);
      setSuccess(
        reviewer
          ? `Artículo asignado a ${reviewer.first_name} ${reviewer.last_name}.`
          : 'Artículo asignado correctamente.',
      );
      setArticulos((current) =>
        current.filter((article) => article.id !== articleId),
      );
      setSelectedReviewer((current) => {
        const next = { ...current };
        delete next[articleId];
        return next;
      });
    } catch (requestError: unknown) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'No se pudo asignar el artículo.',
      );
    } finally {
      setIsAssigning(null);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[.17em] text-[#52766d]">
            Área de Evaluación
          </p>
          <h2 className="font-editorial mt-2 text-[32px] tracking-[-.03em] text-[#173d3b]">
            Asignación de revisores
          </h2>
          <p className="mt-1 text-[13px] text-[#526e68]">
            Deriva los manuscritos pendientes a un especialista DDI o del Comité
            Científico.
          </p>
        </div>
        <Button
          type="button"
          variant="secondary"
          onClick={() => void loadData()}
          disabled={isLoading || isAssigning !== null}
          className="gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Actualizar
        </Button>
      </header>

      {error && (
        <p
          className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700"
          role="alert"
        >
          {error}
        </p>
      )}
      {success && (
        <p
          className="flex items-center gap-2 rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-700"
          role="status"
        >
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          {success}
        </p>
      )}

      <Card>
        {isLoading ? (
          <div
            className="flex justify-center p-8"
            role="status"
            aria-label="Cargando artículos pendientes"
          >
            <Loader2 className="h-8 w-8 animate-spin text-[#087d70]" />
          </div>
        ) : articulos.length === 0 ? (
          <p className="py-8 text-center text-sm text-gray-500">
            No hay artículos pendientes de asignación.
          </p>
        ) : (
          <div className="space-y-4">
            {articulos.map((articulo) => (
              <article
                key={articulo.id}
                className="flex flex-col gap-4 rounded-lg border border-gray-200 p-4 md:flex-row md:items-center md:justify-between"
              >
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-gray-800">
                    {articulo.title}
                  </h3>
                  {articulo.summary && (
                    <p className="mt-1 line-clamp-2 text-sm text-gray-600">
                      {articulo.summary}
                    </p>
                  )}
                  <p className="mt-2 text-xs text-gray-500">
                    Especialidad: {articulo.specialty?.name ?? articulo.specialtyId}
                  </p>
                  <p className="mt-1 text-xs text-gray-400">
                    Enviado: {formatDateTime(articulo.createdAt)}
                  </p>
                </div>

                <div className="flex w-full flex-col gap-2 sm:flex-row md:w-auto">
                  <label className="sr-only" htmlFor={`reviewer-${articulo.id}`}>
                    Especialista para {articulo.title}
                  </label>
                  <select
                    id={`reviewer-${articulo.id}`}
                    className="min-w-0 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm sm:min-w-64"
                    value={selectedReviewer[articulo.id] ?? ''}
                    onChange={(event) => {
                      const reviewerId = Number(event.target.value);
                      setSelectedReviewer((current) => ({
                        ...current,
                        [articulo.id]: reviewerId,
                      }));
                    }}
                    disabled={isAssigning !== null || especialistas.length === 0}
                  >
                    <option value="">Seleccionar especialista...</option>
                    {especialistas.map((especialista) => (
                      <option key={especialista.id} value={especialista.id}>
                        {especialista.first_name} {especialista.last_name} -{' '}
                        {especialidades.find(
                          (especialidad) =>
                            especialidad.id === especialista.specialtyId,
                        )?.name ?? 'Sin especialidad'}
                      </option>
                    ))}
                  </select>
                  <Button
                    type="button"
                    onClick={() => void handleAssign(articulo.id)}
                    disabled={
                      !selectedReviewer[articulo.id] || isAssigning !== null
                    }
                    isLoading={isAssigning === articulo.id}
                    className="shrink-0 gap-2"
                  >
                    <UserCheck className="h-4 w-4" />
                    Asignar
                  </Button>
                </div>
              </article>
            ))}
            {especialistas.length === 0 && (
              <p className="text-sm text-amber-700" role="status">
                No hay especialistas activos con rol DDI o COMITE disponibles.
              </p>
            )}
          </div>
        )}
      </Card>
    </div>
  );
};

export default PanelEditor;
