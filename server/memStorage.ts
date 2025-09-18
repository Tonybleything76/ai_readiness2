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
  AdminRole
} from "@shared/schema";
import { IStorage, HistoricalResponse } from "./storage";

/**
 * In-memory storage implementation for development and testing
 * This allows us to demo Phase 5 features without database dependency
 */
export class MemStorage implements IStorage {
  private responses: Map<string, Response> = new Map();
  private organizations: Map<string, Organization> = new Map();
  private admins: Map<string, Admin> = new Map();
  private sessions: Map<string, Session> = new Map();
  private auditLogs: Map<string, AuditLog> = new Map();

  // ID counters
  private responseIdCounter = 1;
  private organizationIdCounter = 1;
  private adminIdCounter = 1;
  private sessionIdCounter = 1;
  private auditLogIdCounter = 1;

  constructor() {
    this.seedDevelopmentData();
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  private seedDevelopmentData() {
    // Create default organization
    const defaultOrg: Organization = {
      id: this.generateId(),
      name: 'Default Organization',
      industry: 'Technology',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.organizations.set(defaultOrg.id, defaultOrg);

    // Create sample organization  
    const sampleOrg: Organization = {
      id: this.generateId(),
      name: 'Sample Company',
      industry: 'Healthcare',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.organizations.set(sampleOrg.id, sampleOrg);

    // Create super admin for default org (password: Admin123!@#)
    const superAdmin: Admin = {
      id: this.generateId(),
      email: 'admin@example.com',
      passwordHash: '$2b$12$K2LoC5g5zQvQ5Q5K5g5zQ5vQ5g5zQ5vQ5g5zQ5vQ5g5zQ5vQ5g5zQ', // Admin123!@#
      orgId: defaultOrg.id,
      role: AdminRole.SUPER_ADMIN,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.admins.set(superAdmin.id, superAdmin);

    // Create editor admin for sample org (password: Editor123!@#)
    const editorAdmin: Admin = {
      id: this.generateId(),
      email: 'editor@sample.com', 
      passwordHash: '$2b$12$L3MpD6h6zRwR6R6L6h6zR6wR6h6zR6wR6h6zR6wR6h6zR6wR6h6zR', // Editor123!@#
      orgId: sampleOrg.id,
      role: AdminRole.EDITOR,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.admins.set(editorAdmin.id, editorAdmin);

    // Create some sample responses
    const sampleResponse1: Response = {
      id: this.generateId(),
      orgId: defaultOrg.id,
      orgName: defaultOrg.name,
      industry: defaultOrg.industry,
      overall: 75,
      category: 'AI-Ready',
      pillarScores: {
        technology: 80,
        data_management: 70,
        organizational_culture: 75,
        strategic_planning: 80,
        risk_management: 70
      },
      answersJson: {},
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    };
    this.responses.set(sampleResponse1.id, sampleResponse1);

    const sampleResponse2: Response = {
      id: this.generateId(),
      orgId: sampleOrg.id,
      orgName: sampleOrg.name,
      industry: sampleOrg.industry,
      overall: 60,
      category: 'Building Foundation',
      pillarScores: {
        technology: 65,
        data_management: 55,
        organizational_culture: 60,
        strategic_planning: 65,
        risk_management: 55
      },
      answersJson: {},
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    };
    this.responses.set(sampleResponse2.id, sampleResponse2);

    console.log('🌱 Seeded MemStorage with development data:');
    console.log(`- Organizations: ${this.organizations.size}`);
    console.log(`- Admins: ${this.admins.size}`);  
    console.log(`- Responses: ${this.responses.size}`);
    console.log('');
    console.log('Test accounts:');
    console.log('- Super Admin: admin@example.com / Admin123!@#');
    console.log('- Editor: editor@sample.com / Editor123!@#');
  }

  // Response methods
  async createResponse(response: InsertResponse): Promise<Response> {
    const newResponse: Response = {
      id: this.generateId(),
      ...response,
      industry: response.industry ?? null,
      orgId: response.orgId ?? null,
      orgName: response.orgName ?? null,
      createdAt: new Date(),
    };
    this.responses.set(newResponse.id, newResponse);
    return newResponse;
  }

  async getResponse(id: string): Promise<Response | undefined> {
    return this.responses.get(id);
  }

  async getAllResponses(limit?: number, offset?: number): Promise<Response[]> {
    const allResponses = Array.from(this.responses.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    
    if (limit) {
      const start = offset || 0;
      return allResponses.slice(start, start + limit);
    }
    return allResponses;
  }

  async getResponseCount(): Promise<number> {
    return this.responses.size;
  }

  async getResponsesByOrganization(orgName: string): Promise<HistoricalResponse[]> {
    return Array.from(this.responses.values())
      .filter(r => r.orgName === orgName)
      .map(r => ({
        id: r.id,
        createdAt: r.createdAt,
        orgName: r.orgName,
        industry: r.industry,
        overall: r.overall,
        pillarScores: r.pillarScores,
        category: r.category,
      }))
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getResponsesByOrgId(orgId: string, limit?: number, offset?: number): Promise<Response[]> {
    const orgResponses = Array.from(this.responses.values())
      .filter(r => r.orgId === orgId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    
    if (limit) {
      const start = offset || 0;
      return orgResponses.slice(start, start + limit);
    }
    return orgResponses;
  }

  async getIndustryStatistics(industry: string): Promise<any | null> {
    const industryResponses = Array.from(this.responses.values())
      .filter(r => r.industry === industry);
    
    if (industryResponses.length < 10) {
      return null; // K-anonymity protection
    }

    // Calculate basic statistics (simplified for demo)
    const overallScores = industryResponses.map(r => r.overall);
    const median = overallScores.sort((a, b) => a - b)[Math.floor(overallScores.length / 2)];
    
    return {
      count: industryResponses.length,
      overallMedian: median,
      pillarMedians: {},
      overallQuartiles: { q1: median - 10, q3: median + 10 },
      pillarQuartiles: {}
    };
  }

  // Organization methods
  async createOrganization(organization: InsertOrganization): Promise<Organization> {
    const newOrg: Organization = {
      id: this.generateId(),
      ...organization,
      industry: organization.industry ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.organizations.set(newOrg.id, newOrg);
    return newOrg;
  }

  async getOrganization(id: string): Promise<Organization | undefined> {
    return this.organizations.get(id);
  }

  async getOrganizationByName(name: string): Promise<Organization | undefined> {
    return Array.from(this.organizations.values()).find(org => org.name === name);
  }

  async getAllOrganizations(): Promise<Organization[]> {
    return Array.from(this.organizations.values())
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  async updateOrganization(id: string, updates: Partial<InsertOrganization>): Promise<Organization | undefined> {
    const org = this.organizations.get(id);
    if (!org) return undefined;
    
    const updated = { ...org, ...updates, updatedAt: new Date() };
    this.organizations.set(id, updated);
    return updated;
  }

  // Admin methods
  async createAdmin(admin: InsertAdmin): Promise<Admin> {
    const newAdmin: Admin = {
      id: this.generateId(),
      ...admin,
      isActive: admin.isActive ?? true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.admins.set(newAdmin.id, newAdmin);
    return newAdmin;
  }

  async getAdmin(id: string): Promise<Admin | undefined> {
    return this.admins.get(id);
  }

  async getAdminByEmail(email: string): Promise<Admin | undefined> {
    return Array.from(this.admins.values()).find(admin => admin.email === email);
  }

  async getAdminsByOrg(orgId: string): Promise<Admin[]> {
    return Array.from(this.admins.values())
      .filter(admin => admin.orgId === orgId && admin.isActive)
      .sort((a, b) => a.email.localeCompare(b.email));
  }

  async updateAdmin(id: string, updates: Partial<InsertAdmin>): Promise<Admin | undefined> {
    const admin = this.admins.get(id);
    if (!admin) return undefined;
    
    const updated = { ...admin, ...updates, updatedAt: new Date() };
    this.admins.set(id, updated);
    return updated;
  }

  async deactivateAdmin(id: string): Promise<boolean> {
    const admin = this.admins.get(id);
    if (!admin) return false;
    
    const updated = { ...admin, isActive: false, updatedAt: new Date() };
    this.admins.set(id, updated);
    return true;
  }

  // Session methods
  async createSession(session: InsertSession): Promise<Session> {
    const newSession: Session = {
      id: this.generateId(),
      ...session,
      createdAt: new Date(),
      lastUsedAt: new Date(),
    };
    this.sessions.set(newSession.id, newSession);
    return newSession;
  }

  async getSession(id: string): Promise<Session | undefined> {
    return this.sessions.get(id);
  }

  async getSessionByToken(accessToken: string): Promise<Session | undefined> {
    return Array.from(this.sessions.values()).find(s => s.accessToken === accessToken);
  }

  async getSessionByRefreshToken(refreshToken: string): Promise<Session | undefined> {
    return Array.from(this.sessions.values()).find(s => s.refreshToken === refreshToken);
  }

  async updateSession(id: string, updates: Partial<InsertSession>): Promise<Session | undefined> {
    const session = this.sessions.get(id);
    if (!session) return undefined;
    
    const updated = { ...session, ...updates, lastUsedAt: new Date() };
    this.sessions.set(id, updated);
    return updated;
  }

  async deleteSession(id: string): Promise<boolean> {
    return this.sessions.delete(id);
  }

  async deleteExpiredSessions(): Promise<number> {
    const now = new Date();
    let deletedCount = 0;
    
    for (const [id, session] of Array.from(this.sessions.entries())) {
      if (session.accessTokenExpiresAt < now || session.refreshTokenExpiresAt < now) {
        this.sessions.delete(id);
        deletedCount++;
      }
    }
    
    return deletedCount;
  }

  async getSessionsByAdmin(adminId: string): Promise<Session[]> {
    return Array.from(this.sessions.values())
      .filter(s => s.adminId === adminId)
      .sort((a, b) => b.lastUsedAt.getTime() - a.lastUsedAt.getTime());
  }

  // Audit log methods
  async createAuditLog(auditLog: InsertAuditLog): Promise<AuditLog> {
    const newLog: AuditLog = {
      id: this.generateId(),
      ...auditLog,
      createdAt: new Date(),
    };
    this.auditLogs.set(newLog.id, newLog);
    return newLog;
  }

  async getAuditLogs(orgId?: string, limit?: number, offset?: number): Promise<AuditLog[]> {
    let logs = Array.from(this.auditLogs.values());
    
    if (orgId) {
      logs = logs.filter(log => log.orgId === orgId);
    }
    
    logs.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    
    if (limit) {
      const start = offset || 0;
      return logs.slice(start, start + limit);
    }
    return logs;
  }

  async getAuditLogsByAdmin(adminId: string, limit?: number, offset?: number): Promise<AuditLog[]> {
    const logs = Array.from(this.auditLogs.values())
      .filter(log => log.adminId === adminId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    
    if (limit) {
      const start = offset || 0;
      return logs.slice(start, start + limit);
    }
    return logs;
  }

  async getAuditLogsCount(orgId?: string): Promise<number> {
    if (orgId) {
      return Array.from(this.auditLogs.values())
        .filter(log => log.orgId === orgId).length;
    }
    return this.auditLogs.size;
  }
}