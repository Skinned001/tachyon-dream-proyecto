import type { SimilarityReport } from './ai.dto.js';
import { similarityReportSchema } from './ai.dto.js';

const MAX_TOTAL_BYTES = 20 * 1024 * 1024;
const AI_SERVICE_URL = (process.env.AI_SERVICE_URL ?? 'http://localhost:8000').replace(
  /\/$/,
  '',
);

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
  sourceMode: 'demo' | 'uploaded';
  targetText?: string;
  targetFile?: Express.Multer.File;
  referenceFiles: Express.Multer.File[];
}

const asBlob = (file: Express.Multer.File): Blob => {
  const contents = new ArrayBuffer(file.buffer.byteLength);
  new Uint8Array(contents).set(file.buffer);
  return new Blob([contents], { type: 'application/pdf' });
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

    let response: Response;
    try {
      response = await fetch(`${AI_SERVICE_URL}/analyze/similarity`, {
        method: 'POST',
        body: formData,
        signal: AbortSignal.timeout(60_000),
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
