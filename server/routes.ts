import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { scoreRequestSchema, adminLoginSchema } from "@shared/schema";
import { QuestionLoader } from "./services/questionLoader";
import { Scorer } from "./services/scorer";

export async function registerRoutes(app: Express): Promise<Server> {
  const questionLoader = new QuestionLoader();
  const scorer = new Scorer();

  // Admin authentication middleware
  const authenticateAdmin = (req: any, res: any, next: any) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: "Authorization required" });
    }
    
    const token = authHeader.substring(7);
    // Simple token validation - in production, use JWT or session tokens
    if (token !== process.env.ADMIN_PASS) {
      return res.status(403).json({ message: "Invalid credentials" });
    }
    
    next();
  };

  // Load questions from JSON file
  await questionLoader.loadQuestions();

  // GET /api/health - Health check endpoint for Playwright readiness
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
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

      // Return score response
      res.json({
        responseId: responseRecord.id,
        ...scoreResult,
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

  // POST /api/admin/login - Admin authentication
  app.post("/api/admin/login", (req, res) => {
    try {
      const parseResult = adminLoginSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ 
          message: "Invalid request body",
          errors: parseResult.error.errors 
        });
      }

      const { password } = parseResult.data;
      
      if (password !== process.env.ADMIN_PASS) {
        return res.status(401).json({ message: "Invalid password" });
      }

      // Return the password as token for simplicity - in production use JWT
      res.json({ 
        token: password,
        message: "Login successful" 
      });
    } catch (error) {
      console.error("Error during admin login:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  // GET /api/admin/responses - Get all responses (paginated)
  app.get("/api/admin/responses", authenticateAdmin, async (req, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = (page - 1) * limit;

      const responses = await storage.getAllResponses(limit, offset);
      const total = await storage.getResponseCount();

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

  const httpServer = createServer(app);
  return httpServer;
}
