import { Request, Response, NextFunction } from 'express';
import { SessionAuthService, type SessionData } from './sessionAuth';
import { storage } from '../storage';
import type { InsertAuditLog, AdminRoleType } from '@shared/schema';

// Extend Express Request to include session data
declare global {
  namespace Express {
    interface Request {
      sessionData?: SessionData;
      csrfToken?: string;
    }
  }
}

/**
 * Middleware to authenticate admin requests using HTTP-only cookies
 */
export const authenticateAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const accessToken = req.cookies?.['access_token'];
    
    if (!accessToken) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const sessionData = await SessionAuthService.verifyAccessToken(accessToken);
    
    if (!sessionData) {
      // Try to refresh token if available
      const refreshToken = req.cookies?.['refresh_token'];
      if (refreshToken) {
        const newSession = await SessionAuthService.refreshSession(refreshToken);
        if (newSession) {
          // Set new cookies
          const cookieOptions = SessionAuthService.getCookieOptions();
          res.cookie('access_token', newSession.accessToken, {
            ...cookieOptions,
            maxAge: 15 * 60 * 1000, // 15 minutes for access token
          });
          res.cookie('refresh_token', newSession.refreshToken, cookieOptions);

          // Get admin data for the refreshed session
          const admin = await storage.getAdmin(newSession.adminId);
          if (admin) {
            req.sessionData = { admin, session: newSession };
            return next();
          }
        }
      }

      // Clear invalid cookies
      res.clearCookie('access_token');
      res.clearCookie('refresh_token');
      return res.status(401).json({ message: 'Session expired. Please log in again.' });
    }

    req.sessionData = sessionData;
    next();
  } catch (error) {
    console.error('Authentication middleware error:', error);
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');
    return res.status(500).json({ message: 'Authentication error' });
  }
};

/**
 * Middleware to check if admin has required role
 */
export const requireRole = (requiredRole: AdminRoleType | AdminRoleType[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.sessionData) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const adminRole = req.sessionData.admin.role;
    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];

    // Super admin has access to everything
    if (adminRole === 'super_admin') {
      return next();
    }

    // Check if admin has one of the required roles
    if (!roles.includes(adminRole as AdminRoleType)) {
      return res.status(403).json({ 
        message: 'Insufficient permissions',
        required: roles,
        current: adminRole
      });
    }

    next();
  };
};

/**
 * Middleware to ensure admin can only access their organization's data
 */
export const requireOrgAccess = (req: Request, res: Response, next: NextFunction) => {
  if (!req.sessionData) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  // Super admins can access all orgs (for analytics)
  if (req.sessionData.admin.role === 'super_admin') {
    return next();
  }

  // Add orgId to request for filtering
  req.body.orgId = req.sessionData.admin.orgId;
  req.query.orgId = req.sessionData.admin.orgId;

  next();
};

/**
 * CSRF protection middleware
 */
export const csrfProtection = (req: Request, res: Response, next: NextFunction) => {
  // Skip CSRF for GET requests
  if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS') {
    return next();
  }

  const csrfToken = req.headers['x-csrf-token'] as string;
  const expectedToken = req.cookies?.['csrf_token'];

  if (!csrfToken || !expectedToken) {
    return res.status(403).json({ message: 'CSRF token missing' });
  }

  if (!SessionAuthService.verifyCSRFToken(csrfToken, expectedToken)) {
    return res.status(403).json({ message: 'Invalid CSRF token' });
  }

  next();
};

/**
 * Middleware to log admin actions for audit trail
 */
export const auditLogger = (action: string, resource?: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Store audit info for later logging
    req.auditAction = action;
    req.auditResource = resource;

    // Continue with the request
    next();

    // Log the action after response (in background)
    setImmediate(async () => {
      if (req.sessionData) {
        try {
          const auditLog: InsertAuditLog = {
            adminId: req.sessionData.admin.id,
            orgId: req.sessionData.admin.orgId,
            action,
            resource: resource || 'unknown',
            resourceId: req.params.id || req.body.id || req.query.id,
            details: {
              method: req.method,
              path: req.path,
              query: req.query,
              userAgent: req.headers['user-agent'],
            },
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'] as string,
          };
          
          await storage.createAuditLog(auditLog);
        } catch (error) {
          console.error('Failed to create audit log:', error);
        }
      }
    });
  };
};

// Extend Express Request to include audit info
declare global {
  namespace Express {
    interface Request {
      auditAction?: string;
      auditResource?: string;
    }
  }
}