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

export const toLocalDateTimeValue = (date: Date): string =>
  new Date(date.getTime() - date.getTimezoneOffset() * 60_000)
    .toISOString()
    .slice(0, 16);

export const parseLocalDateTimeValue = (value: string): Date | null => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};
