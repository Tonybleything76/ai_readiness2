import { 
  type Response, 
  type InsertResponse, 
  type Organization,
  type InsertOrganization,
  type Admin,
  type InsertAdmin,
  type Session,
  type InsertSession,
  type AuditLog,
  type InsertAuditLog,
  responses,
  organizations,
  admins,
  sessions,
  auditLogs
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, count, sql, and, or, isNull } from "drizzle-orm";

// Safe historical response type (excludes sensitive answersJson)
export type HistoricalResponse = {
  id: string;
  createdAt: Date;
  orgName: string | null;
  industry: string | null;
  overall: number;
  pillarScores: any;
  category: string;
};

export interface IStorage {
  // Response methods
  createResponse(response: InsertResponse): Promise<Response>;
  getResponse(id: string): Promise<Response | undefined>;
  getAllResponses(limit?: number, offset?: number): Promise<Response[]>;
  getResponseCount(): Promise<number>;
  getResponsesByOrganization(orgName: string): Promise<HistoricalResponse[]>;
  getResponsesByOrgId(orgId: string, limit?: number, offset?: number): Promise<Response[]>;
  getIndustryStatistics(industry: string): Promise<{
    count: number;
    overallMedian: number;
    pillarMedians: Record<string, number>;
    overallQuartiles: { q1: number; q3: number };
    pillarQuartiles: Record<string, { q1: number; q3: number }>;
  } | null>;

  // Organization methods
  createOrganization(organization: InsertOrganization): Promise<Organization>;
  getOrganization(id: string): Promise<Organization | undefined>;
  getOrganizationByName(name: string): Promise<Organization | undefined>;
  getAllOrganizations(): Promise<Organization[]>;
  updateOrganization(id: string, updates: Partial<InsertOrganization>): Promise<Organization | undefined>;

  // Admin methods
  createAdmin(admin: InsertAdmin): Promise<Admin>;
  getAdmin(id: string): Promise<Admin | undefined>;
  getAdminByEmail(email: string): Promise<Admin | undefined>;
  getAdminsByOrg(orgId: string): Promise<Admin[]>;
  updateAdmin(id: string, updates: Partial<InsertAdmin>): Promise<Admin | undefined>;
  deactivateAdmin(id: string): Promise<boolean>;

  // Session methods
  createSession(session: InsertSession): Promise<Session>;
  getSession(id: string): Promise<Session | undefined>;
  getSessionByToken(accessToken: string): Promise<Session | undefined>;
  getSessionByRefreshToken(refreshToken: string): Promise<Session | undefined>;
  updateSession(id: string, updates: Partial<InsertSession>): Promise<Session | undefined>;
  deleteSession(id: string): Promise<boolean>;
  deleteExpiredSessions(): Promise<number>;
  getSessionsByAdmin(adminId: string): Promise<Session[]>;

  // Audit log methods
  createAuditLog(auditLog: InsertAuditLog): Promise<AuditLog>;
  getAuditLogs(orgId?: string, limit?: number, offset?: number): Promise<AuditLog[]>;
  getAuditLogsByAdmin(adminId: string, limit?: number, offset?: number): Promise<AuditLog[]>;
  getAuditLogsCount(orgId?: string): Promise<number>;
}

export class DatabaseStorage implements IStorage {

  async createResponse(insertResponse: InsertResponse): Promise<Response> {
    const [response] = await db
      .insert(responses)
      .values(insertResponse)
      .returning();
    return response;
  }

  async getResponse(id: string): Promise<Response | undefined> {
    try {
      const [response] = await db
        .select()
        .from(responses)
        .where(eq(responses.id, id));
      return response || undefined;
    } catch (error) {
      console.error("Error fetching response:", error);
      return undefined;
    }
  }

  async getAllResponses(limit?: number, offset?: number): Promise<Response[]> {
    const query = db
      .select()
      .from(responses)
      .orderBy(desc(responses.createdAt));
    
    if (limit) {
      query.limit(limit);
    }
    if (offset) {
      query.offset(offset);
    }
    
    return await query;
  }

  async getResponseCount(): Promise<number> {
    const [result] = await db
      .select({ count: count() })
      .from(responses);
    return result.count;
  }

  async getResponsesByOrganization(orgName: string): Promise<HistoricalResponse[]> {
    try {
      const results = await db
        .select({
          id: responses.id,
          createdAt: responses.createdAt,
          orgName: responses.orgName,
          industry: responses.industry,
          overall: responses.overall,
          pillarScores: responses.pillarScores,
          category: responses.category,
        })
        .from(responses)
        .where(eq(responses.orgName, orgName))
        .orderBy(desc(responses.createdAt));
      return results;
    } catch (error) {
      console.error("Error fetching responses by organization:", error);
      return [];
    }
  }

  async getResponsesByOrgId(orgId: string, limit?: number, offset?: number): Promise<Response[]> {
    try {
      const query = db
        .select()
        .from(responses)
        .where(eq(responses.orgId, orgId))
        .orderBy(desc(responses.createdAt));
      
      if (limit) {
        query.limit(limit);
      }
      if (offset) {
        query.offset(offset);
      }
      
      return await query;
    } catch (error) {
      console.error("Error fetching responses by organization ID:", error);
      return [];
    }
  }

  async getIndustryStatistics(industry: string): Promise<{
    count: number;
    overallMedian: number;
    pillarMedians: Record<string, number>;
    overallQuartiles: { q1: number; q3: number };
    pillarQuartiles: Record<string, { q1: number; q3: number }>;
  } | null> {
    // Get all responses for the industry
    const responseList = await db
      .select()
      .from(responses)
      .where(eq(responses.industry, industry));

    // K-anonymity protection: only return statistics if >= 10 responses
    if (responseList.length < 10) {
      return null;
    }

    // Helper function to calculate median and quartiles
    const calculateStats = (values: number[]) => {
      const sorted = values.sort((a, b) => a - b);
      const n = sorted.length;
      
      const median = n % 2 === 0 
        ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2
        : sorted[Math.floor(n / 2)];
      
      const q1Index = Math.floor(n / 4);
      const q3Index = Math.floor(3 * n / 4);
      const q1 = sorted[q1Index];
      const q3 = sorted[q3Index];
      
      return { median, q1, q3 };
    };

    // Calculate overall score statistics
    const overallScores = responseList.map(r => r.overall);
    const overallStats = calculateStats(overallScores);

    // Calculate pillar statistics
    const pillarMedians: Record<string, number> = {};
    const pillarQuartiles: Record<string, { q1: number; q3: number }> = {};

    // Get all unique pillar keys from responses
    const pillarKeys = new Set<string>();
    responseList.forEach(response => {
      if (response.pillarScores && typeof response.pillarScores === 'object') {
        Object.keys(response.pillarScores).forEach(key => pillarKeys.add(key));
      }
    });

    pillarKeys.forEach(pillarKey => {
      const pillarScores = responseList
        .map(response => {
          if (response.pillarScores && typeof response.pillarScores === 'object' && response.pillarScores !== null) {
            return (response.pillarScores as Record<string, any>)[pillarKey];
          }
          return undefined;
        })
        .filter(score => typeof score === 'number') as number[];
      
      if (pillarScores.length > 0) {
        const pillarStats = calculateStats(pillarScores);
        pillarMedians[pillarKey] = pillarStats.median;
        pillarQuartiles[pillarKey] = { q1: pillarStats.q1, q3: pillarStats.q3 };
      }
    });

    return {
      count: responseList.length,
      overallMedian: overallStats.median,
      pillarMedians,
      overallQuartiles: { q1: overallStats.q1, q3: overallStats.q3 },
      pillarQuartiles
    };
  }

  // Organization methods
  async createOrganization(organization: InsertOrganization): Promise<Organization> {
    const [org] = await db
      .insert(organizations)
      .values(organization)
      .returning();
    return org;
  }

  async getOrganization(id: string): Promise<Organization | undefined> {
    try {
      const [org] = await db
        .select()
        .from(organizations)
        .where(eq(organizations.id, id));
      return org || undefined;
    } catch (error) {
      console.error("Error fetching organization:", error);
      return undefined;
    }
  }

  async getOrganizationByName(name: string): Promise<Organization | undefined> {
    try {
      const [org] = await db
        .select()
        .from(organizations)
        .where(eq(organizations.name, name));
      return org || undefined;
    } catch (error) {
      console.error("Error fetching organization by name:", error);
      return undefined;
    }
  }

  async getAllOrganizations(): Promise<Organization[]> {
    try {
      return await db
        .select()
        .from(organizations)
        .orderBy(organizations.name);
    } catch (error) {
      console.error("Error fetching all organizations:", error);
      return [];
    }
  }

  async updateOrganization(id: string, updates: Partial<InsertOrganization>): Promise<Organization | undefined> {
    try {
      const [org] = await db
        .update(organizations)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(organizations.id, id))
        .returning();
      return org || undefined;
    } catch (error) {
      console.error("Error updating organization:", error);
      return undefined;
    }
  }

  // Admin methods
  async createAdmin(admin: InsertAdmin): Promise<Admin> {
    const [adminUser] = await db
      .insert(admins)
      .values(admin)
      .returning();
    return adminUser;
  }

  async getAdmin(id: string): Promise<Admin | undefined> {
    try {
      const [admin] = await db
        .select()
        .from(admins)
        .where(eq(admins.id, id));
      return admin || undefined;
    } catch (error) {
      console.error("Error fetching admin:", error);
      return undefined;
    }
  }

  async getAdminByEmail(email: string): Promise<Admin | undefined> {
    try {
      const [admin] = await db
        .select()
        .from(admins)
        .where(eq(admins.email, email));
      return admin || undefined;
    } catch (error) {
      console.error("Error fetching admin by email:", error);
      return undefined;
    }
  }

  async getAdminsByOrg(orgId: string): Promise<Admin[]> {
    try {
      return await db
        .select()
        .from(admins)
        .where(and(eq(admins.orgId, orgId), eq(admins.isActive, true)))
        .orderBy(admins.email);
    } catch (error) {
      console.error("Error fetching admins by organization:", error);
      return [];
    }
  }

  async updateAdmin(id: string, updates: Partial<InsertAdmin>): Promise<Admin | undefined> {
    try {
      const [admin] = await db
        .update(admins)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(admins.id, id))
        .returning();
      return admin || undefined;
    } catch (error) {
      console.error("Error updating admin:", error);
      return undefined;
    }
  }

  async deactivateAdmin(id: string): Promise<boolean> {
    try {
      const [admin] = await db
        .update(admins)
        .set({ isActive: false, updatedAt: new Date() })
        .where(eq(admins.id, id))
        .returning();
      return !!admin;
    } catch (error) {
      console.error("Error deactivating admin:", error);
      return false;
    }
  }

  // Session methods
  async createSession(session: InsertSession): Promise<Session> {
    const [sessionRecord] = await db
      .insert(sessions)
      .values(session)
      .returning();
    return sessionRecord;
  }

  async getSession(id: string): Promise<Session | undefined> {
    try {
      const [session] = await db
        .select()
        .from(sessions)
        .where(eq(sessions.id, id));
      return session || undefined;
    } catch (error) {
      console.error("Error fetching session:", error);
      return undefined;
    }
  }

  async getSessionByToken(accessToken: string): Promise<Session | undefined> {
    try {
      const [session] = await db
        .select()
        .from(sessions)
        .where(eq(sessions.accessToken, accessToken));
      return session || undefined;
    } catch (error) {
      console.error("Error fetching session by token:", error);
      return undefined;
    }
  }

  async getSessionByRefreshToken(refreshToken: string): Promise<Session | undefined> {
    try {
      const [session] = await db
        .select()
        .from(sessions)
        .where(eq(sessions.refreshToken, refreshToken));
      return session || undefined;
    } catch (error) {
      console.error("Error fetching session by refresh token:", error);
      return undefined;
    }
  }

  async updateSession(id: string, updates: Partial<InsertSession>): Promise<Session | undefined> {
    try {
      const [session] = await db
        .update(sessions)
        .set({ ...updates, lastUsedAt: new Date() })
        .where(eq(sessions.id, id))
        .returning();
      return session || undefined;
    } catch (error) {
      console.error("Error updating session:", error);
      return undefined;
    }
  }

  async deleteSession(id: string): Promise<boolean> {
    try {
      const result = await db
        .delete(sessions)
        .where(eq(sessions.id, id));
      return (result.rowCount || 0) > 0;
    } catch (error) {
      console.error("Error deleting session:", error);
      return false;
    }
  }

  async deleteExpiredSessions(): Promise<number> {
    try {
      const now = new Date();
      const result = await db
        .delete(sessions)
        .where(or(
          sql`${sessions.accessTokenExpiresAt} < ${now}`,
          sql`${sessions.refreshTokenExpiresAt} < ${now}`
        ));
      return result.rowCount || 0;
    } catch (error) {
      console.error("Error deleting expired sessions:", error);
      return 0;
    }
  }

  async getSessionsByAdmin(adminId: string): Promise<Session[]> {
    try {
      return await db
        .select()
        .from(sessions)
        .where(eq(sessions.adminId, adminId))
        .orderBy(desc(sessions.lastUsedAt));
    } catch (error) {
      console.error("Error fetching sessions by admin:", error);
      return [];
    }
  }

  // Audit log methods
  async createAuditLog(auditLog: InsertAuditLog): Promise<AuditLog> {
    const [log] = await db
      .insert(auditLogs)
      .values(auditLog)
      .returning();
    return log;
  }

  async getAuditLogs(orgId?: string, limit?: number, offset?: number): Promise<AuditLog[]> {
    try {
      let baseQuery = db.select().from(auditLogs);
      
      if (orgId) {
        baseQuery = baseQuery.where(eq(auditLogs.orgId, orgId));
      }
      
      let finalQuery = baseQuery.orderBy(desc(auditLogs.createdAt));
      
      if (limit) {
        finalQuery = finalQuery.limit(limit);
      }
      if (offset) {
        finalQuery = finalQuery.offset(offset);
      }

      return await finalQuery;
    } catch (error) {
      console.error("Error fetching audit logs:", error);
      return [];
    }
  }

  async getAuditLogsByAdmin(adminId: string, limit?: number, offset?: number): Promise<AuditLog[]> {
    try {
      let query = db
        .select()
        .from(auditLogs)
        .where(eq(auditLogs.adminId, adminId))
        .orderBy(desc(auditLogs.createdAt));

      if (limit) {
        query = query.limit(limit);
      }
      if (offset) {
        query = query.offset(offset);
      }

      return await query;
    } catch (error) {
      console.error("Error fetching audit logs by admin:", error);
      return [];
    }
  }

  async getAuditLogsCount(orgId?: string): Promise<number> {
    try {
      let baseQuery = db.select({ count: count() }).from(auditLogs);
      
      if (orgId) {
        baseQuery = baseQuery.where(eq(auditLogs.orgId, orgId));
      }

      const [result] = await baseQuery;
      return result.count;
    } catch (error) {
      console.error("Error counting audit logs:", error);
      return 0;
    }
  }

  async disconnect(): Promise<void> {
    // Drizzle with connection pooling handles disconnection automatically
  }
}

import { MemStorage } from './memStorage';

// Use MemStorage in development, DatabaseStorage in production
export const storage = process.env.NODE_ENV === 'development' 
  ? new MemStorage() 
  : new DatabaseStorage();
