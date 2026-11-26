import path from 'node:path';
import { Op } from 'sequelize';
import { uploadsDirectory } from '../../config/uploads.js';
import { Articulo } from '../articulos/Articulo.model.js';
import { ArticuloVersion } from '../articulos/ArticuloVersion.model.js';
import { RecursoBiblioteca } from '../biblioteca/RecursoBiblioteca.model.js';
import type { SimilarityReport } from './ai.dto.js';
import { similarityReportSchema } from './ai.dto.js';

const MAX_TOTAL_BYTES = 20 * 1024 * 1024;
const MAX_INTERNAL_ARTICLES = 150;
const MAX_INTERNAL_RESOURCES = 100;
const AI_SERVICE_URL = (process.env.AI_SERVICE_URL ?? 'http://localhost:8000').replace(
  /\/$/,
  '',
);

const backendRootDirectory = path.dirname(uploadsDirectory);

export class AIServiceError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = 'AIServiceError';
  }
}

export interface SimilarityInput {
  sourceMode: 'demo' | 'uploaded' | 'corpus';
  targetText?: string;
  targetFile?: Express.Multer.File;
  referenceFiles: Express.Multer.File[];
  includeInternalCorpus: boolean;
  includeScientificApis: boolean;
  includeOpenWeb: boolean;
  excludeArticleId?: number;
}

interface InternalCorpusIndexItem {
  id: number;
  sourceType: 'internal_article' | 'internal_library';
  title: string;
  relativePath: string;
  url?: string;
  doi?: string;
  year?: number;
}

const asBlob = (file: Express.Multer.File): Blob => {
  const contents = new ArrayBuffer(file.buffer.byteLength);
  new Uint8Array(contents).set(file.buffer);
  return new Blob([contents], { type: 'application/pdf' });
};

const toUploadsRelativePath = (
  storedPath: string | null | undefined,
  fallbackSubdir: 'articles' | 'library',
): string | null => {
  if (!storedPath) return null;
  const resolved = path.resolve(backendRootDirectory, storedPath);
  const relative = path.relative(uploadsDirectory, resolved);
  if (
    relative &&
    relative !== '..' &&
    !relative.startsWith(`..${path.sep}`) &&
    !path.isAbsolute(relative)
  ) {
    return relative.replace(/\\/g, '/');
  }

  const fileName = path.basename(storedPath.replace(/\\/g, '/'));
  if (!fileName || fileName === '.' || fileName === '..') {
    return null;
  }
  return `${fallbackSubdir}/${fileName}`;
};

const serviceErrorMessage = (status: number, payload: unknown): string => {
  if (
    typeof payload === 'object' &&
    payload !== null &&
    'detail' in payload &&
    typeof payload.detail === 'string'
  ) {
    return payload.detail;
  }
  if (status === 413) {
    return 'El tamaño o la cantidad de archivos supera el límite permitido.';
  }
  if (status === 415) {
    return 'Solo se aceptan documentos PDF válidos.';
  }
  if (status === 422) {
    return 'No se pudo procesar uno de los documentos.';
  }
  if (status >= 400 && status < 500) {
    return 'La solicitud de análisis no es válida.';
  }
  return 'El servicio de análisis no está disponible.';
};

export class AIService {
  private async collectInternalCorpus(
    excludeArticleId?: number,
  ): Promise<InternalCorpusIndexItem[]> {
    const [publishedArticles, publicResources] = await Promise.all([
      Articulo.findAll({
        where: {
          state: 'PUBLICADO',
          ...(excludeArticleId ? { id: { [Op.ne]: excludeArticleId } } : {}),
        },
        attributes: ['id', 'title', 'doi', 'publishedAt', 'createdAt'],
        include: [
          {
            model: ArticuloVersion,
            as: 'versions',
            attributes: ['version_number', 'pdf_path'],
            where: { pdf_path: { [Op.ne]: null } },
            separate: true,
            order: [['version_number', 'DESC']],
            limit: 1,
          },
        ],
        order: [['publishedAt', 'DESC'], ['id', 'DESC']],
        limit: MAX_INTERNAL_ARTICLES,
      }),
      RecursoBiblioteca.findAll({
        where: { visibility: 'PUBLICO' },
        attributes: ['id', 'title', 'file_path', 'fileUrl', 'createdAt'],
        order: [['createdAt', 'DESC'], ['id', 'DESC']],
        limit: MAX_INTERNAL_RESOURCES,
      }),
    ]);

    const items: InternalCorpusIndexItem[] = [];

    for (const article of publishedArticles) {
      const relativePath = toUploadsRelativePath(
        article.versions?.[0]?.pdf_path,
        'articles',
      );
      if (!relativePath) continue;
      const dateRef = article.publishedAt ?? article.createdAt;
      items.push({
        id: article.id,
        sourceType: 'internal_article',
        title: article.title,
        relativePath,
        url: `/api/articulos/publicados/${article.id}/pdf`,
        ...(article.doi ? { doi: article.doi } : {}),
        ...(dateRef ? { year: dateRef.getUTCFullYear() } : {}),
      });
    }

    for (const resource of publicResources) {
      const relativePath = toUploadsRelativePath(
        resource.file_path || resource.fileUrl,
        'library',
      );
      if (!relativePath) continue;
      items.push({
        id: resource.id,
        sourceType: 'internal_library',
        title: resource.title,
        relativePath,
        ...(resource.fileUrl ? { url: resource.fileUrl } : {}),
        ...(resource.createdAt ? { year: resource.createdAt.getUTCFullYear() } : {}),
      });
    }

    return items;
  }

  async analyzeSimilarity(input: SimilarityInput): Promise<SimilarityReport> {
    const totalBytes =
      (input.targetFile?.size ?? 0) +
      input.referenceFiles.reduce((sum, file) => sum + file.size, 0);
    if (totalBytes > MAX_TOTAL_BYTES) {
      throw new AIServiceError(413, 'El tamaño total de los PDFs no puede superar 20 MB.');
    }

    const formData = new FormData();
    formData.append('source_mode', input.sourceMode);
    if (input.targetText !== undefined) {
      formData.append('target_text', input.targetText);
    }
    if (input.targetFile) {
      formData.append(
        'target_file',
        asBlob(input.targetFile),
        input.targetFile.originalname,
      );
    }
    for (const reference of input.referenceFiles) {
      formData.append(
        'reference_files',
        asBlob(reference),
        reference.originalname,
      );
    }

    if (input.sourceMode === 'corpus') {
      formData.append('include_internal_corpus', String(input.includeInternalCorpus));
      formData.append('include_scientific_apis', String(input.includeScientificApis));
      formData.append('include_open_web', String(input.includeOpenWeb));
      if (input.includeInternalCorpus) {
        const corpusItems = await this.collectInternalCorpus(input.excludeArticleId);
        formData.append('internal_corpus', JSON.stringify(corpusItems));
      }
    }

    let response: Response;
    try {
      response = await fetch(`${AI_SERVICE_URL}/analyze/similarity`, {
        method: 'POST',
        body: formData,
        signal: AbortSignal.timeout(90_000),
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new AIServiceError(502, 'No se pudo conectar con el servicio de análisis.');
      }
      throw error;
    }

    let payload: unknown;
    try {
      payload = await response.json();
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new AIServiceError(502, 'El servicio de análisis devolvió una respuesta inválida.');
      }
      throw error;
    }

    if (!response.ok) {
      throw new AIServiceError(
        response.status >= 400 && response.status < 500 ? response.status : 502,
        serviceErrorMessage(response.status, payload),
      );
    }

    if (
      typeof payload !== 'object' ||
      payload === null ||
      !('success' in payload) ||
      payload.success !== true ||
      !('data' in payload)
    ) {
      throw new AIServiceError(502, 'El servicio de análisis devolvió una respuesta inválida.');
    }

    const report = similarityReportSchema.safeParse(payload.data);
    if (!report.success) {
      throw new AIServiceError(502, 'El servicio de análisis devolvió un informe inválido.');
    }

    return report.data;
  }
}
