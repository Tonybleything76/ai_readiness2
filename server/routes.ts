import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { scoreRequestSchema, adminLoginSchema, AdminRole } from "@shared/schema";
import { QuestionLoader } from "./services/questionLoader";
import { Scorer } from "./services/scorer";
import { insightsService } from "./insights";
import { SessionAuthService } from "./auth/sessionAuth";
import { PasswordService } from "./auth/passwordService";
import { authenticateAdmin, requireRole, requireOrgAccess, csrfProtection, auditLogger } from "./auth/middleware";
import { PDFGenerator } from "./services/pdfGenerator";

export async function registerRoutes(app: Express): Promise<Server> {
  const questionLoader = new QuestionLoader();
  const scorer = new Scorer();

  // Clean up expired sessions periodically
  setInterval(async () => {
    try {
      const cleaned = await SessionAuthService.cleanupExpiredSessions();
      if (cleaned > 0) {
        console.log(`Cleaned up ${cleaned} expired sessions`);
      }
    } catch (error) {
      console.error('Error cleaning up expired sessions:', error);
    }
  }, 60 * 60 * 1000); // Every hour

  // Load questions from JSON file
  await questionLoader.loadQuestions();

  // GET /api/auth/csrf - Get CSRF token for authenticated requests
  app.get("/api/auth/csrf", (req, res) => {
    try {
      const csrfToken = SessionAuthService.generateCSRFToken();
      
      // Set CSRF token as a cookie (accessible to JavaScript)
      res.cookie('csrf_token', csrfToken, {
        httpOnly: false, // Must be accessible to JS for inclusion in headers
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        path: '/',
      });

      res.json({ csrfToken });
    } catch (error) {
      console.error("Error generating CSRF token:", error);
      res.status(500).json({ message: "Failed to generate CSRF token" });
    }
  });

  // GET /api/health - Basic health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // GET /api/health/detailed - Comprehensive health check for production
  app.get("/api/health/detailed", async (req, res) => {
    const healthCheck = {
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || "development",
      checks: {
        database: "unknown",
        questions: "unknown",
        jwt: "unknown"
      }
    };

    try {
      // Test database connectivity
      const testResponse = await storage.getAllResponses(1, 0);
      healthCheck.checks.database = "ok";
    } catch (error) {
      healthCheck.checks.database = "error";
      healthCheck.status = "degraded";
    }

    try {
      // Test question loading
      const questions = questionLoader.getQuestions();
      healthCheck.checks.questions = questions && Object.keys(questions).length > 0 ? "ok" : "error";
    } catch (error) {
      healthCheck.checks.questions = "error";
      healthCheck.status = "degraded";
    }

    try {
      // Test session auth service
      const testToken = SessionAuthService.generateCSRFToken();
      healthCheck.checks.jwt = testToken && testToken.length > 0 ? "ok" : "error";
    } catch (error) {
      healthCheck.checks.jwt = "error";
      healthCheck.status = "degraded";
    }

    const httpStatus = healthCheck.status === "ok" ? 200 : 503;
    res.status(httpStatus).json(healthCheck);
  });

  // GET /api/questions - Return normalized structure from JSON
  app.get("/api/questions", async (req, res) => {
    try {
      const questions = questionLoader.getQuestions();
      res.json(questions);
    } catch (error) {
      console.error("Error getting questions:", error);
      res.status(500).json({ message: "Failed to load questions" });
    }
  });

  // POST /api/score - Calculate scores and persist response
  app.post("/api/score", async (req, res) => {
    try {
      const parseResult = scoreRequestSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ 
          message: "Invalid request body",
          errors: parseResult.error.errors 
        });
      }

      const { orgName, industry, answers } = parseResult.data;
      const questions = questionLoader.getQuestions();

      // Calculate scores
      const scoreResult = scorer.calculateScores(answers, questions);

      // Create response record
      const responseRecord = await storage.createResponse({
        orgName: orgName || null,
        industry: industry || null,
        answersJson: answers,
        pillarScores: scoreResult.pillarScores,
        overall: scoreResult.overall,
        category: scoreResult.category,
      });

      // Generate personalized recommendations and insights
      const recommendations = insightsService.generateRecommendations(responseRecord);
      const insights = insightsService.generateInsightsSummary(responseRecord);

      // Return score response with recommendations and insights
      res.json({
        responseId: responseRecord.id,
        ...scoreResult,
        recommendations,
        insights,
      });
    } catch (error) {
      console.error("Error calculating scores:", error);
      res.status(500).json({ message: "Failed to calculate scores" });
    }
  });

  // GET /api/response/:id - Get specific response
  app.get("/api/response/:id", async (req, res) => {
    try {
      const response = await storage.getResponse(req.params.id);
      if (!response) {
        return res.status(404).json({ message: "Response not found" });
      }
      res.json(response);
    } catch (error) {
      console.error("Error getting response:", error);
      res.status(500).json({ message: "Failed to get response" });
    }
  });

  // GET /api/responses/:orgName - Get historical data for organization
  app.get("/api/responses/:orgName", async (req, res) => {
    try {
      const orgName = req.params.orgName;
      if (!orgName) {
        return res.status(400).json({ message: "Organization name is required" });
      }

      const responses = await storage.getResponsesByOrganization(orgName);
      res.json({
        orgName,
        count: responses.length,
        responses: responses
      });
    } catch (error) {
      console.error("Error getting historical responses:", error);
      res.status(500).json({ message: "Failed to get historical responses" });
    }
  });

  // GET /api/benchmark/:industry - Get industry benchmarking data
  app.get("/api/benchmark/:industry", async (req, res) => {
    try {
      const industry = req.params.industry;
      if (!industry) {
        return res.status(400).json({ message: "Industry is required" });
      }

      const statistics = await storage.getIndustryStatistics(industry);
      
      if (!statistics) {
        return res.status(200).json({
          industry,
          available: false,
          message: "Insufficient data for benchmarking (minimum 10 responses required for privacy)"
        });
      }

      res.json({
        industry,
        available: true,
        ...statistics
      });
    } catch (error) {
      console.error("Error getting industry statistics:", error);
      res.status(500).json({ message: "Failed to get industry statistics" });
    }
  });

  // POST /api/admin/login - Admin authentication with email/password
  app.post("/api/admin/login", async (req, res) => {
    try {
      const parseResult = adminLoginSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ 
          message: "Invalid request body",
          errors: parseResult.error.errors 
        });
      }

      const { email, password } = parseResult.data;
      
      // Find admin by email
      const admin = await storage.getAdminByEmail(email);
      if (!admin || !admin.isActive) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Verify password
      const isValidPassword = await PasswordService.verifyPassword(password, admin.passwordHash);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Create session
      const session = await SessionAuthService.createSession(
        admin,
        req.ip,
        req.headers['user-agent'] as string
      );

      // Set HTTP-only cookies
      const cookieOptions = SessionAuthService.getCookieOptions();
      
      // Access token (shorter lived)
      res.cookie('access_token', session.accessToken, {
        ...cookieOptions,
        maxAge: 15 * 60 * 1000, // 15 minutes
      });
      
      // Refresh token (longer lived)
      res.cookie('refresh_token', session.refreshToken, cookieOptions);

      // CSRF token
      const csrfToken = SessionAuthService.generateCSRFToken();
      res.cookie('csrf_token', csrfToken, {
        ...cookieOptions,
        httpOnly: false, // CSRF token needs to be accessible to JS
      });

      res.json({ 
        success: true,
        message: "Login successful",
        admin: {
          id: admin.id,
          email: admin.email,
          role: admin.role,
          orgId: admin.orgId,
        },
        csrfToken, // Send CSRF token in response as well
      });
    } catch (error) {
      console.error("Error during admin login:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  // POST /api/admin/logout - Admin logout
  app.post("/api/admin/logout", authenticateAdmin, auditLogger('logout', 'session'), async (req, res) => {
    try {
      const sessionId = req.sessionData?.session.id;
      const adminId = req.sessionData?.admin.id;

      if (sessionId) {
        await SessionAuthService.logout(sessionId, adminId, req.ip, req.headers['user-agent'] as string);
      }

      // Clear cookies
      res.clearCookie('access_token');
      res.clearCookie('refresh_token');
      res.clearCookie('csrf_token');

      res.json({ message: "Logged out successfully" });
    } catch (error) {
      console.error("Error during admin logout:", error);
      res.status(500).json({ message: "Logout failed" });
    }
  });

  // GET /api/admin/me - Get current admin info
  app.get("/api/admin/me", authenticateAdmin, async (req, res) => {
    try {
      const admin = req.sessionData?.admin;
      if (!admin) {
        return res.status(401).json({ message: "Authentication required" });
      }

      // Get organization info
      const organization = await storage.getOrganization(admin.orgId);

      res.json({
        admin: {
          id: admin.id,
          email: admin.email,
          role: admin.role,
          orgId: admin.orgId,
          isActive: admin.isActive,
        },
        organization: organization ? {
          id: organization.id,
          name: organization.name,
          industry: organization.industry,
        } : null,
      });
    } catch (error) {
      console.error("Error getting admin info:", error);
      res.status(500).json({ message: "Failed to get admin info" });
    }
  });

  // GET /api/auth/csrf - Get CSRF token for client
  app.get("/api/auth/csrf", (req, res) => {
    const csrfToken = SessionAuthService.generateCSRFToken();
    
    // Set CSRF token as non-httpOnly cookie so frontend can access it
    res.cookie('csrf_token', csrfToken, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({ csrfToken });
  });

  // Organization management routes
  // POST /api/admin/organizations - Create organization (super admin only)
  app.post("/api/admin/organizations", authenticateAdmin, requireRole(AdminRole.SUPER_ADMIN), csrfProtection, auditLogger('create_organization', 'organization'), async (req, res) => {
    try {
      const { name, industry } = req.body;
      
      if (!name) {
        return res.status(400).json({ message: "Organization name is required" });
      }

      // Check if org with this name already exists
      const existing = await storage.getOrganizationByName(name);
      if (existing) {
        return res.status(400).json({ message: "Organization with this name already exists" });
      }

      const organization = await storage.createOrganization({ name, industry });
      res.status(201).json({ organization });
    } catch (error) {
      console.error("Error creating organization:", error);
      res.status(500).json({ message: "Failed to create organization" });
    }
  });

  // GET /api/admin/organizations - List organizations (super admin only)
  app.get("/api/admin/organizations", authenticateAdmin, requireRole(AdminRole.SUPER_ADMIN), auditLogger('list_organizations', 'organization'), async (req, res) => {
    try {
      const organizations = await storage.getAllOrganizations();
      res.json({ organizations });
    } catch (error) {
      console.error("Error listing organizations:", error);
      res.status(500).json({ message: "Failed to list organizations" });
    }
  });

  // Admin user management routes
  // POST /api/admin/admins - Create admin user (super admin only)
  app.post("/api/admin/admins", authenticateAdmin, requireRole(AdminRole.SUPER_ADMIN), csrfProtection, auditLogger('create_admin', 'admin'), async (req, res) => {
    try {
      const { email, password, orgId, role } = req.body;
      
      if (!email || !password || !orgId || !role) {
        return res.status(400).json({ message: "Email, password, organization ID, and role are required" });
      }

      // Validate password strength
      const passwordValidation = PasswordService.validatePassword(password);
      if (!passwordValidation.isValid) {
        return res.status(400).json({ 
          message: "Password does not meet requirements",
          errors: passwordValidation.errors
        });
      }

      // Check if admin with this email already exists
      const existing = await storage.getAdminByEmail(email);
      if (existing) {
        return res.status(400).json({ message: "Admin with this email already exists" });
      }

      // Verify organization exists
      const organization = await storage.getOrganization(orgId);
      if (!organization) {
        return res.status(400).json({ message: "Organization not found" });
      }

      // Hash password and create admin
      const passwordHash = await PasswordService.hashPassword(password);
      const admin = await storage.createAdmin({
        email,
        passwordHash,
        orgId,
        role,
        isActive: true,
      });

      // Return admin without password hash
      res.status(201).json({ 
        admin: {
          id: admin.id,
          email: admin.email,
          orgId: admin.orgId,
          role: admin.role,
          isActive: admin.isActive,
        }
      });
    } catch (error) {
      console.error("Error creating admin:", error);
      res.status(500).json({ message: "Failed to create admin" });
    }
  });

  // GET /api/admin/responses - Get all responses (paginated) with org filtering
  app.get("/api/admin/responses", authenticateAdmin, auditLogger('view_responses', 'response'), async (req, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = (page - 1) * limit;
      const admin = req.sessionData!.admin;

      let responses: any[];
      let total: number;

      // Super admins can see all responses, others only see their org's responses
      if (admin.role === AdminRole.SUPER_ADMIN) {
        responses = await storage.getAllResponses(limit, offset);
        total = await storage.getResponseCount();
      } else {
        responses = await storage.getResponsesByOrgId(admin.orgId, limit, offset);
        // For now, count all responses for the org (we could optimize this with a specific count method)
        const allOrgResponses = await storage.getResponsesByOrgId(admin.orgId);
        total = allOrgResponses.length;
      }

      res.json({
        data: responses,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error("Error getting responses:", error);
      res.status(500).json({ message: "Failed to get responses" });
    }
  });

  // GET /api/admin/export/csv - Export all responses as CSV
  app.get("/api/admin/export/csv", authenticateAdmin, async (req, res) => {
    try {
      const responses = await storage.getAllResponses(); // Get all responses without pagination
      
      // CSV header
      const csvHeader = "ID,Created At,Organization,Industry,Overall Score,Category,Technology,Data Management,Organizational Culture,Strategic Planning,Risk Management\n";
      
      // CSV rows
      const csvRows = responses.map(response => {
        const pillarScores = response.pillarScores as any;
        return [
          response.id,
          response.createdAt.toISOString(),
          response.orgName || "",
          response.industry || "",
          response.overall,
          response.category,
          pillarScores?.technology || 0,
          pillarScores?.data_management || 0,
          pillarScores?.organizational_culture || 0,
          pillarScores?.strategic_planning || 0,
          pillarScores?.risk_management || 0
        ].map(field => `"${String(field).replace(/"/g, '""')}"`).join(",");
      }).join("\n");

      const csvContent = csvHeader + csvRows;
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="ai-readiness-responses-${new Date().toISOString().split('T')[0]}.csv"`);
      res.send(csvContent);
    } catch (error) {
      console.error("Error exporting CSV:", error);
      res.status(500).json({ message: "Failed to export CSV" });
    }
  });

  // GET /api/admin/export/json/:id - Export individual response as JSON
  app.get("/api/admin/export/json/:id", authenticateAdmin, async (req, res) => {
    try {
      const response = await storage.getResponse(req.params.id);
      if (!response) {
        return res.status(404).json({ message: "Response not found" });
      }

      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="response-${response.id}.json"`);
      res.json(response);
    } catch (error) {
      console.error("Error exporting JSON:", error);
      res.status(500).json({ message: "Failed to export JSON" });
    }
  });

  // GET /api/admin/export/pdf/:id - Export single response as PDF (admin)
  app.get("/api/admin/export/pdf/:id", authenticateAdmin, async (req, res) => {
    try {
      const response = await storage.getResponse(req.params.id);
      if (!response) {
        return res.status(404).json({ message: "Response not found" });
      }

      // Generate PDF with custom branding options
      const pdfBuffer = await PDFGenerator.generateAssessmentReport(response, {
        customBranding: {
          primaryColor: '#3b82f6',
          secondaryColor: '#1e40af',
          companyName: 'AI Readiness Assessment Platform',
        }
      });

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="assessment-report-${response.id}.pdf"`);
      res.send(pdfBuffer);
    } catch (error) {
      console.error("Error generating PDF report:", error);
      res.status(500).json({ message: "Failed to generate PDF report" });
    }
  });

  // GET /api/report/pdf/:id - Public PDF export for assessment results
  app.get("/api/report/pdf/:id", async (req, res) => {
    try {
      const response = await storage.getResponse(req.params.id);
      if (!response) {
        return res.status(404).json({ message: "Response not found" });
      }

      // Generate PDF with default branding
      const pdfBuffer = await PDFGenerator.generateAssessmentReport(response, {
        customBranding: {
          primaryColor: '#3b82f6',
          secondaryColor: '#1e40af',
          companyName: 'AI Readiness Assessment Platform',
        }
      });

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="ai-readiness-report-${response.id}.pdf"`);
      res.send(pdfBuffer);
    } catch (error) {
      console.error("Error generating PDF report:", error);
      res.status(500).json({ message: "Failed to generate PDF report" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
