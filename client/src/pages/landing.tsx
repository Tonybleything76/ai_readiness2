import { Link } from 'wouter';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { ArrowRight, CheckCircle2, Brain, TrendingUp, Database, Cpu, Shield, Heart, Users, RefreshCw, Target } from 'lucide-react';

export function Landing() {
  const nineDimensions = [
    {
      id: 'strategic-leadership',
      title: 'Strategic Leadership and Vision',
      icon: Brain,
      description: 'Executive understanding of AI potential, strategic alignment, and leadership capability to drive AI transformation.',
    },
    {
      id: 'use-case-portfolio',
      title: 'AI Use Case Portfolio and Prioritization',
      icon: TrendingUp,
      description: 'Ability to identify, evaluate, and prioritize AI opportunities that deliver measurable business value.',
    },
    {
      id: 'data-foundation',
      title: 'Data Foundation and Quality',
      icon: Database,
      description: 'Data infrastructure, governance, and quality management that serve as the foundation for AI success.',
    },
    {
      id: 'tech-infrastructure',
      title: 'Technology Infrastructure and MLOps',
      icon: Cpu,
      description: 'Technical capabilities to support AI development, deployment, and operations at scale.',
    },
    {
      id: 'governance-risk',
      title: 'Governance, Risk, and Security',
      icon: Shield,
      description: 'Frameworks for managing AI-related risks, ensuring compliance, and maintaining governance oversight.',
    },
    {
      id: 'responsible-ai',
      title: 'Responsible AI and Ethics',
      icon: Heart,
      description: 'Commitment to and capability for implementing ethical AI practices that ensure fair, transparent, and accountable systems.',
    },
    {
      id: 'people-skills',
      title: 'People, Skills, and Operating Model',
      icon: Users,
      description: 'Human capital capabilities, AI skills, and organizational structures that support AI adoption.',
    },
    {
      id: 'change-management',
      title: 'Change Management and Adoption',
      icon: RefreshCw,
      description: 'Capability to manage organizational changes, stakeholder engagement, and training for AI transformation.',
    },
    {
      id: 'value-realization',
      title: 'Value Realization and Measurement',
      icon: Target,
      description: 'Ability to measure, track, and optimize business value delivered by AI initiatives.',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-6xl mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent" data-testid="text-hero-title">
            Unlock Your AI Advantage
          </h1>
          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto" data-testid="text-hero-description">
            Get a detailed, 9-dimension scorecard, executive report, and AI roadmap. Choose the free preview or the full assessment with expert analysis.
          </p>
          
          {/* Main CTAs */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center max-w-2xl mx-auto mb-8">
            <Link href="/assessment?tier=full" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white" size="lg" data-testid="button-start-full-assessment">
                Start Full Readiness Assessment
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/assessment?tier=free" className="w-full sm:w-auto">
              <Button variant="outline" className="w-full sm:w-auto border-2 border-blue-600 text-blue-600 hover:bg-blue-100 hover:text-blue-700" size="lg" data-testid="button-take-free-assessment">
                Preview With Free 25-Question Assessment
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
          
          <div className="text-center">
            <Link href="/overview" className="text-blue-600 hover:text-blue-700 underline text-sm" data-testid="link-learn-more">
              Learn more about your full assessment options
            </Link>
          </div>
        </div>

        {/* Benefits Overview */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8" data-testid="text-benefits-title">
            Why Complete the AI Readiness Assessment?
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card data-testid="card-benefit-1">
              <CardHeader>
                <CardTitle>Identify Your Starting Point</CardTitle>
                <CardDescription>
                  Understand your current AI maturity level and where you stand compared to industry benchmarks.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card data-testid="card-benefit-2">
              <CardHeader>
                <CardTitle>Prioritize Your Investments</CardTitle>
                <CardDescription>
                  Get clear guidance on which areas need attention first to maximize your AI success.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card data-testid="card-benefit-3">
              <CardHeader>
                <CardTitle>Build Your AI Strategy</CardTitle>
                <CardDescription>
                  Use your results as the foundation for creating a comprehensive AI transformation roadmap.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </section>

        {/* Nine Dimensions Methodology */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-4" data-testid="text-methodology-title">
            Our Comprehensive 9-Dimension Framework
          </h2>
          <p className="text-center text-gray-600 mb-8 max-w-3xl mx-auto" data-testid="text-methodology-description">
            Based on extensive analysis of leading frameworks from premier consulting firms and research institutions, our assessment evaluates nine critical dimensions that determine AI readiness. This comprehensive approach ensures you understand all aspects of your organization's preparedness for successful AI transformation.
          </p>
          <div className="space-y-4">
            {nineDimensions.map((dimension) => {
              const IconComponent = dimension.icon;
              return (
                <Card key={dimension.id} data-testid={`card-dimension-${dimension.id}`}>
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-lg bg-blue-100 flex-shrink-0">
                        <IconComponent className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="mb-2">{dimension.title}</CardTitle>
                        <CardDescription className="text-base">
                          {dimension.description}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Assessment Tiers Comparison */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8" data-testid="text-tiers-title">
            Choose Your Assessment Level
          </h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="border-2 hover:border-blue-500 transition-colors" data-testid="card-free-tier">
              <CardHeader>
                <CardTitle className="text-2xl">Free Preview</CardTitle>
                <CardDescription className="text-lg">Quick snapshot of your readiness</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-blue-600">25</span>
                    <span className="text-gray-600">questions</span>
                  </div>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                      <span>Basic coverage of 9 dimensions</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                      <span>High-level readiness score</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                      <span>~10 minutes to complete</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                      <span>Instant basic results</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-indigo-500 bg-gradient-to-br from-indigo-50 to-blue-50 hover:border-indigo-600 transition-colors" data-testid="card-full-tier">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CardTitle className="text-2xl">Full Readiness Assessment</CardTitle>
                  <span className="px-2 py-1 bg-indigo-600 text-white text-xs rounded-full">Recommended</span>
                </div>
                <CardDescription className="text-lg">Comprehensive analysis with expert recommendations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-indigo-600">90</span>
                    <span className="text-gray-600">questions</span>
                  </div>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                      <span><strong>Detailed 9-dimension scorecard</strong> with deep insights</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                      <span><strong>Executive summary report</strong> ready for leadership</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                      <span><strong>Prioritized AI roadmap</strong> with actionable next steps</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                      <span><strong>Industry benchmarking</strong> to see how you compare</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                      <span>~30 minutes to complete</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Final CTA */}
        <div className="text-center bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-12 text-white">
          <h2 className="text-3xl font-bold mb-4" data-testid="text-final-cta-title">
            Ready to Understand Your AI Readiness?
          </h2>
          <p className="text-xl mb-8 opacity-90" data-testid="text-final-cta-description">
            Take the first step toward successful AI transformation today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/assessment?tier=free">
              <Button size="lg" variant="outline" className="text-blue-600 bg-white hover:bg-gray-100 text-lg px-8" data-testid="button-final-cta-free">
                Start Free Assessment
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/pricing">
              <Button size="lg" variant="outline" className="text-indigo-600 bg-white hover:bg-gray-100 border-2 text-lg px-8" data-testid="button-final-cta-full">
                View Full Assessment Options
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
