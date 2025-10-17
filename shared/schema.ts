import { z } from "zod";

export const coordinatesSchema = z.object({
  x: z.number().min(0).max(100),
  y: z.number().min(0).max(100),
  width: z.number().min(0).max(100),
  height: z.number().min(0).max(100),
});

export const placementSchema = z.object({
  region: z.string(),
  reason: z.string(),
  coordinates: coordinatesSchema.optional(),
});

export const analysisResultSchema = z.object({
  placements: z.array(placementSchema),
  clarifyingQuestions: z.array(z.string()).optional(),
  markedUpImageUrl: z.string().optional(),
});

export const conversationTurnSchema = z.object({
  question: z.string(),
  answer: z.string(),
});

export const analysisRequestSchema = z.object({
  description: z.string().min(10, "Description must be at least 10 characters"),
  conversationHistory: z.array(conversationTurnSchema).optional(),
});

export type Placement = z.infer<typeof placementSchema>;
export type AnalysisResult = z.infer<typeof analysisResultSchema>;
export type AnalysisRequest = z.infer<typeof analysisRequestSchema>;
export type ConversationTurn = z.infer<typeof conversationTurnSchema>;
