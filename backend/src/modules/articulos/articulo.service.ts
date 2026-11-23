import fs from 'node:fs';
import path from 'node:path';
import bcrypt from 'bcryptjs';
import { Op, type Includeable, type Transaction, type WhereOptions } from 'sequelize';
import { sequelize } from '../../config/database.js';
import { uploadsDirectory } from '../../config/uploads.js';
import { registrarAuditoria } from '../../services/auditoria.service.js';
import {
  notificarUsuariosPorIds,
  notificarUsuariosPorRol,
} from '../../services/notificaciones.service.js';
import { Articulo, type ArticleState } from './Articulo.model.js';
import { ArticuloVersion } from './ArticuloVersion.model.js';
import { Especialidad } from '../especialidades/Especialidad.model.js';
import { Rol } from '../usuarios/Rol.model.js';
import { Usuario } from '../usuarios/Usuario.model.js';
import { AsignacionComite } from '../editorial/AsignacionComite.model.js';
import { Convocatoria } from '../editorial/Convocatoria.model.js';
import { Revision } from '../editorial/Revision.model.js';
import type {
  ArticleAssignmentDTO,
  ArticleDTO,
  ArticleReviewDTO,
  AuthenticatedArticleUser,
  CreateArticleDraftRequest,
  CreateArticleVersionRequest,
  PublishArticleRequest,
  PublishedArticleDTO,
  ReviewerCandidateDTO,
  SubmitVerdictRequest,
} from './articulo.dto.js';

const INITIAL_ARTICLE_STATE: ArticleState = 'PENDIENTE';

export class ArticuloError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = 'ArticuloError';
  }
}

const articleIncludes: Includeable[] = [
  {
    model: Especialidad,
    as: 'specialty',
    attributes: ['id', 'name', 'description', 'active'],
  },
  {
    model: Usuario,
    as: 'responsible',
    attributes: ['id', 'first_name', 'last_name', 'email'],
  },
  {
    model: Convocatoria,
    as: 'convocatoria',
    attributes: ['id', 'title'],
  },
  {
    model: AsignacionComite,
    as: 'committeeAssignments',
    include: [
      {
        model: Usuario,
        as: 'reviewer',
        attributes: ['id', 'first_name', 'last_name', 'email'],
      },
    ],
  },
  {
    model: ArticuloVersion,
    as: 'versions',
    include: [
      {
        model: Revision,
        as: 'reviews',
      },
    ],
  },
];

const formatFullName = (user?: Usuario): string | undefined => {
  if (!user) return undefined;
  const fullName = `${user.first_name} ${user.last_name}`.trim();
  return fullName || user.email;
};

const parseStringArray = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === 'string');
  }
  if (typeof value === 'string') {
    try {
      const parsed: unknown = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return parsed.filter((item): item is string => typeof item === 'string');
      }
    } catch {
      return [];
    }
  }
  return [];
};

const parseAiReport = (value: unknown): ArticleDTO['versions'] extends (infer V)[] | undefined ? V extends { ai_report: infer R } ? R : null : null => {
  if (value === null || value === undefined) return null;
  if (typeof value === 'string') {
    try {
      const parsed: unknown = JSON.parse(value);
      return typeof parsed === 'object' && parsed !== null
        ? (parsed as NonNullable<ArticleDTO['versions']>[number]['ai_report'])
        : null;
    } catch {
      return null;
    }
  }
  return typeof value === 'object'
    ? (value as NonNullable<ArticleDTO['versions']>[number]['ai_report'])
    : null;
};

const toArticleDTO = (
  article: Articulo,
  viewer?: AuthenticatedArticleUser,
): ArticleDTO => {
  const canSeeReviewerIdentity =
    viewer?.role === 'DDI' ||
    viewer?.role === 'EDITOR' ||
    viewer?.role === 'ADMIN';

  const sortedAssignments = [...(article.committeeAssignments ?? [])].sort(
    (a, b) => a.id - b.id,
  );
  const assignmentLabelMap = new Map<number, string>();
  const assignmentReviewerMap = new Map<number, AsignacionComite>();
  sortedAssignments.forEach((assignment, index) => {
    assignmentLabelMap.set(assignment.id, `Revisor ${index + 1}`);
    assignmentReviewerMap.set(assignment.id, assignment);
  });

  const sortedVersions = [...(article.versions ?? [])].sort(
    (a, b) => b.version_number - a.version_number,
  );
  const latestVersion = sortedVersions[0];
  const latestVersionReviews = latestVersion?.reviews ?? [];
  const reviewedAssignmentIds = new Set(
    latestVersionReviews.map((review) => review.assignmentId),
  );

  const dto: ArticleDTO = {
    id: article.id,
    title: article.title,
    state: article.state,
    responsibleId: article.responsibleId,
    specialtyId: article.specialtyId,
    convocationId: article.convocationId,
    convocatoriaId: article.convocatoriaId ?? article.convocationId,
    rejection_reason: article.rejection_reason ?? null,
    publishedAt: article.publishedAt ? article.publishedAt.toISOString() : null,
    editionNumber: article.editionNumber ?? null,
    doi: article.doi ?? null,
    createdAt: article.createdAt.toISOString(),
  };

  const authorName = formatFullName(article.responsible);
  if (authorName) {
    dto.authorName = authorName;
  }
  if (article.summary !== null) {
    dto.summary = article.summary;
  }
  const parsedKeywords = parseStringArray(article.keywords);
  if (parsedKeywords.length > 0) {
    dto.keywords = parsedKeywords;
  }
  const parsedCoauthors = parseStringArray(article.coauthors);
  if (parsedCoauthors.length > 0) {
    dto.coauthors = parsedCoauthors;
  }
  if (article.convocatoria) {
    dto.convocatoria = {
      id: article.convocatoria.id,
      title: article.convocatoria.title,
    };
  }
  if (article.specialty) {
    dto.specialty = {
      id: article.specialty.id,
      name: article.specialty.name,
      description: article.specialty.description,
      active: article.specialty.active,
    };
  }

  dto.versions = sortedVersions.map((version) => {
    const sortedReviews = [...(version.reviews ?? [])].sort(
      (a, b) => a.id - b.id,
    );
    const reviews: ArticleReviewDTO[] = sortedReviews.map((review) => {
      const assignment = assignmentReviewerMap.get(review.assignmentId);
      const reviewerLabel =
        assignmentLabelMap.get(review.assignmentId) ?? 'Revisor';
      const reviewerName = canSeeReviewerIdentity
        ? formatFullName(assignment?.reviewer)
        : undefined;
      const isOwnReview =
        viewer !== undefined && assignment?.reviewerId === viewer.id;

      return {
        id: review.id,
        assignmentId: review.assignmentId,
        versionId: review.versionId,
        verdict: review.verdict,
        comments: review.comments,
        observations: parseStringArray(review.observations),
        reviewerLabel,
        ...(reviewerName ? { reviewerName } : {}),
        ...(isOwnReview ? { isOwnReview: true } : {}),
        createdAt: review.createdAt
          ? review.createdAt.toISOString()
          : version.createdAt.toISOString(),
      };
    });

    return {
      id: version.id,
      articleId: version.articleId,
      version_number: version.version_number,
      body_text: version.body_text,
      pdf_path: version.pdf_path,
      ai_report: parseAiReport(version.ai_report),
      reviews,
      createdAt: version.createdAt.toISOString(),
    };
  });

  dto.assignments = sortedAssignments.map((assignment): ArticleAssignmentDTO => {
    const reviewerName = canSeeReviewerIdentity
      ? formatFullName(assignment.reviewer)
      : undefined;

    return {
      id: assignment.id,
      reviewerLabel: assignmentLabelMap.get(assignment.id) ?? 'Revisor',
      ...(canSeeReviewerIdentity ? { reviewerId: assignment.reviewerId } : {}),
      ...(reviewerName ? { reviewerName } : {}),
      read_status: assignment.read_status,
      hasReviewedLatest: reviewedAssignmentIds.has(assignment.id),
    };
  });

  if (viewer) {
    const ownAssignment = sortedAssignments.find(
      (assignment) => assignment.reviewerId === viewer.id,
    );
    if (ownAssignment) {
      dto.currentUserAssignment = {
        id: ownAssignment.id,
        read_status: ownAssignment.read_status,
        hasReviewedLatest: reviewedAssignmentIds.has(ownAssignment.id),
      };
    }
  }

  return dto;
};

const toPublishedArticleDTO = (article: Articulo): PublishedArticleDTO => {
  const latestVersion = article.versions?.[0];
  const dto: PublishedArticleDTO = {
    id: article.id,
    title: article.title,
    publishedAt: article.publishedAt ? article.publishedAt.toISOString() : null,
    editionNumber: article.editionNumber ?? null,
    doi: article.doi ?? null,
    createdAt: article.createdAt.toISOString(),
    pdfAvailable: Boolean(latestVersion?.pdf_path),
  };

  const authorName = article.responsible
    ? `${article.responsible.first_name} ${article.responsible.last_name}`.trim()
    : '';
  if (authorName) {
    dto.authorName = authorName;
  }
  if (article.summary) {
    dto.summary = article.summary;
  }
  const parsedKeywords = parseStringArray(article.keywords);
  if (parsedKeywords.length > 0) {
    dto.keywords = parsedKeywords;
  }
  const parsedCoauthors = parseStringArray(article.coauthors);
  if (parsedCoauthors.length > 0) {
    dto.coauthors = parsedCoauthors;
  }
  if (article.specialty) {
    dto.specialty = { id: article.specialty.id, name: article.specialty.name };
  }

  return dto;
};

const publishedArticleIncludes: Includeable[] = [
  {
    model: Especialidad,
    as: 'specialty',
    attributes: ['id', 'name'],
  },
  {
    model: Usuario,
    as: 'responsible',
    attributes: ['first_name', 'last_name'],
  },
  {
    model: ArticuloVersion,
    as: 'versions',
    attributes: ['version_number', 'pdf_path'],
    where: { pdf_path: { [Op.ne]: null } },
    separate: true,
    order: [['version_number', 'DESC']],
  },
];

const backendRootDirectory = path.dirname(uploadsDirectory);

const resolveDownloadFileName = (
  originalFilename: string | null | undefined,
  storedPath: string,
  fallbackName: string,
): string => {
  const rawCandidate =
    originalFilename?.trim() ||
    path.basename(storedPath.replace(/\\/g, '/')).replace(/^\d+-/, '');
  const sanitized = rawCandidate
    .replace(/[\r\n"\\/]/g, '_')
    .replace(/\s+/g, ' ')
    .trim();

  if (!sanitized) {
    return fallbackName;
  }

  return sanitized.toLowerCase().endsWith('.pdf')
    ? sanitized
    : `${sanitized}.pdf`;
};

const getArticlePdfPath = (storedPath: string): string => {
  const articleDirectory = path.join(uploadsDirectory, 'articles');
  const resolvedPath = path.resolve(backendRootDirectory, storedPath);
  const relativePath = path.relative(articleDirectory, resolvedPath);

  if (
    relativePath === '' ||
    relativePath === '..' ||
    relativePath.startsWith(`..${path.sep}`) ||
    path.isAbsolute(relativePath)
  ) {
    throw new Error('La ruta del PDF del artículo está fuera del directorio permitido.');
  }

  return resolvedPath;
};

const findArticleOrThrow = async (
  id: number,
  transaction?: Transaction,
): Promise<Articulo> => {
  const article = await Articulo.findByPk(id, {
    transaction,
    include: articleIncludes,
  });
  if (!article) {
    throw new ArticuloError(404, 'Artículo no encontrado');
  }
  return article;
};

const cleanupUploadedFile = (filePath: string): void => {
  if (!fs.existsSync(filePath)) {
    return;
  }

  try {
    fs.unlinkSync(filePath);
  } catch (cleanupError: unknown) {
    console.error('No se pudo eliminar el PDF tras fallar la operación del artículo:', cleanupError);
  }
};

export class ArticuloService {
  async listarArticulosPublicados(convocatoriaId?: number): Promise<PublishedArticleDTO[]> {
    const where: WhereOptions = { state: 'PUBLICADO' };
    if (convocatoriaId !== undefined) {
      Object.assign(where, { convocatoriaId });
    }
    const articles = await Articulo.findAll({
      where,
      include: publishedArticleIncludes,
      order: [['createdAt', 'DESC']],
    });

    return articles.map((article) => {
      const dto = toPublishedArticleDTO(article);
      const pdfPath = article.versions?.[0]?.pdf_path;
      if (pdfPath) {
        dto.pdfAvailable = fs.existsSync(getArticlePdfPath(pdfPath));
      }
      return dto;
    });
  }

  async obtenerPdfPublicado(
    id: number,
  ): Promise<{ pdfPath: string; fileName: string }> {
    const article = await Articulo.findOne({
      where: { id, state: 'PUBLICADO' },
      include: [
        {
          model: ArticuloVersion,
          as: 'versions',
          attributes: ['version_number', 'pdf_path', 'original_filename'],
          where: { pdf_path: { [Op.ne]: null } },
          separate: true,
          order: [['version_number', 'DESC']],
        },
      ],
    });

    if (!article) {
      throw new ArticuloError(404, 'Artículo publicado no encontrado');
    }

    const latestVersion = article.versions?.[0];
    const pdfPath = latestVersion?.pdf_path;
    if (!pdfPath) {
      throw new ArticuloError(404, 'El artículo publicado no tiene un PDF disponible');
    }

    const resolvedPath = getArticlePdfPath(pdfPath);
    if (!fs.existsSync(resolvedPath)) {
      throw new ArticuloError(404, 'El PDF de la publicación no está disponible');
    }

    return {
      pdfPath: resolvedPath,
      fileName: resolveDownloadFileName(
        latestVersion.original_filename,
        pdfPath,
        `publicacion-${id}.pdf`,
      ),
    };
  }

  async obtenerPdfAutenticado(
    articleId: number,
    user: AuthenticatedArticleUser,
    versionId?: number,
  ): Promise<{ pdfPath: string; fileName: string }> {
    const article = await findArticleOrThrow(articleId);

    const isOwner = article.responsibleId === user.id;
    const isStaffWithOversight =
      user.role === 'DDI' || user.role === 'EDITOR' || user.role === 'ADMIN';
    const isAssignedReviewer = (article.committeeAssignments ?? []).some(
      (assignment) => assignment.reviewerId === user.id,
    );

    if (!isOwner && !isStaffWithOversight && !isAssignedReviewer) {
      throw new ArticuloError(
        403,
        'No tiene permisos para acceder al PDF de este manuscrito',
      );
    }

    const sortedVersions = [...(article.versions ?? [])].sort(
      (a, b) => b.version_number - a.version_number,
    );
    const targetVersion = versionId
      ? sortedVersions.find((version) => version.id === versionId)
      : sortedVersions[0];

    if (!targetVersion || !targetVersion.pdf_path) {
      throw new ArticuloError(404, 'No se encontró un archivo PDF para esta versión');
    }

    const resolvedPath = getArticlePdfPath(targetVersion.pdf_path);
    if (!fs.existsSync(resolvedPath)) {
      throw new ArticuloError(404, 'El archivo PDF ya no está disponible en el servidor');
    }

    return {
      pdfPath: resolvedPath,
      fileName: resolveDownloadFileName(
        targetVersion.original_filename,
        targetVersion.pdf_path,
        `manuscrito-${article.id}-v${targetVersion.version_number}.pdf`,
      ),
    };
  }

  async listarRevisores(): Promise<ReviewerCandidateDTO[]> {
    const reviewers = await Usuario.findAll({
      where: { active: true },
      attributes: ['id', 'first_name', 'last_name', 'email', 'specialtyId'],
      include: [
        {
          model: Rol,
          as: 'role',
          attributes: [],
          where: { name: 'COMITE' },
        },
        {
          model: Especialidad,
          as: 'specialty',
          attributes: ['id', 'name'],
          required: false,
        },
      ],
      order: [
        ['last_name', 'ASC'],
        ['first_name', 'ASC'],
      ],
    });

    return reviewers.map((reviewer) => {
      const specialty = (reviewer as Usuario & { specialty?: Especialidad }).specialty;
      return {
        id: reviewer.id,
        first_name: reviewer.first_name,
        last_name: reviewer.last_name,
        email: reviewer.email,
        specialtyId: reviewer.specialtyId,
        specialtyName: specialty?.name ?? null,
      };
    });
  }

  async crearArticulo(
    data: CreateArticleDraftRequest,
    file: Express.Multer.File,
    authorId: number,
  ): Promise<ArticleDTO> {
    try {
      const article = await sequelize.transaction(async (transaction) => {
        await this.assertForeignKeys(data, transaction);

        const cleanCoauthors = data.coauthors
          ?.map((name) => name.trim())
          .filter(Boolean);

        const created = await Articulo.create(
          {
            title: data.title,
            summary: data.abstract,
            keywords: null,
            coauthors: cleanCoauthors && cleanCoauthors.length > 0 ? cleanCoauthors : null,
            rejection_reason: null,
            state: INITIAL_ARTICLE_STATE,
            responsibleId: authorId,
            specialtyId: data.specialtyId,
            convocationId: data.convocatoriaId,
            convocatoriaId: data.convocatoriaId,
          },
          { transaction },
        );

        await ArticuloVersion.create(
          {
            version_number: 1,
            body_text: data.abstract,
            pdf_path: path.relative(backendRootDirectory, file.path),
            original_filename: file.originalname,
            ai_report: null,
            articleId: created.id,
          },
          { transaction },
        );

        return findArticleOrThrow(created.id, transaction);
      });

      const authorName = formatFullName(article.responsible) ?? 'Un autor';
      await Promise.all([
        notificarUsuariosPorRol(
          ['DDI'],
          'MANUSCRITO_RECIBIDO',
          'Nuevo manuscrito recibido',
          `${authorName} envió el manuscrito "${article.title}" para evaluación inicial en Mesa de Entrada.`,
          article.id,
        ),
        registrarAuditoria({
          userId: authorId,
          action: 'MANUSCRITO_ENVIADO',
          entityType: 'ARTICULO',
          entityId: article.id,
          summary: `Envió el manuscrito "${article.title}" (v1) a Mesa de Entrada.`,
          details: {
            convocatoriaId: data.convocatoriaId,
            specialtyId: data.specialtyId,
            originalFilename: file.originalname,
          },
        }),
      ]);

      return toArticleDTO(article, {
        id: authorId,
        role: 'STAFF',
        is_author: true,
      });
    } catch (error: unknown) {
      cleanupUploadedFile(file.path);
      throw error;
    }
  }

  async subirNuevaVersion(
    articleId: number,
    data: CreateArticleVersionRequest,
    file: Express.Multer.File,
    user: AuthenticatedArticleUser,
  ): Promise<ArticleDTO> {
    try {
      const { article, reviewerIds, newVersionNumber } = await sequelize.transaction(
        async (transaction) => {
          const existing = await findArticleOrThrow(articleId, transaction);

          if (existing.responsibleId !== user.id && user.role !== 'ADMIN') {
            throw new ArticuloError(
              403,
              'Solo el autor responsable puede subir una nueva versión de este manuscrito',
            );
          }

          if (existing.state !== 'REVISION_MENOR') {
            throw new ArticuloError(
              409,
              'Solo se pueden enviar correcciones para manuscritos en estado Aprobado con correcciones',
            );
          }

          const latestVersionNumber = (existing.versions ?? []).reduce(
            (max, version) => Math.max(max, version.version_number),
            0,
          );
          const nextVersionNumber = latestVersionNumber + 1;

          const cleanCoauthors = data.coauthors
            ?.map((name) => name.trim())
            .filter(Boolean);

          await existing.update(
            {
              ...(data.title ? { title: data.title } : {}),
              ...(data.abstract ? { summary: data.abstract } : {}),
              ...(data.coauthors !== undefined
                ? {
                    coauthors:
                      cleanCoauthors && cleanCoauthors.length > 0
                        ? cleanCoauthors
                        : null,
                  }
                : {}),
              state: 'EN_REVISION',
            },
            { transaction },
          );

          await ArticuloVersion.create(
            {
              version_number: nextVersionNumber,
              body_text:
                data.notes?.trim() ||
                data.abstract?.trim() ||
                existing.summary ||
                null,
              pdf_path: path.relative(backendRootDirectory, file.path),
              original_filename: file.originalname,
              ai_report: null,
              articleId: existing.id,
            },
            { transaction },
          );

          await AsignacionComite.update(
            { read_status: false },
            { where: { articleId: existing.id }, transaction },
          );

          const updatedArticle = await findArticleOrThrow(existing.id, transaction);
          const assignedIds = (updatedArticle.committeeAssignments ?? []).map(
            (assignment) => assignment.reviewerId,
          );

          return {
            article: updatedArticle,
            reviewerIds: assignedIds,
            newVersionNumber: nextVersionNumber,
          };
        },
      );

      await Promise.all([
        reviewerIds.length > 0
          ? notificarUsuariosPorIds(
              reviewerIds,
              'MANUSCRITO_CORREGIDO',
              `Corrección recibida (v${newVersionNumber})`,
              `El autor envió la versión v${newVersionNumber} corregida del manuscrito "${article.title}" para su verificación.`,
              article.id,
            )
          : Promise.resolve(0),
        registrarAuditoria({
          userId: user.id,
          actorRole: user.role,
          action: 'MANUSCRITO_VERSION_SUBIDA',
          entityType: 'ARTICULO',
          entityId: article.id,
          summary: `Subió la versión v${newVersionNumber} corregida de "${article.title}".`,
          details: {
            versionNumber: newVersionNumber,
            originalFilename: file.originalname,
          },
        }),
      ]);

      return toArticleDTO(article, user);
    } catch (error: unknown) {
      cleanupUploadedFile(file.path);
      throw error;
    }
  }

  async rechazarEnEscritorio(
    articleId: number,
    reason: string,
    user: AuthenticatedArticleUser,
  ): Promise<ArticleDTO> {
    const article = await sequelize.transaction(async (transaction) => {
      const existing = await findArticleOrThrow(articleId, transaction);
      if (existing.state !== 'PENDIENTE') {
        throw new ArticuloError(
          409,
          'Solo se pueden rechazar en Mesa de Entrada manuscritos en estado PENDIENTE',
        );
      }

      await existing.update(
        {
          state: 'RECHAZADO',
          rejection_reason: reason.trim(),
        },
        { transaction },
      );

      return findArticleOrThrow(existing.id, transaction);
    });

    await Promise.all([
      notificarUsuariosPorIds(
        [article.responsibleId],
        'MANUSCRITO_RECHAZADO_DDI',
        'Manuscrito rechazado por Docencia e Investigación',
        `Tu manuscrito "${article.title}" fue rechazado en evaluación inicial. Motivo: ${reason.trim()}`,
        article.id,
      ),
      registrarAuditoria({
        userId: user.id,
        actorRole: user.role,
        action: 'MANUSCRITO_RECHAZADO_DDI',
        entityType: 'ARTICULO',
        entityId: article.id,
        summary: `Rechazó en Mesa de Entrada (DDI) el manuscrito "${article.title}".`,
        details: { reason: reason.trim() },
      }),
    ]);

    return toArticleDTO(article, user);
  }

  async asignarRevisores(
    articleId: number,
    reviewerIds: number[],
    user: AuthenticatedArticleUser,
  ): Promise<ArticleDTO> {
    const uniqueReviewerIds = Array.from(new Set(reviewerIds));
    if (uniqueReviewerIds.length !== 1 && uniqueReviewerIds.length !== 3) {
      throw new ArticuloError(
        400,
        'Debe asignar exactamente 1 o 3 miembros del Comité Científico',
      );
    }

    const article = await sequelize.transaction(async (transaction) => {
      const existing = await findArticleOrThrow(articleId, transaction);
      if (existing.state !== 'PENDIENTE') {
        throw new ArticuloError(
          409,
          'Solo se pueden derivar al Comité manuscritos en estado PENDIENTE',
        );
      }

      const validReviewers = await Usuario.findAll({
        where: {
          id: { [Op.in]: uniqueReviewerIds },
          active: true,
        },
        include: [
          {
            model: Rol,
            as: 'role',
            attributes: [],
            where: { name: 'COMITE' },
          },
        ],
        transaction,
      });

      if (validReviewers.length !== uniqueReviewerIds.length) {
        throw new ArticuloError(
          400,
          'Todos los revisores seleccionados deben ser usuarios activos con rol COMITE',
        );
      }

      await AsignacionComite.destroy({
        where: { articleId: existing.id },
        transaction,
      });

      await AsignacionComite.bulkCreate(
        uniqueReviewerIds.map((reviewerId) => ({
          articleId: existing.id,
          reviewerId,
          read_status: false,
        })),
        { transaction },
      );

      await existing.update({ state: 'EN_REVISION' }, { transaction });

      return findArticleOrThrow(existing.id, transaction);
    });

    await Promise.all([
      notificarUsuariosPorIds(
        [article.responsibleId],
        'MANUSCRITO_EN_REVISION',
        'Manuscrito derivado al Comité Científico',
        `Tu manuscrito "${article.title}" superó la instancia inicial de DDI y fue asignado al Comité Científico para su evaluación.`,
        article.id,
      ),
      notificarUsuariosPorIds(
        uniqueReviewerIds,
        'MANUSCRITO_ASIGNADO',
        'Nuevo manuscrito asignado para revisión',
        `El DDI te asignó el manuscrito "${article.title}" para emitir dictamen.`,
        article.id,
      ),
      registrarAuditoria({
        userId: user.id,
        actorRole: user.role,
        action: 'MANUSCRITO_ASIGNADO',
        entityType: 'ARTICULO',
        entityId: article.id,
        summary: `Asignó ${uniqueReviewerIds.length} revisor(es) del Comité al manuscrito "${article.title}".`,
        details: { reviewerIds: uniqueReviewerIds },
      }),
    ]);

    return toArticleDTO(article, user);
  }

  async emitirDictamen(
    articleId: number,
    data: SubmitVerdictRequest,
    user: AuthenticatedArticleUser,
  ): Promise<ArticleDTO> {
    const { article, newState } = await sequelize.transaction(async (transaction) => {
      const existing = await findArticleOrThrow(articleId, transaction);
      if (existing.state !== 'EN_REVISION') {
        throw new ArticuloError(
          409,
          'Solo se pueden emitir dictámenes sobre manuscritos en estado EN_REVISION',
        );
      }

      const assignment = (existing.committeeAssignments ?? []).find(
        (item) => item.reviewerId === user.id,
      );
      if (!assignment) {
        throw new ArticuloError(
          403,
          'No está asignado como revisor de este manuscrito',
        );
      }

      const sortedVersions = [...(existing.versions ?? [])].sort(
        (a, b) => b.version_number - a.version_number,
      );
      const latestVersion = sortedVersions[0];
      if (!latestVersion) {
        throw new ArticuloError(
          400,
          'El manuscrito no tiene una versión cargada para evaluar',
        );
      }

      const existingReview = await Revision.findOne({
        where: {
          assignmentId: assignment.id,
          versionId: latestVersion.id,
        },
        transaction,
      });
      if (existingReview) {
        throw new ArticuloError(
          409,
          'Ya emitiste un dictamen para la versión actual de este manuscrito',
        );
      }

      const cleanObservations = data.observations
        ?.map((item) => item.trim())
        .filter(Boolean);

      await Revision.create(
        {
          assignmentId: assignment.id,
          versionId: latestVersion.id,
          verdict: data.verdict,
          comments: data.comments.trim(),
          observations:
            cleanObservations && cleanObservations.length > 0
              ? cleanObservations
              : null,
        },
        { transaction },
      );

      await assignment.update({ read_status: true }, { transaction });

      const allAssignments = existing.committeeAssignments ?? [];
      const versionReviews = await Revision.findAll({
        where: { versionId: latestVersion.id },
        transaction,
      });

      let resolvedState: ArticleState | null = null;

      if (latestVersion.version_number >= 2) {
        // Ronda de verificación de correcciones:
        // el paper ya fue aprobado con correcciones en v1.
        if (data.verdict === 'APROBAR') {
          resolvedState = 'APROBADO';
        } else if (data.verdict === 'APROBAR_CON_CORRECCIONES') {
          resolvedState = 'REVISION_MENOR';
        } else if (data.verdict === 'RECHAZAR') {
          const rejectVotes = versionReviews.filter(
            (review) => review.verdict === 'RECHAZAR',
          ).length;
          if (
            allAssignments.length <= 1 ||
            rejectVotes > allAssignments.length / 2
          ) {
            resolvedState = 'RECHAZADO';
          }
        }
      } else if (versionReviews.length >= allAssignments.length) {
        // Ronda inicial (v1): voto mayoritario entre los 1 o 3 jueces asignados.
        // APROBAR + APROBAR_CON_CORRECCIONES cuentan juntos como aprobatorios,
        // pero cualquier pedido de correcciones debe atenderse antes de pasar a APROBADO.
        const rejectVotes = versionReviews.filter(
          (review) => review.verdict === 'RECHAZAR',
        ).length;
        const correctionVotes = versionReviews.filter(
          (review) => review.verdict === 'APROBAR_CON_CORRECCIONES',
        ).length;
        const approvingVotes = versionReviews.length - rejectVotes;

        if (rejectVotes > approvingVotes) {
          resolvedState = 'RECHAZADO';
        } else if (correctionVotes > 0) {
          resolvedState = 'REVISION_MENOR';
        } else {
          resolvedState = 'APROBADO';
        }
      }

      if (resolvedState) {
        await existing.update({ state: resolvedState }, { transaction });
      }

      const updatedArticle = await findArticleOrThrow(existing.id, transaction);
      return { article: updatedArticle, newState: resolvedState };
    });

    if (newState === 'APROBADO') {
      await Promise.all([
        notificarUsuariosPorIds(
          [article.responsibleId],
          'MANUSCRITO_RESUELTO',
          'Manuscrito aprobado por el Comité Científico',
          `Tu manuscrito "${article.title}" fue aprobado y pasó a la etapa de publicación editorial.`,
          article.id,
        ),
        notificarUsuariosPorRol(
          ['EDITOR'],
          'MANUSCRITO_APROBADO_PUBLICACION',
          'Manuscrito aprobado listo para publicar',
          `El manuscrito "${article.title}" fue aprobado por el Comité Científico y está listo para su publicación.`,
          article.id,
        ),
      ]);
    } else if (newState === 'REVISION_MENOR') {
      await notificarUsuariosPorIds(
        [article.responsibleId],
        'MANUSCRITO_RESUELTO',
        'Manuscrito aprobado con correcciones',
        `Tu manuscrito "${article.title}" fue aprobado con correcciones. Revisá las observaciones del Comité y subí la versión corregida.`,
        article.id,
      );
    } else if (newState === 'RECHAZADO') {
      await notificarUsuariosPorIds(
        [article.responsibleId],
        'MANUSCRITO_RESUELTO',
        'Manuscrito rechazado por el Comité Científico',
        `Tu manuscrito "${article.title}" fue rechazado tras la evaluación del Comité. Podés consultar las devoluciones en Mis Manuscritos.`,
        article.id,
      );
    }

    await registrarAuditoria({
      userId: user.id,
      actorRole: user.role,
      action: 'MANUSCRITO_DICTAMEN',
      entityType: 'ARTICULO',
      entityId: article.id,
      summary: `Emitió dictamen ${data.verdict} sobre "${article.title}"${newState ? ` (estado resultante: ${newState})` : ''}.`,
      details: {
        verdict: data.verdict,
        resultingState: newState ?? article.state,
        observationsCount: data.observations?.length ?? 0,
      },
    });

    return toArticleDTO(article, user);
  }

  async aprobarCorreccion(
    articleId: number,
    user: AuthenticatedArticleUser,
  ): Promise<ArticleDTO> {
    const article = await sequelize.transaction(async (transaction) => {
      const existing = await findArticleOrThrow(articleId, transaction);
      if (existing.state !== 'EN_REVISION') {
        throw new ArticuloError(
          409,
          'Solo se pueden aprobar correcciones de manuscritos en estado EN_REVISION',
        );
      }

      const latestVersionNumber = (existing.versions ?? []).reduce(
        (max, version) => Math.max(max, version.version_number),
        0,
      );
      if (latestVersionNumber < 2) {
        throw new ArticuloError(
          409,
          'Esta acción solo aplica a manuscritos que ya enviaron una versión corregida (v2 o superior)',
        );
      }

      await existing.update({ state: 'APROBADO' }, { transaction });
      return findArticleOrThrow(existing.id, transaction);
    });

    await Promise.all([
      notificarUsuariosPorIds(
        [article.responsibleId],
        'MANUSCRITO_RESUELTO',
        'Correcciones aprobadas',
        `Las correcciones de tu manuscrito "${article.title}" fueron aprobadas y pasó a la cola de publicación.`,
        article.id,
      ),
      notificarUsuariosPorRol(
        ['EDITOR'],
        'MANUSCRITO_APROBADO_PUBLICACION',
        'Manuscrito aprobado listo para publicar',
        `El manuscrito "${article.title}" quedó aprobado para publicación tras validar sus correcciones.`,
        article.id,
      ),
      registrarAuditoria({
        userId: user.id,
        actorRole: user.role,
        action: 'MANUSCRITO_CORRECCION_APROBADA',
        entityType: 'ARTICULO',
        entityId: article.id,
        summary: `Aprobó la versión corregida de "${article.title}" para publicación.`,
      }),
    ]);

    return toArticleDTO(article, user);
  }

  async publicarArticulo(
    articleId: number,
    input: PublishArticleRequest,
    user: AuthenticatedArticleUser,
  ): Promise<ArticleDTO> {
    const article = await sequelize.transaction(async (transaction) => {
      const existing = await findArticleOrThrow(articleId, transaction);
      if (existing.state !== 'APROBADO' && existing.state !== 'ACEPTADO') {
        throw new ArticuloError(
          409,
          'Solo se pueden publicar manuscritos que estén en estado APROBADO',
        );
      }

      const sortedVersions = [...(existing.versions ?? [])].sort(
        (a, b) => b.version_number - a.version_number,
      );
      const latestVersion = sortedVersions[0];
      if (
        !latestVersion?.pdf_path ||
        !fs.existsSync(getArticlePdfPath(latestVersion.pdf_path))
      ) {
        throw new ArticuloError(
          400,
          'No se puede publicar el manuscrito porque la versión vigente no tiene un PDF disponible',
        );
      }

      const cleanKeywords = input.keywords
        ?.map((item) => item.trim())
        .filter(Boolean);

      await existing.update(
        {
          state: 'PUBLICADO',
          publishedAt: input.publishedAt ?? new Date(),
          ...(input.editionNumber !== undefined
            ? { editionNumber: input.editionNumber.trim() || null }
            : {}),
          ...(input.doi !== undefined ? { doi: input.doi.trim() || null } : {}),
          ...(cleanKeywords !== undefined
            ? { keywords: cleanKeywords.length > 0 ? cleanKeywords : null }
            : {}),
        },
        { transaction },
      );

      return findArticleOrThrow(existing.id, transaction);
    });

    await Promise.all([
      notificarUsuariosPorIds(
        [article.responsibleId],
        'MANUSCRITO_PUBLICADO',
        '¡Tu manuscrito fue publicado!',
        `Tu manuscrito "${article.title}" ya se encuentra publicado y disponible en el Portal Público del HIEF.`,
        article.id,
      ),
      registrarAuditoria({
        userId: user.id,
        actorRole: user.role,
        action: 'MANUSCRITO_PUBLICADO',
        entityType: 'ARTICULO',
        entityId: article.id,
        summary: `Publicó en el Portal Público el manuscrito "${article.title}".`,
        details: {
          editionNumber: article.editionNumber ?? null,
          doi: article.doi ?? null,
        },
      }),
    ]);

    return toArticleDTO(article, user);
  }

  async retirarArticulo(
    articleId: number,
    reason: string,
    password: string,
    user: AuthenticatedArticleUser,
  ): Promise<ArticleDTO> {
    const dbUser = await Usuario.findByPk(user.id);
    if (!dbUser) {
      throw new ArticuloError(401, 'Usuario autenticado no encontrado');
    }
    const validPassword = await bcrypt.compare(password, dbUser.password);
    if (!validPassword) {
      throw new ArticuloError(401, 'Contraseña incorrecta');
    }

    const article = await sequelize.transaction(async (transaction) => {
      const existing = await findArticleOrThrow(articleId, transaction);
      if (existing.state !== 'PUBLICADO') {
        throw new ArticuloError(
          409,
          'Solo se pueden retirar manuscritos que estén actualmente en estado PUBLICADO',
        );
      }

      await existing.update(
        {
          state: 'APROBADO',
          publishedAt: null,
        },
        { transaction },
      );

      return findArticleOrThrow(existing.id, transaction);
    });

    await Promise.all([
      notificarUsuariosPorIds(
        [article.responsibleId],
        'MANUSCRITO_RETIRADO',
        'Publicación retirada del portal público',
        `Tu manuscrito "${article.title}" fue retirado temporalmente del portal público. Motivo: ${reason.trim()}`,
        article.id,
      ),
      registrarAuditoria({
        userId: user.id,
        actorRole: user.role,
        action: 'MANUSCRITO_RETIRADO',
        entityType: 'ARTICULO',
        entityId: article.id,
        summary: `Retiró del Portal Público el manuscrito "${article.title}".`,
        details: { reason: reason.trim() },
      }),
    ]);

    return toArticleDTO(article, user);
  }

  async listarArticulos(user: AuthenticatedArticleUser): Promise<ArticleDTO[]> {
    if (user.role === 'COMITE') {
      const assignments = await AsignacionComite.findAll({
        where: { reviewerId: user.id },
        attributes: ['articleId'],
      });
      const assignedIds = assignments.map((item) => item.articleId);
      if (assignedIds.length === 0) {
        return [];
      }

      const articles = await Articulo.findAll({
        where: { id: { [Op.in]: assignedIds } },
        include: articleIncludes,
        order: [['createdAt', 'DESC']],
      });
      return articles.map((article) => toArticleDTO(article, user));
    }

    const where: WhereOptions =
      user.role === 'STAFF' ? { responsibleId: user.id } : {};
    const articles = await Articulo.findAll({
      where,
      include: articleIncludes,
      order: [['createdAt', 'DESC']],
    });
    return articles.map((article) => toArticleDTO(article, user));
  }

  async actualizarEstado(
    id: number,
    nuevoEstado: ArticleState,
    revisorId: number,
  ): Promise<ArticleDTO> {
    const reviewer = await Usuario.findByPk(revisorId);
    if (!reviewer) {
      throw new ArticuloError(401, 'Sesión expirada. Inicie sesión nuevamente');
    }

    const reviewerRole = await Rol.findByPk(reviewer.roleId);
    if (!reviewerRole || (reviewerRole.name !== 'COMITE' && reviewerRole.name !== 'ADMIN')) {
      throw new ArticuloError(403, 'No tiene permisos para cambiar el estado del artículo');
    }

    const article = await findArticleOrThrow(id);
    await article.update({ state: nuevoEstado });
    return toArticleDTO(await findArticleOrThrow(id));
  }

  private async assertForeignKeys(
    data: CreateArticleDraftRequest,
    transaction: Transaction,
  ): Promise<void> {
    const specialty = await Especialidad.findByPk(data.specialtyId, { transaction });
    if (!specialty || !specialty.active) {
      throw new ArticuloError(400, 'La especialidad indicada no existe o está inactiva');
    }

    const convocatoria = await Convocatoria.findByPk(data.convocatoriaId, { transaction });
    if (!convocatoria) {
      throw new ArticuloError(400, 'La convocatoria indicada no existe');
    }
    if (convocatoria.estado !== 'ABIERTA') {
      throw new ArticuloError(
        400,
        'La convocatoria debe estar en estado ABIERTA para recibir manuscritos',
      );
    }
  }
}
