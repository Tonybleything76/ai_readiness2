import { Router } from 'express';
import { z } from 'zod';
import { storage } from './storage.js';
import {
  ASSESSMENT_SECTIONS,
  calculateSectionScore,
  calculateOverallScore,
  getReadinessLevel,
} from '../shared/assessment-data.js';
import { freeJson, fullJson, dimensionOverviews, FREE_COUNT, FULL_COUNT } from './utils/questionLoader.js';

const router = Router();

// Helper function to build sections with tier-specific questions
function buildSectionsForTier(tier: 'free' | 'full') {
  const questionData = tier === 'free' ? freeJson : fullJson;
  
  return ASSESSMENT_SECTIONS.map(section => {
    const sectionQuestions = questionData[section.id] || [];
    return {
      ...section,
      questions: sectionQuestions
    };
  });
}

router.get('/api/assessment', (req, res) => {
  const tier = req.query.tier as string;
  
  // Validate tier parameter
  if (tier && tier !== 'free' && tier !== 'full') {
    res.status(400).json({ 
      error: 'Invalid tier', 
      message: 'Tier must be either "free" or "full"' 
    });
    return;
  }
  
  // Default to free tier if not specified
  const selectedTier = (tier as 'free' | 'full') || 'free';
  const sections = buildSectionsForTier(selectedTier);
  const questionCount = selectedTier === 'free' ? FREE_COUNT : FULL_COUNT;
  
  res.json({ 
    sections, 
    tier: selectedTier,
    questionCount,
    overviews: dimensionOverviews
  });
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
      questionCount = assessmentMode === 'free' ? FREE_COUNT : FULL_COUNT;
    } else if (!assessmentMode && questionCount) {
      // Auto-derive assessmentMode from count
      assessmentMode = questionCount === FREE_COUNT ? 'free' : questionCount === FULL_COUNT ? 'full' : undefined;
      if (!assessmentMode) {
        res.status(400).json({
          error: 'Invalid questionCount',
          message: `questionCount must be ${FREE_COUNT} (free tier) or ${FULL_COUNT} (full tier)`
        });
        return;
      }
    } else if (assessmentMode && questionCount) {
      // Validate match if both provided
      const expectedCount = assessmentMode === 'free' ? FREE_COUNT : FULL_COUNT;
      if (questionCount !== expectedCount) {
        res.status(400).json({
          error: 'Invalid questionCount',
          message: `questionCount must be ${expectedCount} for ${assessmentMode} tier`
        });
        return;
      }
    }

    // Build tier-specific sections for accurate scoring
    const tierSections = assessmentMode ? buildSectionsForTier(assessmentMode) : ASSESSMENT_SECTIONS;

    const scores = {
      strategicLeadership: calculateSectionScore(data.answers, 'strategicLeadership', tierSections),
      useCasePortfolio: calculateSectionScore(data.answers, 'useCasePortfolio', tierSections),
      dataFoundation: calculateSectionScore(data.answers, 'dataFoundation', tierSections),
      techInfrastructure: calculateSectionScore(data.answers, 'techInfrastructure', tierSections),
      governanceRisk: calculateSectionScore(data.answers, 'governanceRisk', tierSections),
      responsibleAI: calculateSectionScore(data.answers, 'responsibleAI', tierSections),
      peopleSkills: calculateSectionScore(data.answers, 'peopleSkills', tierSections),
      changeManagement: calculateSectionScore(data.answers, 'changeManagement', tierSections),
      valueRealization: calculateSectionScore(data.answers, 'valueRealization', tierSections),
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
    console.error('[Server] Assessment submission error:', error);
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid input', details: error.errors });
    } else {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('[Server] Error details:', errorMessage);
      res.status(500).json({ error: 'Internal server error', message: errorMessage });
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
