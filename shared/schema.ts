import { pgTable, integer, timestamp, json, varchar, real, uuid, pgEnum, index } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

export const assessmentModeEnum = pgEnum('assessment_mode', ['free', 'full']);

export const responses = pgTable('responses', {
  id: varchar('id').primaryKey(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  orgId: uuid('org_id'),
  orgName: varchar('org_name', { length: 255 }),
  industry: varchar('industry', { length: 255 }),
  answersJson: json('answers_json').notNull().$type<Record<string, number>>(),
  pillarScores: json('pillar_scores').notNull().$type<{
    overall: number;
    technology: number;
    dataManagement: number;
    organizationalCulture: number;
    strategyPlanning: number;
    riskCompliance: number;
  }>(),
  overall: real('overall').notNull(),
  category: varchar('category', { length: 50 }).notNull(),
  assessmentMode: assessmentModeEnum('assessment_mode').notNull().default('free'),
  questionCount: integer('question_count').notNull().default(25),
}, (table) => ({
  assessmentModeCreatedAtIdx: index('responses_mode_created_idx').on(table.assessmentMode, table.createdAt),
}));

export const insertResponseSchema = createInsertSchema(responses).omit({
  id: true,
  createdAt: true,
});

export type InsertResponse = z.infer<typeof insertResponseSchema>;
export type Response = typeof responses.$inferSelect;
