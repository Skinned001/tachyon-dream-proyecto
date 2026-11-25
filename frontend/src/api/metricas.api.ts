import axiosClient from './axiosClient';

export type MetricsPeriod = '30d' | '90d' | 'all';

export interface MetricsSummaryDTO {
  totalVisits: number;
  uniqueVisitors: number;
  totalDownloads: number;
  totalPublishedArticles: number;
}

export interface SpecialtyMetricDTO {
  specialtyId: number;
  specialtyName: string;
  visits: number;
  downloads: number;
}

export interface TopDownloadedItemDTO {
  entityType: 'ARTICULO' | 'RECURSO_BIBLIOTECA';
  entityId: number;
  title: string;
  specialtyName: string | null;
  downloads: number;
}

export interface MonthlyTrendPointDTO {
  month: string;
  label: string;
  submissions: number;
  publications: number;
}

export interface EditorialMetricsDTO {
  totalSubmissions: number;
  approvedOrPublishedCount: number;
  rejectedCount: number;
  approvalRate: number | null;
  avgDaysToPublish: number | null;
  avgDaysToFirstReview: number | null;
  monthlyTrend: MonthlyTrendPointDTO[];
}

export interface MetricsOverviewDTO {
  period: MetricsPeriod;
  summary: MetricsSummaryDTO;
  bySpecialty: SpecialtyMetricDTO[];
  topDownloaded: TopDownloadedItemDTO[];
  editorial: EditorialMetricsDTO;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

const VISITOR_STORAGE_KEY = 'cj_visitor_id';

const getVisitorHash = (): string => {
  try {
    const existing = localStorage.getItem(VISITOR_STORAGE_KEY);
    if (existing) return existing;
    const generated =
      typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
    localStorage.setItem(VISITOR_STORAGE_KEY, generated);
    return generated;
  } catch {
    return 'anonymous-browser';
  }
};

export const trackPortalVisit = async (): Promise<void> => {
  const sessionKey = 'cj_portal_visit_tracked';
  try {
    if (sessionStorage.getItem(sessionKey)) return;
    sessionStorage.setItem(sessionKey, '1');
  } catch {
    // Ignore sessionStorage restrictions
  }

  try {
    await axiosClient.post('/metricas/track', {
      eventType: 'VISIT',
      entityType: 'PORTAL',
      visitorHash: getVisitorHash(),
    });
  } catch {
    // Never block UX for analytics
  }
};

export const trackBibliotecaVisit = async (
  specialtyId?: number | null,
): Promise<void> => {
  const sessionKey = `cj_bib_visit_${specialtyId ?? 'all'}`;
  try {
    if (sessionStorage.getItem(sessionKey)) return;
    sessionStorage.setItem(sessionKey, '1');
  } catch {
    // Ignore sessionStorage restrictions
  }

  try {
    await axiosClient.post('/metricas/track', {
      eventType: 'VISIT',
      entityType: 'PORTAL',
      specialtyId: specialtyId ?? null,
      visitorHash: getVisitorHash(),
    });
  } catch {
    // Never block UX for analytics
  }
};

export const trackDocumentView = (
  entityType: 'ARTICULO' | 'RECURSO_BIBLIOTECA',
  entityId: number,
  specialtyId?: number | null,
): void => {
  void axiosClient
    .post('/metricas/track', {
      eventType: 'VISIT',
      entityType,
      entityId,
      specialtyId: specialtyId ?? null,
      visitorHash: getVisitorHash(),
    })
    .catch(() => {
      // Never block view UX
    });
};

export const trackDocumentDownload = (
  entityType: 'ARTICULO' | 'RECURSO_BIBLIOTECA',
  entityId: number,
  specialtyId?: number | null,
): void => {
  void axiosClient
    .post('/metricas/track', {
      eventType: 'DOWNLOAD',
      entityType,
      entityId,
      specialtyId: specialtyId ?? null,
      visitorHash: getVisitorHash(),
    })
    .catch(() => {
      // Never block download UX
    });
};

export const getMetricsOverview = async (
  period: MetricsPeriod = '30d',
): Promise<MetricsOverviewDTO> => {
  const { data } = await axiosClient.get<ApiResponse<MetricsOverviewDTO>>(
    '/metricas/overview',
    { params: { period } },
  );
  if (!data.success) {
    throw new Error(data.error || 'No se pudieron obtener las métricas.');
  }
  return data.data;
};
