import { Link } from 'wouter';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { ArrowRight, CheckCircle2, Sparkles, Calendar } from 'lucide-react';

export function Pricing() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-6xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent" data-testid="text-pricing-title">
            Choose Your Assessment Plan
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto" data-testid="text-pricing-subtitle">
            Select the assessment level that best fits your organization's needs and AI transformation goals
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-16">
          {/* Free Tier */}
          <Card className="border-2 hover:border-blue-500 transition-colors" data-testid="card-pricing-free">
            <CardHeader>
              <CardTitle className="text-3xl">Free Assessment</CardTitle>
              <CardDescription className="text-lg">Perfect for getting started</CardDescription>
              <div className="mt-4">
                <span className="text-5xl font-bold text-blue-600">$0</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>25 questions across 9 dimensions</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>~10 minutes to complete</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Instant AI readiness score</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Dimensional breakdown</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Basic recommendations</span>
                </li>
              </ul>
              <Link href="/assessment?tier=free" className="block">
                <Button className="w-full" size="lg" data-testid="button-pricing-free">
                  Start Free Assessment
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Full Assessment */}
          <Card className="border-2 border-indigo-500 bg-gradient-to-br from-indigo-50 to-blue-50 relative" data-testid="card-pricing-full">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <span className="bg-indigo-600 text-white px-4 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                <Sparkles className="h-4 w-4" />
                Most Popular
              </span>
            </div>
            <CardHeader className="pt-8">
              <CardTitle className="text-3xl">Full Assessment</CardTitle>
              <CardDescription className="text-lg">Complete evaluation with deep insights</CardDescription>
              <div className="mt-4">
                <span className="text-5xl font-bold text-indigo-600">$499</span>
                <span className="text-gray-600 ml-2">per assessment</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span><strong>90 questions</strong> across all 9 dimensions</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>~30 minutes to complete</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Comprehensive AI readiness analysis</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Detailed dimensional scoring</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Prioritized action roadmap</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Executive summary PDF report</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Industry benchmarking</span>
                </li>
              </ul>
              <Link href="/assessment?tier=full" className="block">
                <Button className="w-full bg-indigo-600 hover:bg-indigo-700" size="lg" data-testid="button-pricing-full">
                  Start Full Assessment
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <p className="text-sm text-gray-600 text-center mt-3">
                No payment required - Try the full 90-question assessment now
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Enterprise/Custom Section */}
        <Card className="max-w-4xl mx-auto mb-16 border-2 border-blue-200" data-testid="card-pricing-enterprise">
          <CardHeader>
            <CardTitle className="text-2xl">Enterprise & Custom Solutions</CardTitle>
            <CardDescription className="text-lg">
              Tailored assessments for large organizations and specific industries
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">What's Included:</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                    <span>Custom question sets for your industry</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                    <span>Multiple team/department assessments</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                    <span>Dedicated expert consultation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                    <span>Quarterly progress tracking</span>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Perfect For:</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                    <span>Organizations with 500+ employees</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                    <span>Multi-national enterprises</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                    <span>Highly regulated industries</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                    <span>Organizations needing ongoing support</span>
                  </li>
                </ul>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/schedule">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white" data-testid="button-schedule-consultation">
                  <Calendar className="mr-2 h-5 w-5" />
                  Schedule Consultation
                </Button>
              </Link>
              <Link href="/contact">
                <Button variant="outline" size="lg" className="text-blue-600 border-blue-600 hover:bg-blue-50" data-testid="button-contact-enterprise">
                  Contact Sales Team
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* FAQ Section */}
        <section className="max-w-4xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-center mb-8" data-testid="text-faq-title">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            <Card data-testid="card-faq-1">
              <CardHeader>
                <CardTitle className="text-lg">How long does the assessment take?</CardTitle>
                <CardDescription>
                  The free assessment takes approximately 10 minutes with 25 questions, while the full assessment takes about 30 minutes with 90 comprehensive questions.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card data-testid="card-faq-2">
              <CardHeader>
                <CardTitle className="text-lg">Can I upgrade from free to full later?</CardTitle>
                <CardDescription>
                  Yes! You can start with the free assessment to get a baseline understanding, then upgrade to the full assessment for deeper insights whenever you're ready.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card data-testid="card-faq-3">
              <CardHeader>
                <CardTitle className="text-lg">What payment methods do you accept?</CardTitle>
                <CardDescription>
                  Payment functionality will be available in our next release. In the meantime, contact us directly to arrange your full assessment.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </section>

        {/* Bottom CTA */}
        <div className="text-center bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-12 text-white">
          <h2 className="text-3xl font-bold mb-4" data-testid="text-bottom-cta-title">
            Start Your AI Readiness Journey Today
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Begin with our free assessment or contact us about the full evaluation
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/assessment?tier=free">
              <Button size="lg" variant="outline" className="text-blue-600 bg-white hover:bg-gray-100 text-lg px-8" data-testid="button-cta-free">
                Try Free Assessment
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/overview">
              <Button size="lg" variant="outline" className="text-indigo-600 bg-white hover:bg-gray-100 border-2 text-lg px-8" data-testid="button-cta-overview">
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
