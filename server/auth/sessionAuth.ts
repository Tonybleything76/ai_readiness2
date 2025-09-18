import crypto from 'crypto';
import { storage } from '../storage';
import type { Admin, Session, InsertSession, InsertAuditLog } from '@shared/schema';

// Use JWT_SECRET if available, otherwise generate a random secret for dev
// Note: In production, you should set SESSION_SECRET environment variable
const SESSION_SECRET = process.env.SESSION_SECRET || process.env.JWT_SECRET || 'dev-session-secret-change-in-production';
const ACCESS_TOKEN_LIFETIME = 15 * 60 * 1000; // 15 minutes
const REFRESH_TOKEN_LIFETIME = 7 * 24 * 60 * 60 * 1000; // 7 days

export interface SessionData {
  admin: Admin;
  session: Session;
}

export class SessionAuthService {
  /**
   * Generate a cryptographically secure random token
   */
  private static generateSecureToken(): string {
    return crypto.randomBytes(32).toString('base64url');
  }

  /**
   * Create a new session for an admin user
   */
  static async createSession(admin: Admin, ipAddress?: string, userAgent?: string): Promise<Session> {
    const now = new Date();
    const accessToken = this.generateSecureToken();
    const refreshToken = this.generateSecureToken();

    const sessionData: InsertSession = {
      adminId: admin.id,
      accessToken,
      refreshToken,
      accessTokenExpiresAt: new Date(now.getTime() + ACCESS_TOKEN_LIFETIME),
      refreshTokenExpiresAt: new Date(now.getTime() + REFRESH_TOKEN_LIFETIME),
    };

    const session = await storage.createSession(sessionData);

    // Log the login action
    const auditLog: InsertAuditLog = {
      adminId: admin.id,
      orgId: admin.orgId,
      action: 'login',
      resource: 'session',
      resourceId: session.id,
      details: { loginMethod: 'email_password' },
      ipAddress,
      userAgent,
    };
    await storage.createAuditLog(auditLog);

    return session;
  }

  /**
   * Verify and get session data from access token
   */
  static async verifyAccessToken(accessToken: string): Promise<SessionData | null> {
    try {
      const session = await storage.getSessionByToken(accessToken);
      if (!session) {
        return null;
      }

      // Check if access token has expired
      if (session.accessTokenExpiresAt < new Date()) {
        return null;
      }

      // Get admin user data
      const admin = await storage.getAdmin(session.adminId);
      if (!admin || !admin.isActive) {
        return null;
      }

      // Update last used time
      await storage.updateSession(session.id, {});

      return { admin, session };
    } catch (error) {
      console.error('Error verifying access token:', error);
      return null;
    }
  }

  /**
   * Refresh an expired access token using refresh token
   */
  static async refreshSession(refreshToken: string): Promise<Session | null> {
    try {
      // Find session by refresh token
      const session = await storage.getSessionByRefreshToken(refreshToken);

      if (!session) {
        return null;
      }

      // Check if refresh token has expired
      if (session.refreshTokenExpiresAt < new Date()) {
        // Clean up expired session
        await storage.deleteSession(session.id);
        return null;
      }

      // Verify admin is still active
      const admin = await storage.getAdmin(session.adminId);
      if (!admin || !admin.isActive) {
        await storage.deleteSession(session.id);
        return null;
      }

      // Generate new tokens with token rotation
      const newAccessToken = this.generateSecureToken();
      const newRefreshToken = this.generateSecureToken();
      const now = new Date();

      const updatedSession = await storage.updateSession(session.id, {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        accessTokenExpiresAt: new Date(now.getTime() + ACCESS_TOKEN_LIFETIME),
        refreshTokenExpiresAt: new Date(now.getTime() + REFRESH_TOKEN_LIFETIME),
      });

      return updatedSession || null;
    } catch (error) {
      console.error('Error refreshing session:', error);
      return null;
    }
  }

  /**
   * Logout and invalidate session
   */
  static async logout(sessionId: string, adminId?: string, ipAddress?: string, userAgent?: string): Promise<boolean> {
    try {
      const result = await storage.deleteSession(sessionId);
      
      if (result && adminId) {
        // Log the logout action
        const admin = await storage.getAdmin(adminId);
        const auditLog: InsertAuditLog = {
          adminId,
          orgId: admin?.orgId,
          action: 'logout',
          resource: 'session',
          resourceId: sessionId,
          details: {},
          ipAddress,
          userAgent,
        };
        await storage.createAuditLog(auditLog);
      }

      return result;
    } catch (error) {
      console.error('Error during logout:', error);
      return false;
    }
  }

  /**
   * Clean up expired sessions (should be called periodically)
   */
  static async cleanupExpiredSessions(): Promise<number> {
    try {
      return await storage.deleteExpiredSessions();
    } catch (error) {
      console.error('Error cleaning up expired sessions:', error);
      return 0;
    }
  }

  /**
   * Get cookie configuration for secure cookies
   */
  static getCookieOptions(isProduction: boolean = process.env.NODE_ENV === 'production') {
    return {
      httpOnly: true,
      secure: isProduction, // HTTPS only in production
      sameSite: 'strict' as const,
      path: '/',
      maxAge: REFRESH_TOKEN_LIFETIME, // 7 days
    };
  }

  /**
   * Generate CSRF token for additional security
   */
  static generateCSRFToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Verify CSRF token
   */
  static verifyCSRFToken(provided: string, expected: string): boolean {
    return crypto.timingSafeEqual(Buffer.from(provided, 'hex'), Buffer.from(expected, 'hex'));
  }
}