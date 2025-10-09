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
    id: 'technology',
    title: 'Technology Infrastructure',
    description: 'Evaluates your organization\'s technological capabilities, including cloud infrastructure, computing resources, data storage systems, and integration capabilities necessary for AI implementation.',
    importance: 'Technology infrastructure forms the backbone of any AI initiative. Without adequate computing power, storage, and integration capabilities, even the best AI models cannot function effectively. This section identifies whether your current technology stack can support AI workloads.',
    whatItAssesses: 'This section assesses your cloud maturity, computational resources, data storage architecture, API capabilities, and ability to integrate AI tools with existing systems.',
    icon: 'Server',
    questions: [
      {
        id: 'tech_1',
        text: 'How would you describe your organization\'s cloud infrastructure maturity?',
        options: [
          { value: 0, label: 'No cloud infrastructure - entirely on-premises' },
          { value: 25, label: 'Basic cloud adoption - some workloads migrated' },
          { value: 50, label: 'Hybrid cloud - mixed on-premises and cloud' },
          { value: 75, label: 'Cloud-first - most workloads in the cloud' },
          { value: 100, label: 'Cloud-native - fully optimized cloud architecture' },
        ],
      },
      {
        id: 'tech_2',
        text: 'What computational resources do you have available for AI/ML workloads?',
        options: [
          { value: 0, label: 'No dedicated computational resources' },
          { value: 25, label: 'Basic CPU resources only' },
          { value: 50, label: 'Some GPU/TPU access available' },
          { value: 75, label: 'Dedicated GPU/TPU infrastructure' },
          { value: 100, label: 'Advanced distributed computing with AI accelerators' },
        ],
      },
      {
        id: 'tech_3',
        text: 'How mature is your data storage and database infrastructure?',
        options: [
          { value: 0, label: 'Legacy systems with limited scalability' },
          { value: 25, label: 'Traditional databases, some modernization' },
          { value: 50, label: 'Mix of traditional and modern data stores' },
          { value: 75, label: 'Modern cloud-based data lakes and warehouses' },
          { value: 100, label: 'Advanced multi-modal data infrastructure' },
        ],
      },
      {
        id: 'tech_4',
        text: 'How would you rate your API and integration capabilities?',
        options: [
          { value: 0, label: 'No API infrastructure' },
          { value: 25, label: 'Basic APIs for limited use cases' },
          { value: 50, label: 'RESTful APIs with good documentation' },
          { value: 75, label: 'Modern API gateway with microservices' },
          { value: 100, label: 'Advanced event-driven architecture with real-time integration' },
        ],
      },
    ],
  },
  {
    id: 'dataManagement',
    title: 'Data Management & Quality',
    description: 'Assesses your data readiness including quality, accessibility, governance policies, and the processes you have in place for managing and utilizing data effectively.',
    importance: 'AI systems are only as good as the data they learn from. Poor data quality, accessibility issues, or lack of governance can severely limit AI effectiveness and create significant risks. This section determines if your data is AI-ready.',
    whatItAssesses: 'This section evaluates data quality standards, accessibility across the organization, governance frameworks, documentation practices, and your ability to prepare data for AI consumption.',
    icon: 'Database',
    questions: [
      {
        id: 'data_1',
        text: 'How would you rate the overall quality of your organizational data?',
        options: [
          { value: 0, label: 'Poor quality - significant errors and inconsistencies' },
          { value: 25, label: 'Below average - frequent data quality issues' },
          { value: 50, label: 'Moderate - acceptable quality with some issues' },
          { value: 75, label: 'Good - high quality with minor issues' },
          { value: 100, label: 'Excellent - comprehensive quality management' },
        ],
      },
      {
        id: 'data_2',
        text: 'How accessible is data across your organization?',
        options: [
          { value: 0, label: 'Highly siloed - data trapped in departments' },
          { value: 25, label: 'Mostly siloed - limited sharing' },
          { value: 50, label: 'Partially integrated - some data sharing' },
          { value: 75, label: 'Well integrated - good cross-functional access' },
          { value: 100, label: 'Fully democratized - comprehensive data access' },
        ],
      },
      {
        id: 'data_3',
        text: 'What level of data governance do you have in place?',
        options: [
          { value: 0, label: 'No formal governance' },
          { value: 25, label: 'Basic policies being developed' },
          { value: 50, label: 'Governance framework in place' },
          { value: 75, label: 'Mature governance with active enforcement' },
          { value: 100, label: 'Advanced governance with automation and monitoring' },
        ],
      },
      {
        id: 'data_4',
        text: 'How well documented and catalogued is your data?',
        options: [
          { value: 0, label: 'No documentation or cataloguing' },
          { value: 25, label: 'Limited documentation for critical data' },
          { value: 50, label: 'Basic data catalogue in place' },
          { value: 75, label: 'Comprehensive metadata management' },
          { value: 100, label: 'Advanced data cataloguing with lineage tracking' },
        ],
      },
    ],
  },
  {
    id: 'organizationalCulture',
    title: 'Organizational Culture & Skills',
    description: 'Evaluates your organization\'s cultural readiness for AI, including leadership support, team skills, learning culture, and change management capabilities.',
    importance: 'Technology alone doesn\'t drive AI success - people and culture do. Without leadership buy-in, necessary skills, and a culture that embraces change and experimentation, AI initiatives are likely to fail. This section assesses your human readiness for AI.',
    whatItAssesses: 'This section examines leadership commitment to AI, availability of AI skills and expertise, learning and development programs, change management capabilities, and overall organizational adaptability.',
    icon: 'Users',
    questions: [
      {
        id: 'culture_1',
        text: 'How strong is executive leadership support for AI initiatives?',
        options: [
          { value: 0, label: 'No awareness or interest from leadership' },
          { value: 25, label: 'Minimal interest - low priority' },
          { value: 50, label: 'Moderate support - acknowledged importance' },
          { value: 75, label: 'Strong support - actively championed' },
          { value: 100, label: 'Full commitment - strategic imperative with resources' },
        ],
      },
      {
        id: 'culture_2',
        text: 'What is the current level of AI skills in your organization?',
        options: [
          { value: 0, label: 'No AI skills or expertise' },
          { value: 25, label: 'Limited skills - few individuals with basic knowledge' },
          { value: 50, label: 'Developing capabilities - small team building skills' },
          { value: 75, label: 'Solid expertise - dedicated AI/ML team' },
          { value: 100, label: 'Advanced capabilities - centers of excellence' },
        ],
      },
      {
        id: 'culture_3',
        text: 'How would you describe your organizational learning culture?',
        options: [
          { value: 0, label: 'Resistant to change - traditional approaches preferred' },
          { value: 25, label: 'Slow to adopt - cautious about new approaches' },
          { value: 50, label: 'Moderately adaptive - open to learning' },
          { value: 75, label: 'Learning-oriented - continuous improvement mindset' },
          { value: 100, label: 'Innovation-driven - experimentation encouraged' },
        ],
      },
      {
        id: 'culture_4',
        text: 'How effective is your change management capability?',
        options: [
          { value: 0, label: 'No change management processes' },
          { value: 25, label: 'Ad-hoc approach to change' },
          { value: 50, label: 'Basic change management framework' },
          { value: 75, label: 'Structured change management with proven success' },
          { value: 100, label: 'Agile change management - highly effective' },
        ],
      },
    ],
  },
  {
    id: 'strategyPlanning',
    title: 'Strategy & Planning',
    description: 'Assesses whether you have a clear AI strategy, defined use cases, implementation roadmap, and alignment with business objectives.',
    importance: 'Without a clear strategy, AI projects become disconnected experiments that fail to deliver business value. Strategic planning ensures AI investments align with business goals and deliver measurable ROI. This section evaluates your strategic approach to AI.',
    whatItAssesses: 'This section reviews your AI strategy maturity, identification of business use cases, roadmap development, success metrics, and alignment between AI initiatives and overall business strategy.',
    icon: 'Target',
    questions: [
      {
        id: 'strategy_1',
        text: 'Do you have a documented AI strategy?',
        options: [
          { value: 0, label: 'No AI strategy exists' },
          { value: 25, label: 'Informal discussions about AI' },
          { value: 50, label: 'Strategy being developed' },
          { value: 75, label: 'Documented strategy with clear objectives' },
          { value: 100, label: 'Comprehensive strategy integrated with business goals' },
        ],
      },
      {
        id: 'strategy_2',
        text: 'How well have you identified and prioritized AI use cases?',
        options: [
          { value: 0, label: 'No use cases identified' },
          { value: 25, label: 'Generic use cases with no prioritization' },
          { value: 50, label: 'Some use cases identified and prioritized' },
          { value: 75, label: 'Well-defined use cases with business cases' },
          { value: 100, label: 'Portfolio of use cases with clear ROI and priorities' },
        ],
      },
      {
        id: 'strategy_3',
        text: 'How developed is your AI implementation roadmap?',
        options: [
          { value: 0, label: 'No roadmap exists' },
          { value: 25, label: 'High-level vision with no timeline' },
          { value: 50, label: 'Basic roadmap with milestones' },
          { value: 75, label: 'Detailed roadmap with resources allocated' },
          { value: 100, label: 'Agile roadmap with regular updates and tracking' },
        ],
      },
      {
        id: 'strategy_4',
        text: 'How do you measure success for AI initiatives?',
        options: [
          { value: 0, label: 'No success metrics defined' },
          { value: 25, label: 'Technical metrics only' },
          { value: 50, label: 'Mix of technical and business metrics' },
          { value: 75, label: 'Clear business KPIs for each initiative' },
          { value: 100, label: 'Comprehensive measurement framework with ROI tracking' },
        ],
      },
    ],
  },
  {
    id: 'riskCompliance',
    title: 'Risk & Compliance',
    description: 'Examines your approach to AI ethics, regulatory compliance, security measures, and risk management practices to ensure responsible AI deployment.',
    importance: 'AI introduces new risks around bias, privacy, security, and regulatory compliance. Organizations must proactively address these risks to avoid legal issues, reputational damage, and ethical concerns. This section assesses your risk management maturity.',
    whatItAssesses: 'This section evaluates your understanding of AI risks, ethical guidelines, regulatory compliance readiness, security measures, bias detection and mitigation, and overall risk management framework for AI.',
    icon: 'Shield',
    questions: [
      {
        id: 'risk_1',
        text: 'How mature is your AI ethics framework?',
        options: [
          { value: 0, label: 'No consideration of AI ethics' },
          { value: 25, label: 'Aware of ethical issues but no framework' },
          { value: 50, label: 'Basic ethical guidelines being developed' },
          { value: 75, label: 'Formal ethics framework in place' },
          { value: 100, label: 'Comprehensive ethics governance with oversight' },
        ],
      },
      {
        id: 'risk_2',
        text: 'How prepared are you for AI-related regulatory compliance?',
        options: [
          { value: 0, label: 'Unaware of relevant regulations' },
          { value: 25, label: 'Aware but no compliance measures' },
          { value: 50, label: 'Understanding regulations, planning compliance' },
          { value: 75, label: 'Compliance program in development' },
          { value: 100, label: 'Full compliance with monitoring and auditing' },
        ],
      },
      {
        id: 'risk_3',
        text: 'What security measures are in place for AI systems?',
        options: [
          { value: 0, label: 'No specific security for AI' },
          { value: 25, label: 'Standard IT security applied' },
          { value: 50, label: 'Some AI-specific security measures' },
          { value: 75, label: 'Comprehensive AI security framework' },
          { value: 100, label: 'Advanced security with continuous monitoring' },
        ],
      },
      {
        id: 'risk_4',
        text: 'How do you address bias and fairness in AI?',
        options: [
          { value: 0, label: 'No consideration of bias' },
          { value: 25, label: 'Aware of bias issues but no processes' },
          { value: 50, label: 'Basic bias testing in development' },
          { value: 75, label: 'Systematic bias detection and mitigation' },
          { value: 100, label: 'Continuous fairness monitoring with governance' },
        ],
      },
    ],
  },
];

export const WEIGHT_CONFIG = {
  technology: 0.20,
  dataManagement: 0.25,
  organizationalCulture: 0.20,
  strategyPlanning: 0.20,
  riskCompliance: 0.15,
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
  technology: number;
  dataManagement: number;
  organizationalCulture: number;
  strategyPlanning: number;
  riskCompliance: number;
}): number {
  return (
    scores.technology * WEIGHT_CONFIG.technology +
    scores.dataManagement * WEIGHT_CONFIG.dataManagement +
    scores.organizationalCulture * WEIGHT_CONFIG.organizationalCulture +
    scores.strategyPlanning * WEIGHT_CONFIG.strategyPlanning +
    scores.riskCompliance * WEIGHT_CONFIG.riskCompliance
  );
}
