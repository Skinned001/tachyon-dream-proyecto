import axiosClient from './axiosClient';

export type SimilaritySourceMode = 'demo' | 'uploaded';
export type SimilarityStatus = 'completed' | 'not_evaluable';

export interface SimilarityFinding {
  sourceLabel: string;
  sourcePage: number;
  targetPage: number;
  excerpt: string;
  matchedTokens: number;
}

export interface SimilarityReport {
  analysisId: string;
  status: SimilarityStatus;
  sourceMode: SimilaritySourceMode;
  analyzerVersion: string;
  findings: SimilarityFinding[];
  warnings: string[];
  message: string;
  disclaimer: string;
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
