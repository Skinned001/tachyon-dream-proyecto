export const formatDateTime = (
  dateString?: string | null,
): string => {
  if (!dateString) return 'Fecha desconocida';

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return 'Fecha desconocida';

  return new Intl.DateTimeFormat('es-AR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};
