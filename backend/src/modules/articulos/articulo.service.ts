import fs from 'node:fs';
import path from 'node:path';
import type { Transaction, WhereOptions } from 'sequelize';
import { sequelize } from '../../config/database.js';
import { Articulo, type ArticleState } from './Articulo.model.js';
import { ArticuloVersion } from './ArticuloVersion.model.js';
import { Especialidad } from '../especialidades/Especialidad.model.js';
import { Rol } from '../usuarios/Rol.model.js';
import { Usuario } from '../usuarios/Usuario.model.js';
import type {
  ArticleDTO,
  AuthenticatedArticleUser,
  CreateArticleDraftRequest,
} from './articulo.dto.js';

const INITIAL_ARTICLE_STATE: ArticleState = 'EN_REVISION';

export class ArticuloError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = 'ArticuloError';
  }
}

const articleIncludes = [
  {
    model: Especialidad,
    as: 'specialty',
    attributes: ['id', 'name', 'description', 'active'],
  },
  {
    model: ArticuloVersion,
    as: 'versions',
  },
];

const toArticleDTO = (article: Articulo): ArticleDTO => {
  const dto: ArticleDTO = {
    id: article.id,
    title: article.title,
    state: article.state,
    responsibleId: article.responsibleId,
    specialtyId: article.specialtyId,
    convocationId: article.convocationId,
    createdAt: article.createdAt.toISOString(),
  };

  if (article.summary !== null) {
    dto.summary = article.summary;
  }
  if (article.keywords !== null) {
    dto.keywords = article.keywords;
  }
  if (article.coauthors !== null) {
    dto.coauthors = article.coauthors;
  }
  if (article.specialty) {
    dto.specialty = {
      id: article.specialty.id,
      name: article.specialty.name,
      description: article.specialty.description,
      active: article.specialty.active,
    };
  }
  if (article.versions) {
    dto.versions = article.versions.map((version) => ({
      id: version.id,
      articleId: version.articleId,
      version_number: version.version_number,
      body_text: version.body_text,
      pdf_path: version.pdf_path,
      ai_report: version.ai_report,
      createdAt: version.createdAt.toISOString(),
    }));
  }
  return dto;
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
    console.error('No se pudo eliminar el PDF luego de fallar la creación del artículo:', cleanupError);
  }
};

export class ArticuloService {
  async crearArticulo(
    data: CreateArticleDraftRequest,
    file: Express.Multer.File,
    authorId: number,
  ): Promise<ArticleDTO> {
    try {
      const article = await sequelize.transaction(async (transaction) => {
        await this.assertForeignKeys(data, transaction);

        const article = await Articulo.create(
          {
            title: data.title,
            summary: data.abstract,
            keywords: null,
            coauthors: null,
            state: INITIAL_ARTICLE_STATE,
            responsibleId: authorId,
            specialtyId: data.specialtyId,
            convocationId: null,
          },
          { transaction },
        );

        await ArticuloVersion.create(
          {
            version_number: 1,
            body_text: data.abstract,
            pdf_path: path.relative(process.cwd(), file.path),
            ai_report: null,
            articleId: article.id,
          },
          { transaction },
        );

        return findArticleOrThrow(article.id, transaction);
      });

      return toArticleDTO(article);
    } catch (error: unknown) {
      cleanupUploadedFile(file.path);
      throw error;
    }
  }

  async listarArticulos(user: AuthenticatedArticleUser): Promise<ArticleDTO[]> {
    const where: WhereOptions = user.role === 'AUTOR' ? { responsibleId: user.id } : {};
    const articles = await Articulo.findAll({
      where,
      include: articleIncludes,
      order: [['createdAt', 'DESC']],
    });
    return articles.map(toArticleDTO);
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
    if (!specialty) {
      throw new ArticuloError(400, 'La especialidad indicada no existe');
    }
  }
}
