import axiosClient from './axiosClient';

export type SimilaritySourceMode = 'demo' | 'uploaded' | 'corpus';
export type SimilarityStatus = 'completed' | 'not_evaluable';
export type SimilarityMatchType = 'exact' | 'lexical';
export type OpenWebStatus = 'disabled' | 'not_configured' | 'active';

export interface SimilarityFinding {
  sourceLabel: string;
  sourcePage: number;
  targetPage: number;
  excerpt: string;
  sourceExcerpt?: string;
  matchedTokens: number;
  matchType: SimilarityMatchType;
  similarityScore: number;
  provider: string;
  sourceUrl?: string | null;
  doi?: string | null;
  year?: number | null;
  isCited?: boolean;
}

export interface SimilarityReport {
  analysisId: string;
  status: SimilarityStatus;
  sourceMode: SimilaritySourceMode;
  analyzerVersion: string;
  findings: SimilarityFinding[];
  warnings: string[];
  queriedProviders: string[];
  queriesUsed: string[];
  sourcesEvaluated: number;
  openWebStatus: OpenWebStatus;
  message: string;
  disclaimer: string;
}

export interface SimilarityOptions {
  includeInternalCorpus?: boolean;
  includeScientificApis?: boolean;
  includeOpenWeb?: boolean;
  excludeArticleId?: number;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export const analyzeSimilarity = async (
  sourceMode: SimilaritySourceMode,
  targetText: string,
  targetFile: File | null,
  referenceFiles: File[],
  options: SimilarityOptions = {},
): Promise<SimilarityReport> => {
  const formData = new FormData();
  formData.append('sourceMode', sourceMode);

  if (targetFile) {
    formData.append('targetFile', targetFile);
  } else if (targetText.trim()) {
    formData.append('targetText', targetText);
  }

  for (const referenceFile of referenceFiles) {
    formData.append('referenceFiles', referenceFile);
  }

  if (sourceMode === 'corpus') {
    formData.append(
      'includeInternalCorpus',
      String(options.includeInternalCorpus ?? true),
    );
    formData.append(
      'includeScientificApis',
      String(options.includeScientificApis ?? true),
    );
    formData.append('includeOpenWeb', String(options.includeOpenWeb ?? false));
    if (options.excludeArticleId !== undefined) {
      formData.append('excludeArticleId', String(options.excludeArticleId));
    }
  }

  const response = await axiosClient.post<ApiResponse<SimilarityReport>>(
    '/ai/similarity/check',
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  );
  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.error || 'No se pudo completar el análisis.');
  }
  return response.data.data;
};
