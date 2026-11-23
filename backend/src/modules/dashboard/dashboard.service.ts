import { Op, type Includeable } from 'sequelize';
import { Articulo, type ArticleState } from '../articulos/Articulo.model.js';
import { AsignacionComite } from '../editorial/AsignacionComite.model.js';
import { Convocatoria } from '../editorial/Convocatoria.model.js';
import { Revision } from '../editorial/Revision.model.js';
import { RecursoBiblioteca } from '../biblioteca/RecursoBiblioteca.model.js';
import { Rol } from '../usuarios/Rol.model.js';
import { Usuario } from '../usuarios/Usuario.model.js';
import type { RoleName } from '../auth/auth.dto.js';
import type { DashboardSummaryDTO } from './dashboard.dto.js';

const ARTICLE_STATES: ArticleState[] = [
  'BORRADOR',
  'PENDIENTE',
  'EN_REVISION',
  'REVISION_MENOR',
  'REVISION_MAYOR',
  'PENDIENTE_DECISION',
  'APROBADO',
  'ACEPTADO',
  'RECHAZADO',
  'PUBLICADO',
];

const REVIEW_STATES: ArticleState[] = [
  'PENDIENTE',
  'EN_REVISION',
  'REVISION_MENOR',
  'REVISION_MAYOR',
  'PENDIENTE_DECISION',
];

const recentArticleIncludes: Includeable[] = [
  {
    model: Usuario,
    as: 'responsible',
    attributes: ['id', 'first_name', 'last_name'],
    required: false,
  },
  {
    model: Convocatoria,
    as: 'convocatoria',
    attributes: ['id', 'title'],
    required: false,
  },
];

const toRecentArticle = (article: Articulo) => ({
  id: article.id,
  title: article.title,
  estado: article.state,
  createdAt: article.createdAt.toISOString(),
  autorNombre: article.responsible
    ? `${article.responsible.first_name} ${article.responsible.last_name}`.trim()
    : null,
  convocatoriaTitle: article.convocatoria?.title ?? null,
});

const getOpenConvocations = async () => {
  const convocatorias = await Convocatoria.findAll({
    attributes: ['id', 'title', 'fechaFin'],
    where: { estado: 'ABIERTA' },
    order: [['fechaFin', 'ASC']],
  });
  return convocatorias.map((convocatoria) => ({
    id: convocatoria.id,
    title: convocatoria.title,
    fechaFin: convocatoria.fechaFin.toISOString(),
  }));
};

const getManagementSummary = async (
  role: 'ADMIN' | 'EDITOR' | 'DDI',
  convocatoriasAbiertasList: Awaited<ReturnType<typeof getOpenConvocations>>,
): Promise<DashboardSummaryDTO> => {
  const [
    convocatoriasProgramadas,
    enRevision,
    publicados,
    recursosBiblioteca,
    usuariosTotal,
    autoresCount,
    reviewerRole,
    recientes,
    distribucionEstados,
  ] = await Promise.all([
    Convocatoria.count({ where: { estado: 'PROGRAMADA' } }),
    Articulo.count({ where: { state: { [Op.in]: REVIEW_STATES } } }),
    Articulo.count({ where: { state: 'PUBLICADO' } }),
    RecursoBiblioteca.count(),
    Usuario.count(),
    Usuario.count({ where: { is_author: true } }),
    Rol.findOne({ where: { name: 'COMITE' }, attributes: ['id'] }),
    Articulo.findAll({
      include: recentArticleIncludes,
      order: [
        ['createdAt', 'DESC'],
        ['id', 'DESC'],
      ],
      limit: 5,
    }),
    Promise.all(
      ARTICLE_STATES.map(async (estado) => ({
        estado,
        count: await Articulo.count({ where: { state: estado } }),
      })),
    ),
  ]);

  const revisoresCount = reviewerRole
    ? await Usuario.count({ where: { roleId: reviewerRole.id } })
    : 0;

  const kpis = {
    convocatoriasActivas: convocatoriasAbiertasList.length,
    convocatoriasProgramadas,
    enRevision,
    publicados,
    recursosBiblioteca,
    usuariosTotal,
    autoresCount,
    revisoresCount,
  };
  const common = {
    recientes: recientes.map(toRecentArticle),
    convocatoriasAbiertasList,
  };

  if (role === 'DDI') {
    return { ...common, role, kpis, distribucionEstados: [] };
  }

  return {
    ...common,
    role,
    kpis,
    distribucionEstados,
  };
};

const getAuthorSummary = async (
  role: 'AUTOR' | 'GENERAL',
  userId: number,
  convocatoriasAbiertasList: Awaited<ReturnType<typeof getOpenConvocations>>,
): Promise<DashboardSummaryDTO> => {
  const [misManuscritos, enRevision, publicados, recientes] = await Promise.all([
    Articulo.count({ where: { responsibleId: userId } }),
    Articulo.count({
      where: {
        responsibleId: userId,
        state: { [Op.in]: REVIEW_STATES },
      },
    }),
    Articulo.count({ where: { responsibleId: userId, state: 'PUBLICADO' } }),
    Articulo.findAll({
      where: { responsibleId: userId },
      include: recentArticleIncludes,
      order: [
        ['createdAt', 'DESC'],
        ['id', 'DESC'],
      ],
      limit: 5,
    }),
  ]);

  return {
    role,
    kpis: {
      misManuscritos,
      enRevision,
      publicados,
      convocatoriasAbiertas: convocatoriasAbiertasList.length,
    },
    recientes: recientes.map(toRecentArticle),
    convocatoriasAbiertasList,
    distribucionEstados: [],
  };
};

const getReviewerSummary = async (
  userId: number,
  convocatoriasAbiertasList: Awaited<ReturnType<typeof getOpenConvocations>>,
): Promise<DashboardSummaryDTO> => {
  const [allAssignments, articulosPublicados, recursosBiblioteca, asignaciones] =
    await Promise.all([
      AsignacionComite.findAll({
        where: { reviewerId: userId },
        attributes: ['id'],
        include: [
          {
            model: Revision,
            as: 'reviews',
            attributes: ['id'],
            required: false,
          },
        ],
      }),
      Articulo.count({ where: { state: 'PUBLICADO' } }),
      RecursoBiblioteca.count(),
      AsignacionComite.findAll({
        where: { reviewerId: userId },
        attributes: ['id'],
        include: [
          {
            model: Articulo,
            as: 'article',
            required: true,
            include: recentArticleIncludes,
          },
        ],
        order: [['id', 'DESC']],
        limit: 5,
      }),
    ]);

  const pendientesCount = allAssignments.filter(
    (asignacion) => !asignacion.reviews || asignacion.reviews.length === 0,
  ).length;
  const evaluados = allAssignments.length - pendientesCount;
  return {
    role: 'REVISOR',
    kpis: {
      pendientesRevision: pendientesCount,
      evaluados,
      articulosPublicados,
      recursosBiblioteca,
    },
    recientes: asignaciones.flatMap((asignacion) =>
      asignacion.article ? [toRecentArticle(asignacion.article)] : [],
    ),
    convocatoriasAbiertasList,
    distribucionEstados: [],
  };
};

export class DashboardService {
  async getSummary(user: {
    id: number;
    role: RoleName;
    is_author: boolean;
  }): Promise<DashboardSummaryDTO> {
    const convocatoriasAbiertasList = await getOpenConvocations();

    if (user.role === 'ADMIN' || user.role === 'EDITOR' || user.role === 'DDI') {
      return getManagementSummary(
        user.role,
        convocatoriasAbiertasList,
      );
    }

    if (user.role === 'COMITE') {
      return getReviewerSummary(user.id, convocatoriasAbiertasList);
    }

    return getAuthorSummary(
      user.is_author ? 'AUTOR' : 'GENERAL',
      user.id,
      convocatoriasAbiertasList,
    );
  }
}
