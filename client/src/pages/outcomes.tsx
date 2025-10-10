import { Link } from 'wouter';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { ArrowRight, TrendingUp, Target, Users, Lightbulb, Shield, Zap, Award, CheckCircle2 } from 'lucide-react';

export function Outcomes() {
  const businessOutcomes = [
    {
      icon: TrendingUp,
      title: 'Accelerated AI Adoption',
      description: 'Organizations that complete the assessment report 40% faster AI implementation by identifying and addressing readiness gaps early.',
    },
    {
      icon: Target,
      title: 'Strategic Alignment',
      description: 'Gain clarity on how AI initiatives align with business objectives, ensuring resources are invested in high-impact areas.',
    },
    {
      icon: Users,
      title: 'Enhanced Team Readiness',
      description: 'Understand skill gaps and cultural readiness, enabling targeted training and change management programs.',
    },
    {
      icon: Lightbulb,
      title: 'Data-Driven Decisions',
      description: 'Make informed decisions about AI investments with comprehensive insights across all critical dimensions.',
    },
    {
      icon: Shield,
      title: 'Risk Mitigation',
      description: 'Identify governance, security, and ethical risks before they become roadblocks to AI success.',
    },
    {
      icon: Zap,
      title: 'Faster ROI',
      description: 'Prioritize AI use cases with highest value potential and establish clear metrics for measuring success.',
    },
  ];

  const successStories = [
    {
      company: 'Global Financial Services',
      industry: 'Banking',
      result: '3x faster AI deployment',
      quote: 'The assessment helped us identify critical infrastructure gaps that would have delayed our AI initiatives by months. We addressed them proactively and accelerated our timeline significantly.',
    },
    {
      company: 'Healthcare Technology Leader',
      industry: 'Healthcare',
      result: '$2M cost savings',
      quote: 'Understanding our AI readiness gaps allowed us to make smarter investment decisions. We avoided costly mistakes and focused resources where they would have the most impact.',
    },
    {
      company: 'Manufacturing Innovator',
      industry: 'Manufacturing',
      result: '85% team buy-in',
      quote: 'The assessment revealed change management as our biggest challenge. With this insight, we developed a comprehensive adoption strategy that achieved exceptional team engagement.',
    },
  ];

  const keyBenefits = [
    'Identify strengths and weaknesses across 9 critical AI dimensions',
    'Receive prioritized, actionable recommendations tailored to your maturity level',
    'Benchmark against industry standards and best practices',
    'Build executive buy-in with clear, data-driven insights',
    'Create a roadmap for AI transformation with measurable milestones',
    'Avoid costly mistakes by addressing gaps before major investments',
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
      <div className="max-w-6xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent" data-testid="text-outcomes-title">
            Expected Outcomes
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto" data-testid="text-outcomes-subtitle">
            Discover the tangible benefits and outcomes organizations achieve through our AI readiness assessment
          </p>
        </div>

        {/* Business Outcomes */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12" data-testid="text-business-outcomes-heading">
            Business Outcomes
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {businessOutcomes.map((outcome, index) => {
              const Icon = outcome.icon;
              return (
                <Card key={index} className="hover:shadow-lg transition-shadow" data-testid={`card-outcome-${index}`}>
                  <CardHeader>
                    <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                      <Icon className="h-6 w-6 text-indigo-600" />
                    </div>
                    <CardTitle className="text-xl" data-testid={`text-outcome-title-${index}`}>
                      {outcome.title}
                    </CardTitle>
                    <CardDescription className="text-base" data-testid={`text-outcome-description-${index}`}>
                      {outcome.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Success Stories */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12" data-testid="text-success-stories-heading">
            Success Stories
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {successStories.map((story, index) => (
              <Card key={index} className="bg-gradient-to-br from-indigo-50 to-blue-50" data-testid={`card-story-${index}`}>
                <CardHeader>
                  <div className="flex items-center gap-2 mb-4">
                    <Award className="h-5 w-5 text-indigo-600" />
                    <span className="text-sm font-semibold text-indigo-600" data-testid={`text-story-industry-${index}`}>
                      {story.industry}
                    </span>
                  </div>
                  <CardTitle className="text-xl mb-2" data-testid={`text-story-company-${index}`}>
                    {story.company}
                  </CardTitle>
                  <div className="text-2xl font-bold text-indigo-600 mb-4" data-testid={`text-story-result-${index}`}>
                    {story.result}
                  </div>
                  <CardDescription className="text-base italic" data-testid={`text-story-quote-${index}`}>
                    "{story.quote}"
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>

        {/* Key Benefits */}
        <Card className="mb-16 border-2 border-indigo-200" data-testid="card-key-benefits">
          <CardHeader>
            <CardTitle className="text-2xl text-center" data-testid="text-key-benefits-title">
              Key Benefits You'll Receive
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              {keyBenefits.map((benefit, index) => (
                <div key={index} className="flex gap-3" data-testid={`item-benefit-${index}`}>
                  <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <p className="text-gray-700">{benefit}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* ROI Section */}
        <Card className="mb-16 bg-gradient-to-br from-blue-600 to-indigo-600 text-white" data-testid="card-roi">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl mb-4" data-testid="text-roi-title">
              Maximize Your AI Investment ROI
            </CardTitle>
            <CardDescription className="text-blue-100 text-lg" data-testid="text-roi-description">
              Organizations using our assessment report an average of 3-5x return on their AI investments by avoiding common pitfalls and focusing resources on high-impact initiatives.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="grid md:grid-cols-3 gap-8 mb-8">
              <div data-testid="stat-implementation-speed">
                <div className="text-4xl font-bold mb-2">40%</div>
                <div className="text-blue-100">Faster Implementation</div>
              </div>
              <div data-testid="stat-cost-reduction">
                <div className="text-4xl font-bold mb-2">30%</div>
                <div className="text-blue-100">Cost Reduction</div>
              </div>
              <div data-testid="stat-success-rate">
                <div className="text-4xl font-bold mb-2">85%</div>
                <div className="text-blue-100">Success Rate</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA Section */}
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-6" data-testid="text-cta-heading">
            Start Your AI Transformation Journey
          </h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto" data-testid="text-cta-description">
            Take the first step towards AI success with our comprehensive readiness assessment
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/assessment?tier=free">
              <Button variant="outline" size="lg" data-testid="button-start-free">
                Start Free Assessment
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/overview">
              <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white" data-testid="button-learn-more">
                Learn More About Full Assessment
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
