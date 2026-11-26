import type { NextFunction, Request, Response } from 'express';
import type { ApiResponse } from '../auth/auth.dto.js';
import {
  similarityRequestSchema,
  type SimilarityReport,
} from './ai.dto.js';
import { AIService } from './ai.service.js';

export class AiController {
  constructor(private readonly aiService = new AIService()) {}

  analyzeSimilarity = async (
    req: Request,
    res: Response<ApiResponse<SimilarityReport>>,
    next: NextFunction,
  ): Promise<void> => {
    const parsedRequest = similarityRequestSchema.safeParse(req.body);
    if (!parsedRequest.success) {
      res.status(400).json({
        success: false,
        error: 'Los parámetros del análisis de similitud no son válidos.',
      });
      return;
    }

    const files = req.files as
      | {
          targetFile?: Express.Multer.File[];
          referenceFiles?: Express.Multer.File[];
        }
      | undefined;
    const targetFile = files?.targetFile?.[0];
    const referenceFiles = files?.referenceFiles ?? [];
    const {
      sourceMode,
      targetText,
      includeInternalCorpus,
      includeScientificApis,
      includeOpenWeb,
      excludeArticleId,
    } = parsedRequest.data;

    if (targetFile && targetText !== undefined) {
      res.status(400).json({
        success: false,
        error: 'Adjunte un PDF objetivo o ingrese texto, pero no ambos.',
      });
      return;
    }
    if (targetText !== undefined && !targetText.trim()) {
      res.status(400).json({
        success: false,
        error: 'El texto objetivo no puede estar vacío.',
      });
      return;
    }
    if (sourceMode === 'uploaded' && referenceFiles.length === 0) {
      res.status(400).json({
        success: false,
        error: 'Adjunte al menos un PDF de referencia.',
      });
      return;
    }
    if (sourceMode === 'demo' && referenceFiles.length > 0) {
      res.status(400).json({
        success: false,
        error: 'El modo de demostración utiliza únicamente referencias sintéticas.',
      });
      return;
    }
    if (sourceMode === 'corpus' && referenceFiles.length > 0) {
      res.status(400).json({
        success: false,
        error: 'El modo de corpus utiliza únicamente las fuentes institucionales y científicas seleccionadas.',
      });
      return;
    }
    if (
      sourceMode === 'corpus' &&
      !includeInternalCorpus &&
      !includeScientificApis &&
      !includeOpenWeb
    ) {
      res.status(400).json({
        success: false,
        error: 'Seleccione al menos una fuente de comparación.',
      });
      return;
    }
    if (sourceMode !== 'demo' && !targetFile && targetText === undefined) {
      res.status(400).json({
        success: false,
        error: 'Adjunte un PDF objetivo o ingrese texto para analizar.',
      });
      return;
    }

    const allFiles = [...(targetFile ? [targetFile] : []), ...referenceFiles];
    if (allFiles.some((file) => file.mimetype !== 'application/pdf')) {
      res.status(415).json({
        success: false,
        error: 'Solo se aceptan archivos PDF.',
      });
      return;
    }

    try {
      const data = await this.aiService.analyzeSimilarity({
        sourceMode,
        targetText,
        targetFile,
        referenceFiles,
        includeInternalCorpus,
        includeScientificApis,
        includeOpenWeb,
        excludeArticleId,
      });
      res.status(200).json({ success: true, data });
    } catch (error: unknown) {
      next(error);
    }
  };
}
