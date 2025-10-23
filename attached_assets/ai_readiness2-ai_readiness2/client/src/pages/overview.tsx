import { Link } from 'wouter';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { ArrowRight, CheckCircle2, Star, Zap, FileText, Users as UsersIcon, Calendar, TrendingUp } from 'lucide-react';

export function Overview() {
  const fullAssessmentFeatures = [
    {
      icon: FileText,
      title: 'Comprehensive 90-Question Evaluation',
      description: 'Deep-dive assessment covering all 9 dimensions with 10 questions per area for thorough insights.',
    },
    {
      icon: TrendingUp,
      title: 'Detailed Analytics & Benchmarking',
      description: 'Compare your results against industry standards and receive dimensional scoring with actionable insights.',
    },
    {
      icon: Zap,
      title: 'Customized Recommendations',
      description: 'Get prioritized, actionable recommendations tailored to your organization\'s specific needs and maturity level.',
    },
    {
      icon: FileText,
      title: 'Executive Summary Report',
      description: 'Receive a comprehensive PDF report perfect for sharing with leadership and stakeholders.',
    },
  ];

  const addOnFeatures = [
    {
      title: 'Expert Consultation Session',
      description: 'One-on-one review of your results with an AI transformation expert to discuss strategy and next steps.',
    },
    {
      title: 'Custom Assessment Questions',
      description: 'Add industry-specific or organization-specific questions to tailor the assessment to your unique context.',
    },
    {
      title: 'Team Assessment Package',
      description: 'Assess multiple teams or departments separately to identify organizational variations and opportunities.',
    },
    {
      title: 'Quarterly Progress Tracking',
      description: 'Re-assess quarterly to track improvement over time with trend analysis and progress reports.',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
      <div className="max-w-6xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent" data-testid="text-overview-title">
            Full AI Readiness Assessment
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto" data-testid="text-overview-subtitle">
            Get the complete picture of your organization's AI readiness with our comprehensive 90-question assessment. 
            Designed for organizations serious about AI transformation.
          </p>
        </div>

        {/* Value Proposition */}
        <section className="mb-16">
          <Card className="border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-blue-50" data-testid="card-value-prop">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Star className="h-6 w-6 text-indigo-600" />
                Why Choose the Full Assessment?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">
                While our free assessment provides a solid overview, the Full Assessment delivers the depth and detail needed to build a comprehensive AI transformation strategy. With 90 carefully crafted questions across 9 critical dimensions, you'll gain:
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700"><strong>Granular insights</strong> into each dimension with 10 targeted questions per area</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700"><strong>Precise identification</strong> of strengths, gaps, and opportunities for improvement</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700"><strong>Strategic roadmap</strong> with prioritized recommendations based on your unique results</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700"><strong>Professional deliverables</strong> suitable for executive presentations and board meetings</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </section>

        {/* What You Get */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8" data-testid="text-features-title">
            What's Included in the Full Assessment
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {fullAssessmentFeatures.map((feature, idx) => {
              const IconComponent = feature.icon;
              return (
                <Card key={idx} data-testid={`card-feature-${idx}`}>
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-lg bg-indigo-100 flex-shrink-0">
                        <IconComponent className="h-6 w-6 text-indigo-600" />
                      </div>
                      <div>
                        <CardTitle className="mb-2">{feature.title}</CardTitle>
                        <CardDescription className="text-base">
                          {feature.description}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Add-On Features */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-4" data-testid="text-addons-title">
            Custom Assessment Add-Ons
          </h2>
          <p className="text-center text-gray-600 mb-8 max-w-3xl mx-auto">
            Enhance your assessment with additional features tailored to your organization's specific needs
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            {addOnFeatures.map((addon, idx) => (
              <Card key={idx} className="border-l-4 border-l-indigo-500" data-testid={`card-addon-${idx}`}>
                <CardHeader>
                  <CardTitle className="text-lg">{addon.title}</CardTitle>
                  <CardDescription>{addon.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>

        {/* Consultation CTA */}
        <section className="mb-16">
          <Card className="border-2 border-indigo-300 bg-gradient-to-r from-indigo-600 to-blue-600 text-white" data-testid="card-consultation-cta">
            <CardHeader>
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 rounded-lg bg-white/20">
                  <Calendar className="h-8 w-8 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl text-white">Still Have Questions?</CardTitle>
                  <CardDescription className="text-indigo-100 text-base">
                    Let's discuss how the Full Assessment can help your organization
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-indigo-50 mb-6">
                Schedule a complimentary 30-minute consultation with our AI readiness experts. We'll discuss your organization's unique needs, answer your questions about the assessment, and help you determine which options are right for you.
              </p>
              <div className="space-y-4">
                <div className="bg-white/10 rounded-lg p-4">
                  <h3 className="font-semibold text-white mb-2">Contact Us</h3>
                  <p className="text-indigo-100 mb-2">Email: <a href="mailto:assessments@aireadiness.com" className="underline hover:text-white" data-testid="link-contact-email">assessments@aireadiness.com</a></p>
                  <p className="text-indigo-100">Phone: <a href="tel:+1-555-AI-READY" className="underline hover:text-white" data-testid="link-contact-phone">+1 (555) AI-READY</a></p>
                </div>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="w-full sm:w-auto bg-white text-indigo-600 hover:bg-indigo-50 border-0 text-lg"
                  data-testid="button-schedule-consultation"
                >
                  <UsersIcon className="mr-2 h-5 w-5" />
                  Set Up a Consultation Today
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Bottom CTA */}
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4" data-testid="text-bottom-cta-title">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Begin with our free assessment or dive deep with the full evaluation
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/assessment?tier=free">
              <Button size="lg" variant="outline" className="text-blue-600 border-blue-600 hover:bg-blue-50 text-lg px-8" data-testid="button-start-free">
                Try Free Assessment
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/pricing">
              <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white text-lg px-8" data-testid="button-view-pricing">
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
