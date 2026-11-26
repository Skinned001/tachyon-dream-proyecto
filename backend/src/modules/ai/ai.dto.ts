import { z } from 'zod';

const formBooleanSchema = (defaultValue: boolean) =>
  z
    .union([z.boolean(), z.enum(['true', 'false', '1', '0'])])
    .optional()
    .transform((value) => {
      if (value === undefined) return defaultValue;
      if (typeof value === 'boolean') return value;
      return value === 'true' || value === '1';
    });

const optionalPositiveIntSchema = z
  .union([z.number(), z.string()])
  .optional()
  .transform((value) => {
    if (value === undefined || value === '') return undefined;
    const parsed = typeof value === 'number' ? value : Number(value);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : Number.NaN;
  })
  .refine((value) => value === undefined || !Number.isNaN(value), {
    message: 'excludeArticleId debe ser un entero positivo.',
  });

export const similarityRequestSchema = z.object({
  sourceMode: z.enum(['demo', 'uploaded', 'corpus']),
  targetText: z.string().max(20_000).optional(),
  includeInternalCorpus: formBooleanSchema(true),
  includeScientificApis: formBooleanSchema(true),
  includeOpenWeb: formBooleanSchema(false),
  excludeArticleId: optionalPositiveIntSchema,
});

const similarityFindingSchema = z.object({
  sourceLabel: z.string(),
  sourcePage: z.number().int().positive(),
  targetPage: z.number().int().positive(),
  excerpt: z.string(),
  sourceExcerpt: z.string().optional(),
  matchedTokens: z.number().int().nonnegative(),
  matchType: z.enum(['exact', 'lexical']).default('exact'),
  similarityScore: z.number().min(0).max(100).default(100),
  provider: z.string().default('uploaded'),
  sourceUrl: z.string().nullable().optional(),
  doi: z.string().nullable().optional(),
  year: z.number().int().nullable().optional(),
  isCited: z.boolean().optional(),
});

export const similarityReportSchema = z.object({
  analysisId: z.string().uuid(),
  status: z.enum(['completed', 'not_evaluable']),
  sourceMode: z.enum(['demo', 'uploaded', 'corpus']),
  analyzerVersion: z.string(),
  findings: z.array(similarityFindingSchema),
  warnings: z.array(z.string()),
  queriedProviders: z.array(z.string()).optional().default([]),
  queriesUsed: z.array(z.string()).optional().default([]),
  sourcesEvaluated: z.number().int().nonnegative().optional().default(0),
  openWebStatus: z.enum(['disabled', 'not_configured', 'active']).optional().default('disabled'),
  message: z.string(),
  disclaimer: z.string(),
});

export type SimilarityRequest = z.infer<typeof similarityRequestSchema>;
export type SimilarityReport = z.infer<typeof similarityReportSchema>;
