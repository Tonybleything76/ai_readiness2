import { Link } from 'wouter';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Server, Database, Users, Target, Shield, CheckCircle2, ArrowRight } from 'lucide-react';
import { READINESS_LEVELS, ASSESSMENT_SECTIONS } from '../../../shared/assessment-data';

export function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-6xl mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent" data-testid="text-hero-title">
            AI Readiness Assessment
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto" data-testid="text-hero-description">
            Evaluate your organization's preparedness for AI adoption across five critical dimensions. 
            Get detailed insights, actionable recommendations, and understand where you stand on your AI journey.
          </p>
          <Link href="/assessment">
            <Button size="lg" className="text-lg px-8" data-testid="button-start-assessment">
              Start Assessment
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>

        {/* How It Works */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8" data-testid="text-how-it-works-title">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card data-testid="card-step-1">
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                  <span className="text-2xl font-bold text-blue-600">1</span>
                </div>
                <CardTitle>Answer Questions</CardTitle>
                <CardDescription>
                  Complete 20 questions across five key areas of AI readiness. Each question takes about 30 seconds.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card data-testid="card-step-2">
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                  <span className="text-2xl font-bold text-blue-600">2</span>
                </div>
                <CardTitle>Get Your Score</CardTitle>
                <CardDescription>
                  Receive detailed scores for each dimension and an overall AI readiness rating from "Getting Started" to "AI Ready".
                </CardDescription>
              </CardHeader>
            </Card>
            <Card data-testid="card-step-3">
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                  <span className="text-2xl font-bold text-blue-600">3</span>
                </div>
                <CardTitle>Take Action</CardTitle>
                <CardDescription>
                  Use your results to prioritize improvements, build your AI strategy, and track progress over time.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </section>

        {/* Assessment Sections Overview */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-4" data-testid="text-sections-title">Assessment Areas</h2>
          <p className="text-center text-gray-600 mb-8 max-w-2xl mx-auto" data-testid="text-sections-description">
            The assessment evaluates five critical dimensions that determine your organization's AI readiness
          </p>
          <div className="space-y-6">
            {ASSESSMENT_SECTIONS.map((section) => {
              const IconComponent = {
                Server,
                Database,
                Users,
                Target,
                Shield,
              }[section.icon] || Server;

              return (
                <Card key={section.id} data-testid={`card-section-${section.id}`}>
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-lg bg-blue-100">
                        <IconComponent className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="mb-2">{section.title}</CardTitle>
                        <CardDescription className="text-base mb-3">
                          {section.description}
                        </CardDescription>
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="font-semibold text-gray-700">Why It Matters:</span>
                            <p className="text-gray-600 mt-1">{section.importance}</p>
                          </div>
                          <div>
                            <span className="font-semibold text-gray-700">What We Assess:</span>
                            <p className="text-gray-600 mt-1">{section.whatItAssesses}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Readiness Levels */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-4" data-testid="text-levels-title">Readiness Levels</h2>
          <p className="text-center text-gray-600 mb-8 max-w-2xl mx-auto" data-testid="text-levels-description">
            Your assessment score will place you in one of four readiness levels, each with specific characteristics and recommended next steps
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            {READINESS_LEVELS.map((level) => (
              <Card 
                key={level.name} 
                className="border-l-4" 
                style={{ borderLeftColor: level.color }}
                data-testid={`card-level-${level.name.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: level.color }} />
                    {level.name}
                    <span className="text-sm font-normal text-gray-500">
                      ({level.range[0]}-{level.range[1]}%)
                    </span>
                  </CardTitle>
                  <CardDescription className="text-base pt-2">
                    {level.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="font-semibold text-sm text-gray-700">Key Characteristics:</p>
                    <ul className="space-y-1">
                      {level.characteristics.map((char, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                          <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>{char}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Scoring Methodology */}
        <section className="mb-16">
          <Card data-testid="card-methodology">
            <CardHeader>
              <CardTitle>How We Calculate Your Score</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">
                Your overall AI readiness score is calculated using a weighted average of your scores across the five assessment dimensions:
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">Data Management & Quality</span>
                  <span className="text-blue-600 font-bold">25%</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">Technology Infrastructure</span>
                  <span className="text-blue-600 font-bold">20%</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">Organizational Culture</span>
                  <span className="text-blue-600 font-bold">20%</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">Strategy & Planning</span>
                  <span className="text-blue-600 font-bold">20%</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">Risk & Compliance</span>
                  <span className="text-blue-600 font-bold">15%</span>
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-4">
                Data Management receives the highest weight because quality data is the foundation of successful AI implementation. 
                Without strong data practices, even the best technology and strategy will struggle to deliver value.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* CTA */}
        <div className="text-center bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-12 text-white">
          <h2 className="text-3xl font-bold mb-4" data-testid="text-cta-title">Ready to Get Started?</h2>
          <p className="text-xl mb-8 opacity-90" data-testid="text-cta-description">
            The assessment takes approximately 10 minutes to complete. You'll receive your results immediately.
          </p>
          <Link href="/assessment">
            <Button size="lg" variant="outline" className="text-blue-600 bg-white hover:bg-gray-100 text-lg px-8" data-testid="button-cta-start">
              Begin Your Assessment
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
