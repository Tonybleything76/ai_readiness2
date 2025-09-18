import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { scoreRequestSchema } from "@shared/schema";
import { QuestionLoader } from "./services/questionLoader";
import { Scorer } from "./services/scorer";

export async function registerRoutes(app: Express): Promise<Server> {
  const questionLoader = new QuestionLoader();
  const scorer = new Scorer();

  // Load questions from JSON file
  await questionLoader.loadQuestions();

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

  const httpServer = createServer(app);
  return httpServer;
}
