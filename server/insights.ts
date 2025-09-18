import { Response } from "@shared/schema";

// Recommendation types
export interface Recommendation {
  id: string;
  category: "immediate" | "strategic" | "foundational";
  priority: "high" | "medium" | "low";
  title: string;
  description: string;
  pillar: string;
  score_threshold: number;
}

// Predefined recommendation rules
const RECOMMENDATION_RULES: Recommendation[] = [
  // Technology pillar recommendations
  {
    id: "tech_infrastructure_low",
    category: "foundational",
    priority: "high",
    title: "Strengthen Technology Infrastructure",
    description: "Your organization needs to invest in modern technology infrastructure as a foundation for AI initiatives. Consider cloud migration, API modernization, and data pipeline improvements.",
    pillar: "technology",
    score_threshold: 3.0
  },
  {
    id: "tech_skills_gap",
    category: "strategic",
    priority: "high",
    title: "Address Technical Skills Gap",
    description: "Invest in training programs for your technical team on AI/ML technologies, or consider hiring data scientists and AI specialists to build internal capabilities.",
    pillar: "technology",
    score_threshold: 2.5
  },
  {
    id: "tech_tooling_improvement",
    category: "immediate",
    priority: "medium",
    title: "Upgrade Development and Analytics Tools",
    description: "Implement modern development tools, version control systems, and analytics platforms to support AI development workflows.",
    pillar: "technology",
    score_threshold: 3.5
  },
  
  // Data Management pillar recommendations
  {
    id: "data_governance_critical",
    category: "foundational",
    priority: "high",
    title: "Establish Data Governance Framework",
    description: "Create comprehensive data governance policies, establish data quality standards, and implement data cataloging to ensure AI projects have reliable data foundations.",
    pillar: "data_management",
    score_threshold: 3.0
  },
  {
    id: "data_quality_improvement",
    category: "immediate",
    priority: "high",
    title: "Improve Data Quality and Accessibility",
    description: "Implement data cleaning processes, standardize data formats, and create centralized data repositories to improve data quality and accessibility for AI initiatives.",
    pillar: "data_management",
    score_threshold: 2.5
  },
  {
    id: "data_privacy_compliance",
    category: "strategic",
    priority: "high",
    title: "Strengthen Data Privacy and Security",
    description: "Implement robust data privacy controls, ensure regulatory compliance (GDPR, CCPA), and establish data access controls before proceeding with AI initiatives.",
    pillar: "data_management",
    score_threshold: 3.5
  },
  
  // Organizational Culture pillar recommendations
  {
    id: "culture_change_management",
    category: "strategic",
    priority: "high",
    title: "Implement AI Change Management Program",
    description: "Develop a comprehensive change management strategy to help employees adapt to AI integration, including communication plans and training programs.",
    pillar: "organizational_culture",
    score_threshold: 3.0
  },
  {
    id: "culture_leadership_buy_in",
    category: "foundational",
    priority: "high",
    title: "Secure Leadership Commitment to AI",
    description: "Ensure executive leadership is fully committed to AI transformation with clear vision, adequate resources, and consistent messaging throughout the organization.",
    pillar: "organizational_culture",
    score_threshold: 2.5
  },
  {
    id: "culture_employee_engagement",
    category: "immediate",
    priority: "medium",
    title: "Improve AI Awareness and Engagement",
    description: "Conduct AI literacy workshops, create innovation challenges, and establish cross-functional AI working groups to build enthusiasm and understanding.",
    pillar: "organizational_culture",
    score_threshold: 3.5
  },
  
  // Strategic Planning pillar recommendations
  {
    id: "strategy_roadmap_development",
    category: "foundational",
    priority: "high",
    title: "Develop Comprehensive AI Strategy and Roadmap",
    description: "Create a detailed AI strategy with clear objectives, timelines, success metrics, and resource allocation plans aligned with business goals.",
    pillar: "strategic_planning",
    score_threshold: 3.0
  },
  {
    id: "strategy_pilot_projects",
    category: "immediate",
    priority: "medium",
    title: "Launch Strategic AI Pilot Projects",
    description: "Identify and initiate 2-3 high-impact, low-risk AI pilot projects to demonstrate value and build organizational confidence in AI capabilities.",
    pillar: "strategic_planning",
    score_threshold: 2.5
  },
  {
    id: "strategy_success_metrics",
    category: "strategic",
    priority: "medium",
    title: "Establish AI Success Metrics and KPIs",
    description: "Define clear, measurable success criteria for AI initiatives including ROI tracking, performance metrics, and business impact measurements.",
    pillar: "strategic_planning",
    score_threshold: 3.5
  },
  
  // Risk Management pillar recommendations
  {
    id: "risk_ai_governance",
    category: "foundational",
    priority: "high",
    title: "Implement AI Governance and Ethics Framework",
    description: "Establish AI ethics guidelines, create governance committees, and implement review processes for AI projects to ensure responsible AI deployment.",
    pillar: "risk_management",
    score_threshold: 3.0
  },
  {
    id: "risk_bias_monitoring",
    category: "strategic",
    priority: "high",
    title: "Develop AI Bias Detection and Mitigation",
    description: "Implement systematic bias testing, diverse training data practices, and ongoing monitoring systems to ensure fair and unbiased AI outcomes.",
    pillar: "risk_management",
    score_threshold: 2.5
  },
  {
    id: "risk_security_measures",
    category: "immediate",
    priority: "high",
    title: "Strengthen AI Security and Privacy Controls",
    description: "Implement robust security measures for AI systems including model security, adversarial attack protection, and privacy-preserving techniques.",
    pillar: "risk_management",
    score_threshold: 3.5
  }
];

// Additional cross-cutting recommendations based on overall score
const OVERALL_SCORE_RECOMMENDATIONS: Recommendation[] = [
  {
    id: "overall_foundations_critical",
    category: "foundational",
    priority: "high",
    title: "Build Fundamental AI Readiness Foundations",
    description: "Your organization needs to establish basic AI readiness foundations before pursuing advanced initiatives. Focus on data quality, technical infrastructure, and organizational alignment.",
    pillar: "overall",
    score_threshold: 2.0
  },
  {
    id: "overall_accelerate_progress",
    category: "strategic", 
    priority: "medium",
    title: "Accelerate AI Readiness Development",
    description: "Your organization is moderately prepared for AI adoption. Focus on addressing the weakest areas while building on existing strengths to accelerate progress.",
    pillar: "overall",
    score_threshold: 3.0
  },
  {
    id: "overall_optimize_excellence",
    category: "immediate",
    priority: "medium", 
    title: "Optimize for AI Excellence",
    description: "Your organization shows strong AI readiness. Focus on fine-tuning processes, scaling successful initiatives, and establishing centers of excellence for sustained AI leadership.",
    pillar: "overall",
    score_threshold: 4.0
  }
];

export class InsightsService {
  /**
   * Generate personalized recommendations based on assessment scores
   */
  generateRecommendations(response: Response): Recommendation[] {
    const recommendations: Recommendation[] = [];
    const pillarScores = response.pillarScores as Record<string, number>;
    
    // Add pillar-specific recommendations based on low scores
    for (const [pillar, score] of Object.entries(pillarScores)) {
      const pillarRecs = RECOMMENDATION_RULES.filter(rec => 
        rec.pillar === pillar && score <= rec.score_threshold
      );
      
      // Sort by priority (high first) and take top 2 per pillar
      const topPillarRecs = pillarRecs
        .sort((a, b) => {
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        })
        .slice(0, 2);
      
      recommendations.push(...topPillarRecs);
    }
    
    // Add overall score recommendations
    const overallRecs = OVERALL_SCORE_RECOMMENDATIONS.filter(rec =>
      response.overall <= rec.score_threshold
    );
    
    if (overallRecs.length > 0) {
      // Take the most appropriate overall recommendation
      recommendations.push(overallRecs[0]);
    }
    
    // Remove duplicates and limit total recommendations
    const uniqueRecommendations = recommendations.filter((rec, index, self) =>
      index === self.findIndex(r => r.id === rec.id)
    );
    
    // Sort by priority and category for optimal ordering
    return uniqueRecommendations
      .sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        const categoryOrder = { foundational: 3, strategic: 2, immediate: 1 };
        
        // First sort by priority, then by category
        const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
        if (priorityDiff !== 0) return priorityDiff;
        
        return categoryOrder[b.category] - categoryOrder[a.category];
      })
      .slice(0, 6); // Limit to top 6 recommendations
  }
  
  /**
   * Generate insights summary for the assessment
   */
  generateInsightsSummary(response: Response): {
    strengths: string[];
    challenges: string[];
    readinessLevel: string;
    nextSteps: string[];
  } {
    const pillarScores = response.pillarScores as Record<string, number>;
    const overall = response.overall;
    
    // Identify strengths (scores >= 3.5)
    const strengths: string[] = [];
    const challenges: string[] = [];
    
    for (const [pillar, score] of Object.entries(pillarScores)) {
      const pillarName = pillar.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      
      if (score >= 3.5) {
        strengths.push(`Strong ${pillarName} capabilities`);
      } else if (score <= 2.5) {
        challenges.push(`${pillarName} needs significant improvement`);
      }
    }
    
    // Determine readiness level
    let readinessLevel = "Not Ready";
    if (overall >= 4.0) readinessLevel = "Highly Ready";
    else if (overall >= 3.0) readinessLevel = "Moderately Ready"; 
    else if (overall >= 2.0) readinessLevel = "Basic Readiness";
    
    // Generate next steps
    const recommendations = this.generateRecommendations(response);
    const nextSteps = recommendations.slice(0, 3).map(rec => rec.title);
    
    return {
      strengths: strengths.length > 0 ? strengths : ["Focus on building foundational capabilities"],
      challenges: challenges.length > 0 ? challenges : ["Continue strengthening current capabilities"],
      readinessLevel,
      nextSteps
    };
  }
}

// Export singleton instance
export const insightsService = new InsightsService();