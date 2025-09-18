import { z } from "zod";

// Prisma Response types (will be generated)
export type Response = {
  id: string;
  createdAt: Date;
  orgName: string | null;
  industry: string | null;
  answersJson: any; // JSON type
  pillarScores: any; // JSON type
  overall: number;
  category: string;
};

export const insertResponseSchema = z.object({
  orgName: z.string().nullable().optional(),
  industry: z.string().nullable().optional(),
  answersJson: z.any(),
  pillarScores: z.any(),
  overall: z.number(),
  category: z.string(),
});

export type InsertResponse = z.infer<typeof insertResponseSchema>;

// Types for the question structure
export const questionSchema = z.object({
  id: z.string(),
  text: z.string(),
  description: z.string().optional(),
  weight: z.number().nullable(),
  weight_rationale: z.string().optional(),
  responses: z.record(z.string(), z.string()), // "1" -> "No formal data infrastructure"
  meanings: z.record(z.string(), z.string()),   // "1" -> "Data is stored in silos..."
});

export const pillarSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  questions: z.array(questionSchema),
});

export const assessmentDataSchema = z.object({
  pillars: z.array(pillarSchema),
});

export type Question = z.infer<typeof questionSchema>;
export type Pillar = z.infer<typeof pillarSchema>;
export type AssessmentData = z.infer<typeof assessmentDataSchema>;

// Phase 3: Recommendations and insights types (defined first to avoid forward references)
export const recommendationSchema = z.object({
  id: z.string(),
  category: z.enum(["immediate", "strategic", "foundational"]),
  priority: z.enum(["high", "medium", "low"]),
  title: z.string(),
  description: z.string(),
  pillar: z.string(),
  score_threshold: z.number(),
});

export const insightsSummarySchema = z.object({
  strengths: z.array(z.string()),
  challenges: z.array(z.string()),
  readinessLevel: z.string(),
  nextSteps: z.array(z.string()),
});

export type Recommendation = z.infer<typeof recommendationSchema>;
export type InsightsSummary = z.infer<typeof insightsSummarySchema>;

// API response types
export const scoreRequestSchema = z.object({
  orgName: z.string().optional(),
  industry: z.string().optional(),
  answers: z.record(z.string(), z.number().min(1).max(5)),
});

export const scoreResponseSchema = z.object({
  responseId: z.string(),
  pillarScores: z.record(z.string(), z.number()),
  overall: z.number(),
  category: z.string(),
  color: z.string(),
  message: z.string(),
  answers: z.record(z.string(), z.object({
    value: z.number(),
    label: z.string(),
    meaning: z.string(),
  })),
  // Metadata fields for results display
  orgName: z.string().nullable().optional(),
  industry: z.string().nullable().optional(),
  createdAt: z.date().optional(),
  // Phase 3: Recommendations and insights
  recommendations: z.array(recommendationSchema).optional(),
  insights: insightsSummarySchema.optional(),
});

export type ScoreRequest = z.infer<typeof scoreRequestSchema>;
export type ScoreResponse = z.infer<typeof scoreResponseSchema>;

// Admin authentication schema
export const adminLoginSchema = z.object({
  password: z.string().min(1, "Password is required"),
});

export type AdminLogin = z.infer<typeof adminLoginSchema>;
