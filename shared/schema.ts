import { sql } from "drizzle-orm";
import { pgTable, text, varchar, jsonb, real, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const responses = pgTable("responses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  orgName: text("org_name"),
  industry: text("industry"),
  answersJson: jsonb("answers_json").notNull(),
  pillarScores: jsonb("pillar_scores").notNull(),
  overall: real("overall").notNull(),
  category: text("category").notNull(),
});

export const insertResponseSchema = createInsertSchema(responses).omit({
  id: true,
  createdAt: true,
});

export type InsertResponse = z.infer<typeof insertResponseSchema>;
export type Response = typeof responses.$inferSelect;

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
});

export type ScoreRequest = z.infer<typeof scoreRequestSchema>;
export type ScoreResponse = z.infer<typeof scoreResponseSchema>;
