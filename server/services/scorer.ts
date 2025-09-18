import { AssessmentData, ScoreResponse } from "@shared/schema";

export class Scorer {
  calculateScores(answers: Record<string, number>, assessmentData: AssessmentData): Omit<ScoreResponse, 'responseId'> {
    const pillarScores: Record<string, number> = {};
    const answerDetails: Record<string, { value: number; label: string; meaning: string }> = {};
    
    // Calculate score for each pillar
    for (const pillar of assessmentData.pillars) {
      let weightedSum = 0;
      let totalWeight = 0;
      
      for (const question of pillar.questions) {
        const answerValue = answers[question.id];
        if (answerValue !== undefined) {
          // Normalize score: (value-1)/4 to get 0-1 range
          const normalizedScore = (answerValue - 1) / 4;
          const weight = question.weight || 0.06;
          
          weightedSum += normalizedScore * weight;
          totalWeight += weight;
          
          // Store answer details
          answerDetails[question.id] = {
            value: answerValue,
            label: question.responses[answerValue.toString()],
            meaning: question.meanings[answerValue.toString()],
          };
        }
      }
      
      // Calculate pillar score as percentage (0-100)
      const pillarScore = totalWeight > 0 ? (weightedSum / totalWeight) * 100 : 0;
      pillarScores[pillar.id] = Math.round(pillarScore * 100) / 100; // Round to 2 decimals
    }
    
    // Calculate overall score as average of pillar scores
    const pillarValues = Object.values(pillarScores);
    const overall = pillarValues.length > 0 
      ? pillarValues.reduce((sum, score) => sum + score, 0) / pillarValues.length
      : 0;
    
    // Determine category and color based on overall score
    const { category, color, message } = this.categorizeScore(overall);
    
    return {
      pillarScores,
      overall: Math.round(overall * 100) / 100,
      category,
      color,
      message,
      answers: answerDetails,
    };
  }
  
  private categorizeScore(overall: number): { category: string; color: string; message: string } {
    if (overall >= 80) {
      return {
        category: "AI Ready",
        color: "hsl(var(--chart-2))",
        message: "Your organization demonstrates strong AI readiness across all pillars. You're well-positioned to implement advanced AI solutions."
      };
    } else if (overall >= 60) {
      return {
        category: "Good Progress",
        color: "hsl(var(--chart-3))",
        message: "Your organization shows solid foundation for AI adoption with clear areas for improvement. Focus on addressing priority gaps to advance further."
      };
    } else if (overall >= 40) {
      return {
        category: "Developing",
        color: "hsl(var(--chart-4))",
        message: "Your organization is in the early stages of AI readiness. Significant investment in foundational capabilities is needed before implementing AI solutions."
      };
    } else {
      return {
        category: "Getting Started",
        color: "hsl(var(--chart-5))",
        message: "Your organization needs substantial development across all pillars before pursuing AI initiatives. Start with foundational improvements in data and strategy."
      };
    }
  }
}
