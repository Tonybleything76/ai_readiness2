export interface ReadinessLevel {
  name: string;
  range: [number, number];
  color: string;
  description: string;
  characteristics: string[];
}

export interface AssessmentSection {
  id: string;
  title: string;
  description: string;
  importance: string;
  whatItAssesses: string;
  icon: string;
  questions: {
    id: string;
    text: string;
    options: { value: number; label: string }[];
  }[];
}

export const READINESS_LEVELS: ReadinessLevel[] = [
  {
    name: 'Getting Started',
    range: [0, 40],
    color: '#ef4444',
    description: 'Your organization is at the beginning stages of AI readiness. You have significant foundational work to do before implementing AI solutions effectively.',
    characteristics: [
      'Limited or no AI strategy in place',
      'Minimal data infrastructure and governance',
      'Low organizational awareness of AI capabilities',
      'Basic or absent technological capabilities for AI',
      'Significant risks and compliance gaps',
    ],
  },
  {
    name: 'Developing',
    range: [40, 60],
    color: '#f59e0b',
    description: 'Your organization has begun the AI readiness journey with some foundational elements in place, but there are important gaps to address.',
    characteristics: [
      'Basic AI strategy being developed',
      'Some data management practices established',
      'Growing organizational awareness and interest',
      'Partial technological infrastructure for AI',
      'Developing risk management practices',
    ],
  },
  {
    name: 'Good Progress',
    range: [60, 80],
    color: '#3b82f6',
    description: 'Your organization has established solid foundations for AI implementation with most critical capabilities in place.',
    characteristics: [
      'Clear AI strategy with defined objectives',
      'Strong data management and governance',
      'Widespread organizational buy-in',
      'Robust technological infrastructure',
      'Comprehensive risk and compliance framework',
    ],
  },
  {
    name: 'AI Ready',
    range: [80, 100],
    color: '#10b981',
    description: 'Your organization is well-prepared to implement and scale AI solutions effectively. You have mature capabilities across all dimensions.',
    characteristics: [
      'Sophisticated AI strategy integrated with business goals',
      'Advanced data architecture and governance',
      'AI-first organizational culture and capabilities',
      'State-of-the-art technological infrastructure',
      'Proactive risk management and compliance',
    ],
  },
];

export const ASSESSMENT_SECTIONS: AssessmentSection[] = [
  {
    id: 'strategicLeadership',
    title: 'Strategic Leadership',
    description: 'Evaluates your organization\'s executive leadership understanding of AI, their commitment to AI transformation, and their ability to articulate and execute on a compelling AI vision.',
    importance: 'Strong leadership is the cornerstone of successful AI transformation. Without executive commitment and strategic vision, AI initiatives lack direction, resources, and organizational buy-in necessary for success.',
    whatItAssesses: 'This dimension assesses executive AI literacy, strategic vision, investment commitment, governance structures, and leadership\'s ability to drive AI-enabled organizational change.',
    icon: 'Crown',
    questions: [],
  },
  {
    id: 'useCasePortfolio',
    title: 'Use Case Portfolio',
    description: 'Assesses your organization\'s ability to identify, prioritize, and execute AI use cases that deliver tangible business value, from quick wins to transformational initiatives.',
    importance: 'A well-managed portfolio of AI use cases ensures that initiatives are aligned with business priorities, resources are optimally allocated, and the organization achieves both short-term wins and long-term transformation.',
    whatItAssesses: 'This dimension evaluates use case discovery processes, prioritization frameworks, pilot-to-production pathways, and portfolio management capabilities.',
    icon: 'Briefcase',
    questions: [],
  },
  {
    id: 'dataFoundation',
    title: 'Data Foundation',
    description: 'Evaluates the quality, accessibility, governance, and management of your organization\'s data assets - the fundamental fuel for AI success.',
    importance: 'AI systems are only as good as the data they learn from. Poor data quality, accessibility issues, or lack of governance can severely limit AI effectiveness and create significant risks.',
    whatItAssesses: 'This dimension assesses data quality, accessibility, governance frameworks, architecture maturity, and data management processes critical for AI.',
    icon: 'Database',
    questions: [],
  },
  {
    id: 'techInfrastructure',
    title: 'Technology Infrastructure',
    description: 'Assesses your organization\'s technological capabilities including cloud infrastructure, computing resources, platforms, and integration capabilities necessary for AI implementation.',
    importance: 'Technology infrastructure forms the backbone of any AI initiative. Without adequate computing power, storage, scalability, and integration capabilities, even the best AI models cannot function effectively.',
    whatItAssesses: 'This dimension evaluates cloud maturity, computational resources, scalability, DevOps practices, and ML platform capabilities.',
    icon: 'Server',
    questions: [],
  },
  {
    id: 'governanceRisk',
    title: 'Governance & Risk',
    description: 'Examines your organization\'s approach to AI governance, risk management, regulatory compliance, and security measures to ensure responsible and safe AI deployment.',
    importance: 'AI introduces new risks around security, privacy, compliance, and operational integrity. Robust governance and risk management frameworks are essential to protect the organization and ensure sustainable AI operations.',
    whatItAssesses: 'This dimension assesses compliance readiness, security frameworks, risk management processes, model governance, and incident response capabilities.',
    icon: 'Shield',
    questions: [],
  },
  {
    id: 'responsibleAI',
    title: 'Responsible AI',
    description: 'Evaluates your organization\'s commitment to ethical AI practices including fairness, transparency, accountability, and bias mitigation to ensure AI systems are developed and deployed responsibly.',
    importance: 'Responsible AI practices are critical to building trust, avoiding harm, and ensuring AI systems benefit all stakeholders. Ethical failures can result in reputational damage, legal liability, and loss of customer trust.',
    whatItAssesses: 'This dimension evaluates ethics frameworks, bias mitigation practices, transparency mechanisms, accountability structures, and stakeholder impact assessment processes.',
    icon: 'Heart',
    questions: [],
  },
  {
    id: 'peopleSkills',
    title: 'People & Skills',
    description: 'Assesses your organization\'s AI talent capabilities, skills development programs, and ability to attract, develop, and retain AI expertise across the workforce.',
    importance: 'AI success depends on having the right people with the right skills. Without adequate talent and continuous upskilling, organizations cannot develop, deploy, or maintain AI systems effectively.',
    whatItAssesses: 'This dimension evaluates AI skills inventory, training programs, talent acquisition strategies, data literacy, and knowledge management practices.',
    icon: 'Users',
    questions: [],
  },
  {
    id: 'changeManagement',
    title: 'Change Management',
    description: 'Evaluates your organization\'s cultural readiness for AI transformation, including adaptability, learning culture, innovation mindset, and ability to manage organizational change effectively.',
    importance: 'AI transformation requires significant organizational change. Without effective change management and a supportive culture, even technically sound AI initiatives will face resistance and fail to deliver value.',
    whatItAssesses: 'This dimension assesses learning culture, change management capabilities, cross-functional collaboration, innovation practices, and employee engagement approaches.',
    icon: 'Repeat',
    questions: [],
  },
  {
    id: 'valueRealization',
    title: 'Value Realization',
    description: 'Assesses your organization\'s ability to measure, track, and realize tangible business value from AI investments, including ROI tracking, benefits realization, and continuous optimization.',
    importance: 'AI investments must deliver measurable business value. Without rigorous value tracking and optimization, organizations risk wasting resources on initiatives that don\'t contribute to strategic objectives.',
    whatItAssesses: 'This dimension evaluates measurement frameworks, business case development, ROI tracking, benefits realization processes, and value optimization practices.',
    icon: 'TrendingUp',
    questions: [],
  },
];

export const WEIGHT_CONFIG = {
  strategicLeadership: 0.12,
  useCasePortfolio: 0.10,
  dataFoundation: 0.15,
  techInfrastructure: 0.12,
  governanceRisk: 0.12,
  responsibleAI: 0.10,
  peopleSkills: 0.12,
  changeManagement: 0.10,
  valueRealization: 0.07,
};

export function getReadinessLevel(score: number): ReadinessLevel {
  return READINESS_LEVELS.find(
    (level) => score >= level.range[0] && score <= level.range[1]
  ) || READINESS_LEVELS[0];
}

export function calculateSectionScore(
  answers: Record<string, number>, 
  sectionId: string,
  sections: AssessmentSection[] = ASSESSMENT_SECTIONS
): number {
  const section = sections.find(s => s.id === sectionId);
  if (!section) return 0;

  const questionIds = section.questions.map(q => q.id);
  const sectionAnswers = questionIds.map(id => answers[id] || 0);
  
  if (sectionAnswers.length === 0) return 0;
  
  const sum = sectionAnswers.reduce((acc, val) => acc + val, 0);
  return sum / sectionAnswers.length;
}

export function calculateOverallScore(scores: {
  strategicLeadership: number;
  useCasePortfolio: number;
  dataFoundation: number;
  techInfrastructure: number;
  governanceRisk: number;
  responsibleAI: number;
  peopleSkills: number;
  changeManagement: number;
  valueRealization: number;
}): number {
  return (
    scores.strategicLeadership * WEIGHT_CONFIG.strategicLeadership +
    scores.useCasePortfolio * WEIGHT_CONFIG.useCasePortfolio +
    scores.dataFoundation * WEIGHT_CONFIG.dataFoundation +
    scores.techInfrastructure * WEIGHT_CONFIG.techInfrastructure +
    scores.governanceRisk * WEIGHT_CONFIG.governanceRisk +
    scores.responsibleAI * WEIGHT_CONFIG.responsibleAI +
    scores.peopleSkills * WEIGHT_CONFIG.peopleSkills +
    scores.changeManagement * WEIGHT_CONFIG.changeManagement +
    scores.valueRealization * WEIGHT_CONFIG.valueRealization
  );
}
