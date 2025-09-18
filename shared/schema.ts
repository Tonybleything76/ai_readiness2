import { z } from "zod";
import { pgTable, varchar, timestamp, json, real, uuid, text, boolean, serial } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { sql } from "drizzle-orm";
import { relations } from "drizzle-orm";

// Organizations table - central to the multi-org system
export const organizations = pgTable("organizations", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 255 }).notNull(),
  industry: varchar("industry", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Admins table with role-based permissions
export const admins = pgTable("admins", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  orgId: uuid("org_id").references(() => organizations.id, { onDelete: 'cascade' }).notNull(),
  role: varchar("role", { length: 50 }).notNull(), // 'viewer', 'editor', 'super_admin'
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Sessions table for secure cookie-based authentication
export const sessions = pgTable("sessions", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  adminId: uuid("admin_id").references(() => admins.id, { onDelete: 'cascade' }).notNull(),
  accessToken: text("access_token").notNull(),
  refreshToken: text("refresh_token").notNull(),
  accessTokenExpiresAt: timestamp("access_token_expires_at").notNull(),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastUsedAt: timestamp("last_used_at").defaultNow().notNull(),
});

// Audit log table for tracking admin actions
export const auditLogs = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  adminId: uuid("admin_id").references(() => admins.id, { onDelete: 'set null' }),
  orgId: uuid("org_id").references(() => organizations.id, { onDelete: 'cascade' }),
  action: varchar("action", { length: 100 }).notNull(), // 'login', 'export_csv', 'view_response', etc.
  resource: varchar("resource", { length: 100 }), // 'response', 'export', etc.
  resourceId: varchar("resource_id", { length: 255 }), // ID of the resource being acted upon
  details: json("details"), // Additional context like filters, parameters, etc.
  ipAddress: varchar("ip_address", { length: 45 }), // IPv6 compatible
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Updated responses table with organization reference
export const responses = pgTable("responses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  orgId: uuid("org_id").references(() => organizations.id, { onDelete: 'set null' }),
  orgName: varchar("org_name", { length: 255 }), // Keep for backward compatibility
  industry: varchar("industry", { length: 255 }),
  answersJson: json("answers_json").notNull(),
  pillarScores: json("pillar_scores").notNull(),
  overall: real("overall").notNull(),
  category: varchar("category", { length: 50 }).notNull(),
});

// Database relations
export const organizationsRelations = relations(organizations, ({ many }) => ({
  admins: many(admins),
  responses: many(responses),
  auditLogs: many(auditLogs),
}));

export const adminsRelations = relations(admins, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [admins.orgId],
    references: [organizations.id],
  }),
  sessions: many(sessions),
  auditLogs: many(auditLogs),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  admin: one(admins, {
    fields: [sessions.adminId],
    references: [admins.id],
  }),
}));

export const responsesRelations = relations(responses, ({ one }) => ({
  organization: one(organizations, {
    fields: [responses.orgId],
    references: [organizations.id],
  }),
}));

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  admin: one(admins, {
    fields: [auditLogs.adminId],
    references: [admins.id],
  }),
  organization: one(organizations, {
    fields: [auditLogs.orgId],
    references: [organizations.id],
  }),
}));

// Generated schemas from Drizzle tables
export const insertResponseSchema = createInsertSchema(responses).omit({
  id: true,
  createdAt: true,
});
export const selectResponseSchema = createSelectSchema(responses);

export const insertOrganizationSchema = createInsertSchema(organizations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export const selectOrganizationSchema = createSelectSchema(organizations);

export const insertAdminSchema = createInsertSchema(admins).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export const selectAdminSchema = createSelectSchema(admins);

export const insertSessionSchema = createInsertSchema(sessions).omit({
  id: true,
  createdAt: true,
  lastUsedAt: true,
});
export const selectSessionSchema = createSelectSchema(sessions);

export const insertAuditLogSchema = createInsertSchema(auditLogs).omit({
  id: true,
  createdAt: true,
});
export const selectAuditLogSchema = createSelectSchema(auditLogs);

// Types
export type Response = typeof responses.$inferSelect;
export type InsertResponse = z.infer<typeof insertResponseSchema>;

export type Organization = typeof organizations.$inferSelect;
export type InsertOrganization = z.infer<typeof insertOrganizationSchema>;

export type Admin = typeof admins.$inferSelect;
export type InsertAdmin = z.infer<typeof insertAdminSchema>;

export type Session = typeof sessions.$inferSelect;
export type InsertSession = z.infer<typeof insertSessionSchema>;

export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;

// Admin role enum for validation
export const AdminRole = {
  VIEWER: 'viewer' as const,
  EDITOR: 'editor' as const,
  SUPER_ADMIN: 'super_admin' as const,
} as const;

export type AdminRoleType = typeof AdminRole[keyof typeof AdminRole];

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

// Admin authentication schemas
export const adminLoginSchema = z.object({
  email: z.string().email("Valid email is required"),
  password: z.string().min(1, "Password is required"),
});

export const adminRegistrationSchema = z.object({
  email: z.string().email("Valid email is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  orgId: z.string().uuid("Valid organization ID is required"),
  role: z.enum([AdminRole.VIEWER, AdminRole.EDITOR, AdminRole.SUPER_ADMIN]),
});

export const createOrganizationSchema = z.object({
  name: z.string().min(1, "Organization name is required"),
  industry: z.string().optional(),
});

export const updateAdminRoleSchema = z.object({
  adminId: z.string().uuid("Valid admin ID is required"),
  role: z.enum([AdminRole.VIEWER, AdminRole.EDITOR, AdminRole.SUPER_ADMIN]),
});

export type AdminLogin = z.infer<typeof adminLoginSchema>;
export type AdminRegistration = z.infer<typeof adminRegistrationSchema>;
export type CreateOrganization = z.infer<typeof createOrganizationSchema>;
export type UpdateAdminRole = z.infer<typeof updateAdminRoleSchema>;
