import { z } from 'zod';

export const similarityRequestSchema = z.object({
  sourceMode: z.enum(['demo', 'uploaded']),
  targetText: z.string().max(20_000).optional(),
});

const similarityFindingSchema = z.object({
  sourceLabel: z.string(),
  sourcePage: z.number().int().positive(),
  targetPage: z.number().int().positive(),
  excerpt: z.string(),
  matchedTokens: z.number().int().positive(),
});

export const similarityReportSchema = z.object({
  analysisId: z.string().uuid(),
  status: z.enum(['completed', 'not_evaluable']),
  sourceMode: z.enum(['demo', 'uploaded']),
  analyzerVersion: z.string(),
  findings: z.array(similarityFindingSchema),
  warnings: z.array(z.string()),
  message: z.string(),
  disclaimer: z.string(),
});

export type SimilarityRequest = z.infer<typeof similarityRequestSchema>;
export type SimilarityReport = z.infer<typeof similarityReportSchema>;
