import { pgTable, text, integer, timestamp, jsonb, serial } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

export const responses = pgTable('responses', {
  id: serial('id').primaryKey(),
  organizationName: text('organization_name').notNull(),
  industry: text('industry').notNull(),
  answers: jsonb('answers').notNull().$type<Record<string, number>>(),
  scores: jsonb('scores').notNull().$type<{
    overall: number;
    technology: number;
    dataManagement: number;
    organizationalCulture: number;
    strategyPlanning: number;
    riskCompliance: number;
  }>(),
  readinessLevel: text('readiness_level').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const insertResponseSchema = createInsertSchema(responses).omit({
  id: true,
  createdAt: true,
});

export type InsertResponse = z.infer<typeof insertResponseSchema>;
export type Response = typeof responses.$inferSelect;
