import { Link } from 'wouter';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { ArrowRight, ClipboardList, BarChart3, FileText, CheckCircle2, Clock, Target } from 'lucide-react';

export function HowItWorks() {
  const steps = [
    {
      number: 1,
      icon: ClipboardList,
      title: 'Choose Your Assessment',
      description: 'Select between our free 25-question assessment or comprehensive 90-question evaluation based on your needs.',
      duration: '2 min',
    },
    {
      number: 2,
      icon: Target,
      title: 'Answer Questions',
      description: 'Respond to carefully crafted questions covering 9 critical dimensions of AI readiness, from strategy to implementation.',
      duration: '10-30 min',
    },
    {
      number: 3,
      icon: BarChart3,
      title: 'Get Your Score',
      description: 'Receive instant results with overall readiness score and detailed breakdown across all dimensions.',
      duration: 'Instant',
    },
    {
      number: 4,
      icon: FileText,
      title: 'Review Recommendations',
      description: 'Access personalized, actionable recommendations tailored to your organization\'s specific readiness level.',
      duration: '5-10 min',
    },
  ];

  const dimensions = [
    'Strategic Leadership and Vision',
    'AI Use Case Portfolio and Prioritization',
    'Data Foundation and Quality',
    'Technology Infrastructure and MLOps',
    'Governance, Risk, and Security',
    'Responsible AI and Ethics',
    'People, Skills, and Operating Model',
    'Change Management and Adoption',
    'Value Realization and Measurement',
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-6xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent" data-testid="text-how-it-works-title">
            How It Works
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto" data-testid="text-how-it-works-subtitle">
            Our AI readiness assessment is designed to be simple, comprehensive, and actionable. Here's how to get started.
          </p>
        </div>

        {/* Steps */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12" data-testid="text-process-heading">
            The Assessment Process
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <Card key={step.number} className="relative" data-testid={`card-step-${step.number}`}>
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Icon className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-semibold text-blue-600" data-testid={`text-step-number-${step.number}`}>
                            Step {step.number}
                          </span>
                          <span className="flex items-center gap-1 text-sm text-gray-500" data-testid={`text-duration-${step.number}`}>
                            <Clock className="h-4 w-4" />
                            {step.duration}
                          </span>
                        </div>
                        <CardTitle className="text-xl" data-testid={`text-step-title-${step.number}`}>
                          {step.title}
                        </CardTitle>
                      </div>
                    </div>
                    <CardDescription className="text-base mt-3" data-testid={`text-step-description-${step.number}`}>
                      {step.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </div>

        {/* 9 Dimensions */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-6" data-testid="text-dimensions-heading">
            9 Dimensions of AI Readiness
          </h2>
          <p className="text-gray-600 text-center mb-12 max-w-3xl mx-auto" data-testid="text-dimensions-description">
            Our assessment evaluates your organization across nine critical dimensions that determine AI success
          </p>
          <div className="grid md:grid-cols-3 gap-4">
            {dimensions.map((dimension, index) => (
              <Card key={index} className="border-l-4 border-l-blue-600" data-testid={`card-dimension-${index}`}>
                <CardHeader className="pb-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <CardTitle className="text-base" data-testid={`text-dimension-${index}`}>
                      {dimension}
                    </CardTitle>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>

        {/* What You Get */}
        <Card className="mb-16 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200" data-testid="card-what-you-get">
          <CardHeader>
            <CardTitle className="text-2xl" data-testid="text-what-you-get-title">
              What You'll Receive
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex gap-3" data-testid="item-overall-score">
                <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold mb-1">Overall Readiness Score</h3>
                  <p className="text-gray-600">Clear percentage score indicating your organization's AI maturity level</p>
                </div>
              </div>
              <div className="flex gap-3" data-testid="item-dimensional-breakdown">
                <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold mb-1">Dimensional Breakdown</h3>
                  <p className="text-gray-600">Detailed scores across all 9 dimensions to identify strengths and gaps</p>
                </div>
              </div>
              <div className="flex gap-3" data-testid="item-readiness-level">
                <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold mb-1">Readiness Level Classification</h3>
                  <p className="text-gray-600">Strategic insights on your current maturity stage and growth path</p>
                </div>
              </div>
              <div className="flex gap-3" data-testid="item-recommendations">
                <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold mb-1">Actionable Recommendations</h3>
                  <p className="text-gray-600">Prioritized next steps to advance your AI transformation journey</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA Section */}
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-6" data-testid="text-cta-heading">
            Ready to Assess Your AI Readiness?
          </h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto" data-testid="text-cta-description">
            Start with our free assessment or dive deep with the comprehensive evaluation
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/assessment?tier=free">
              <Button variant="outline" size="lg" data-testid="button-start-free">
                Start Free Assessment
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/pricing">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white" data-testid="button-view-pricing">
                View Pricing Options
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
