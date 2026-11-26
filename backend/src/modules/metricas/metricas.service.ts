import { Op, fn, col, type WhereOptions } from 'sequelize';
import { Articulo } from '../articulos/Articulo.model.js';
import { RecursoBiblioteca } from '../biblioteca/RecursoBiblioteca.model.js';
import { AsignacionComite } from '../editorial/AsignacionComite.model.js';
import { Revision } from '../editorial/Revision.model.js';
import { Especialidad } from '../especialidades/Especialidad.model.js';
import {
  MetricEvent,
  type MetricEntityType,
  type MetricEventType,
} from './MetricEvent.model.js';

export type MetricsPeriod = '30d' | '90d' | 'all';

export interface TrackMetricInput {
  eventType: MetricEventType;
  entityType: MetricEntityType;
  entityId?: number | null;
  specialtyId?: number | null;
  visitorHash?: string | null;
}

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

const getPeriodStartDate = (period: MetricsPeriod): Date | null => {
  if (period === 'all') return null;
  const days = period === '30d' ? 30 : 90;
  const start = new Date();
  start.setDate(start.getDate() - days);
  start.setHours(0, 0, 0, 0);
  return start;
};

const roundToOneDecimal = (value: number): number => Math.round(value * 10) / 10;

const buildLastSixMonths = (): { key: string; label: string }[] => {
  const formatter = new Intl.DateTimeFormat('es-AR', {
    month: 'short',
    year: '2-digit',
  });
  const months: { key: string; label: string }[] = [];
  const now = new Date();
  for (let offset = 5; offset >= 0; offset -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - offset, 1);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    months.push({ key, label: formatter.format(date) });
  }
  return months;
};

export class MetricasService {
  async trackEvent(input: TrackMetricInput): Promise<boolean> {
    if (input.visitorHash) {
      const windowMinutes = input.entityType === 'PORTAL' ? 30 : 24 * 60;
      const since = new Date(Date.now() - windowMinutes * 60 * 1000);

      const existing = await MetricEvent.findOne({
        where: {
          eventType: input.eventType,
          entityType: input.entityType,
          entityId: input.entityId ?? null,
          visitorHash: input.visitorHash,
          createdAt: { [Op.gte]: since },
        },
        attributes: ['id'],
      });
      if (existing) {
        return false;
      }
    }

    let resolvedSpecialtyId = input.specialtyId ?? null;

    if (resolvedSpecialtyId === null && input.entityId) {
      if (input.entityType === 'ARTICULO') {
        const articulo = await Articulo.findByPk(input.entityId, {
          attributes: ['specialtyId'],
        });
        resolvedSpecialtyId = articulo?.specialtyId ?? null;
      } else if (input.entityType === 'RECURSO_BIBLIOTECA') {
        const recurso = await RecursoBiblioteca.findByPk(input.entityId, {
          attributes: ['specialtyId'],
        });
        resolvedSpecialtyId = recurso?.specialtyId ?? null;
      }
    }

    await MetricEvent.create({
      eventType: input.eventType,
      entityType: input.entityType,
      entityId: input.entityId ?? null,
      specialtyId: resolvedSpecialtyId,
      visitorHash: input.visitorHash ?? null,
    });
    return true;
  }

  async getOverview(period: MetricsPeriod): Promise<MetricsOverviewDTO> {
    const startDate = getPeriodStartDate(period);
    const eventDateWhere: WhereOptions = startDate
      ? { createdAt: { [Op.gte]: startDate } }
      : {};
    const articleDateWhere: WhereOptions = startDate
      ? { createdAt: { [Op.gte]: startDate } }
      : {};

    const [
      totalVisits,
      uniqueVisitors,
      totalDownloads,
      totalPublishedArticles,
      specialties,
      specialtyEvents,
      topDownloadRows,
      articlesInPeriod,
      publishedArticlesInPeriod,
      trendArticles,
    ] = await Promise.all([
      MetricEvent.count({
        where: { ...eventDateWhere, eventType: 'VISIT' },
      }),
      MetricEvent.count({
        where: {
          ...eventDateWhere,
          eventType: 'VISIT',
          visitorHash: { [Op.ne]: null },
        },
        distinct: true,
        col: 'visitorHash',
      }),
      MetricEvent.count({
        where: { ...eventDateWhere, eventType: 'DOWNLOAD' },
      }),
      Articulo.count({ where: { state: 'PUBLICADO' } }),
      Especialidad.findAll({
        where: { active: true },
        attributes: ['id', 'name'],
        order: [['name', 'ASC']],
      }),
      MetricEvent.findAll({
        where: {
          ...eventDateWhere,
          specialtyId: { [Op.ne]: null },
        },
        attributes: [
          'specialtyId',
          'eventType',
          [fn('COUNT', col('id')), 'total'],
        ],
        group: ['specialtyId', 'eventType'],
        raw: true,
      }) as unknown as Promise<
        { specialtyId: number; eventType: MetricEventType; total: string | number }[]
      >,
      MetricEvent.findAll({
        where: {
          ...eventDateWhere,
          eventType: 'DOWNLOAD',
          entityType: { [Op.in]: ['ARTICULO', 'RECURSO_BIBLIOTECA'] },
          entityId: { [Op.ne]: null },
        },
        attributes: [
          'entityType',
          'entityId',
          [fn('COUNT', col('id')), 'downloads'],
        ],
        group: ['entityType', 'entityId'],
        order: [[fn('COUNT', col('id')), 'DESC']],
        limit: 5,
        raw: true,
      }) as unknown as Promise<
        {
          entityType: 'ARTICULO' | 'RECURSO_BIBLIOTECA';
          entityId: number;
          downloads: string | number;
        }[]
      >,
      Articulo.findAll({
        where: {
          ...articleDateWhere,
          state: { [Op.ne]: 'BORRADOR' },
        },
        attributes: ['id', 'state', 'createdAt', 'publishedAt'],
        include: [
          {
            model: AsignacionComite,
            as: 'committeeAssignments',
            attributes: ['id'],
            required: false,
            include: [
              {
                model: Revision,
                as: 'reviews',
                attributes: ['createdAt'],
                required: false,
              },
            ],
          },
        ],
      }),
      Articulo.findAll({
        where: {
          state: 'PUBLICADO',
          publishedAt: startDate ? { [Op.gte]: startDate } : { [Op.ne]: null },
        },
        attributes: ['id', 'createdAt', 'publishedAt'],
      }),
      Articulo.findAll({
        where: {
          state: { [Op.ne]: 'BORRADOR' },
          createdAt: {
            [Op.gte]: new Date(
              new Date().getFullYear(),
              new Date().getMonth() - 5,
              1,
            ),
          },
        },
        attributes: ['createdAt', 'publishedAt', 'state'],
      }),
    ]);

    const specialtyMap = new Map<number, SpecialtyMetricDTO>();
    for (const specialty of specialties) {
      specialtyMap.set(specialty.id, {
        specialtyId: specialty.id,
        specialtyName: specialty.name,
        visits: 0,
        downloads: 0,
      });
    }
    for (const row of specialtyEvents) {
      const target = specialtyMap.get(Number(row.specialtyId));
      if (!target) continue;
      const count = Number(row.total) || 0;
      if (row.eventType === 'VISIT') target.visits += count;
      if (row.eventType === 'DOWNLOAD') target.downloads += count;
    }

    const articleIds = topDownloadRows
      .filter((row) => row.entityType === 'ARTICULO')
      .map((row) => Number(row.entityId));
    const resourceIds = topDownloadRows
      .filter((row) => row.entityType === 'RECURSO_BIBLIOTECA')
      .map((row) => Number(row.entityId));

    const [topArticles, topResources] = await Promise.all([
      articleIds.length > 0
        ? Articulo.findAll({
            where: { id: { [Op.in]: articleIds } },
            attributes: ['id', 'title'],
            include: [
              {
                model: Especialidad,
                as: 'specialty',
                attributes: ['name'],
                required: false,
              },
            ],
          })
        : Promise.resolve([]),
      resourceIds.length > 0
        ? RecursoBiblioteca.findAll({
            where: { id: { [Op.in]: resourceIds } },
            attributes: ['id', 'title'],
            include: [
              {
                model: Especialidad,
                as: 'specialty',
                attributes: ['name'],
                required: false,
              },
            ],
          })
        : Promise.resolve([]),
    ]);

    const articleLookup = new Map(
      topArticles.map((item) => [
        item.id,
        { title: item.title, specialtyName: item.specialty?.name ?? null },
      ]),
    );
    const resourceLookup = new Map(
      topResources.map((item) => [
        item.id,
        { title: item.title, specialtyName: item.specialty?.name ?? null },
      ]),
    );

    const topDownloaded: TopDownloadedItemDTO[] = topDownloadRows.map((row) => {
      const id = Number(row.entityId);
      const info =
        row.entityType === 'ARTICULO'
          ? articleLookup.get(id)
          : resourceLookup.get(id);
      return {
        entityType: row.entityType,
        entityId: id,
        title: info?.title ?? `Documento #${id}`,
        specialtyName: info?.specialtyName ?? null,
        downloads: Number(row.downloads) || 0,
      };
    });

    const approvedOrPublishedCount = articlesInPeriod.filter((article) =>
      ['APROBADO', 'ACEPTADO', 'PUBLICADO'].includes(article.state),
    ).length;
    const rejectedCount = articlesInPeriod.filter(
      (article) => article.state === 'RECHAZADO',
    ).length;
    const decidedCount = approvedOrPublishedCount + rejectedCount;
    const approvalRate =
      decidedCount > 0
        ? roundToOneDecimal((approvedOrPublishedCount / decidedCount) * 100)
        : null;

    const publishDurations = publishedArticlesInPeriod
      .filter((article) => article.publishedAt !== null)
      .map((article) => {
        const diffMs =
          (article.publishedAt as Date).getTime() - article.createdAt.getTime();
        return Math.max(0, diffMs / (1000 * 60 * 60 * 24));
      });
    const avgDaysToPublish =
      publishDurations.length > 0
        ? roundToOneDecimal(
            publishDurations.reduce((sum, days) => sum + days, 0) /
              publishDurations.length,
          )
        : null;

    const reviewDurations: number[] = [];
    for (const article of articlesInPeriod) {
      const reviewDates = (article.committeeAssignments ?? []).flatMap(
        (assignment) =>
          (assignment.reviews ?? []).map((review) => review.createdAt.getTime()),
      );
      if (reviewDates.length === 0) continue;
      const firstReviewMs = Math.min(...reviewDates);
      reviewDurations.push(
        Math.max(
          0,
          (firstReviewMs - article.createdAt.getTime()) / (1000 * 60 * 60 * 24),
        ),
      );
    }
    const avgDaysToFirstReview =
      reviewDurations.length > 0
        ? roundToOneDecimal(
            reviewDurations.reduce((sum, days) => sum + days, 0) /
              reviewDurations.length,
          )
        : null;

    const months = buildLastSixMonths();
    const trendMap = new Map<string, MonthlyTrendPointDTO>(
      months.map((item) => [
        item.key,
        {
          month: item.key,
          label: item.label,
          submissions: 0,
          publications: 0,
        },
      ]),
    );
    for (const article of trendArticles) {
      const createdKey = `${article.createdAt.getFullYear()}-${String(article.createdAt.getMonth() + 1).padStart(2, '0')}`;
      const createdBucket = trendMap.get(createdKey);
      if (createdBucket) createdBucket.submissions += 1;

      if (article.state === 'PUBLICADO' && article.publishedAt) {
        const pubKey = `${article.publishedAt.getFullYear()}-${String(article.publishedAt.getMonth() + 1).padStart(2, '0')}`;
        const pubBucket = trendMap.get(pubKey);
        if (pubBucket) pubBucket.publications += 1;
      }
    }

    return {
      period,
      summary: {
        totalVisits,
        uniqueVisitors,
        totalDownloads,
        totalPublishedArticles,
      },
      bySpecialty: Array.from(specialtyMap.values()),
      topDownloaded,
      editorial: {
        totalSubmissions: articlesInPeriod.length,
        approvedOrPublishedCount,
        rejectedCount,
        approvalRate,
        avgDaysToPublish,
        avgDaysToFirstReview,
        monthlyTrend: Array.from(trendMap.values()),
      },
    };
  }
}
