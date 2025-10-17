import { z } from "zod";

export const placementSchema = z.object({
  region: z.string(),
  reason: z.string(),
});

export const analysisResultSchema = z.object({
  placements: z.array(placementSchema),
  clarifyingQuestions: z.array(z.string()).optional(),
  markedUpImageUrl: z.string().optional(),
});

export const analysisRequestSchema = z.object({
  description: z.string().min(10, "Description must be at least 10 characters"),
});

export type Placement = z.infer<typeof placementSchema>;
export type AnalysisResult = z.infer<typeof analysisResultSchema>;
export type AnalysisRequest = z.infer<typeof analysisRequestSchema>;
