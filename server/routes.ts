import { Router } from 'express';
import { z } from 'zod';
import { storage } from './storage.js';
import {
  ASSESSMENT_SECTIONS,
  calculateSectionScore,
  calculateOverallScore,
  getReadinessLevel,
} from '../shared/assessment-data.js';

const router = Router();

router.get('/api/assessment', (_req, res) => {
  res.json({ sections: ASSESSMENT_SECTIONS });
});

const submitAssessmentSchema = z.object({
  organizationName: z.string().min(1),
  industry: z.string().min(1),
  answers: z.record(z.number()),
  assessmentMode: z.enum(['free', 'full']).optional(),
  questionCount: z.number().optional(),
});

router.post('/api/assessment/submit', async (req, res) => {
  try {
    const data = submitAssessmentSchema.parse(req.body);

    // Ensure assessmentMode and questionCount are consistent
    let assessmentMode = data.assessmentMode;
    let questionCount = data.questionCount;
    
    if (assessmentMode && !questionCount) {
      // Auto-derive questionCount from mode
      questionCount = assessmentMode === 'free' ? 25 : 90;
    } else if (!assessmentMode && questionCount) {
      // Auto-derive assessmentMode from count
      assessmentMode = questionCount === 25 ? 'free' : questionCount === 90 ? 'full' : undefined;
      if (!assessmentMode) {
        res.status(400).json({
          error: 'Invalid questionCount',
          message: 'questionCount must be 25 (free tier) or 90 (full tier)'
        });
        return;
      }
    } else if (assessmentMode && questionCount) {
      // Validate match if both provided
      const expectedCount = assessmentMode === 'free' ? 25 : 90;
      if (questionCount !== expectedCount) {
        res.status(400).json({
          error: 'Invalid questionCount',
          message: `questionCount must be ${expectedCount} for ${assessmentMode} tier`
        });
        return;
      }
    }

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
      orgName: data.organizationName,
      industry: data.industry,
      answersJson: data.answers,
      pillarScores: { ...scores, overall },
      overall,
      category: readinessLevel.name,
      assessmentMode,
      questionCount,
    });

    // Map internal field names to frontend-expected names for backwards compatibility
    res.json({
      id: response.id,
      organizationName: response.orgName,
      industry: response.industry,
      answers: response.answersJson,
      scores: response.pillarScores,
      readinessLevel: response.category,
      createdAt: response.createdAt,
      assessmentMode: response.assessmentMode,
      questionCount: response.questionCount,
    });
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
    const id = req.params.id;
    if (!id) {
      res.status(400).json({ error: 'Invalid ID' });
      return;
    }

    const response = await storage.getResponse(id);
    if (!response) {
      res.status(404).json({ error: 'Response not found' });
      return;
    }

    // Map internal field names to frontend-expected names for backwards compatibility
    res.json({
      id: response.id,
      organizationName: response.orgName,
      industry: response.industry,
      answers: response.answersJson,
      scores: response.pillarScores,
      readinessLevel: response.category,
      createdAt: response.createdAt,
      assessmentMode: response.assessmentMode,
      questionCount: response.questionCount,
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
