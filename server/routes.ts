import { Router } from 'express';
import { z } from 'zod';
import { storage } from './storage';
import { insertResponseSchema } from '@shared/schema';
import {
  ASSESSMENT_SECTIONS,
  calculateSectionScore,
  calculateOverallScore,
  getReadinessLevel,
} from '@shared/assessment-data';

const router = Router();

router.get('/api/assessment', (_req, res) => {
  res.json({ sections: ASSESSMENT_SECTIONS });
});

const submitAssessmentSchema = z.object({
  organizationName: z.string().min(1),
  industry: z.string().min(1),
  answers: z.record(z.number()),
});

router.post('/api/assessment/submit', async (req, res) => {
  try {
    const data = submitAssessmentSchema.parse(req.body);

    const scores = {
      technology: calculateSectionScore(data.answers, 'technology'),
      dataManagement: calculateSectionScore(data.answers, 'dataManagement'),
      organizationalCulture: calculateSectionScore(data.answers, 'organizationalCulture'),
      strategyPlanning: calculateSectionScore(data.answers, 'strategyPlanning'),
      riskCompliance: calculateSectionScore(data.answers, 'riskCompliance'),
    };

    const overall = calculateOverallScore(scores);
    const readinessLevel = getReadinessLevel(overall);

    const response = await storage.createResponse({
      organizationName: data.organizationName,
      industry: data.industry,
      answers: data.answers,
      scores: { ...scores, overall },
      readinessLevel: readinessLevel.name,
    });

    res.json(response);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid input', details: error.errors });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

router.get('/api/results/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ error: 'Invalid ID' });
      return;
    }

    const response = await storage.getResponse(id);
    if (!response) {
      res.status(404).json({ error: 'Response not found' });
      return;
    }

    res.json(response);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
